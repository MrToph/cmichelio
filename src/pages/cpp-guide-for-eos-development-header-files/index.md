---
title: C++ Guide for EOS Development - Call by value / reference
date: 2018-08-28
featured: /cpp-guide-for-eos-development-call-by-value-reference/featured.png
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
draft: true
---

> This post is part of my [C++ Guide for EOS developers](/categories/learneos)

1. [Basics](/cpp-guide-for-eos-development-basics/)
1. [Call by value / reference & Pointers](/cpp-guide-for-eos-development-call-by-value-reference/)
1. [Classes and Structs](/cpp-guide-for-eos-development-classes-and-structs/)
1. [Templates](/cpp-guide-for-eos-development-templates)
1. [Iterators & Lambda Expressions](/cpp-guide-for-eos-development-iterators-lambda-expressions)
1. Multi-index
1. Header files

## Header files

There are two main file types in C++. Source files (`.cpp`) and header files (`.hpp` or `.h`).
Header files are the files you _include_ when writing `#include <vector>` or `#include "./Game.hpp"`.

If you're coming from languages like Java, C#, etc., the concept of _Header files_ might occur weird and unnecessary to you.
But let me try to motivate why C++ does it this way.

C++ separates **declarations** from **definitions**.
Declarations _introduce_ an identifier and describe its type. It makes the identifiers known to the _compiler_.

Examples are:

```cpp
// extern means exactly this, that the definition is in another file
extern int a;

double square(double d);

class Currency
{
    string name;
    double priceInUSD;

    public:
    Currency(const string &_name, const double price);

    void setName(const string &dogsName);
    void setPrice(double price);
    void print() const;
};
```

> This class declaration actually also acts as a definition, but let's keep it simple to bring the point across.

Definitions _instantiate_ the identifiers. It's what the _linker_ needs after the compile step to assemble the binary.
Examples are initializing variables or _implementing_ the functions:

```cpp
int a;
int b = 5;
void Currency::setPrice(double price)
{
    priceInUSD = price;
}

void Currency::print() const
{
    cout << name << " is at a price of " << priceInUSD << "USD\n";
}

// ...
```

> C++ has a _one definition rule_: While you can declare the same variables as often as you want, you can only have one definition of them.

In simple words: Declarations say that an identifier exists _somewhere_, the definition gives this identifier a face.

Usually, you put your **declarations in header files** and your **definitions in source files**.

The reason _why_ C++ separates definitions from declarations, instead of recognizing symbols automatically from the source files like most modern languages do, is because ~~it's 30 years old~~ putting your declarations in header files brings a couple advantages:

* It improves compile time because the compiler only needs the _declarations_ in the header files. Unnecessary recompilations for implementation changes are therefore mitigated. (Yet, C++ is one of the slowest languages to compile.)
* It structurally separates the interface of a class from the implementation.
* You can build against code just by having the headers and don't need access to the source code for the definitions/implementations

The bigger your project becomes, the better it is to structure your code like this, otherwise, your code might become hard to follow.
For the beginning, a single header and a single source file (or even a single source file with both declarations and definitions) is enough.


[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.one#modal)
