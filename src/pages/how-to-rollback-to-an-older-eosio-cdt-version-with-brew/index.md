---
title: How to rollback to an older EOSIO.CDT version with brew
date: 2020-01-21
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
---

Recently, EOSIO.CDT 1.7 has been released, but it has a [severe bug] where it crashes when trying to compile a contract using an `eosio::ecc_public_key` in one of its table structures.

If you're on MAC you might wonder how to roll-back to a previous EOSIO.CDT version using brew.

Sadly, there's no versioning for the EOSIO.CDT releases, but you can still rollback to a previous version by installing it directly from an old GitHub commit.

Search the [EOSIO/homebrew-eosio.cdt](https://github.com/EOSIO/homebrew-eosio.cdt) for a commit containing your desired version to install in the `eosio.cdt.rb` file, view the RAW version of this file and install it by directly providing this URL to `brew install`

```bash
# remove old version
$ brew remove eosio.cdt
# install 1.6.3
$ brew install https://raw.githubusercontent.com/EOSIO/homebrew-eosio.cdt/d0f0320017315bd5ac69aa1e1ce001c6567af6b3/eosio.cdt.rb
```

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
