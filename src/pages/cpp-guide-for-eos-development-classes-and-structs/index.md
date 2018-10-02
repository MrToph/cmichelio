---
title: C++ Guide for EOS Development - Classes and Structs
date: 2018-09-04
featured: /cpp-guide-for-eos-development-classes-and-structs/featured.png
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

## Classes and Structs

C++ is an object-oriented programming language.
It has a powerful inheritance system, private and public member variables and a nice way to initialize them in constructors through _member initializer lists_.
Destructors are the pendant to constructors and allow you to run code when an object is destroyed or falls out of scope.
Let's create a small `CryptoCurrency` class. 

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Classes-1
#include <iostream>
#include <string>
#include <stdlib.h>

// automatically resolves the std namespace
// so we can write string instead of std::string
using namespace std;

// Declare a class.
// Classes are usually declared in header (.h or .hpp) files.
class Currency
{
    // Member variables and functions are private by default.
    string name;
    double priceInUSD;

    // All members following this are public
    // until "private:" or "protected:" is found.
  public:
    // Default constructor
    Currency();
    // another constructor taking two parameters
    Currency(const string &_name, const double price);

    // Member function declarations (implementations to follow)
    void setName(const string &dogsName);

    void setPrice(double price);

    // Functions that do not modify the state of the object
    // should be marked as const.
    // This allows you to call them if given a const reference to the object.
    void print() const;

    // Functions can also be defined inside the class body.
    // Functions defined as such are automatically inlined.
    void bark() const { cout << name << " barks!\n"; }

    // C++ has destructors. They are the pendant to constructors.
    // These are called when an object is deleted or falls out of scope.
    virtual ~Currency();

}; // A semicolon must follow the class declaration.

// Class member functions are usually implemented in .cpp files.
Currency::Currency()
{
    cout << "A currency has been created\n";
}

Currency::Currency(const string &_name, double price)
{
    name = _name;
    priceInUSD = price;
    cout << name << " has been created with a price of " << price << "USD\n";
}

void Currency::setName(const string &currencyName)
{
    name = currencyName;
}

void Currency::setPrice(double price)
{
    priceInUSD = price;
}

// Notice that "virtual" is only needed in the declaration, not the definition.
void Currency::print() const
{
    cout << name << " is at a price of " << priceInUSD << "USD\n";
}

Currency::~Currency()
{
    cout << name << " has been hard forked!\n";
}

// struct are the same as classes however they are usually only used to encapsulate
// data and rarely contain methods, prefer classes in those cases
struct block_header
{
    // fields of structs are public by default
    uint64_t timestamp;
    uint64_t blockNumber;
    // pointer to a block_header object
    block_header* prevBlock;
};

int main()
{
    // this runs the default constructor
    Currency bitcoin;
    bitcoin.setName("Bitcoin");
    bitcoin.setPrice(1E5);
    bitcoin.print();

    Currency eos("EOS", 100);
    eos.print();

    block_header genesis;
    genesis.timestamp = 1528445288;
    genesis.blockNumber = 0;

    // structs without user-defined constructors
    // can be initialized through "aggregate initialization"
    block_header second{1528445288, 1, &genesis};
    cout << "Timestamp of second block " << second.timestamp << "\n";

    // or explicit by providing the struct's field names
    // they need to be in the same order as defined in the struct
    // but allows you to skip initializing values
    block_header third{.blockNumber = 2, .prevBlock = &second};
    // third.timestamp is initialized to 0
    cout << "Timestamp of block after block #" << third.prevBlock->blockNumber << ": " << third.timestamp << "\n";
}
```

### Inheritance

What would an introduction to inheritance be without the obligatory `Animal` class example?
Note that C++ supports _multiple inheritance_, a (controversial) feature where a class can inherit from _multiple_ classes at once.
You'll probably never need it when developing smart contracts, so let's look at the case of inheriting from a _single_ class.

```cpp
// @url: https://repl.it/@MrToph/CPPBasics-Classes-2
#include <iostream>

using namespace std;

class Animal
{
    string name;
    int weight;

  public:
    // Default constructor "delegates" its values to other constructor
    Animal() : Animal("Peter", 80){};

    // constructor takes name and weight and initializes the
    // class member with an "initializer list" using the same names
    Animal(const string &name, int weight) : name(name), weight(weight)
    {
        // we already write the function body here
        cout << name << " was created\n";
    };

    void setName(const string &dogsName);
    string getName() const;

    void setWeight(int weight);

    // Functions that can be overwritten must be declared as _virtual_
    virtual void print() const;

    // Functions can also be defined inside the class declaration
    // Be careful however as they are automatically inlined.
    void eat() { weight += 5; }

    // The destructor should be virtual if a class is to be derived from;
    // if it is not virtual, then the derived class' destructor will
    // not be called if the object is destroyed through a base-class reference
    // or pointer.
    virtual ~Animal();
};

void Animal::setName(const string &animalName)
{
    name = animalName;
}

string Animal::getName() const
{
    return name;
}

void Animal::setWeight(int animalWeight)
{
    weight = animalWeight;
}

// "virtual" is only needed in the declaration, not in the definition.
void Animal::print() const
{
    cout << name << " weighs " << weight << "kg\n";
}

Animal::~Animal()
{
    cout << "Animal " << name << " died\n";
}

// Dog is now a subclass of Animal and inherits Animal's members
// but may not directly access private members or methods directly without getters
class Dog : public Animal
{
    string breed;

  public:
    Dog(const string &name, int weight, const string &breed) : Animal(name, weight), breed(breed)
    {
        cout << "Woof\n";
    }

    // virtual methods that are being overridden should be marked as override
    void print() const override;
};

void Dog::print() const
{
    // Call the print function of Animal
    Animal::print();
    // Cannot access .name directly because it's private
    // need to access public getter getName
    cout << Animal::getName() << " is a " << breed << " dog\n";
}

int main()
{
    Dog dog("Carl", 10, "Dackel");
    dog.print();
}
```


[![Learn EOS Development Signup](https://cmichel.io/images/learneos_subscribe.png)](https://learneos.one#modal)
