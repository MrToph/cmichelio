---
title: Thoughts on making EOS development easier
featured: /thoughts-on-making-eos-development-easier/featured.png
date: 2018-03-11
categories:
- Tech
- EOS
medium:
- EOS
- Programming
- Development
steem:
- eos
- steemdev
- javascript
- programming
- dev
---

I started writing my first smart contract for [EOS](https://eos.io) and I had to overcome some hurdles.
This is to be expected because EOS is not even released yet, and we're working with a rapidly changing test version until June this year.
Also, the only information comes from the GitHub's wiki, the rest is only documented in the code.
Still, having everything set up and running, I have to say the developer experience of developing smart contracts leaves a lot to be desired.

Here's what I need to do **every time** I start working on my EOS project:
1. Start a virtual machine running Ubuntu 16 with my EOS installation.
1. Run a local test network: Start the `eosd` service that listens to and processes my transactions and produces blocks for the blockchain.
1. Open a wallet containing the **private keys of my contract test accounts** with `eosc wallet open -n default`
1. Unlock that wallet with `eosc wallet unlock -n default <<< 'password'`

Here's the cycle I go through while developing:
1. Make changes to my smart contract's `.cpp` file.
1. Compile it to WebAssembly with `eoscpp -o contract/TestContract.wast contract/TestContract.cpp`
1. Whenever the ABI (the smart contract's public interface) changes, I need to recompile it with `eoscpp -o contract/TestContract.abi contract/TestContract.hpp`
1. Upload the changed smart contract to the blockchain with `eosc set contract test contract/TestContract.wast contract/TestContract.abi`
1. Invoke the smart contract with `eosc push message test actionname '{"key":"value","some":"json"}' --scope test --permission test@active`
1. Sieve through the `eosd` log to see the `print` debugging statements of my contracts

I think most dapp developers come from a web development background where you nowadays get immediate feedback when you change the code, through **hot-reloading** or through **test-runners watching for file changes**. [Immediate feedback is important for the creative process](https://vimeo.com/36579366).

Of course, blockchain dapp development is still in its very early stages and a lot of tooling is missing which will come later in time.
But why wait, when we can change the future right now.
Here are some thoughts on how smart contract development could become easier.
It's a good idea to completely forget how things are right now to get a perspective change and start by asking:

> _What would it look like if it were easy?_ - Tim Ferris

## What would dapp development look like if it were easy?
It would look something like this:
1. No initial setup phase. You just create a project. (Maybe some initial project specific configuration.)
1. You change the code of your `.cpp` smart contract and press save. It is compiled and the smart contract is updated on your local testnet.
1. You run a bunch of tests against your newly deployed smart contract.

## How can we achieve this?
Ethereum already has a great development environment [Truffle](http://truffleframework.com/docs/) that does a lot of these things:
> Built-in smart contract compilation, linking, deployment and binary management.
> Automated contract testing for rapid development.

Truffle also comes with [Ganache](http://truffleframework.com/ganache/) which is _an internal Javascript implementation of the Ethereum Blockchain_ available on all platforms.

The ultimate goal for EOS should be to have something similar to Truffle.
To quickly prototype and play with the EOS test versions today, we could also do the following:

1. Move the EOS test blockchain to the cloud. For instance, we can run a Digital Ocean droplet with Ubuntu and install EOS there. You can communicate with the remote `eosd` by specifying a host and a port in the `eosc` command:
```
eosc -H <ip> -p 8888
```

2. Use [eosjs](https://github.com/EOSIO/eosjs) for the API calls and for writing tests. EOSjs is a JavaScript _general purpose library for the EOS blockchain._
This way, you could get rid off your local EOS setup.

```js
const fs = require('fs')
const Eos = require('eosjs')
const {ecc} = Eos.modules
//  for CPP -> WASM compilation
const binaryen = require('binaryen')

initaPrivate = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'

// New deterministic key for the currency account.  Only use a simple
// seedPrivate in production if you want to give away money.
const testPrivate = ecc.seedPrivate('test')
const testPublic = ecc.privateToPublic(testPrivate)

const keyProvider = [initaPrivate, testPrivate]
const eos = Eos.Localnet({keyProvider, binaryen, httpEndpoint: 'http://127.0.0.1:8888'})

// This is only needed once to set up the account
eos.newaccount({
  creator: 'inita',
  name: 'test',
  owner: testPublic,
  active: testPublic,
  recovery: 'inita',
  deposit: '1000 EOS'
})

const contractDir = `contract`
const wast = fs.readFileSync(`${contractDir}/test.wast`)
const abi = fs.readFileSync(`${contractDir}/test.abi`)
// To publish contract to the blockchain:
eos.setcode('test', 0, 0, wast, abi)

module.exports = {
    eos,
}

```

To test your contract, you can use any JavaScript testing framework. I used `jest` in this example:

```js
const { eos } = require('../config')

test('"test" has correct balance upon "test" action', async () => {
    const contract = await eos.contract('test')
    // you can now call any action defined in the ABI of the contract
    // eosc push message test actionname '{"key":"value","some":"json"}' --scope test --permission test@active
    const transaction = await contract.test('value', 'json')
    const newBalance = (await eos.getAccount('test')).eos_balance
    expect(newBalance).toBe('10.0000 EOS')
});
```

This way we solved how to tests your EOS smart contract in a nice way.
We could add a _watcher_ that watches for a file change of the `.cpp/.hpp` files and then runs a script that recompiles them and deploys to our remote test blockchain.
Adding the contract account's private key to the `keyProvider` array should be enough to sign the transaction, meaning we can also get rid off running our unlocked wallet locally.
This gets us quite close to the goal of not having to set up EOS at all locally and just running NPM scripts to communicate with the EOS blockchain.

These are just some ideas that crossed my mind while developing my first EOS smart contract. I'll try them out and improve them. After having a workflow that works well for me, I'll then create a follow-up post.

**It would be nice to hear how your EOS development workflow looks like.**
