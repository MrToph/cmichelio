---
title: setcode and setabi with EOS.js
date: 2018-11-18
featured: /setcode-and-setabi-with-eos-js/featured.png
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

This post is about deploying smart contract code and its ABI programmatically
from your JavaScript frontend or Node backend using
[eosjs](https://github.com/EOSIO/eosjs).

The `setcode` action of the `eosio` system contract accepts the `.wasm` file as
a hex string. To deploy _the code_ all we need to do is convert the `.wasm` file
to a hex string an call the action. More difficult is calling the `setabi`
function, as it needs a **packed binary** representation of the ABI. For this, we
need to [serialize the ABI](https://github.com/EOSIO/eosjs/issues/421).

Here's the working code using `eosjs >= 20.0.0`:

```jsx
const fs = require(`fs`)
const path = require(`path`)
const { Serialize } = require(`eosjs`)
const { api } = require(`../config`)

function getDeployableFilesFromDir(dir) {
  const dirCont = fs.readdirSync(dir)
  const wasmFileName = dirCont.find(filePath => filePath.match(/.*\.(wasm)$/gi))
  const abiFileName = dirCont.find(filePath => filePath.match(/.*\.(abi)$/gi))
  if (!wasmFileName) throw new Error(`Cannot find a ".wasm file" in ${dir}`)
  if (!abiFileName) throw new Error(`Cannot find an ".abi file" in ${dir}`)
  return {
    wasmPath: path.join(dir, wasmFileName),
    abiPath: path.join(dir, abiFileName),
  }
}

async function deployContract({ account, contractDir }) {
  const { wasmPath, abiPath } = getDeployableFilesFromDir(contractDir)

  // 1. Prepare SETCODE
  // read the file and make a hex string out of it
  const wasm = fs.readFileSync(wasmPath).toString(`hex`)

  // 2. Prepare SETABI
  const buffer = new Serialize.SerialBuffer({
    textEncoder: api.textEncoder,
    textDecoder: api.textDecoder,
  })

  let abi = JSON.parse(fs.readFileSync(abiPath, `utf8`))
  const abiDefinition = api.abiTypes.get(`abi_def`)
  // need to make sure abi has every field in abiDefinition.fields
  // otherwise serialize throws
  abi = abiDefinition.fields.reduce(
    (acc, { name: fieldName }) =>
      Object.assign(acc, { [fieldName]: acc[fieldName] || [] }),
    abi
  )
  abiDefinition.serialize(buffer, abi)

  // 3. Send transaction with both setcode and setabi actions
  const result = await api.transact(
    {
      actions: [
        {
          account: 'eosio',
          name: 'setcode',
          authorization: [
            {
              actor: account,
              permission: 'active',
            },
          ],
          data: {
            account: account,
            vmtype: 0,
            vmversion: 0,
            code: wasm,
          },
        },
        {
          account: 'eosio',
          name: 'setabi',
          authorization: [
            {
              actor: account,
              permission: 'active',
            },
          ],
          data: {
            account: account,
            abi: Buffer.from(buffer.asUint8Array()).toString(`hex`),
          },
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  )
}
```

Note how we make use of some internal fields of eosjs's `api` object like ``api.abiTypes.get(`abi_def`)`` when
converting the JS ABI object to a raw ABI.
Here's how the `api` object is created in `eosjs` and configured for a local EOS network:

```jsx
// config.js
const { Api, JsonRpc, JsSignatureProvider } = require(`eosjs`)
const fetch = require(`node-fetch`) // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require(`util`) // node only; native TextEncoder/Decoder

const signatureProvider = new JsSignatureProvider([
    `5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3`,
    /* other private keys for your contract account */,
])
const rpc = new JsonRpc(`http://127.0.0.1:7777`, { fetch })
const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
})


module.exports = {
    api,
}
```

Now you just need to call the `deployContract` function with the contract account name and configure `signatureProvider` to include this account's private key for the `active` permission:

```jsx
deployContract({ account: `test`, contractDir: `./contract` })
```
