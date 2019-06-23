---
title: Advanced EOSIO programming concepts
date: 2019-06-23
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

While reviewing EOS smart contracts I noticed that every developer has its own style of programming and that there are many different ways to do the same things, like working with time or sending actions to other contracts.
This article is a thought-dump of some EOSIO library functions that I find elegant and are useful to know.

## 1. `eosio::same_payer`

The first one is just a constant expression that can be used when modifying entries of multi-index tables.
When using `eosio::same_payer`, the new RAM that will be used (if any) is allocated to the same account that already paid for the table entry.

#### Usage:

```cpp
statstable.modify( st, eosio::same_payer, [&]( auto& s ) {
    s.supply += quantity;
});
```

It's defined in [`multi_index.hpp`] and is just a constant expression for the empty `name` (value: 0) `""_n` or `name(0)` which some developers still use to indicate the same payer.

## 2. `get_first_receiver`, `get_self()`

The two getters `get_self` and `get_first_receiver`, defined in [contracts.hpp](https://github.com/EOSIO/eosio.cdt/blob/796ff8bee9a0fc864f665a0a4d018e0ff18ac383/libraries/eosiolib/contracts/eosio/contract.hpp#L47), return part of the execution context of the running action.
(In EOSIO.CDT 1.6 `get_first_receiver` was implemented in favour of the old `get_code`, which is now deprecated.)
The `get_self` method returns the contract that is currently running the code, whereas the `get_first_receiver` returns the account where the action originated from.
These two accounts are the same unless notifications through `require_recipient` are involved.

For example, listening to notifications of the `eosio.token`'s `transfer` action, `get_self()` returns the account your contract is deployed to, whereas `get_first_receiver()` returns the `eosio.token` account. This is because the action originated by an account sending a `transfer` action to the `eosio.token` account that involves your contract account.

#### Usage:

```cpp
[[eosio::on_notify("eosio.token::transfer")]] void cryptoship::transfer(name from, name to, const asset &quantity,
                          string memo) {
  print(get_self()); // cryptoship
  print(get_first_receiver()); // eosio.token
}
```

## 3. `action_wrapper`

Sending new actions from the contract code to another contract is needed for many use cases.
It's the only way contracts can actively communicate with each other.
Again, there are many ways to do it, but one of the most elegant ways is by using `eosio::action_wrapper`s.
It creates an "action template" for a specific action of a specific smart contract code that can then be used to invoke this action.

The first argument is the action name and the second one is the method _declaration_ of the action.

#### Usage

The `eosio.token` header defines action wrappers for all of its actions in the [eosio.token.hpp header file](https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.token/include/eosio.token/eosio.token.hpp):

```cpp
  [[eosio::action]]
  void create( name   issuer,
              asset  maximum_supply);

  [[eosio::action]]
  void issue( name to, asset quantity, string memo );

  [[eosio::action]]
  void retire( asset quantity, string memo );

  [[eosio::action]]
  void transfer( name    from,
                name    to,
                asset   quantity,
                string  memo );

  // ...

  using create_action = eosio::action_wrapper<"create"_n, &token::create>;
  using issue_action = eosio::action_wrapper<"issue"_n, &token::issue>;
  using retire_action = eosio::action_wrapper<"retire"_n, &token::retire>;
  using transfer_action = eosio::action_wrapper<"transfer"_n, &token::transfer>;
  // ...
```

We can now send inline actions to any `eosio.token` contract by including this header file.

> Important to note is that only this header file with the **declarations** needs to be included. Meaning, one can easily write action wrappers even for closed-source contracts with unknown implementation details. Only the declaration, the action signature, needs to be written, which one can get from the ABI.

> Additional include directories for header files are included using the `-I` flag of `eosio-cpp`.

After including the header file, an **inline** transfer action is sent like this:

```cpp
#include <eosio_token/include/eosio_token.hpp>

// can specify the contract to send the action to as first argument
token::transfer_action payout("eosio.token"_n, {get_self(), "active"_n});
// transfer arguments are now passed as postional arguments
payout.send(get_self(), to, quantity, memo);
```

The same works for [deferred transactions](/deferred-transactions-on-eos/) using the `to_action` method:

```cpp
token::transfer_action payout("eosio.token"_n, {get_self(), "active"_n});

transaction t{};
t.actions.emplace_back(payout.to_action(get_self(), to, quantity, memo));
t.delay_sec = 10;
t.send(0 /* sender id */, get_self(), false);
```

## 4. EOSIO time classes `time_point`, `time_point_sec`, `microseconds`

The EOSIO library defines two date classes in the [time.hpp header](https://github.com/EOSIO/eosio.cdt/blob/796ff8bee9a0fc864f665a0a4d018e0ff18ac383/libraries/eosiolib/time.hpp) differing in their precision. The `time_point_sec` class is a standard UNIX timestamp storing the seconds since January 1st 1970 in an `uint32_t`, `time_point` has a more accurate precision storing the elapsed number of **microseconds** (not milliseconds) in an `uint64_t`.
It's easy to convert from and to both classes.

To do arithmetic with times, one uses the `microseconds` class which comes with useful helpers like `seconds`, `minutes` or `hours`.

#### Usage

```cpp
eosio::time_point tp = eosio::current_time_point();
eosio::time_point_sec tps = eosio::current_time_point();
eosio::microseconds micros = tp.time_since_epoch();
uint64_t count_micros = micros.count();
uint32_t count_seconds = tps.sec_since_epoch();

// no more 60*60*24*1e6
const auto MICROSECONDS_IN_DAY = hours(24);
count_micros += MICROSECONDS_IN_DAY;
// no more 60*60*24
count_seconds += hours(24).to_seconds();

eosio::time_point_sec lastGame = /* ... */;
check((eosio::time_point_sec)(current_time_point() + minutes(1)) >= lastGame,
      "last game not finished");
```

Using the `microseconds` class and its helpers allow one to avoid any kind of constants like `const auto SECONDS_PER_DAY = 60*60*24`, making the code easier to reason about.

If you want to learn more about EOS smart contract programming techniques, check out the [Learn EOS Development book](https://learneos.dev).

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
