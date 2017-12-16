---
author: Christoph Michel
comments: true
date: 2016-08-28 14:03:38+00:00
disqus_identifier: 418 http://cmichel.io/?p=418
layout: Post
route: /fractals-with-l-systems-in-d3-js/
slug: fractals-with-l-systems-in-d3-js
title: Drawing Fractals with L-Systems in D3.js
featured: /assets/2016/08/sierpinskiTriangle.gif
categories:
- Tech
- Math
---
This is the development post for my [L-System project](/projects/fractals-LSystem), where I 'll show you how to draw all kinds of fractals in [D3.js](https://github.com/d3/d3). If you haven't seen it, be sure to check it out first, or at least let the following fractals we are going to build get you excited.

![Dragon Curve Fractal Iterations](http://cmichel.io/assets/2016/08/dragonCurve-300.gif)![Koch Curve Fractal Iterations](http://cmichel.io/assets/2016/08/kochCurve300.gif)


## Preliminaries
### What is an L-System?
A [Lindenmayer-System](https://en.wikipedia.org/wiki/L-system) (L-System) is a set of string rewriting rules. If you know what a Context Free Grammar (CFG) is, then an L-System is basically the same, however at each iteration you _have to_ apply every applicable production (rewriting rule). If you don't know anything about formal grammars, you basically start with a string of letters (taken from your "Alphabet"), and have rules how to transform a letter into different letters. Let's look at an example:
```default
A // this is the axiom (start symbol of your grammar)
A=+B-A-B+ // production for A
B=-A+B+A- // production for B
```

The start of your derivation is the symbol A, and it has two productions, one for A and one for B. As you can see, there can be letters that don't have a production, like '+' and '-', these simply stay unchanged in the derivations. Let's look at the first three iterations:
```default
Iteration 0: A // start symbol 
Iteration 1: +B-A-B+ 
Iteration 2: + -A+B+A- - +B-A-B+ - -A+B+A- + 
Iteration 3: +-+B-A-B++-A+B+A-++B-A-B+--+-A+B+A--+B-A-B+--A+B+A-+--+B-A-B++-A+B+A-++B-A-B+-+
```

For the first iteration we simply apply the first rule for 'A', in the second iteration we have to apply the rules for B,A,B again. The derivations can grow big quite fast, usually exponential as a single letter gets replaced by two or more letters in each iteration.

![Who the hell cares? I want fractals](http://cmichel.io/assets/2016/08/71240729.jpg)


### From L-Systems to Fractals
Maybe surprisingly, L-Systems are one of the best ways to draw fractals, due to their recursive nature. Lindenmayer invented them to study the growth and self-similarity of plants.
To get from an L-System to a fractal, you imagine you start with a pen ([or a turtle](https://en.wikipedia.org/wiki/Turtle_graphics)) on a piece of paper, and interpret the string's letters in a predefined way. In our example above, if _A_ and _B_ both mean **draw a straight line of constant length forward**, and _+_/_-_ mean **turn left/right by 60°**, then the resulting drawings from the strings of our iterations approximate the [Sierpinski triangle](https://en.wikipedia.org/wiki/Sierpinski_triangle).

![Sierpinski Triangle Fractal Iterations](http://cmichel.io/assets/2016/08/sierpinskiTriangle.gif)

To study fractal plants, we can look at this L-System:
```default
X // start symbol
X=F-[[X]+X]+F[+FX]-X
F=FF
```

We will interpret _F_ again as **draw a straight line of constant size forward**, and _+_/_-_ by **turn left/right by 25°**. For complex fractals, we additionally need _[_ which **stores the current position and angle on a stack**, and _]_ **pops it**. The result is this beautiful fractal plant.

![Fractal Plant Iterations](http://cmichel.io/assets/2016/08/fractalPlant.gif)

## Implementation
The implementation of the L-System parser and the Turtle Graphics is quite simple and only needs a few lines of code. For the UI and storing state of the application, I used [React](https://facebook.github.io/react/) and [Redux](http://redux.js.org/), while [D3.js](https://github.com/d3/d3) renders the fractals in a `svg`.
The full source code is available on [GitHub](https://github.com/MrToph/L-System), the most interesting parts are probably the [L-System Parser](https://github.com/MrToph/L-System/blob/master/src/LSystem/index.js) and the [Turtle Drawing SVG System](https://github.com/MrToph/L-System/blob/master/src/LSystem/TurtleDrawingSubsystem.js)

Play around with my implementation [here](/projects/fractals-LSystem), change the productions to create some interesting fractals, and share them with me in the comments.

![Hilbert Curve Fractal Iterations](http://cmichel.io/assets/2016/08/hilbertCurve300.gif)![Pythagoras Tree Fractal Iterations](http://cmichel.io/assets/2016/08/pythagorasTree300.gif)
