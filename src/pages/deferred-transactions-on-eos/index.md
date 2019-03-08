---
title: Deferred Transactions on EOS
date: 2018-12-19
featured: /deferred-transactions-on-eos/featured.jpg
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


EOS has two ways to send actions, _inline_ and _deferred_.
Inline actions can intuitively be seen as synchronous execution and deferred actions as asynchronous code.
**Inline actions** can be spawned from a contract and are then executed within the same transaction as the original action.
They are reliable as they are guaranteed to execute and they can make the whole transaction fail, reverting any changes of previous actions of the same transaction.
(A transaction is a list of actions executed in the same block.)

**Deferred actions** are actions being scheduled by a contract to be executed at some time in the future.
The biggest difference to _inline_ actions is that they are not even guaranteed to run.
The transaction could as well just be dropped by the nodes.
Also if they fail, the transaction scheduling the deferred action is _not_ reverted.
In fact, there's no way to revert them, they were already applied to the blockchain in a previous block at the time the deferred transaction is executed.
Deferred transactions can also be canceled from code again.

> Deferred actions get scheduled to run, at best, at a later time, at the producer's discretion.
> There is no guarantee that a deferred action will be executed. [EOS Dev Portal](https://developers.eos.io/eosio-cpp/docs/communication-model#section-deferred-communication)

With this huge drawback of deferred transactions, one might wonder if they should even be used at all.
Deferred transactions definitely have their right to exist.
Besides the obvious reason of programmatically scheduling an action in the future, they can be used for **anything non-essential**.
The EOSIO software only provides a certain amount of milliseconds (30ms) for a transaction to execute.
Note that this restriction applies to the _transaction_, the list of its actions and spawned inline actions.
Deferred transactions provide a way to get around this restriction as they are run in a new transaction.
Non-essential actions, like logging, or actions that can be triggered again manually by the user on non-execution, like withdrawing of funds in a gambling contract tracking balances, can be implemented as deferred actions.

> Every transaction must execute in 30ms or less.
> If a transaction contains several actions, and the sum of these actions is greater than 30ms, the entire transaction will fail.
> In situations without concurrency requirements for their actions this can be circumvented by including the CPU consuming actions in separate transactions. [EOS Dev Portal](https://developers.eos.io/eosio-cpp/docs/communication-model#section-transaction-limitations)

This is how to create a deferred transaction in EOS:

```cpp
#include <eosiolib/transaction.hpp> // include this for transactions

class deferred_example : public eosio::contract
{
  public:
    using contract::contract;

    // this action will be called by the deferred transaction
    ACTION deferred(name from, const string &message)
    {
        require_auth(from);
        print("Printing deferred ", from, message);
    }

    ACTION send(name from, const string &message, uint64_t delay)
    {
        require_auth(from);

        eosio::transaction t{};
        // always double check the action name as it will fail silently
        // in the deferred transaction
        t.actions.emplace_back(
            // when sending to _self a different authorization can be used
            // otherwise _self must be used
            permission_level(from, "active"_n),
            // account the action should be send to
            _self,
            // action to invoke
            "deferred"_n,
            // arguments for the action
            std::make_tuple(from, message));

        // set delay in seconds
        t.delay_sec = delay;

        // first argument is a unique sender id
        // second argument is account paying for RAM
        // third argument can specify whether an in-flight transaction
        // with this senderId should be replaced
        // if set to false and this senderId already exists
        // this action will fail
        t.send(now(), from /*, false */);

        print("Scheduled with a delay of ", delay);
    }
};

EOSIO_DISPATCH(deferred_example, (send)(deferred))
```

The code is similar to the one sending inline actions.
The difference is that we need to create a new empty transaction first.
When sending the transaction, you need to specify the _sender id_.
This id must be unique among all deferred transactions send by your contract.
It can be used to identify the transaction which is useful for error handling and needed when canceling deferred transactions that are still _in flight_, i.e., not yet executed.
If a unique sender id cannot be created from the context of your contract, you can create a counter for your deferred transaction ids and store it in a `eosio::singleton` in your contract.
Scheduling a delayed transaction works by "depositing" the transaction on the blockchain which requires RAM in the size of the transaction.
The payer can be specified and his authorization is required.

To cancel an in-flight transaction with a `sender_id`, one simply calls `cancel_deferred(sender_id)`.

When a deferred transaction fails, `eosio` sends an `onerror` action to your contract with the `sender_id` and the transaction data:

```cpp
class deferred_example : public eosio::contract
{
    // ...

    void onError(const onerror &error)
    {
        // this function should have a counter to not retry forever
        print("Resending Transaction: ", error.sender_id);
        transaction dtrx = error.unpack_sent_trx();
        dtrx.delay_sec = 3;
        dtrx.send(now(), _self);
    }

    // ...
};

extern "C" void apply(uint64_t receiver, uint64_t code, uint64_t action)
{
    if (code == "eosio"_n.value && action == "onerror"_n.value)
    {
        eosio::execute_action(eosio::name(receiver), eosio::name(code), &deferred_example::onError);
    }
    // ...
}
```

Deferred transactions lead to _defensive programming_ techniques.
You can never be sure if the action was actually executed, so your contract needs to represent the current status in its tables and retry the action.
If the deferred transaction would impact a user, like sending funds, you should always have a separate action that implements the logic in a non-deferred way and which can be triggered manually by the user, like a withdraw action. 
Your necessary core logic should be handled by the initial action or inline actions.

Deferred transactions run with the contract's permission that scheduled it.
This contract also pays for the CPU / NET bandwidth costs for the spawned actions.

> Deferred transactions carry the authority of the contract that sends them. [EOS Dev Portal](https://developers.eos.io/eosio-cpp/docs/communication-model#section-deferred-communication)

Note that a deferred transaction can only be scheduled 45 days ahead in the future.
However, you could get around this by making the deferred action repeatedly schedule new deferred transactions until your desired time span is reached.
Again, this is prone to failure and should be avoided if possible.

Here are some other interesting [configuration settings](https://github.com/CryptoLions/EOS-MainNet/blob/master/genesis.json) on the EOS main network about transactions.

```json
{
  "initial_configuration": {
    // ...
    // the maximum billable cpu usage (in microseconds) that the chain will allow regardless of account limits
    "max_transaction_cpu_usage": 150000,
    // the minimum billable cpu usage (in microseconds) that the chain requires
    "min_transaction_cpu_usage": 100,
    // the maximum number of seconds that an input transaction's expiration can be ahead of the time of the block in which it is first included
    "max_transaction_lifetime": 3600,
    // the number of seconds _after_ the time a deferred transaction can first execute until it expires
    "deferred_trx_expiration_window": 600,
    // the maximum number of seconds that can be imposed as a delay requirement by authorization checks
    // 45 days
    "max_transaction_delay": 3888000,
    "max_inline_action_size": 4096,
    "max_inline_action_depth": 4,
    "max_authority_depth": 6
  }
}
```

Meaning we can schedule transactions 45 days in advance and the nodes have 10 minutes to execute this transaction before it expires.
Unfortunately, if a transaction expires and was never executed you are not notified about the non-execution in the `onerror` callback of your contract.
This `onerror` action is only called if the transaction was executed in the first place but then failed due to an assertion error.

If you'd like to know more about the EOS' communication model, [this article](https://developers.eos.io/eosio-cpp/docs/communication-model) is helpful.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
