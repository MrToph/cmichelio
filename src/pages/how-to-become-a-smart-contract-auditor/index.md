---
title: How to become a smart contract auditor
date: 2021-10-30
image: ./featured.jpg
categories:
- Tech
- ETH
medium:
- eth
- Programming
- blockchain
- cryptocurrency
- javascript
steem:
- eth
- utopian-io
- steemdev
- programming
- cryptocurrency
---

From time to time, I receive messages asking me for advice on how to get started as a smart contract security auditor.
While there are already articles written about this topic, most of them are just a collection of security-related articles which they throw at beginners, overwhelming them.
I'll provide a path that I would take if I had to do it all over again.
This will be ETH specific (or more general EVM-specific) as most auditing work is currently still in this ecosystem.

At the end, I'll also go over frequently asked questions that are related to auditing and getting your first job.

## Who made me the expert?
Who am I and why should you even listen to me?

I'm currently an independent security researcher who has worked at traditional auditing firms before, so I know both sides.
You don't need to listen to me but if you reached out to me, you probably have your own reasons why you think my advice is valuable.
At the time of writing, I'm currently ranked #1 auditor at [Code4rena](https://code423n4.com/leaderboard), how much weight you want to give to this ranking is again up to you.

## Learn programming
I expect that you already know how to code, any language is fine.
If not, learning how to code should be your first step as auditing code requires being able to read it.
In my opinion, being a developer is a prerequisite, otherwise, you're spending too much time trying to make sense of the syntax and the semantics of the _individual_ instructions. It'd be like trying to read Nietzsche while being illiterate. Become literate first.
This is definitely the step that takes the most time to learn, learning the security aspects happens a lot faster.

If you have no prior programming experience, be mentally prepared that it'll take you years before your reviews will be useful.
I'd start with JavaScript, it's the most beginner-friendly and versatile language. If it turns out you don't actually like being an auditor, the transition to being a frontend, backend or smart contract developer is easy.
The syntax of Solidity and JavaScript are also somewhat similar.

## Learn ETH blockchain & Solidity basics
So you know how to code now but don't know anything about Ethereum and Solidity yet.
The quickest way to learn a new language is by using it in practice, by writing code in it - reading only the docs does not make the knowledge stick (and for some reason, even after all these years I still find the Solidity docs confusing and unstructured).
There's no better way to combine learning Solidity with learning about ETH security than solving CTFs.

> CTFs (Capture The Flags / War games) are security challenges where vulnerable code is presented and you need to write a smart contract to exploit the vulnerability.

These are the three CTFs I personally solved to learn Solidity and the language:
- [Damn Vulnerable DeFi](/damn-vulnerable-de-fi-solutions/)
- [Ethernaut](/ethernaut-solutions/)
- [Capture The Ether](/capture-the-ether-solutions/)

The Ethernaut and Capture The Ether challenges often overlap and some vulnerabilities only apply to old Solidity versions.
You won't see them in modern code anymore; be aware of that.

> These CTFs were originally made to be run against an Ethereum testnet for which it's hard to get any ETH funds and the development experience is very cumbersome. I recommend an alternative approach of using modern testing frameworks & forking to solve these challenges, it's described in my [Ethernaut Solutions post](/ethernaut-solutions/). You can clone my GitHub repo to start with the same setup.

