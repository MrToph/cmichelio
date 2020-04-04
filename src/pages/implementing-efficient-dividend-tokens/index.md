---
title: Implementing efficient Dividend tokens
date: 2020-03-02
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
draft: true
---

Blockchain makes it possible to distribtue ownership of a product and its funds to thousands of individuals in a verifiable way.
For example, casino dapps might crowd-source the funds required for the _house_ and in return distribute all profits back to the supporters proportional to their share in the total house funds.
Similarly, on EOSIO users can lend their unused CPU from their staked EOS tokens to the resource exchange (REX) and earn their share everytime someone rents CPU from REX.

To make this profit sharing trustless and verifiable it must be implemented in a smart contract. The challenge is that this must be done efficiently as we want to support hundreds of thousands of users. (REX on EOS mainnet currently has [21,580 REX holders](https://eosauthority.com/rex/statistics?network=eos)).

This post explains how to implement efficient dividend tokens by exploring and gradually building up on ideas.

## Storing the balance per user

The simplest way would be to just store the balance per users at each time.
Assume there are 4 users depositing 25 _TOKENS_ each.

| User | Balance | % Share |
| ---- | ------- | ------- |
| 1    | 25      | 25%     |
| 2    | 25      | 25%     |
| 3    | 25      | 25%     |
| 4    | 25      | 25%     |

If there's a profit of 20 TOKENS, it should be split in a way that each user receives the appropriate share of 5 TOKENS.

The new balance for user $user_i$ is computed as:

$$balance_i' += (balance_i / TOTAL_BALANCE) * PROFIT$$

The updated balance looks like this:

| User | Balance | % Share |
| ---- | ------- | ------- |
| 1    | 30      | 25%     |
| 2    | 30      | 25%     |
| 3    | 30      | 25%     |
| 4    | 30      | 25%     |

This requires **iterating through all users** whenever there is a profit to be shared.
One could mitigate this by letting the profits accumulate in a pool and only periodically distributing the funds.
However, as we'll see there are better options.

A useful insight at this point is that while the absolute balances for each user change with each profit distribution, their **percentage in the total share stays constant**.
Their share as a percentage only changes when a user makes a deposit or withdrawal.

#### Requirements:

1. Requires storing the users' balances, and the total sum of balances of all users.
2. Each profit distribution requires iterating over all users.
3. Each new user deposit / withdrawal requires only changing that user's balance and the total amount.

## Storing the percentage of total share per user

Assuming profit distributions occur more frequently than users joining / leaving the system, using the previous insight we can implement a more efficient scheme by storing each user's share percentage instead of the balance.

This improvement is useful for casinos where a profit distribution can happen with each bet.

| User | % Share | (Balance) (not stored) |
| ---- | ------- | ---------------------- |
| 1    | 25%     | (25)                   |
| 2    | 25%     | (25)                   |
| 3    | 25%     | (25)                   |
| 4    | 25%     | (25)                   |

When a profit happens, we don't need to do anything because the profit is distributed proportional to each user's share anyway, meaning each user's share remains the same.
Only if you actually wanted to transfer the profit to each user you would need iterate over all users and recompute the values.
The same is true for deposits and withdrawals for users because they are in itself just transfers of funds.

#### Requirements:

1. Requires storing the users' share percentages, and the total sum of balances of all users.
2. We don't need to do anything when new profits are added to the pot.
3. Each new user deposit / withdrawal requires changing the share percentage of **each user** and the total amount.

## Creating a dividend token

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
