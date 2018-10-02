---
title: C++ Guide for EOS Development - Basics
date: 2018-08-25
featured: /cpp-guide-for-eos-development-basics/featured.png
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
1. Header files

## Why C++?

The whole EOS blockchain infrastructure is written in C++.
C++ is a low-level language that gives the programmer a lot of control over how you do things and manage your resources.
The result is an immensely powerful and performant language being used a lot in performance critical applications like games, computer graphics, or on hardware with low resources like most embedded systems.
However, shifting so much control to the developer also makes it one of the hardest languages to learn.

We need to learn C++ because your EOS smart contracts, the part of your decentralized application that lives on the blockchain, must also be written in C++.
The C++ code is then compiled to WebAssembly. While theoretically, other "easier" languages can be compiled to WebAssembly (most notably RUST, Python, Solidity), C++ is the only officially supported language by Block One.

> While these other languages may appear simpler, their performance will likely impact the scale of application you can build. We expect that C++ will be the best language for developing high-performance and secure smart contracts and plan to use C++ for the foreseeable future. [EOS Developers Portal](https://developers.eos.io/eosio-cpp/docs/required-knowledge)

Yes, C++ is scary and when your programming experience is mostly through high-level interpreted languages like JavaScript, it may seem daunting at first - but here's the good news:
Most of C++'s features are actually not needed to write smart contracts.
The intent of these tutorials will be to teach you the C++ basics and the advanced C++ features that you _actually_ need for smart contract programming.

Let's take a moment to acknowledge and hear about some useful [modern C++ features](https://github.com/AnthonyCalandra/modern-cpp-features) that high-level languages like JavaScript don't have. Most notably:

* Statically typed (but comes with automatic type inference)
* Preprocessor Macros
* Explicit call-by-reference, call-by-value
* Memory Pointers
* Operator overloading
* Generic programming through templates
* `typedef`s

Don't worry if you don't understand these yet, we'll start with the basics.

<blockquote class="twitter-tweet" data-dnt="true"><p lang="en" dir="ltr">By using C++ to develop smart contracts we gain the effort of the entire computing industry in producing verification tools. People are already creating tools to write provably-correct software in c++ <a href="https://twitter.com/hashtag/eosio?src=hash&amp;ref_src=twsrc%5Etfw">#eosio</a> <a href="https://twitter.com/hashtag/ethereum?src=hash&amp;ref_src=twsrc%5Etfw">#ethereum</a> <a href="https://twitter.com/hashtag/cardano?src=hash&amp;ref_src=twsrc%5Etfw">#cardano</a> <a href="https://t.co/mhQQaEKA0D">https://t.co/mhQQaEKA0D</a></p>&mdash; Daniel Larimer (@bytemaster7) <a href="https://twitter.com/bytemaster7/status/991070899888631811?ref_src=twsrc%5Etfw">April 30, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Basics
I assume you are already familiar with at least one programming language like JavaScript or Python.
Then understanding the basics like defining variables, `for` loops, `if` conditionals or calling functions in C++ will also not be a surprise to you.
Let's take a look at the syntax:

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-1
// In c++ libraries are imported through the #include macro
// iostream comes with functions handling input and output to the console
#include <iostream>
// includes rand function
#include <cstdlib>
// includes time function
#include <ctime>

// this is how to define functions: <return type> <name>(<arguments>)
int compute(int x)
{
    // unsigned means no negative values which increases the range of numbers the variable can hold
    const unsigned int FIVE = 5;
    // FIVE = 3; // would throw an error as FIVE is declared constant
    return x * x + FIVE;
}

// the return type for no return value is called 'void'
void playGuessingGame()
{
    // initialize random number seed with time in seconds since the epoch
    srand(time(0));
    // get a random integer between 0 and 9 by doing modulus 10
    int random = std::rand() % 10;
    // need to initialize guess, uninitialized variables are indeterminate
    // meaning it could have any value, even the same as our random one!
    int guess = -1;
    std::cout << "Guess my number between 0 and 9";
    while (guess != random)
    {
        std::cin >> guess;
        if (guess > random)
            std::cout << "Lower";
        else if (guess < random)
            std::cout << "Higher";
        else
            std::cout << "Correct";
    }
}

// the entry point of your program is a function called main which returns an integer
int main()
{
    std::cout << "Hello! Type in a number\n";

    int number;
    std::cin >> number;

    int computed = compute(number);
    std::cout << "I computed x^2+5 as " << computed << "!\n";

    playGuessingGame();

    return 0;
}
```

There are many fundamental types for integer numbers `short, int, long, long long` (each with an `unsigned` alternative to represent non-negative integer numbers only).
Their difference is in the number of bytes, and thus the range of integers, they hold. These types mentioned here **do not have a specified size**, their size is **implementation-dependent**. It could be that if you compile your program on one machine an `int` has 16 bits (`sizeof(int) == 2)`, and when compiling on another machine it will have 32 bits.
The only guarantee these types give you is a _minimum_ number of bytes. For example, an `int` must have at least 16 bits, `long` at least 32 bits.

When working with numbers it's helpful to know the exact ranges of the individual types, especially in security-sensitive applications like blockchain development where over-/underflows are critical.
To address this, C99 added new types where you can explicitly ask for a specificly sized integer, for example `int16_t`, `int32_t`, or the unsigned `uint64_t` variant.
When writing smart contracts, we will solely use these explicit fixed-size types.

Note that similar fixed-size types do not exist for floating point numbers as the number of bits doesn't tell you very much about its precision and range. You'll need to use `float, double, long double`  in these cases (the former usually being `32` and `64` bit IEEE-754 floating point types).


### Strings
Besides the number types and the boolean `bool` type, `string`s are one of the most used data types.
They are included through `<string>` and live in the `std` namespace.
(Namespaces are regions that scope variables and are a way to resolve name conflicts in bigger projects.)

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Strings
#include <iostream>
// need to import <string> for strings
#include <string>

int main()
{
  // strings are part of the std namespace
  std::string text = "Hello";
  // + is used for concatenation
  text += " World";
  std::cout << text << "\n";
  // length and size are synonyms
  std::cout << text.length() << " " << text.size() << "\n";

  text = text.substr(0, 5);
  for (int i = 0; i < text.length(); i++)
  {
    std::cout << i << ": " << text[i] << "\n";
  }

  // different way to loop over characters
  for (char c : text)
  {
    std::cout << c << "\n";
  }
  return 0;
}
```

