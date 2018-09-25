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
---

> This post is part of my [C++ Guide for EOS developers](/categories/learneos)

1. [Basics](/cpp-guide-for-eos-development-basics/)
1. [Call by value / reference & Pointers](/cpp-guide-for-eos-development-call-by-value-reference/)
1. [Classes and Structs](/cpp-guide-for-eos-development-classes-and-structs/)
1. [Templates](/cpp-guide-for-eos-development-templates)
1. [Iterators & Lambda Expressions](/cpp-guide-for-eos-development-iterators-lambda-expressions)
1. Multi-index
1. Header files

## Call by value / reference

How arguments are passed to functions is an important concept in C++.
This is often hard to understand for beginners, as you don't have these different ways to pass arguments in languages like Java or JavaScript.
You can pass arguments to a function with **call by value** or **call by reference**.
The difference between them is that in call by value a **copy** of the actual argument is created and the called function operates on the copy. While, in call by reference, the location in memory (address) of the arguments is passed to the function. Meaning, the function will operate on the _same, identical_ object and any modification on the object will, therefore, persist outside of the function call, as the changes are of course not reverted when the function returns.
Let's take a look at an example:

```cpp
#include <iostream>

// this is call by value
// the integer x is copied and any modification is done on the copy 
void test_by_value(int x) {
  x = 1;
}

// call by reference is done using the `&` after the type
// no copy is created, behind the scenes the memory location is passed
// and the same number is used
void test_by_ref(int& x) {
  x = 2;
}

int main() {
  std::cout << "Hello World!\n";
  int number = 0;
  test_by_value(number);
  // outputs 0, number unchaged
  std::cout << "test_by_value " << number << "\n";

  test_by_ref(number);
  // outputs 2(!), number changed
  std::cout << "test_by_ref " << number << "\n";
}
```

Notice that the code for the _caller_ is exactly the same no matter if you pass by value or by reference. The caller always just passes `number`.
For call-by-reference, an ampersand `&` is used as an indicator in the function's argument list.
The indistinguishability from the calling side makes it impossible to reason about whether your data was modified as parts of side effects of the function.
The reason why C++ has these two types is C++'s default answer to questions: **performance**. Creating copies of big objects takes time and can be avoided by just reusing the existing object.
You can disallow modifying the argument by declaring them as `const`:

```cpp
int test_by_ref(const int& x) {
  // this raises a compile time error now 
  // x = 2;

  // reading is OK
  return x + 2;
}
```

The same behavior applies not only to `int` but to all other data types (`string`s, `vector`s) and class object.

> It's good practice to use call-by-reference because it's usually more performant and to **not** modify the arguments by declaring them as `const`

For example, the [Google C++ Style Guide](http://drake.mit.edu/styleguide/cppguide.html#Reference_Arguments) states:

> All parameters passed by reference must be labeled const.
    In fact, it is a very strong convention in Google code that input arguments are values or const references while output arguments are pointers.

We understand `values` and `const references` now, so let's talk about what Google means with _output arguments are pointers_.

## Pointers

Pointers are variables that store the memory address of another variable. They are heavily used in C as it doesn't have _call-by-reference_. Instead, in C, you define a pointer variable that stores the memory location of your argument, and then pass _this pointer_ variable by value.

Let's have a look at how we would write our `test` function in C:

```cpp
int number = 0;

// in C++
void test_by_ref(int& x) {
  x = 2;
}
test_by_ref(number);

// in C
void test_by_pointer(int* px) {
    // remember the value of px is the address of x
    // to get the actual value of x we need to dereference the pointer by using `*` 
  *x = 2;
}

// pointers are defined by <type>*
// you get the address of a variable by using &
int* pnumber = &number;
test_by_pointer(pnumber);
// or without intermediate pointer variable
test_by_pointer(&number);
```

A pointer to an `int` variable is defined as `int*`, a pointer to a `string` would be defined as `string*`.
The actual size of _any_ pointer is however the same: `sizeof(int*) == sizeof(string*)`.
Intuitively, pointers can be seen as a 32bit or 64bit, depending on the platform, `unsigned int` variables whose **value is the memory address** of another variable.

> Why do we need to specify the _type_ of the pointer (`int*` or `string*`) then?

Good question. The type becomes important when trying to access _the value of the variable that the pointer points to_.
In our case, to get the value of `number` from our `int* pnumber` pointer, we need to **dereference the pointer**.
This is done by the `*` operator on a pointer variable: `int numberValue = *pnumber`
In order to know how many bytes the pointer should read, we need to define the _type of the pointer_.

For example, you could read the integer variable byte-by-byte by doing this:

```cpp
uint32_t number = 0x01020304;
// we need to cast it to uint8_t* because &number is of type unit32_t*
// remember the pointers all have the same range as they all store memory addresses
uint8_t* p = (uint8_t*)(&number);
for(int i = 0; i < 4; i++) {
    std::cout << "Byte " << i << ": " << std::to_string(*(p+i)) << "\n";
}
```

As you can see, we can do calculations on pointers. This is called **pointer arithmetic**. Here, `*(p+i)` means move `i` times the size of the pointer type (`sizeof(uint8_t)`) ahead in the memory location of `p` and read an `uint8_t`.

> Do we still need pointers in C++?

Although a lot can be done using easier `references` in C++, you 'll still frequently encounter pointers, for example, when using _iterators_ or _output parameters_.
Output parameters are like `return` values from the function, except that they are passed as a pointer argument and the referenced object is then modified in the function.
Let's have a look at an example:

```cpp
void split(const std::string &name, std::string *first, std::string *last)
{
    std::size_t pos = name.find(" ");
    *first = name.substr(0, pos);
    *last = name.substr(pos + 1);
}
std::string name = "Dan Larimer";
std::string first, last;
split(name, &first, &last);
```

Here `first` and `last` are pointer output parameters containing the result of the computation after the `split` function is finished.
Output parameters are generally used over real return arguments (`string split(...) { ... return <string> }`) when you need to return more than one value like _two_ `string`s in our case.

> Couldn't we achieve the same by using references instead of pointers as output parameters?

Yes, we could rewrite the function to use _reference_ output parameters instead:


```cpp
void split(const std::string &name, std::string& first, std::string& last)
{
    std::size_t pos = name.find(" ");
    first = name.substr(0, pos);
    last = name.substr(pos + 1);
}
std::string name = "Dan Larimer";
std::string first, last;
split(name, first, last);
```

What you prefer is up to you and comes down to personal style. One reason why the Google C++ Styleguide prefers _pointers_ as output arguments is because it makes it clear **at the caller site** that the argument is potentially going to be mutated.

Nevertheless, it's important to be able to read and understand both references and pointers.

You are probably confused by now with the many different ways to pass arguments to functions.
That's generally the biggest learning experience for developers new to C++, so don't worry.
At some point you'll see the common, repeating patterns.


[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.one#modal)
