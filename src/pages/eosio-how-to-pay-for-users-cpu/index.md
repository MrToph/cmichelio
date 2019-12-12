---
title: EOSIO - How to pay for users' CPU
date: 2019-12-12
image: ./featured.jpg
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

EOSIO 1.8 introduced the `ONLY_BILL_FIRTH_AUTHORIZER` feature which _only bills CPU costs of a transaction to the first account authorizing_ it.
Which in turn allows any account to pay for the CPU costs of a transaction of another user.
For example, dapps can pay for their users' CPU, or, if you have many EOS accounts yourself, you can designate one of your accounts as the CPU payer and make use it to pay for the transactions of all your other accounts.

The way it works is by prepending the actual transaction with a dummy action that is authorized/signed by the CPU payer account. The dummy action should itself consume minimal CPU, therefore a [no-operation (noop)](<https://en.wikipedia.org/wiki/NOP_(code)>) action is usually used.

Assuming your intention is to transfer some EOS tokens, the final transaction with a prepended CPU payer action authorized by a different account might look [like this transaction](https://bloks.io/transaction/969c8b332340f83e8cc35a4a7d3ae1fb7c3c49e1360a56b61b1abc5ded55ae7c):

![ONLY_BILL_FIRTST_AUTHORIZER CPU paying action](./featured.png)

As you can see the transaction now requires signatures from two accounts. Creating a single signature from one account is sometimes called _cosigning_.

> It's also possible to just authorize **the actual action** - in our case the eosio.token::transfer - by the CPU payer in addition to the transferring account. The ONLY_BILL_FIRTST_AUTHORIZER would still apply to the desired CPU payer. However, this can lead to security issues if you don't know what you're doing and blindly _cosign_ any transaction. In our case, it would allow transferring the tokens also from the CPU paying account because the transfer action now has the CPU payer's authorization. Prepending and signing a noop-action is more foolproof and therefore my recommended way.

## How to use ONLY_BILL_FIRST_AUTHORIZER with eos-transit/scatter-js/eos-js

That just about wraps up the theory - let's see how it's possible to use this feature in practice.
Surprisingly, there's not a lot of example code yet, so I created an [example repo demonstrating the ONLY_BILL_FIRST_AUTHORIZER](https://github.com/MrToph/eos-pay-for-user-cpu-example) feature.

It consists of a server and a frontend part which is a fork of [EOS NY/EOS Titan's eos-transit example](https://github.com/eosnewyork/eos-transit/tree/master/examples/transit-react-basic).

1. **server**: You won't get around using a backend to accept/deny the transaction requests. Remember that we need to authorize and sign with the CPU payer's keys, so we cannot store them in the frontend. Otherwise, they can be extracted and used to sign any transaction. What we'll implement is a small function residing on the server that approves/disapproves a CPU paying request for a transaction. If approved, it prepends a noop action and cosigns the request. _Serverless_ functions, like AWS Lambda or Google Cloud functions, are perfect for this task.
2. **client**: The client uses [eos-transit](https://github.com/eosnewyork/eos-transit), a multi-wallet signature provider, to cosign the transaction from the user's perspective. If you're not using eos-transit, don't worry, the example also works scatter-js or any other abstraction on top of [eosjs's `Api` object](https://github.com/EOSIO/eosjs#api).

### Client

Let's start with the client code. The idea is to send the transaction to the server which signs it, then request a signature from the user, and finally merge both signatures, and send the serialized transaction with the combined signatures to a standard EOS node endpoint.

```typescript
// this also affects the serialization
const transactionHeader = {
  blocksBehind: 3,
  expireSeconds: 60,
}

const sendTransaction = async actions => {
  const tx = {
    actions,
  }

  let pushTransactionArgs: PushTransactionArgs

  let serverTransactionPushArgs: PushTransactionArgs | undefined
  try {
    serverTransactionPushArgs = await serverSign(tx, transactionHeader)
  } catch (error) {
    console.error(`Error when requesting server signature: `, error.message)
  }

  if (serverTransactionPushArgs) {
    // just to initialize the ABIs and other structures on api
    // https://github.com/EOSIO/eosjs/blob/master/src/eosjs-api.ts#L214-L254
    await wallet.eosApi.transact(tx, {
      ...transactionHeader,
      sign: false,
      broadcast: false,
    })

    // fake requiredKeys to only be user's keys
    const requiredKeys = await wallet.eosApi.signatureProvider.getAvailableKeys()
    // must use server tx here because blocksBehind header might lead to different TAPOS tx header
    const serializedTx = serverTransactionPushArgs.serializedTransaction
    const signArgs = {
      chainId: wallet.eosApi.chainId,
      requiredKeys,
      serializedTransaction: serializedTx,
      abis: [],
    }
    pushTransactionArgs = await wallet.eosApi.signatureProvider.sign(signArgs)
    // add server signature
    pushTransactionArgs.signatures.unshift(
      serverTransactionPushArgs.signatures[0]
    )
  } else {
    // no server response => sign original tx
    pushTransactionArgs = await wallet.eosApi.transact(tx, {
      ...transactionHeader,
      sign: true,
      broadcast: false,
    })
  }

  return wallet.eosApi.pushSignedTransaction(pushTransactionArgs)
}

async function serverSign(
  transaction: any,
  txHeaders: any
): Promise<PushTransactionArgs> {
  // insert your server cosign endpoint here
  const rawResponse = await fetch('http://localhost:3031/api/eos/sign', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tx: transaction, txHeaders }),
  })

  const content = await rawResponse.json()
  if (content.error) throw new Error(content.error)

  const pushTransactionArgs = {
    ...content,
    serializedTransaction: Buffer.from(content.serializedTransaction, `hex`),
  }

  return pushTransactionArgs
}
```

The code is not as straight-forward as just calling `eosApi.transact()`, because eosjs was never intended to do any cosigning.
Instead, we use several calls to the `eosApi` methods to manually build and cosign the transaction. We fake the `requiredKeys` variable, which would by default be both the user and the CPU payer's keys, to just be the user's keys. This enables cosigning.

Prepending the CPU payer action and then checking if a free CPU request is granted all happens on the server.

If the server is down or does not grant the request, we fall back to signing the original transaction with the current wallet user as the payer.

### Server

On the server-side, we check the actions in the transaction, prepend the no-operation action used for paying for CPU (named `payforcpu`), and sign it with the `payforcpu` permission of our dapp contract.

```typescript
import { Request, Response, Router, Express } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { api } from 'src/eos/api'
import { PushTransactionArgs } from 'eosjs/dist/eosjs-rpc-interfaces'
import { getNetwork } from 'src/eos/networks'

const router = Router()

const buffer2hex = (buffer: Uint8Array) =>
  Array.from(buffer, (x: number) => ('00' + x.toString(16)).slice(-2)).join('')

// we allow actions on this contract
const ALLOWED_CONTRACT = `dappcontract`
const checkAction = (action: any): void => {
  switch (action.account) {
    case `eosio.token`: {
      if (action.data.to !== ALLOWED_CONTRACT) {
        throw new Error(
          `Free CPU for transfers to other contracts is not granted.`
        )
      }
      return
    }
    case ALLOWED_CONTRACT: {
      // any internal action except payforcpu is fine
      // we don't want someone to DDOS by sending only payforcpu actions
      if (action.name === `payforcpu`) {
        throw new Error(`Don't include duplicate payforcpu actions.`)
      }
      return
    }
    default: {
      throw new Error(
        `Free CPU for actions on ${action.account} is not granted.`
      )
    }
  }
}