There are also CTFs that are a lot harder, like [Paradigm's CTF](/paradigm-ctf-2021-solutions/).
Scoring well in these shows that you know what you're doing and they are great for getting hired, especially if you're unknown.
All major auditing firms reached out to me after my [solutions blog post](/paradigm-ctf-2021-solutions/) with the call-to-action at the end.

## Become familiar with the most used smart contracts
There are certain contracts, patterns or even algorithms that you will see over and over again during your auditing career.
It's good to become familiar with them and deeply understand how they work and their nuances.

- Token contracts: The most used token standards are [EIP20](https://eips.ethereum.org/EIPS/eip-20) for fungible tokens, and [EIP721](https://eips.ethereum.org/EIPS/eip-721) for NFTs. There are many more, but these two are all you need to know in the beginning. It's important to understand that the original ERC20 standard evolved a lot and there are tokens that do _not_ comply with the final EIP20 (most notably USDT), which does _not_ return a success boolean among other issues. You should also understand that tokens can have different decimals and they're to be interpreted as a floating-point number with the decimals precision, i.e., `1e18 TOKENS (= 10**18 TOKENS) ~ 1.0 TOKENS` for a token with `18` decimals. You'll encounter a lot of bugs where some computed token amount is in the wrong number of decimals.
- Proxies: Ethereum contracts are _not_ upgradeable. If you want to update the code, you need to deploy a new contract. However, that means that the storage which still resides in the original contract is also lost. Thus proxies implement the idea to separate the storage from the logic. There are many different proxy implementations, have a look at the [OpenZeppelin Proxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy). You should understand how `delegatecall` is essential for building proxies.
- MasterChef: The [MasterChef](https://github.com/sushiswap/sushiswap/blob/271458b558afa6fdfd3e46b8eef5ee6618b60f9d/contracts/MasterChef.sol) is a staking contract where users deposit liquidity pool (LP) tokens and receive rewards proportional to their `time * stakeAmount`. This contract has been forked a lot but the main reason why it's important to understand is that its reward algorithm appears in many different places. Paradigm calls it the [Billion-dollar algorithm](https://www.paradigm.xyz/2021/05/liquidity-mining-on-uniswap-v3/). You should understand how it works and why it's needed in a blockchain setting (cannot update all users at the same time).
- Compound: I'd say [Compound](https://compound.finance/docs) is the basis for all decentralized peer-to-peer lending protocols. You should know it as a lot of DeFi primitives interact with lending protocols in some way. The code is also cleaner than Aave's and it's a great example of what good documentation looks like. Its `Governor` & `TimeLock` contracts are used as governance contracts of many other protocols as well. You should notice the similarities between the MasterChef reward algorithm and the way debt is accrued for the user through `borrowIndex`.
- UniswapV2: While Uniswap is already on V3, [Uniswap V2](https://github.com/Uniswap/v2-core/blob/27f6354bae6685612c182c3bc7577e61bc8717e3/contracts/UniswapV2Pair.sol) is significantly simpler, less gas-golfed, and still the basis for understanding automated market makers (AMMs) in general. You should also understand how LP tokens (more generally, _share_ tokens that give you a fair share of an underlying balance) work.

## Learn the finance basics
There will be a time when you're auditing a DeFi project that uses a lot of traditional finance terms and you don't understand anything.
When you look these terms up, you'll get definitions that refer to even more terms that you don't know.
I, therefore, found it really helpful to go through a basic finance course that does not assume anything and actually explains the _intent_ of why one would use this specific financial instrument.

I recommend [Khan Academy's Options, swaps, futures, MBSs, CDOs, and other derivatives](https://www.khanacademy.org/economics-finance-domain/core-finance/derivative-securities) chapter where you'll learn the terminology of options, shorting, futures (~perpetual contracts). From there, you can further expand and go deeper into the individual topics.

## Getting real experience
At this point, your training is over and you'll just keep reading more code and exploit post mortems to get better.
Whenever the theory part gets too boring, you should try finding issues in real code, this could be [bug bounties on Immunefi](https://immunefi.com) or [audit contests on Code4rena](https://code423n4.com/).
The great advantage here is that they are _permissionless_. You can be anonymous, there's no need to pass a job interview, the payouts are purely skill-based.
Receiving an actual bug bounty is a great addition in case you want to apply to auditing firms.

# FAQ
I recently held an AMA on [Secureum's bootcamp](https://secureum.xyz/) and received many interesting questions to which I'll share my answers here.

## How do you stay up-to-date with security?
Be on Twitter for real-time notifications, but if you only want to read one aggregated piece each week, subscribe to the [BlockThreat Newsletter](https://blockthreat.substack.com/) by [iphelix](https://twitter.com/_iphelix).

## What's the compensation?
I'm not an expert on this but I'd say hourly rates for auditors are roughly:
- Junior: 100$/h
- Experienced: 100$-250$/h
- Top Auditors: 250$-1000$/h

I'd categorize compensation into two categories:
1) Fixed: You get paid a fixed (hourly) salary for your work
2) Skill-based: The more or higher-severity bugs you find, the bigger your compensation.

If you are a junior I'd recommend joining an auditing firm, if you're on the other side of the bell curve, it'll be more lucrative to seek opportunities with the latter compensation model. Note that top bug bounty hunters can earn much more with payouts in the millions for critical vulnerabilities.

## How long does it take to review a codebase?
Scoping audits is always a tough task and in my opinion, you only get better at it with experience.
But to give a rule of thumb:
Let's say you can audit 200 lines of code per hour (which is a standard assumption among some auditors afaik) - adjust that parameter down if the code is complex, math-heavy or if the documentation is bad.
You then take the lines of code and divide it by 200 LOC/h, then you get the hours required to audit the code for a single person.
If you're an independent auditor you should also add 5h-10h for compiling the report and all the biz-dev work, plus answering questions.
Then you multiply it by your hourly rate.

## How do you know when to stop looking for bugs?
That's a good question.
I could always spend more time on the code and it would increase the likelihood of me finding bugs.
But at some point, there's the point of _diminishing returns_, where it's not reasonable to spend any more time on the code.

Alexander Schlindwein was asked the same question regarding bug bounties but I think it applies to audits as well:
> The approach which works best for me is to set myself the goal of fully understanding the system to the point where I could reimplement it from scratch without being allowed a look at the original codebase. Not from remembering the code, but from having understood what the application is supposed to do. If you have examined a project that far and have not found a bug, the chances of finding one by continuing is low. [Interview](https://medium.com/immunefi/interview-with-legendary-bug-bounty-hunter-alexander-schlindwein-cced9c73c02a)

Realistically, I often stop before reaching that point due to time constraints and opportunity costs when I think my limited time is better spent elsewhere.

## Can you be an auditor but not a developer?
In my opinion, auditors' and developers' skills mostly overlap. I'd even say being an auditor has made me a better developer.
You've probably heard of this myth of a 10x engineer but it's just someone who has worked on a lot of similar projects before and can copy-paste from their previous work such that assembling a new protocol happens a lot quicker compared to someone with no prior code to draw upon.
I've probably seen ~100 Solidity codebases by now and know exactly where to look and copy code from if I had to build a new protocol.
On the other side, a protocol dev knows more about areas like proper deployments, managing the day-to-day on-chain tasks, monitoring, etc.
They also have better muscle memory for the syntax from actually typing out the code whereas I'm mostly reading it.

## What tools do you use when auditing?
I don't use any tools that directly perform vulnerability analysis. I only use the great "Solidity Visual Developer" VSCode extension that highlights storage variables and function parameters which makes it easier to have some context when reading a new codebase.

## What makes a good auditor?
Besides the technical skills like knowing many types of exploits, knowing the EVM well, or having seen issues of similar protocols, a personality trait that I think is useful:
_conscientiousness_ - I feel like some auditors don't even try to find all bugs and just want to be done with their job as quickly as possible.
This is more likely to happen if the incentives are not aligned and you get paid a fixed salary as is often the case with traditional auditing firms.
So you want to hire people that are conscientious, who take their job seriously and take pride in their work.

## Do I need to know math?
I see more and more math-heavy DeFi protocols, so being good at math is definitely a plus.

## What does your auditing process look like?
My auditing process is pretty straightforward.
First I read the documentation.
Then I read the code from top to bottom, I order the contracts in a way that makes sense for me: for example, I read the base class contract first before I read the derived class contract.
I don't use any tools, but I heavily take notes and scribble all over the code. 😃
I'm using the "Solidity Visual Developer" extension which comes with the `@audit`, `@audit-info`, `@audit-ok`, `@audit-issue` markers which I all use to categorize my notes.
After having read the entire codebase once, I revisit my notes and resolve any loose ends or things I didn't understand earlier.
Afterwards, I create my audit report out of these notes.

## Can you easily audit projects on other blockchains? Are newer chains more secure?
I looked into Solana which uses Rust and I have to say that the Rust learning curve is quite steep even for me and the non-conventional Solana blockchain model also needs some time getting used to.
I think the safety guarantees that languages like Rust/Haskell give you will catch some low-hanging bugs but so will audits.
The more interesting bugs are economic ones / wrong logic / unforeseen attack vectors.

Some reasons why I think that ETH sees so many exploits is that
1. the most innovative and therefore usually complex and untested protocols are still on ETH
2. the cross-contract function invocation model is great for re-entrancy bugs
3. special treatment of ETH instead of being just another ERC20 token
4. no built-in contract upgradeability, instead we got several complicated proxy and module patterns to work around this limitation
5. ETH's open-source culture is much stronger than on any other chain and it's much harder to find bugs in closed-source systems
6. ETH is still where the money is which attracts more eyeballs.

As you can see, there are some blockchain layer decisions that influence security which other blockchains have solved better.
It's not really about the smart contract language itself but more about understanding how the blockchain works and the implications regarding security.
That's the bigger hurdle to auditing a new chain, usually, this information is scattered across blog posts or not even documented at all and you have to look at the code or hope to find a core dev on Discord/Telegram.
