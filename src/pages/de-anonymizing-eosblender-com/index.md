---
title: De-anonymizing eosblender.com
date: 2019-12-14
image: ./featured.jpeg
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

eosBlender, the first EOS mixing service, recently came to my intention by this EOS NY tweet:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">EOS Blender has launched which allows for trustless token mixing/transfer obfuscation services on <a href="https://twitter.com/hashtag/EOS?src=hash&amp;ref_src=twsrc%5Etfw">#EOS</a>. Excellent use of <a href="https://t.co/I935Bm0VO7">https://t.co/I935Bm0VO7</a> for contract immutability. <a href="https://t.co/hOOPqq5KEv">https://t.co/hOOPqq5KEv</a> <a href="https://twitter.com/search?q=%24eos&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$eos</a></p>&mdash; EOS New York (@eosnewyork) <a href="https://twitter.com/eosnewyork/status/1188760240403243009?ref_src=twsrc%5Etfw">October 28, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I don't want to go as far as saying that EOS NY is endorsing or affiliated with bloxchanger's eosBlender mixing service in any way, but one should at least be more careful about promoting projects that have obvious red flags:

- anonymous team
- section on "How it works" doesn't explain how it works

Fortunately, it was already called out in the twitter replies.
I now had a deeper look at how it _actually_ works.
**Big surprise, it's useless and it's easy to de-anonymize any transaction**.
But first, let's have a look at the website:

> eosBlender aims to make transactions safer and untraceable. It’s a service that mixes different streams of potentially identifiable EOSIO payments. This improves the anonymity of token transfers while contributing towards privacy over internet transactions.
> 1. The sender deposits a given amount of EOS on the eosioblender smart contract and assigns the deposit to a specific receiver.
> 2. The receiver can then activate a claim action for the same amount and receive the corresponding transfer from the smart contract.  
> The sender’s payment gets mixed with that of other users in the eosioblender account. The transaction data is not publicly disclosed. In fact, the name of the receiver and amount of the transfer are **temporarily recorded** in form of cryptographic hash values that **only the smart contract can decrypt** when the receiver claims the funds.
> The protocol eliminates the explicit link between the original transaction and the receiver address. At the same time, it maintains the same security properties of the EOSIO token transfers.

<iframe src="https://giphy.com/embed/3ELtfmA4Apkju" width="240" height="160" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>

My highlights are "_temporarily recorded_" and "_only the smart contract can decrypt_".
Nothing can just be temporarily recorded on a blockchain, everything is permanent and public.
Hashes can also not be "_decrypted_", you find an input/preimage that matches the hash - the terminology is wrong.
It's also obvious that if the smart contract can decrypt something, anyone can do the same by just running the WASM code with the action data.

## What is eosBlender actually doing?

eosBlender works by sending two transactions.

1. The first one sends X EOS to eosBlender and assigns it to a _receiver_. The receiver information is encoded in two hashes (`depositId` and `myreceiverHash`) and therefore not _immediately_ visible. That's all the privacy eosBlender provides.
2. The receiver can now claim the funds by providing a third hash (`controlhash`).

Let's have a look at example transactions from the bloxchanger team trying to hide their own transfers.
(Looking at the volume of eosBlender, they are probably also the only ones using it.)

First, the [EOS transfer & assign transaction](https://eosq.app/tx/62ca277f6b0c035b0505b11ea19e0ff676777fa199417c045fe26e7ce3d55f32) from `accountspawn` account to `eosioblender` involves these hashes:

```json
{
   "depositId": "aa0dcdc28a6a2cb2138b69bda66d0a267ee6996407fa2778840bfb43dc5c0df9",
   "myreceiverHash": "224591065c76b7ee3428d05f2a72bd8d29fc1bd36bc286ee874c959f977f85c6",
   "quantity": "1.0000 EOS",
   "username": "accountspawn"
}
```

Second, the [claim transaction](https://eosq.app/tx/4cc6e82882e41425ba2ef85ac8d5c5cd1ad3bc34fb130475faecf1d76926fdc5) from the `bloxchangers` account:

```json
{
   "controlhash": "7fb3b1b7bd2434ecc216db39d549694c077a1dedd5b9f4bea08d5ef3db3810d7",
   "myreceiver": "bloxchangers",
   "quantity": "1.0000 EOS"
}
```

The anonymity is based on the hope that the `controlhash` of the claim transaction is not linkable to any of the hashes of the transfer action.
It takes about 10 minutes of reverse-engineering to see how these hashes are computed and can be linked.
The frontend code is not even minimized and [readable in plain](https://eosblender.com/dep/index.html):

```js
// how the eosblender hashes are computed

// arguments are from the initial transfer transaction
// in our example receiver = `bloxchangers`, amount = `1`, memo = secret memo from frontend
const computeHashes = ({ receiver, memo, amount }) => {
  let checkcode = "c8PGNTDRuY3JX8tFJePGP1K7qktqRwBGv";
  let mydepostr =
    checkcode + memo + Number(amount).toFixed(4) + " EOS" + receiver;
  let depositId = sha256(mydepostr);

  let claimcode = "KVEE6xCu6UFgUzv6HoQhtn66HmTcoQa";

  let mystr = receiver + Number(amount).toFixed(4) + " EOS" + memo + checkcode;
  let controlhash = sha256(mystr);
  let myreceiverHash = sha256(controlhash + receiver + claimcode);

  return {
    depositId: depositId,
    myreceiverHash: myreceiverHash,
    controlhash,
  };
};
```

Given the transfer inputs _from the web UI_, one can compute all three hashes used in the transfer and claim transactions.

> The memo used for the computation is not the memo of the eosio.token::transfer action. It's a secret memo one inputs in the frontend that is not stored on-chain. The receiver needs to input this in the frontend as well when claiming the action. Therefore, it's at least not possible for a third-party to claim your funds.

We can **completely de-anonymize any eosBlender claim** by doing the same calculations as above.
I created a proof-of-concept app where one enters the `receiver` and `controlhash` of a claim, and the `myreceiverhash` is computed which uniquely identifies the funding transaction.
You just need to search the chain for a transfer transaction with the corresponding `myreceiverhash`.
The code is [open-source on codesandbox](https://codesandbox.io/s/eosblender-debunked-o9om9?from-embed):

<iframe
     src="https://codesandbox.io/embed/strange-williamson-o9om9?fontsize=14&hidenavigation=1&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="eosblender-debunked"
     allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
     sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
   ></iframe>

In the end, security must be based [_solely_ on mathematics](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle), and if projects are reluctant to show their code or explain the technical details of their protocols, run away. 🏃‍♂️
What we got is a _security through obscurity_ mixing service that is completely useless - but hey, at least the smart contract code was locked for a couple of weeks!

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
