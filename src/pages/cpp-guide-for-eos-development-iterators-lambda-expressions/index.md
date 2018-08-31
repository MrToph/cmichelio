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
1. Classes and Structs
1. Templates
1. Iterators
1. Lambda Expressions
1. Multi-index
1. Header files

## Iterators

Let's talk about iterators, a really useful tool which is heavily used throughout the EOS code base.
If you're coming from a JavaScript background, you are already familiar with iterators like they are used in `for of` loops.
The key concept of iterators is to provide a nicer way to iterate through a collection of items.
The added bonus is that you can implement the _iterator interface_ for any custom classes, making iterators a generic way to traverse data.

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Iterators
#include <iostream>
#include <vector>

using namespace std;

int main()
{
  vector<int> v{2, 3, 5, 8};
  // old way to iterate
  for (int i = 0; i < v.size(); i++)
  {
    cout << v[i] << "\n";
  }

  // using Iterators
  // begin() returns an iterator that points to the beginning of the vector
  // end() points to the end, can be compared using != operator
  // iterators are incremented by using the + operator thanks to operator-overloading
  for (vector<int>::iterator i = v.begin(); i != v.end(); i++)
  {
    // iterators are dereferenced by * like pointers
    // returns the element the iterator is currently pointing to
    cout << *i << "\n";
  }

  // auto keyword allows you to not write the type yourself
  // instead C++ infers it from the return type of v.begin
  for (auto i = v.begin(); i != v.end(); i++)
  {
    cout << *i << "\n";
  }

  // can use arithmetic to "jump" to certain elements
  int thirdElement = *(v.begin() + 2);
  cout << "Third: " << thirdElement << "\n";
  // end is the iterator that points to the "past-the-end" element
  // The past-the-end element is the theoretical element that would follow the last element in the vector. It does not point to any element, and thus shall not be dereferenced.
  int lastElement = *(v.end() - 1);
  cout << "Last: " << lastElement << "\n";

  // do not go out of bounds by iterating past the end() iterator
  // the behavior is undefined
  // BAD: v.end() + 1, v.begin() + 10
}

```

In modern C++, iterators are the preferred way to iterate over collections of elements (`vector`s, `list`s, `map`s). We've also seen the `auto` keyword saving you from typing out wordy types, but may lead to less expressive code.

## Lambda Expressions

Armed with iterators, we can start to look at the functional programming concepts of modern C++.
Many functions from the standard library take a range of elements represented by two iterators (beginning and end) and an **anonymous function** (lambda function) as parameters.
This anonymous function is then applied to each element within the range.
They're called anonymous functions as they are not bound to a variable, rather they are short blocks of logic, passed as an inline argument to a higher-order function.
Usually, they are unique to the function they are passed to and therefore don't need the whole overhead of having a name (anonymous).

With it we can achieve similar constructs to sorting, mapping, filtering, etc. that are easy to do in languages like JavaScript:

```js
[1,2,3,4].map(x => x*x).filter(x => x % 2 === 1).sort((a,b) => b - a)
```

The code in C++ isn't as succinct, but nevertheless of the same structure.
Many functional programming helpers from the `std` library operate on _half-open_ intervals, meaning the lower range is included, the upper range is excluded.

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Lambdas
#include <iostream>
#include <vector>
// for sort, map, etc.
#include <algorithm>

using namespace std;

int main()
{
  vector<int> v{2, 1, 4, 3, 6, 5};
  // first two arguments are the range
  // v.begin() is included up until v.end() (excluded)
  // sorts ascending
  sort(v.begin(), v.end());

  // in C++, functions like sort mutate the container (in contrast to immutability and returning new arrays in other languages)
  for (auto i = v.begin(); i != v.end(); i++)
  {
    cout << *i << "\n";
  }

  // sort it again in descending order
  // third argument is a lambda function which is used as the comparison for the sort
  sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

  // functional for_each, can also use auto for type
  for_each(v.begin(), v.end(), [](int a) { cout << a << "\n"; });

  vector<string> names{"Alice", "Bob", "Eve"};
  vector<string> greetings(names.size());

  // transform is like a map in JavaScript
  // it applies a function to each element of a container
  // and writes the result to (possibly the same) container
  // first two arguments are range to iterate over
  // third argument is the beginning of where to write to
  transform(names.begin(), names.end(), greetings.begin(), [](const string &name) {
    return "Hello " + name + "\n";
  });
  // filter greetings by length of greeting
  auto new_end = std::remove_if(greetings.begin(), greetings.end(), [](const string &g) {
    return g.size() > 10;
  });
  // iterate up to the new filtered length
  for_each(greetings.begin(), new_end, [](const string &g) { cout << g; });
  // alternatively, really erase the filtered out elements from vector
  // so greetings.end() is the same as new_end
  // greetings.erase(new_end, greetings.end());

  // let's find Bob
  string search_name = "Bob";
  // we can use the search_name variable defined outside of the lambda scope
  // notice the [&] instead of [] which means that we want to do "variable capturing"
  // i.e. make all local variables available to use in the lambda function
  auto bob = find_if(names.begin(), names.end(), [&](const string &name) {
    return name == search_name;
  });
  // find_if returns an iterator referncing the found object or the past-the-end iterator if nothing was found
  if (bob != names.end())
    cout << "Found name " << *bob << "\n";
}

```

The syntax for anonymous functions is something to get used to in C++.
They are specified by brackets and followed by a parameter list, like so `[](int a, int b) -> bool {return a > b; }`.
Note that the `-> bool` specifies a boolean return value. Often times you can avoid expressing the return type as it can be inferred from the return type in the function body.

If you want to use variables defined in the scope outside of your lambda function, you need to do _variable capturing_.
There's again the possibility to pass the arguments by _reference_ or by _value_ to your function.

* To pass by reference, you need to start your lambda with the `&` character (like when using references in a function): `[&]`
* To pass by value, you use the `=` character: `[=]`

There's also the possibility to _mix-and-match_ capturing by value and reference.  
For example, `[=, &foo]` will create copies for all variables except `foo` which is captured by reference.

It helps to understand what happens behind the scenes when using lambdas:

> It turns out that the way lambdas are implemented is by creating a small class; this class overloads the operator(), so that it acts just like a function. A lambda function is an instance of this class; when the class is constructed, any variables in the surrounding environment are passed into the constructor of the lambda function class and saved as member variables. This is, in fact, quite a bit like the idea of a functor that is already possible. The benefit of C++11 is that doing this becomes almost trivially easy--so you can use it all the time, rather than only in very rare circumstances where writing a whole new class makes sense. @cpplambdas

Lambda functions are heavily used in EOS smart contracts as they provide a really convenient way to modify data in a short amount of code.
There are more functions in the standard library that work in a similar way to what we have already seen with `sort, transform, remove_if` and `find_if`.
They are all exported through the `<algorithm>` header. @cppalgorithm

[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.one#modal)
