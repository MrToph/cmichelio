---
title: Capture The Ether Solutions
date: 2021-01-04
image: ./featured.png
categories:
  - Tech
  - ETH
  - security
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
draft: true
---

[Capture the Ether](https://capturetheether.com) is a game to learn about Ethereum smart contract security.
It already launched over 2 years ago but most things you'll learn still apply to solidity today.

There even is a [leaderboard](https://capturetheether.com/leaderboard/). You can still be immortalized as one of the first top 100 to solve all challenges.
(I'm at rank 56.)
Go ahead an try it!

I solved all challenges using the modern [hardhat](https://hardhat.org/) local environment which makes forking from the ropsten test network and testing your exploits locally very easy.
My solutions [can be found here](https://github.com/MrToph/capture-the-ether).

I'll discuss all challenges in this post.

# [Warmup](https://capturetheether.com/challenges/warmup/)

## Deploy

The first challenge is very easy and is just meant to get you set up.
Install Metamask, create a wallet, login, and get some testnet ropsten ether.
At the time of writing, I could get testnet ether using [this faucet](https://faucet.ropsten.be/) and [this faucet](https://faucet.dimensions.network/).
Around 10 ether will be enough.

## Call Me

This one is easy, too. Just call the function of the deployed smart contract.

## Nickname

The last warmup challenge allows you to choose a nickname which will be shown on the leaderboard.

# [Lotteries](https://capturetheether.com/challenges/lotteries/)

## Guess the number

The number is hardcoded in the smart contract and is `42`.

## Guess the secret number

We need to supply a number which will be hashed to match the hash stored in the contract.
Notice how the number we provide is just an `uint8` which is just an 8-byte integer.
We can bruteforce all possible 2^8=256 numbers and compute the hash for each one of them and compare it to the smart contract hash.

## Guess the random number

Here, the answer is stored in the blockchain state (storage).
Even though the storage variable is private, all data on the blockchain is public and can still be retrieved.
Once we understand how [the storage layout](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html) works, we see that the answer storage variable is stored at slot `0` which we can then query from a node.
Using ethers, we can get the storage at slot `0` using this code:

```js
const number = BigNumber.from(
  await contract.provider.getStorageAt(contract.address, 0)
)
```

## Guess the new number

The answer does not use any future blockchain state which means we can write our [own smart contract](https://github.com/MrToph/capture-the-ether/blob/master/contracts/lotteries/GuessTheNewNumberAttacker.sol#L16-L27) that just emulates the exact same steps that the challenge smart contract does and then submit our result from our contract.

```solidity
function attack() external payable {
  // simulate all steps the challenge contract does
  require(address(this).balance >= 1 ether, "not enough funds");
  uint8 answer = uint8(uint256(
    keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))
  ));
  challenge.guess{value: 1 ether}(answer);

  require(challenge.isComplete(), "challenge not completed");
  // return all of it to EOA
  tx.origin.transfer(address(this).balance);
}
```

## Predict the future

This time the answer needs to be locked in first and can only be checked after a certain number of blocks have settled.
However, the answer is only in the range of 0 to 9 because of the modulo 10 instruction:

```solidity
uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;
```

Also notice how the answer is the result of using `keccak256`, a hash function, which will create a random number based on the head block number.
Therefore our strategy can be as simple as:

- Lock in a guess of `0`
- Spam transaction that end up in different blocks and at some point the computed answer will match our `0` as it's random and in the range of `[0, 9]`.

```solidity
function lockInGuess(uint8 n) external payable {
    // need to call it from this contract because guesser is stored and checked
    // when settling
    challenge.lockInGuess{value: 1 ether}(n);
}

function attack() external payable {
    challenge.settle();

    // if we guessed wrong, revert
    require(challenge.isComplete(), "challenge not completed");
    // return all of it to EOA
    tx.origin.transfer(address(this).balance);
}

receive() external payable {}
```

## Predict the block hash

For the last challenge of this section, the answer is chosen as the blockhash of a specific block.
Here, you need to know that the blockhash function only returns the true blockhash for the last 256 blocks due to performance reasons:

> `block.blockhash(uint blockNumber)` returns (`bytes32`): hash of the given block - only works for 256 most recent, excluding current, blocks - deprecated in version 0.4.22 and replaced by `blockhash(uint blockNumber)`.

After 256 blocks, `blockhash` returns 32 zeroes.
To solve this challenge, lock in `0x0000000000000000000000000000000000000000000000000000000000000000` and wait 257 blocks to call the `settle` action.

# [Math](https://capturetheether.com/challenges/math/)

The math section covers integer over- and underflow and integer division issues and has been the most interesting section for me.

## Token sale

This challenge involves an exchange contract that buys and sells tokens for a fixed price of `1 ether`.
Our goal is to first buy tokens and then sell them for a profit.

The issue is in this line which is susceptible to an integer overflow:

```solidity
// 1 ether = 10^18
uint256 constant PRICE_PER_TOKEN = 1 ether;

function buy(uint256 numTokens) public payable {
    require(msg.value == numTokens * PRICE_PER_TOKEN);

    balanceOf[msg.sender] += numTokens;
}
```

Knowing that `1 ether` is just the short form of `10^18`, we can force an overflow and buy tokens at a price of `0` by choosing `numTokens` to be the max possible uint256 + 1, divided by 10^18, i.e., `2^256 / 10^18`.
The smart contract will then check if `msg.value` equals `(2^256 / 10^18) * 10^18 % 2^256 = 2^256 % 2^256 = 0` because of the overflow.

## Token whale

This challenge contract is written in a confusing way.
There is a `transferFrom` function which uses three values: `from`, `to` and `msg.sender`, but such a function really only needs to be concerned about two of these values.

```solidity
function _transfer(address to, uint256 value) internal {
    balanceOf[msg.sender] -= value;
    balanceOf[to] += value;

    emit Transfer(msg.sender, to, value);
}

function transferFrom(address from, address to, uint256 value) public {
    require(balanceOf[from] >= value);
    require(balanceOf[to] + value >= balanceOf[to]);
    require(allowance[from][msg.sender] >= value);

    allowance[from][msg.sender] -= value;
    _transfer(to, value);
}
```

We can create an accomplice to our attacker address and fully `approve(accomplice, 2^256-1)` our accomplice from the `attacker`.
Then we can call the `transferFrom(attacker, attacker, 1)` function from our `accomplice` (signed such that `msg.sender == accomplice`) with both the `from` and `to` being our attacker.
This passes the `allowance[attacker][accomplice] >= value` check and underflows the accomplice's balance `balanceOf[msg.sender] -= value <=> balanceOf[accomplice] = 0 - 1 = 2^256 - 1` in the `_transfer` helper function.

This just shows that many issues can arise when using global variables like `msg.sender` in private helper functions like `_transfer` because the control flow can't be trusted anymore.

## Retirement fund

This challenge involves a lock up contract where premature withdrawals involve a penalty fee.
We can collect the penalty (which is set to be all contract funds) if we pass this check:

```solidity
function collectPenalty() public {
  // ...
  uint256 withdrawn = startBalance - address(this).balance;

  // an early withdrawal occurred
  require(withdrawn > 0);

  // penalty is what's left
  msg.sender.transfer(address(this).balance);
}
```

The idea is that a penalty occured if the start balance is less than the current balance.
However, this logic does not work in Ethereum because we can always force send ether to a contract.
Usually, sending ether to a contract requires a fallback function to be implemented, but one can force-send ether by calling the `selfdestruct` instruction on a contract containing ether.
This instruction bypasses any checks:

> The attacker can do this by creating a contract, funding it with 1 wei, and invoking selfdestruct(victimAddress). No code is invoked in victimAddress, so it cannot be prevented. This is also true for block reward which is sent to the address of the miner, which can be any arbitrary address. Also, since contract addresses can be precomputed, ether can be sent to an address before the contract is deployed. - [ConsenSys - Secure Development Recommendations](https://consensys.github.io/smart-contract-best-practices/recommendations/#remember-that-ether-can-be-forcibly-sent-to-an-account)

A simple `selfdestruct` contract to solve this challenge looks like this:

```solidity
pragma solidity ^0.7.3;

contract RetirementFundAttacker {

    constructor (address payable target) payable {
        require(msg.value > 0);
        selfdestruct(target);
    }
}
```

## Mapping

## Donation

## Fifty years2
