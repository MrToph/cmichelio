---
title: How to fetch any secondary EOSIO table index using eosjs
date: 2019-07-15
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
- tutorials
- steemdev
- programming
---

Understanding how to fetch EOSIO contract tables based on primary and secondary indexes is easy in theory but gets hard in practice as one needs to deal with different key types and their respective encoding.
Unfortunately, [eosjs](https://github.com/EOSIO/eosjs) does not concern itself with the encoding and leaves it up to the user.
This post will go through all common _key types_ and show how to query EOSIO tables based on them using _eosjs_.

An EOSIO primary key must always be a 64-bit value, an `uint64_t`, but secondary indexes can use many more **key_types**:

> You can have up to 16 additional indexes and the field types can be uint64_t, uint128_t, uint256_t, double or long double. - [EOSIO Developer Portal](https://developers.eos.io/eosio-cpp/docs/using-multi-index-tables#section-introduction)

The list of possible key types mentioned in the EOSIO Developer Portal is however not complete - there are [three more key_types](https://github.com/EOSIO/eos/blob/eb88d033c0abbc481b8a481485ef4218cdaa033a/plugins/chain_plugin/include/eosio/chain_plugin/chain_plugin.hpp#L610) one can use:

* `i64` (`uint64_t`)
* `i128` (`uint128_t`)
* `i256` (`uint256_t`)
* `float64` (`double`)
* `float128` (`long double`)
* `name` (`name`)
* `sha256` (`checksum256`)
* `ripemd160` (`checksum160`)


Often secondary keys are _composite keys_, i.e., the bytes of the key are the concatenation of multiple different values.
For example, [LiquidApps's dappservices `accountext` table](https://github.com/liquidapps-io/zeus-sdk/blob/master/boxes/groups/dapp-network/dapp-services/contracts/eos/dappservices/dappservices.hpp#L347) defines two composite keys of type `uint128_t` and `checksum256` involving the `account`, `service`, and `provider` fields:

```cpp
TABLE accountext {
    uint64_t id;
    name account;
    name service;
    name provider;
    // ...

    uint64_t primary_key() const { return id; }

    uint128_t by_account_service() const {
      // account in higher bits, service in lower bits
      return (uint128_t{account.value}<<64) | service.value;
    }

     checksum256 by_account_service_provider() const {
      return checksum256::make_from_word_sequence<uint64_t>(
          0ULL, account.value, service.value, provider.value
      );
    }
  };
```

This allows querying specific ranges of the table using the `lower_bound` and `upper_bound` options of the [`get_table_rows` API](https://developers.eos.io/eosio-nodeos/reference#get_table_rows-1).
As an example, one can query all `ipfsservice1` service entries for the account `helloworld12` (without getting any other service or account) by setting the bounds to:

```cpp
lower_bound: (uint64_t)"helloworld" + (uint64_t)"ipfsservice1"
upper_bound: (uint64_t)"helloworld" + ((uint64_t)"ipfsservice1"+1)
```

> Note that secondary indexes do not need to be unique.

The above pseudo code ignores the encoding, which is important in practice and depends on each `key_type`.


## Fetching the primary key (`i64` or `name`)

The only available key types for a primary key are `i64` and `name`, which is just a human-readable base32 encoding of the `uint_64` value.
Let's fetch the _voter info_ for an account which is stored in the `eosio` contract's `voters` table.
First, we define a helper function to fetch table rows that sets some sensible default options.

```js
import { JsonRpc } from 'eosjs'

const rpc = new JsonRpc(`https://public.eosinfra.io:443`)

export async function fetchRows(options) {
  const mergedOptions = {
    json: true,
    limit: 9999,
    ...options,
  };

  const result = await rpc.get_table_rows(mergedOptions);

  return result.rows;
}
```


### Using `name` key type

When we're dealing with EOSIO names, it's easiest to use the `name` key type which allows us to pass in the human-readable account name as it is:

```js
const response = await fetchRows({
  code: `eosio`,
  table: `voters`,
  scope: `eosio`,
  key_type: `name`,
  index_position: 1,
  lower_bound: `helloworld12`,
  limit: 1,
});

// no upper_bound provided, need to check if owner is actually the account we queried
if(response.length > 0 && response[0].owner === `helloworld12`) {
  // ...
}
```

Notice how we couldn't provide an `upper_bound` as we cannot easily infer what the "account name + 1" evaluates to using the base32 encoded representation.
Therefore, we check if the resulting row entry matches the account we queried.

### Using `i64` key type

Surprisingly, it seems like the above code works as well if we set `key_type` to `i64` (or omit it in which case it defaults to `i64`).
This is because the chain plugin automatically notices that the bounds are not a valid integer value and does a conversion from the `name` type instead.
However, you'll encounter errors when specifying bounds for account names that consist only of numbers like `111111111122` if the `key_type` is set to `i64` because it will be interpreted as a 64-bit integer instead.

The correct way to use the `i64` key type is by converting the name to its _value_ (base32 decoding) using the following helper functions from [this GitHub gist](https://gist.github.com/MrToph/2634b81999357f34ff26f4c03a00fe0e) (initially defined in eosjs but removed in eosjs@2):

```ts
// ...

export function getTableBoundsForName(name: string) {
  const nameValue = nameToValue(name);
  const nameValueP1 = nameValue.add(1);

  return {
    lower_bound: nameValue.toString(),
    upper_bound: nameValueP1.toString()
  };
}
```

It decodes the name to its value and returns the _name_ and _name+1_ as the lower and upper bound.

```js
const bounds = getTableBoundsForName(`helloworld12`)
const response = await fetchRows({
  code: `eosio`,
  table: `voters`,
  scope: `eosio`,
  key_type: `i64`,
  index_position: 1,
  ...bounds,
});

if(response.length > 0) {
  // ...
}
```

This time the `upper_bound` is set correctly and only the account we are interested in is fetched.

## The `i128`, `i256` key types

Secondary indexes defining the `i128` or `i256` key types work similarly to the `i64` key type with one important difference:

1. The value must be provided as a **little-endian hex** value.

We can adjust the `getTableBoundsForName` function to take this case into account:

```js
function getTableBoundsForName(name, asLittleEndianHex = true) {
  const nameValue = nameToValue(name);
  const nameValueP1 = nameValue.add(1);

  if(!asLittleEndianHex) {
    return {
      lower_bound: nameValue.toString(),
      upper_bound: nameValueP1.toString()
    };
  }

  const lowerBound = bytesToHex(nameValue.toBytesLE());
  const upperBound = bytesToHex(nameValueP1.toBytesLE());

  return {
    lower_bound: lowerBound,
    upper_bound: upperBound,
  };
}
```

Fetching only the `ipfsservice1` services for the `helloworld12` account using the composite `by_account_service` key of the `accountext` table mentioned in the beginning (account << 64 | service) then requires:

* Little-endian hex encoding of `helloworld12`
* Little-endian hex encoding of the bounds for `ipfsservice1`
* Concatenating them in a way that matches the little-endian encoding of the `uint128_t`

```js
const accountHexLE = getTableBoundsForName(`helloworld12`).lower_bound;
const serviceBounds = getTableBoundsForName(`ipfsservice1`);
const bounds = {
    lower_bound: `0x${serviceBounds.lower_bound}${accountHexLE}`,
    upper_bound: `0x${serviceBounds.upper_bound}${accountHexLE}`,
}
const rows = await fetchRows({
  code: `dappservices`,
  table: `accountext`,
  scope: `DAPP`,
  key_type: `i128`,
  index_position: 3,
  ...bounds,
});
```

Note how the account is defined as the 64 _higher bits_ and the service is in the 64 _lower bits_, therefore we need to put the service first when using the "least-significant byte first" structure of little-endianness.

The same idea works for the `i256` type - the resulting value used for the bounds must be the hex-encoded little-endian value.

## The `sha256` key type

The `sha256` key-type corresponds to `struct checksum256` in EOSIO's C++ code which is a 256-bit type usually used as the result of some hash computation like `sha256`.
Naturally, one would think the encoding would be the same as for the `i256` key type - little endian.
But it is not - it uses a weird mix of splitting the `checksum256` into two 128 bit numbers and little-endian encoding them.
(There's [a PR that tries to fix it](https://github.com/EOSIO/eos/pull/6591), but it hasn't been merged for half a year.)

As this [stackexchange answer](https://eosio.stackexchange.com/questions/4116/how-to-use-checksum256-secondary-index-to-get-table-rows/4344) explains:

If you have the below hash (checksum256) returned by a row in the table (which returns a big-endian representation):

```
7af12386a82b6337d6b1e4c6a1119e29bb03e6209aa03c70ed3efbb9b74a290c
```

It's first split into two parts (16 bytes each side):

```
7af12386a82b6337d6b1e4c6a1119e29 bb03e6209aa03c70ed3efbb9b74a290c
```

These two parts are then separately little-endian encoded (reversing every byte (2 char) chunk):

```
299e11a1c6e4b1d637632ba88623f17a 0c294ab7b9fb3eed703ca09a20e603bb
```

In the case of `accountsext` table's `by_account_service_provider` index, mentioned in the beginning, if we interpret the index as big-endian, the conversion to the bounds we need for `get_table_rows` looks like this:

```cpp
// return checksum256::make_from_word_sequence<uint64_t>(
//     0ULL, account.value, service.value, provider.value
// );
0ULL, account, service, provider
// convert to: (LE = little-endian encoding)
LE(0ULL, account), LE(service, provider)
// which is the same as
LE(account), LE(0ULL), LE(provider), LE(service)
LE(account), 0ULL, LE(provider), LE(service)
```

The same query to fetch only the `ipfsservice1` services for the `helloworld12` account, that we did before using the `i128` key type, looks like this for the `sha256` key type:

```js
const accountHexLE = getTableBoundsForName(`helloworld12`).lower_bound;
const serviceBounds = getTableBoundsForName(`ipfsservice1`);
const bounds = {
  lower_bound: `${accountHexLE}${`0`.repeat(32)}${serviceBounds.lower_bound}`,
  upper_bound: `${accountHexLE}${`0`.repeat(32)}${serviceBounds.upper_bound}`,
};

const rows = await fetchRows({
  code: `dappservices`,
  table: `accountext`,
  scope: `DAPP`,
  key_type: `sha256`,
  index_position: 2,
  ...bounds,
});
```

## The `float64`, `float128` and `ripemd160` key types

I never came across a secondary index that used one of these key types.
If I do, I'll write a follow-up post explaining their boundary encodings for the `get_table_rows` endpoint.

> If you enjoyed this post and want to know more practical in-depth EOS articles like this one, you might also enjoy my Learn EOS Development book.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
