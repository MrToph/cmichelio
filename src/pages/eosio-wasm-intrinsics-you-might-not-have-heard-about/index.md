---
title: 8 EOSIO WASM intrinsics you might not have heard about
date: 2020-04-19
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

EOSIO smart contracts are just simple WebAssembly files.
The WebAssembly format allows defining **imports**, functions that are not declared in WASM itself but in the environment the WebAssembly code is executed in.
EOSIO makes use of these builtin functions ([intrinsics](https://en.wikipedia.org/wiki/Intrinsic_function)) to exchange data between the WebAssembly contract code and the EOSIO `nodeos` node.
Whenever the EOS virtual machine (EOSVM), which executes the WebAssembly code, hits such an intrinsic the program control is handed over to the _nodeos controller_ code to resolve it.
A full list of intrinsics as of EOSIO 2.0.X [can be found here](https://github.com/EOSIO/eosio.cdt/blob/a6b8d3fc289d46f4612588cdd7223a3d549238f6/libraries/native/native/eosio/intrinsics_def.hpp#L42-L160):

```bash
get_resource_limits
set_resource_limits
set_proposed_producers
set_proposed_producers_ex
get_blockchain_parameters_packed
set_blockchain_parameters_packed
is_privileged
set_privileged
is_feature_activated
preactivate_feature
get_active_producers
db_idx64_store
db_idx64_remove
db_idx64_update
db_idx64_find_primary
db_idx64_find_secondary
db_idx64_lowerbound
db_idx64_upperbound
db_idx64_end
db_idx64_next
db_idx64_previous
db_idx128_store
db_idx128_remove
db_idx128_update
db_idx128_find_primary
db_idx128_find_secondary
db_idx128_lowerbound
db_idx128_upperbound
db_idx128_end
db_idx128_next
db_idx128_previous
db_idx256_store
db_idx256_remove
db_idx256_update
db_idx256_find_primary
db_idx256_find_secondary
db_idx256_lowerbound
db_idx256_upperbound
db_idx256_end
db_idx256_next
db_idx256_previous
db_idx_double_store
db_idx_double_remove
db_idx_double_update
db_idx_double_find_primary
db_idx_double_find_secondary
db_idx_double_lowerbound
db_idx_double_upperbound
db_idx_double_end
db_idx_double_next
db_idx_double_previous
db_idx_long_double_store
db_idx_long_double_remove
db_idx_long_double_update
db_idx_long_double_find_primary
db_idx_long_double_find_secondary
db_idx_long_double_lowerbound
db_idx_long_double_upperbound
db_idx_long_double_end
db_idx_long_double_next
db_idx_long_double_previous
db_store_i64
db_update_i64
db_remove_i64
db_get_i64
db_next_i64
db_previous_i64
db_find_i64
db_lowerbound_i64
db_upperbound_i64
db_end_i64
assert_recover_key
recover_key
assert_sha256
assert_sha1
assert_sha512
assert_ripemd160
sha1
sha256
sha512
ripemd160
check_transaction_authorization
check_permission_authorization
get_permission_last_used
get_account_creation_time
current_time
publication_time
read_action_data
action_data_size
current_receiver
require_recipient
require_auth
require_auth2
has_auth
is_account
prints
prints_l
printi
printui
printi128
printui128
printsf
printdf
printqf
printn
printhex
read_transaction
transaction_size
expiration
tapos_block_prefix
tapos_block_num
get_action
send_inline
send_context_free_inline
send_deferred
cancel_deferred
get_context_free_data
get_sender
```

This list is not fixed, it evolves with EOSIO. For example, EOSIO 1.8 introduced the `get_sender` intrinsic.
There are also talks about including intrinsics for Elliptic Curve Cryptography in a future EOSIO release.

Most of the intrinsics are commonly used by EOSIO smart contract developers, but there are a few that are not widely known and are rarely used.
Let's look at 8 EOSIO intrinsics you might not have heard about before:

1. `publication_time`: Returns the transaction's publication time.
    ```cpp
time_point publication = eosio::publication_time();
    ```
1. `get_account_creation_time`: Returns the account creation time. This could be useful if you implement an airgrab and only want all accounts older than some specific date to be eligible. Alternatively, it could be used in a voting strength calculation - older accounts have more power.
    ```cpp
time_point creation_time = get_account_creation_time(get_self());
    ```
1. `get_permission_last_used`: Returns the date when an account's permission was used the last time. Could be used to check for dormant accounts. However, you need to specify a specific permission and EOSIO allows you to define custom permissions, which means it won't give you an accurate prediction of when an account authorized an action the last time.
    ```cpp
time_point last_used = get_permission_last_used(get_self(), name("active"));
    ```
1. `is_feature_activated`: EOSIO is constantly developing and not all chains run the latest version. Furthermore, EOSIO 1.8 introduced _feature flags_ where BPs can decide to enable or disable a specific feature. The `is_feature_activated` intrinsic allows smart contract developers to write chain-independent code with different behavior depending on what features are activated. For example, we could check if the `get_sender` intrinsic is activated.
    ```cpp
// GET_SENDER = hex f0af56d2c5a48d60a4a5b5c903edfb7db3a736a94ed589d0b797df33ff9d3e1d
const checksum256 &feature_digest = ...;
bool activated = eosio::is_feature_activated(feature_digest);
name sender = activated ? name(eosio::get_sender()); : get_first_receiver();
    ```
1. `get_sender`: This intrinsic allows getting the actual sender of an inline action or action notification. It can be used to forbid smart contracts from calling actions on your smart contract. Something that [NewDex tries to achieve, but is currently easy to circumvent with custom permissions](/how-to-check-if-an-eos-account-has-a-smart-contract/).
    ```cpp
name sender = name(eosio::get_sender());
    ```
1. `read_transaction`: This is one of the must useful unknown intrinsics in my opinion. It returns the **input** transaction. Meaning, you'll get access to the transaction header and actions that are defined in the transaction that was submitted to the chain. Actions that are the result of inline actions or `require_recipient` calls are _not_ included. Usecases are checking who paid for CPU of the transaction, or checking for transactions that consist of multiple actions, like a token `open + transfer` transaction.
    ```cpp
char tx_buffer[eosio::transaction_size()];
eosio::read_transaction(tx_buffer, eosio::transaction_size());
const std::vector<char> trx_vector(
    tx_buffer, tx_buffer + sizeof tx_buffer / sizeof tx_buffer[0]);
transaction trx = eosio::unpack<transaction>(trx_vector);
action first_action = trx.actions[0];
print("first action was: ", first_action.account, " ", first_action.name);
char *action_data_buffer = trx.actions.at(0).data.data();
    ```
1. `check_permission_authorization`: Allows to check if an account's permission is satisfied by specific public keys, accounts, or waits.
    ```cpp
ACTION permissionpm(const eosio::public_key &pub) {
  const std::set<public_key> provided_keys = {pub};
  // check_permission_authorization actually returns a boolean
  check(check_permission_authorization(get_self(), name("active"),
                                        provided_keys),
        "please add this key to the active permission");
}
    ```
1. `check_transaction_authorization`: Similar to the previous `check_permission_authorization`, it checks if all declared authorizations of all actions of the specified transaction are satisfied by a set of provided permissions. Note that this does not check signatures of the transaction and the provided public keys though. I can't think of any usecases for the average EOSIO smart contract. This might still be useful when implementing a utility smart contract that serializes transactions on-chain and provides an alternative to deferred transactions.
    ```cpp
ACTION permissiontx(const transaction &tx) {
  std::set<permission_level> provided_permissions = {
      permission_level(get_self(), eosio::name("dummy"))};
  const std::set<public_key> provided_keys;
  // check_transaction_authorization actually returns a boolean
  check(check_transaction_authorization(tx, provided_permissions,
                                        provided_keys),
        "wrong auth");
}
    ```

Have you ever used one of these intrinsics? I'd be curious to discover new use-cases for these.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
