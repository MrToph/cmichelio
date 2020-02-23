---
title: How to check if an EOS account has a smart contract
date: 2020-02-23
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

Figuring out if an EOSIO account is a smart contract is an easy task if you are operating off-chain.
One simply hits the [get_code endpoint](https://developers.eos.io/manuals/eos/latest/nodeos/plugins/chain_api_plugin/api-reference/index#operation/get_code) of an EOSIO node with the account name and checks whether the `code_hash` response is not `0`.

> But what if you want to check if there's a smart contract deployed on an account  **from within your smart contract**?

As of EOSIO 2.0 and EOSIO.CDT 1.7.x there's no `get_code_hash` WASM intrinsic and it's not possible.
However, if you trust NewDex there's still a quick and convenient way to check it.

### NewDex

NewDex is the biggest (?) decentralized exchange on EOS.
A not well-known fact is that they ban all smart contracts from trading.
Deploy a smart contract and try to send a trade action to [`newdexpublic`](https://bloks.io/account/newdexpublic). You'll run into an assertion error saying that your contract is not whitelisted.

What NewDex does is scan the EOS mainnet for any `eosio.setcode` actions and then immediately call the [savecontract action](https://eosq.app/search?q=account%253Anewdexpublic%2520action%253Asavecontract) blacklisting your contract.

But this means that `newdexpublic` must keep an on-chain ["contractlist" table](https://bloks.io/account/newdexpublic?loadContract=true&tab=Tables&table=contractlist&account=newdexpublic&scope=newdexpublic&limit=100) consisting of all smart contracts and if they are allowed to trade.
We can make use of this fact and just access Newdex' table from our own smart contract to figure out if an account is a smart contract:

```cpp
TABLE contractlist {
  eosio::name contract;
  bool is_white = false;

  uint64_t primary_key() const { return contract.value; }
}

typedef eosio::multi_index<"contractlist"_n, contractlist> contractlist_t;

static bool is_contract( const name& account)
{
  contractlist_t contractlist_table("newdexpublic"_n, "newdexpublic"_n.value);
  const auto& itr = contractlist_table.find( account.value );
  return itr != contractlist_table.end();
}
```

It's not a perfect solution because you need to trust Newdex to:
1. keep their oracle running
2. not update their smart contract to change or hide this table
3. be honest about what smart contracts they add / remove from the table

Nevertheless, this solution might work for you if you 're looking for a quick and easy solution and:
1. Don't want to run your own monitoring & oracle
2. Don't want to pay for keeping a list of all smart contracts in RAM


### Addendum

From my tests, their oracle blacklists new contracts within minutes from setting code on your account.

If you are like me and wondered how many and which accounts are actually whitelisted to trade on NewDex, here's the list:

1. [sovconverter](https://bloks.io/account/sovconverter)
2. [gy2dgmztgqge](https://bloks.io/account/gy2dgmztgqge)

Only these two contracts out of 5752 are whitelisted. Both of them don't seem to do any automated trading.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