### Arrays / Vectors
C++ differentiates between _static_ and _dynamic_ arrays. _Static arrays_ are arrays with a **fixed size** which is known _at compile time_.
If your arrays need to be able to grow or the size is only known at runtime, you need to use `vector`s.

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Vectors
#include <iostream>
#include <vector>

int main()
{
    // arrays are defined with [] after the variable name
    // and can be immediately initialized providing values in { ... }
    int arr[] = {1, 2, 3};
    // can specify size in brackets
    // initializes elements in the list, rest to 0
    int brr[3] = {1, 3};
    for (int x : brr)
    {
        // outputs 1, 3, 0
        std::cout << x << "\n";
    }

    std::vector<int> numbers;
    for (int i = 0; i < 3; i++)
    {
        // add a number to the back
        numbers.emplace_back(i);
    }
    // size and accessing vectors is the same as with arrays
    std::cout << "numbers: " << numbers[0] << numbers.size() << "\n";

    // this inserts a number at the second (index 1) place
    numbers.emplace(numbers.begin() + 1, 9);
    // numbers.begin returns an iterator. More on these later
    for (std::vector<int>::iterator it = numbers.begin(); it != numbers.end(); it++)
    {
        // outputs 1, 3, 0
        std::cout << *it << "\n";
    }
}
```

Let's leave it at this for now.
In the next tutorial we will talk about different types to pass parameters to functions.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.one#modal)
