---
title: How to install an old package version with brew
date: 2020-09-25
categories:
- Tech
- EOS
- learneos
medium:
- macos
- catalina
- Programming
- C++
steem:
- macos
- catalina
- Programming
- C++
---

Sometimes you need to roll back to a previous version of a brew package.
If the brew package maintainers do versioning this is as easy as typing `brew install <packageName>@1.2.3`.
Often times, there's no versioning system though and the only available version is the latest one.

In previous `brew` versions you could install a package by directly linking to the GitHub repo that hosts the `Formula/<packageName>.rb` file.
The repository is usually called `homebrew-<packageName>` and you can browse through the git commits to find an old `Formula/<packageName>.rb` file.
For example, you could install an old version of [EOSIO.CDT](http://localhost:8000/how-to-rollback-to-an-older-eosio-cdt-version-with-brew/) by doing:

```bash
brew remove eosio.cdt
brew install https://raw.githubusercontent.com/EOSIO/homebrew-eosio.cdt/d0f0320017315bd5ac69aa1e1ce001c6567af6b3/eosio.cdt.rb
```

Recent `brew` versions, however, [_verschlimmbessert_](https://en.wiktionary.org/wiki/verschlimmbessern) this behavior and the brew police tells you that you're not allowed to do this anymore.

```bash
Error: Calling Installation of <packageName> from a GitHub commit URL is disabled! Use 'brew extract <packageName>' to stable tap on GitHub instead.
```

## What to do now?

Just do what the error message hints at and use `brew extract` to **_stable tap on GitHub_**.

<iframe src="https://giphy.com/embed/9ohlKnRDAmotG" width="480" height="428" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>

To save you some time, here's how to do it:

1. You create a local "tap" - which I assume is something like a local brew repository
2. You extract the desired version of the package into this local tap
3. You install your local tap

```bash
# use $USER variable to mimick userName/repoName structure
# this does not actually create any git repositories
# 1. create a new tap
brew tap-new $USER/local-<packageName>
# 2. extract into local tap
brew extract --version=1.2.3 <packageName> $USER/local-<packageName>
# 3. run brew install@version as usual
brew install <packageName>@1.2.3
```

