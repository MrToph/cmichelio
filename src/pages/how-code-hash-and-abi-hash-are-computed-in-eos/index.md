---
title: How EOS code and ABI hashes are computed
date: 2019-05-17
image: ./featured.png
categories:
- Tech
- EOS
- learneos
medium:
- eos
- Programming
- blockchain
- cryptocurrency
- javascript
steem:
- eos
- utopian-io
- steemdev
- programming
- cryptocurrency
---

If you'd like to know what version of a smart contract is deployed on EOS, you'll need to look at the _code hash_.
We'll see how code and ABI hashes are computed and write a function to see if a local WASM file matches the one a contract is running by comparing their hashes.

## Code hash in EOS

When setting or updating a contract through the `eosio` `setcode` action it is checked if the contract is already running the code.
Therefore, we can see how the hash is computed from the wasm file by [looking at the `setcode` implementation](https://github.com/EOSIO/eos/blob/3fddb727b8f3615917707281dfd3dd3cc5d3d66d/libraries/chain/eosio_contract.cpp#L140).

```cpp
void apply_eosio_setcode(apply_context& context) {
   // some setup code

   fc::sha256 code_id; /// default ID == 0

   if( act.code.size() > 0 ) {
     code_id = fc::sha256::hash( act.code.data(), (uint32_t)act.code.size() ); // highlight-line
     wasm_interface::validate(context.control, act.code);
   }

   const auto& account = db.get<account_object,by_name>(act.account);

   int64_t code_size = (int64_t)act.code.size();
   int64_t old_size  = (int64_t)account.code.size() * config::setcode_ram_bytes_multiplier;
   int64_t new_size  = code_size * config::setcode_ram_bytes_multiplier;

   EOS_ASSERT( account.code_version != code_id, set_exact_code, "contract is already running this version of code" ); // highlight-line

   // ...
}
```

It's just a simple SHA256 hash of the WASM byte representation. (The second argument is just the length of the byte array and is needed by the hash function to know how many bytes to hash.)

We can easily do the same in Node.js by hashing a WASM file and comparing it to the code hash on the blockchain.

```js
const fs = require(`fs`)
const crypto = require(`crypto`)

const loadFileContents = file => {
    if (!fs.existsSync(file)) {
        throw new Error(`Code file "${file}" does not exist.`)
    }

    // no encoding => read as Buffer
    return fs.readFileSync(file)
}

const createHash = contents => {
    const hash = crypto.createHash(`sha256`)
    hash.update(contents)
    const digest = hash.digest(`hex`)

    return digest
}

// fetch code contract from blockchain
const { code_hash: onChainCodeHash, abi_hash } = await api.rpc.fetch(`/v1/chain/get_raw_abi`, {
    account_name: `hello`,
})
const contents = loadFileContents(`contracts/hello.wasm`)
const codeHash = createHash(contents)

if (codeHash === onChainCodeHash) {
    console.log(`Code is up-to-date.`)
}
```

The [`get_raw_abi`](https://developers.eos.io/eosio-nodeos/reference#get_raw_abi) function is a great API endpoint to fetch both the code and ABI hash of an account with a single query.

> Note that the WASM file, and thus the code hash, depends on the `eosio-cpp` version used during compilation and the `-O` optimization parameter. It could be that the code hashes are different but come from the same C++ code.

## ABI hash in EOS

We could try the same to figure out the ABI hash, however, for some reason, the `eosio` `setabi` action [does not check the ABI hash](https://github.com/EOSIO/eos/blob/3fddb727b8f3615917707281dfd3dd3cc5d3d66d/libraries/chain/eosio_contract.cpp#L175) and therefore allows updates with the same hash.

But the [`get_raw_abi`](https://developers.eos.io/eosio-nodeos/reference#get_raw_abi) API endpoint returns an ABI hash, so it must get it from somewhere.
By checking the `nodeos` `chain-plugin` we can see that it is [computed on-the-fly for each request](https://github.com/EOSIO/eos/blob/686f0deb5dac097cc292f735ccb47c238e763de0/plugins/chain_plugin/chain_plugin.cpp#L1689):

```cpp
read_only::get_raw_abi_results read_only::get_raw_abi( const get_raw_abi_params& params )const {
   get_raw_abi_results result;
   result.account_name = params.account_name;

   const auto& d = db.db();
   const auto& accnt = d.get<account_object,by_name>(params.account_name);
   result.abi_hash = fc::sha256::hash( accnt.abi.data(), accnt.abi.size() ); // highlight-line
   result.code_hash = accnt.code_version;
   if( !params.abi_hash || *params.abi_hash != result.abi_hash )
      result.abi = blob{{accnt.abi.begin(), accnt.abi.end()}};

   return result;
}
```

The computation is exactly the same as with the code hash - SHA256 of the byte representation of the ABI.
However, there is one big difference in how the ABI is actually stored.
It is **not** stored as the familiar JSON file, instead, it is stored in a _packed_ way as what EOS calls **raw ABI**.

Converting from raw ABI to JSON is easy using `eosjs`, but from JSON to raw ABI requires a bit of hacking:

```js
const {Serialize, Api} = require(`eosjs`)
const {TextEncoder, TextDecoder} = require(`util`) // node only; native TextEncoder/Decoder

const jsonToRawAbi = json => {
    const tmpApi = new Api({
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    })
    const buffer = new Serialize.SerialBuffer({
        textEncoder: tmpApi.textEncoder,
        textDecoder: tmpApi.textDecoder,
    })

    const abiDefinition = tmpApi.abiTypes.get(`abi_def`)
    // need to make sure abi has every field in abiDefinition.fields
    // otherwise serialize throws
    const jsonExtended = abiDefinition.fields.reduce(
        (acc, {name: fieldName}) => Object.assign(acc, {[fieldName]: acc[fieldName] || []}),
        json,
    )
    abiDefinition.serialize(buffer, jsonExtended)

    if (!Serialize.supportedAbiVersion(buffer.getString())) {
        throw new Error(`Unsupported abi version`)
    }
    buffer.restartRead()

    // convert to node buffer
    return Buffer.from(buffer.asUint8Array())
}
```

Each ABI must consist of a certain set of fields like [`version`, `types`, `structs`, `actions`, `tables`, etc.](https://github.com/EOSIO/eosjs/blob/849c03992e6ce3cb4b6a11bf18ab17b62136e5c9/src/abi.abi.json#L151), which are then serialized to a more size-efficient representation.

Computing the ABI hash and checking it with the on-chain value is then straightforward:

```js
const contents = loadFileContents(`contracts/hello.abi`)

const abi = JSON.parse(contents.toString(`utf8`))
const serializedAbi = jsonToRawAbi(abi)

const abiHash = createHash(serializedAbi)

// fetch abi hash from blockchain
const { code_hash, abi_hash: onChainAbiHash } = await api.rpc.fetch(`/v1/chain/get_raw_abi`, {
    account_name: `hello`,
})

if (abiHash === onChainAbiHash) {
    console.log(`ABI is up-to-date.`)

    return null
}
```

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
