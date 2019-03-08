---
title: EOS 1.3 Contract Development Toolkit Updates
date: 2018-10-28
featured: /eos-1-3-contract-development-toolkit-updates/featured.png
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

The [EOSIO Contract Development Toolkit](https://github.com/EOSIO/eosio.cdt),
which serves as _the_ way to compile your smart contracts in the future,
recently released the new 1.32 Version with quite some
[breaking changes](https://github.com/EOSIO/eosio.cdt#differences-between-version-12x-and-version-13x).
The changes were made to prepare the binary release of the toolkit, so you don't
have to compile the toolkit yourself anymore, and to clean up some code. For
example, some oddities were removed from the EOS code like the `N` macro and
other `typedef`s while making the creation of an ABI easier with the `ACTION,
TABLE` and `CONTRACT` macros.

Furthermore, the `eosio::contract` constructor changed and with the `EOSIO_ABI`
macro rename to `EOSIO_DISPATCH` and the removal of the `currency` class, it
left many contract developers puzzled how to listen to `eosio.token` transfers
in their smart contracts. The EOSIO.CDT v1.3 way to dispatch both your
internal actions and listen to `eosio.token::transfer` actions looks like this:

```cpp
// test.hpp
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>

#define EOS_SYMBOL symbol("EOS", 4)

CONTRACT test : public eosio::contract
{
  test(name receiver, name code, datastream<const char *> ds) 
  : contract(receiver, code, ds), games(receiver, receiver.value) {}

  public:
    struct init
    {
        init(){};
        eosio::name name;
        EOSLIB_SERIALIZE(init, (name))
    };

    ACTION init(eosio::name name);
    void transfer(
        eosio::name from,
        eosio::name to,
        eosio::asset quantity,
        std::string memo
    );
};

// test.cpp
#include "./test.hpp"

using namespace eosio;
using namespace std;

void test::init(name name)
{
    require_auth(_self);
}

void test::transfer(name from, name to, asset quantity, string memo)
{
    if (from == _self)
    {
        // we're sending money, do nothing additional
        return;
    }

    eosio_assert(to == _self, "contract is not involved in this transfer");
    eosio_assert(quantity.symbol.is_valid(), "invalid quantity");
    eosio_assert(quantity.amount > 0, "only positive quantity allowed");
    eosio_assert(quantity.symbol == EOS_SYMBOL, "only EOS tokens allowed");
}

extern "C" void apply(uint64_t receiver, uint64_t code, uint64_t action)
{
    if (code == "eosio.token"_n.value && action == "transfer"_n.value)
    {
        eosio::execute_action(
            eosio::name(receiver), eosio::name(code), &test::transfer
        );
    }
    else if (code == receiver)
    {
        switch (action)
        {
            EOSIO_DISPATCH_HELPER(test, (init))
        }
    }
}
```

I created a `yeoman generator` [generator-eos](https://github.com/MrToph/generator-eos) that scaffolds new EOS smart contract projects and works with the latest version of EOS Contract Developer Toolkit.
It runs using Node.js and includes some helpful NPM scripts like automatically creating actions to run based on your contract's ABI.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
