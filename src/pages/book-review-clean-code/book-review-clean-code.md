---
author: Christoph Michel
date: 2017-04-16
disqus_identifier: book-review-clean-code
layout: Post
route: /book-review-clean-code/
slug: book-review-clean-code
title: Book Summary - Clean Code
featured: https://images-na.ssl-images-amazon.com/images/I/41TINACY3hL._SX384_BO1,204,203,200_.jpg
categories:
- Book
---
# Book Summary - Clean Code: A Handbook of Agile Software Craftsmanship by Uncle Bob
[Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) is a classic, teaching why writing clean code is important and showing coding principles that lead to clean code.

> This is not a “feel good” book that
you can read on an airplane and finish before you land. This book will make you work, and
work hard. What kind of work will you be doing? You’ll be reading code—lots of code.
And you will be challenged to think about what’s right about that code and what’s wrong
with it. You’ll be asked to follow along as we take modules apart and put them back
together again. This will take time and effort; but we think it will be worth it.

I 'll list some quotes I find worth remembering. But as the quote above says you get the most value out of the book by actively reading the code and thinking about how to improve it yourself first.

### Quotes: 
* “If I don’t do what my manager says, I’ll be fired.” Probably not.
Most managers want the truth, even when they don’t act like it. Most managers want good
code, even when they are obsessing about the schedule. They may defend the schedule and
requirements with passion; but that’s their job. It’s your job to defend the code with equal
passion.
* You will not make the deadline by making the mess. Indeed, the mess will slow you down instantly, and
will force you to miss the deadline. The only way to make the deadline - the only way to
go fast - is to keep the code as clean as possible at all times.
* The Boy Scouts of America have a simple rule that we can apply to our profession:
_Leave the campground cleaner than you found it._ If we all checked-in our code a little cleaner than when we checked it out, the code
simply could not rot. 
* **Variables:** You should name a variable using the same care with which you name a first-born child.
* **Naming conventions:** Some interesting ones:
    * Use pronounceable names. 
    * The length of a name should correspond to the size of its scope (for search-friendliness).
    * Instead of overloading constructors, use static factory methods with names that describe the arguments.
    * Pick one word for one abstract concept and stick with it. For instance, it’s confusing to have fetch, retrieve, and get as equivalent methods of different classes. 
* **Functions:** They should be _short_ and only do one thing. So, another way to know that a function is doing more than “one thing” is if you can
extract another function from it with a name that is not merely a restatement of its implementation. Try to keep the number of arguments as low as possible. 3 or more is a bad smell.
Prefer Exception to returning error codes (often simplifies the code path).
* **Comments:** Comments are hard to maintain, don't tell the truth like code does. Clear and expressive code with few comments is far superior to cluttered and complex
code with lots of comments. Use JS-Doc comments only when you're writing a public API.
* **Classes:** The [Single Responsibility Principle (SRP)](https://en.wikipedia.org/wiki/Single_responsibility_principle) states that a class or module should have one,
and only one, reason to change.
* **Objects vs Data Structures: Fundamental Dichotomy between objects and data structures:**
    * Procedural code (code using data structures) makes it easy to add new functions without
    changing the existing data structures.
    * OO code, on the other hand, makes it easy to add new classes without changing existing functions. (by overwriting a base class)
    * Procedural code makes it hard to add new data structures because all the functions must
    change.
    * OO code makes it hard to add new functions because all the classes must change.
* **Third party libraries:** Sometimes useful to wrap third party libraries, so if they change only your wrapper implementation needs to change
* **Error handling** is important, but if it obscures logic, it’s wrong. Throwing errors makes code cleaner than checking for status values throughout the code.
* **Tests:**  It _is_ unit tests that keep our code flexible, maintainable, and reusable. The reason is simple. If you have
tests, you do not fear making changes to the code! Test code should be treated like production code. Talks about learning an external API by writing tests for it (**learning tests**).
* **Concurrency** is a decoupling strategy. It helps us decouple what gets done from when it gets done. Concurrency is hard. Concurrency can sometimes improve performance, but only when there is a lot of wait time that can be shared between multiple threads or multiple processors. 

> _Nothing has a more profound and long-term degrading effect upon a development project than bad code. Bad schedules can be redone, bad requirements can be redefined. Bad team dynamics can be repaired. But bad code rots and ferments, becoming an inexorable weight that drags the team down._

### Personal opinion
Of course these principles are just guide lines and therefore come down to personal taste, and shouldn't be followed blindly.
For instance, if you take his advice on refactoring any function that has more than _three_ (!) lines, the functions become ridiculously small and harder to read in my opinion.
Also, the book focuses on Java and OOP a lot, so you sometimes get advice that is mostly applicable to only the Java world. 
