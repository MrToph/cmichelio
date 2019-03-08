---
title: C++ Guide for EOS Development - Multi-Index Container
date: 2018-10-02
featured: /cpp-guide-for-eos-development-multi-index/featured.png
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
- steemdev
- programming
- cryptocurrency
---

> This post is part of my [C++ Guide for EOS developers](/categories/learneos)

1. [Basics](/cpp-guide-for-eos-development-basics/)
1. [Call by value / reference & Pointers](/cpp-guide-for-eos-development-call-by-value-reference/)
1. [Classes and Structs](/cpp-guide-for-eos-development-classes-and-structs/)
1. [Templates](/cpp-guide-for-eos-development-templates)
1. [Iterators & Lambda Expressions](/cpp-guide-for-eos-development-iterators-lambda-expressions)
1. [Multi-index](/cpp-guide-for-eos-development-multi-index)
1. [Header files](/cpp-guide-for-eos-development-header-files)

## Multi-index

The last important topic we will cover is *multi-indexes*.
The standard library comes with many _containers_ like `vector`s (dynamic array), `list`s (doubly-linked list), `set`s or `map`s.
While all serve the same purpose of storing and accessing elements, each of them achieves this differently leading to different _runtimes_ of fundamental operations - a `set`, for instance, maintains its elements in a sorted way, whereas a `list` does not yield random access but allows you to insert elements at any place in constant time without reallocating.
They all provide a _single_ specific way to access your elements, but sometimes we want to have multiple interfaces to the same data.

Let's look at a `CryptoCurrency` class:

```cpp
#include <iostream>
#include <set>
#include <string>
#include <algorithm>

using namespace std;

class CryptoCurrency {
    public:
    string name;
    uint64_t market_cap;
    double priceInUSD;
    CryptoCurrency(const string &name, uint64_t market_cap, double priceInUSD) : name(name), market_cap(market_cap), priceInUSD(priceInUSD) {}
    
    // define comparison < operator to compare cryptos by market_cap 
    bool operator<(const CryptoCurrency& c) const {
        return market_cap < c.market_cap;
    }
};

int main()
{
    // store some crypto currencies in a set
    set<CryptoCurrency> cryptos;
    cryptos.insert(CryptoCurrency("EOS", 1000, 1.0));
    cryptos.insert(CryptoCurrency("Bitcoin", 2000, 10.0));
    cryptos.insert(CryptoCurrency("Ethereum", 500, 2.0));
    
    // sets order their elements, in our case according to market_cap
    // iterating the currencies in ascending order
    for_each(cryptos.begin(), cryptos.end(), [](const CryptoCurrency& c) {
        cout << c.name << " " << c.market_cap << "\n";
    });
}
```

A set is a nice way to keep the crypto-currencies ordered by a single _index_, in our case `market_cap`.
But what happens if you need an alphabetically ordered-list of the currencies?

An approach would be to keep a set of pointers to the `set` elements ordered by the `name` field this time.
However, there's an easier approach: What we need is a way to define _multiple indexes_ to the same data elements.

This is exactly the concept of `multi_index_container`s from the _boost_ library.

> The Boost library is an external library which is highly-used in practice because it solves a wide range of common tasks not in the C++ standard library, comes with nice documentation and tutorials, and is open-source and peer-reviewed. (You can also use it when writing your smart contracts!)  
    "The obvious solution for most programmers is to use a library that provides an elegant and efficient platform independent to needed services. Examples are BOOST..." — Bjarne Stroustrup

Let's take a look how to make our class work with `multi_index_container`s:

```cpp
#include <iostream>
#include <set>
#include <string>
#include <algorithm>
#include <boost/multi_index_container.hpp>
#include <boost/multi_index/ordered_index.hpp>
#include <boost/multi_index/identity.hpp>
#include <boost/multi_index/member.hpp>

using namespace std;
using namespace boost; // for multi_index_container
// for indexed_by, ordered_unique, member, identity
using namespace boost::multi_index;

class CryptoCurrency
{
  public:
    string name;
    uint64_t market_cap;
    double priceInUSD;
    CryptoCurrency(const string &name, uint64_t market_cap, double priceInUSD) : name(name), market_cap(market_cap), priceInUSD(priceInUSD) {}

    // define comparison < operator to compare cryptos by market_cap
    bool operator<(const CryptoCurrency &c) const
    {
        return market_cap < c.market_cap;
    }
};

// typedef is a way to alias types
// multi_index_container<...> will be aliased as crypto_set
typedef multi_index_container
<
    CryptoCurrency,
    indexed_by
    <
        // sort by CryptoCurrency::operator<
        ordered_unique<identity<CryptoCurrency>>,
        // sort by string's < on CryptoCurrency::name member
        ordered_unique<member<CryptoCurrency, std::string, &CryptoCurrency::name>>
    >
> crypto_set;

int main()
{
    // use the typedef'd multi_index_container
    crypto_set cryptos;
    cryptos.insert(CryptoCurrency("Eos", 1000, 1.0));
    cryptos.insert(CryptoCurrency("Bitcoin", 2000, 10.0));
    cryptos.insert(CryptoCurrency("Ethereum", 500, 2.0));

    // interface through the first index by market_cap
    // market_cap_index is now an iterator having .begin() and .end()
    // make sure to not forget the '&' after ::type or use auto
    const crypto_set::nth_index<0>::type &market_cap_index = cryptos.get<0>();
    for_each(market_cap_index.begin(), market_cap_index.end(), [](const CryptoCurrency &c) {
        cout << c.name << " " << c.market_cap << "\n";
    });

    // alternatively you can omit the .get<0>().begin() and call .begin() directly
    // not providing .get<index> always returns the first index
    // so we don't even need to change the old code for sorting by market_cap!
    for_each(cryptos.begin(), cryptos.end(), [](const CryptoCurrency &c) {
        cout << c.name << " " << c.market_cap << "\n";
    });

    // now interface through the _second_ index by name
    // const crypto_set::nth_index<1>::type& name_index = cryptos.get<1>();
    const auto &name_index = cryptos.get<1>();
    for_each(name_index.begin(), name_index.end(), [](const CryptoCurrency &c) {
        cout << c.name << " " << c.market_cap << "\n";
    });
}

```

There are more index types than `ordered_unique` or `ordered_non_unique` (for non-unique class members).
While these two provide an interface similar to storing `CryptoCurrency` as a `std::set`, `sequenced<>` indexes provide a bidirectional interface like `std::list`.
Sequenced indexes are useful when you want to keep the original order of the time you inserted the elements.
If you need access to a specific position like with a `std::vector`, there's a `random_access<>` index for that.

We will revisit `multi_index_container`s when we store and retrieve data tables in the EOS blockchain through our smart contract.
As you can imagine, having multiple interfaces to sort and search for elements in your database tables is really useful.

If you want to learn more about them, boost.org has an [exhaustive tutorial](https://www.boost.org/doc/libs/1_41_0/libs/multi_index/doc/tutorial/index.html) on it.


[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.dev#modal)
