---
title: C++ Guide for EOS Development - Templates
date: 2018-09-11
featured: /cpp-guide-for-eos-development-templates/featured.png
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

## Templates

A language having static types comes with a lot of benefits because errors can be caught at compile time by type-checking.
However, it also introduces overhead when writing functions or classes, as they need to be written for a certain type.
What if you're writing a library and don't exactly know how your library is going to be used?
If you'd like to support more types, you have to repeat yourself and overload the function.

```cpp
int max(int a, int b) {
    return a > b ? a : b;
}
max(5, 3); // works
max(5.0, 3.0) // does not work as these are _double_s and not _int_s.
```

You need to define another function for `double`s:

```cpp
double max(double a, double b) {
    return a > b ? a : b;
}
```

As you can see the function _body_ is exactly the same in both cases. All that matters is that the type implements the comparison operator `>`.

For these use-cases, C++ provides type `template`s, generic types that you can use instead of specific ones.
This allows you to create functions or classes whose functionality can be adapted to more than one type or class without repeating the entire code for each type.

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Templates
#include <iostream>

// create a "function-template" with template type T
// T can now be used as any other type like int
template<class T>
T max(T a, T b)
{
  return a > b ? a : b;
}

// create a "class-template"
// class members can now be of the template type T
template <class T>
class pair {
    T values[2];
  public:
    pair(T first, T second)
    {
      values[0]=first;
      values[1]=second;
    }

    T first() const;

    T second() const;
};

// must use template<class T> syntax here again
template <class T>
T pair<T>::first() const {
  return values[0];
}

template <class T>
T pair<T>::second() const {
  return values[1];
}

int main()
{
    int iMax = max(3, 5);
    double dMax = max(3.0, 5.0);
    // class template instantiations are done
    // by passing the type in angle brackets
    pair<int> p(3, 5);
    std::cout << max(p.first(), p.second());
}

```

What happens behind the scenes is the same thing we did before by hand.
Being statically-typed, the code is analyzed and the types to any _call_ to the template function can be resolved.
The compiler then instantiates a function for each specific type used.

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.one#modal)