const checkTransaction = (tx: any): void => {
  tx.actions.forEach(checkAction)
}

router.post('/sign', async (req: Request, res: Response) => {
  try {
    const { tx, txHeaders = {} } = req.body
    if (!tx || !tx.actions) {
      return res.status(BAD_REQUEST).json({
        error: `No transaction passed`,
      })
    }

    checkTransaction(tx)

    // insert cpu payer's payforcpu action as first action to trigger ONLY_BILL_FIRST_AUTHORIZER
    tx.actions.unshift({
      account: ALLOWED_CONTRACT,
      name: 'payforcpu',
      authorization: [
        {
          actor: ALLOWED_CONTRACT,
          permission: `payforcpu`,
        },
      ],
      data: {},
    })

    // https://github.com/EOSIO/eosjs/blob/master/src/eosjs-api.ts#L214-L254
    // get the serialized transaction
    let pushTransactionArgs: PushTransactionArgs = await api.transact(tx, {
      blocksBehind: txHeaders.blocksBehind,
      expireSeconds: txHeaders.expireSeconds,
      // don't sign yet, as we don't have all keys and signing would fail
      sign: false,
      // don't broadcast yet, merge signatures first
      broadcast: false,
    })

    // JSSignatureProvider throws errors when encountering a key that it doesn't have a private key for
    // so we cannot use it for partial signing unless we change requiredKeys
    // https://github.com/EOSIO/eosjs/blob/849c03992e6ce3cb4b6a11bf18ab17b62136e5c9/src/eosjs-jssig.ts#L38
    const availableKeys = await api.signatureProvider.getAvailableKeys()
    const serializedTx = pushTransactionArgs.serializedTransaction
    const signArgs = {
      chainId: getNetwork().chainId,
      requiredKeys: availableKeys,
      serializedTransaction: serializedTx,
      abis: [],
    }
    pushTransactionArgs = await api.signatureProvider.sign(signArgs)

    const returnValue = {
      ...pushTransactionArgs,
      serializedTransaction: buffer2hex(
        pushTransactionArgs.serializedTransaction
      ),
    }
    return res.status(CREATED).json(returnValue)
  } catch (err) {
    console.error(err.message)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

export default router
```

The cosigning code is similar to the one we saw on the client-side. The new part is the code where the transaction is checked.
Here, we only grant free CPU for actions on our dapp contract, or for `eosio.token` transfers to it.

This code can now be deployed as a serverless function and you can pay for your users' transactions involving your dapp in a secure way, while still being compatible with all wallets. 🚀

The full example is available [on Github](https://github.com/MrToph/eos-pay-for-user-cpu-example/blob/master/server/src/routes/sign.ts).

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
