---
title: EOS vaults.sx hack
date: 2021-05-14
image: ./featured.jpg
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

The [vaults.sx](https://www.bloks.io/account/vaults.sx) contract on EOS mainnet has been exploited through a re-entrancy attack.
1,180,142.5653 EOS (~13M USD) and 461,796.8968 USDT were stolen making this the biggest hack on EOS.

[Vaults.sx](https://www.bloks.io/account/vaults.sx) is a yield aggregator where users can deposit EOS or USDT in return for interest-bearing SXEOS/SXUSDT tokens.
The deposited tokens are then available in the [flash.sx](https://bloks.io/account/flash.sx) contract for flashloans and aggregate fees.
Finally, `SX` tokens can be redeemed for a pro-rata share of the underlying funds + aggregated fees again.

## EOS actions execution order

To understand the attack one first needs to understand the _execution order_ of _notifications_ (`require_recipient`) and normal _inline actions_ (`send_inline`).

The [`eosio.token`](https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.token/src/eosio.token.cpp#L89) notifies both the `sender` and the `recipient` using `require_recipient`:

```cpp
void token::transfer( const name&    from,
                      const name&    to,
                      const asset&   quantity,
                      const string&  memo )
{
    // ...

    require_recipient( from );
    require_recipient( to );

    // ...
}
```

Imagine both parties having a contract deployed that each creates a `log` inline action:

```cpp
[[eosio::on_notify("*::transfer")]]
void tester::on_transfer(const name from, const name to, const asset quantity, const string memo )
{
    log_action log( get_self(), { get_self(), "active"_n });
    log.send( "hello from " + get_self().to_string() );
}
```

When sending a token from `A` to `B` using `token.transfer(A, B, 1.0000 EOS, "")` one might expect the following sequence of execution:

1. token.transfer receiver:token
2. token.transfer receiver:A
3. A.log receiver:A
4. token.transfer receiver:B
5. B.log receiver:B

But this is not the case. EOSIO always [executes all notification handlers first](https://github.com/EOSIO/eos/blob/master/libraries/chain/apply_context.cpp#L171) before processing normal inline actions.
After all notifications have been processed the created inline actions are processed depth-first.
This means the actual execution order is:

1. token.transfer receiver:token
2. token.transfer receiver:A
3. token.transfer receiver:B
4. A.log receiver:A
5. B.log receiver:B

The consequence is that malicious inline actions can run between receiving the notification (`token.transfer receiver:B`) and creating the `log` inline action:

```cpp
[[eosio::on_notify("*::transfer")]]
void tester::on_transfer(const name from, const name to, const asset quantity, const string memo )
{
    // not guaranteed to execute next (!)
    // if another contract received the same notification earlier and created an inline action
    // it'll be executed before this one
    log_action log( get_self(), { get_self(), "active"_n });
    log.send( "hello from " + get_self().to_string() );
}
```

## The exploit

The exeuction order of the attacker transaction then performs the following steps chronologically:

1. `token.transfer(attacker, vaults.sx)`: Deposit tokens to receive SX tokens
2. `sxtoken.transfer(attacker, vaults.sx)@sxtoken` Redeem half of the received SX tokens again by transferring them to the vault
3. `sxtoken.transfer(attacker, vaults.sx)@attacker`: This notifies the sender (attacker) who creates 1) an inline action to call the [vaults.sx update function](https://github.com/stableex/sx.vaults/tree/6f6a3bd5d46fbc83503be7eaf56d87a1982a5a77/vaults.sx.cpp#L7) and 2) another inline action redeeming the second half of the SX tokens.
4. `sxtoken.transfer(attacker, vaults.sx)@vaults.sx` The receiver (`vaults.sx`) is notified, pays out the fair share of underlying tokens and correctly [saves the new fund balance](https://github.com/stableex/sx.vaults/tree/6f6a3bd5d46fbc83503be7eaf56d87a1982a5a77/vaults.sx.cpp#L133) left in the contract:
    ```cpp
    void sx::vaults::on_transfer( const name from, const name to, const asset quantity, const string memo ) {
        // update internal deposit & supply
        _vault_by_supply.modify( supply_itr, get_self(), [&]( auto& row ) {
            // (!) decreases the deposit (underlying) by the out amount
            row.deposit -= out;
            row.supply.quantity -= quantity;
            row.last_updated = current_time_point();
        });
    }
5. The `vault.update` inline action created in step 3) is now executed which [overwrites the update](https://github.com/stableex/sx.vaults/tree/6f6a3bd5d46fbc83503be7eaf56d87a1982a5a77/vaults.sx.cpp#L34) in step 4) as the balance of the `vaults.sx` contract **has not changed yet**, because the inline action performing the redeem transfer to the attacker still has to be executed.
    ```cpp
    [[eosio::action]]
    void sx::vaults::update( const symbol_code id )
    {
        // get balance from account
        // (!) still the old balance as the transfer out has not been executed yet
        const asset balance = eosio::token::get_balance( contract, account, sym.code() );
        asset staked = { 0, balance.symbol };
        
        // update balance
        _vault.modify( vault, get_self(), [&]( auto& row ) {
            // (!) balance is the original balance and overwrites previous update
            row.deposit.quantity = balance + staked;
            row.staked.quantity = staked;
            row.last_updated = current_time_point();
        });
    }
    ```

At some point, the second redeem of the other half of the SX tokens is performed using the original funds (instead of the funds - first redeem output).
The share is then redeemed on an inflated total supply which leads to a bigger payout than their actual pro-rata share.
The attacker then goes on and repeats these steps several times until all funds are trained.

> In reality, the attack is more complicated as the attacker cannot directly call `vault.update` but needs to take a tiny flash.sx flashloan which then [triggers the vault update](https://github.com/stableex/sx.flash/blob/cbdf30be510bdba1f6e987b2ffed5d65a968347c/flash.sx.cpp#L60).

An example transaction performing this can be [seen here](https://eos.eosq.eosnation.io/tx/c6e6a08acac52dab944adcee341ffab6f43cd304d8e1ea1ecf1c1a555bb33aec)
The stolen tokens are currently held in the [aquudqdmxesw](https://www.bloks.io/account/aquudqdmxesw) account.
