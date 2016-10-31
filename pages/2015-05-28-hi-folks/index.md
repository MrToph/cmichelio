---
title: New Beginnings
date: "2015-05-28T22:40:32.169Z"
layout: post
path: "/hi-folks/"
---

Far far away, behind the word mountains, far from the countries Vokalia
and Consonantia, there live the blind texts. Separated they live in
Bookmarksgrove right at the coast of the Semantics, a large language
ocean. A small river named Duden flows by their place and supplies it
with the necessary regelialia.

**Hi**

`normal backticks`

```javascript
import Actions from '../actions/ActionNames'
import { createFetchExercisesFinished } from '../actions'
import { AsyncStorage } from 'react-native'
import routes from '../routes'
import * as workoutStats from '../statistics/WorkoutStats'
import { dateSameCalendarDay } from '../utils'
import { backupWorkouts } from '../utils/ExternalStorage'
import loadTestState from '../../test'

// pu, pl, hu, hl are the current exercises the user has
// history is a workout history. (day, type) is a primary key
// we save the exercises in each workout, because they might not agree with the up-to-date information
// and we don't want to delete the stats
// When a user clicks on a Workout a new history element is created (or the existing (date,type) is laoded)
// When a user does a rep, we update the rep array in this history workout and SAVE this history to AsyncStorage
// If a history has empty reps (or gets clicked to empty reps) we delete / don't save it to AsyncStorage
var defaultState = {
  pu: [
    {name: 'Barbell Bench Press', sets: 3, reps: 5, weight: 70},
    {name: 'Dumbbell Bench Press', sets: 3, reps: 10, weight: 20},
    {name: 'Bent Over Row', sets: 3, reps: 5, weight: 60},
    {name: 'Lat Pull Down', sets: 3, reps: 10, weight: 70},
    {name: 'Overhead Press', sets: 3, reps: 5, weight: 40},
    {name: 'Barbell Curl', sets: 2, reps: 10, weight: 20},
    {name: 'Skullcrusher', sets: 2, reps: 10, weight: 20}
  ],
  timerStart: undefined,
  result: [],
  entities: {
    workouts: {
      // 1: {
      //   id: 1, // also acts as the corresponding exercise index as we have a 1-to-1 mapping
      //   start: new Date(),
      //   end: new Date(),
      //   type: 'pu'
      // }
    }
  }
}

class Exercises {
  constructor () {
    this._types = ['pu', 'pl', 'hu', 'hl']
    this._allowedTimeDiff = 1000 * 60 * 60 * 6
    this._onSaveError = this._onSaveError.bind(this)
    // AsyncStorage.clear()
    // AsyncStorage.removeItem('exercises') // TODO: just for testing purposes
    AsyncStorage.getItem('exercises').then(val => {
      let state = this._loadState(val)
      if (!state) state = defaultState
      // require here first, so we don't get circular import dependency with store <=> exerciseReducer
      require('../store').default.dispatch(createFetchExercisesFinished(state))
    }).done()
    // setTimeout(() => loadTestState(), 0)
  }
}

/**
 * Gets the exercises. Used in Workout.js to display the ExerciseCards
 */
export function getSelectedWorkoutExercises (state, type) {
  let res = exercises.getSelectedExercises(state, type)
  return res ? res.arr : undefined
}

```

1. First ordered list item
2. Another item
	* Unordered sub-list. 
1. Actual numbers don't matter, just that it's a number
	1. Ordered sub-list
4. And another item.

	You can have properly indented paragraphs within list items. Notice the blank line above, and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).

	To have a line break without a paragraph, you will need to use two trailing spaces.  
	Note that this line is separate, but within the same paragraph.  
	(This is contrary to the typical GFM line break behaviour, where trailing spaces are not required.)

* Unordered list can use asterisks
- Or minuses
+ Or pluses

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3

## On deer horse aboard tritely yikes and much

The Big Oxmox advised her not to do so, because there were thousands of
bad Commas, wild Question Marks and devious Semikoli, but the Little
Blind Text didn’t listen. She packed her seven versalia, put her initial
into the belt and made herself on the way.

*   This however showed weasel
*   Well uncritical so misled
    *   this is very interesting
*   Goodness much until that fluid owl

When she reached the first hills of the **Italic Mountains**, she
had a last view back on the skyline of her
hometown _Bookmarksgrove_, the headline of [Alphabet
Village](http://google.com) and the subline of her own road, the
Line Lane. Pityful a rethoric question ran over her cheek, then she
continued her way. On her way she met a copy.

### Overlaid the jeepers uselessly much excluding

But nothing the copy said could convince her and so it didn’t take
long until a few insidious Copy Writers ambushed her, made her drunk
with [Longe and Parole](http://google.com) and dragged her into
their agency, where they abused her for their projects again and
again. And if she hasn’t been rewritten, then they are still using
her.

> Far far away, behind the word mountains, far from the countries
> Vokalia and Consonantia, there live the blind texts. Separated
> they live in Bookmarksgrove right at the coast of the Semantics, a
> large language ocean. 

It is a paradisematic country, in which roasted parts of sentences
fly into your mouth. Even the all-powerful Pointing has no control
about the blind texts it is an almost unorthographic life One day
however a small line of blind text by the name of Lorem Ipsum
decided to leave for the far World of Grammar.

### According a funnily until pre-set or arrogant well cheerful

The Big Oxmox advised her not to do so, because there were thousands
of bad Commas, wild Question Marks and devious Semikoli, but the
Little Blind Text didn’t listen. She packed her seven versalia, put
her initial into the belt and made herself on the way.

1.  So baboon this
2.  Mounted militant weasel gregariously admonishingly straightly hey
3.  Dear foresaw hungry and much some overhung
4.  Rash opossum less because less some amid besides yikes jeepers frenetic impassive fruitlessly shut

When she reached the first hills of the Italic Mountains, she had a
last view back on the skyline of her hometown Bookmarksgrove, the
headline of Alphabet Village and the subline of her own road, the
Line Lane. Pityful a rethoric question ran over her cheek, then she
continued her way. On her way she met a copy.

> The copy warned the Little Blind Text, that where it came from it
> would have been rewritten a thousand times and everything that was
> left from its origin would be the word "and" and the Little Blind
> Text should turn around and return to its own, safe country.

But nothing the copy said could convince her and so it didn’t take
long until a few insidious Copy Writers ambushed her, made her drunk
with Longe and Parole and dragged her into their agency, where they
abused her for their projects again and again. And if she hasn’t
been rewritten, then they are still using her. Far far away, behind
the word mountains, far from the countries Vokalia and Consonantia,
there live the blind texts.

#### Silent delightfully including because before one up barring chameleon

Separated they live in Bookmarksgrove right at the coast of the
Semantics, a large language ocean. A small river named Duden flows
by their place and supplies it with the necessary regelialia. It is
a paradisematic country, in which roasted parts of sentences fly
into your mouth.

Even the all-powerful Pointing has no control about the blind texts
it is an almost unorthographic life One day however a small line of
blind text by the name of Lorem Ipsum decided to leave for the far
World of Grammar. The Big Oxmox advised her not to do so, because
there were thousands of bad Commas, wild Question Marks and devious
Semikoli, but the Little Blind Text didn’t listen.

##### Wherever far wow thus a squirrel raccoon jeez jaguar this from along

She packed her seven versalia, put her initial into the belt and
made herself on the way. When she reached the first hills of the
Italic Mountains, she had a last view back on the skyline of her
hometown Bookmarksgrove, the headline of Alphabet Village and the
subline of her own road, the Line Lane. Pityful a rethoric question
ran over her cheek, then she continued her way. On her way she met a
copy.

###### Slapped cozy a that lightheartedly and far

The copy warned the Little Blind Text, that where it came from it
would have been rewritten a thousand times and everything that was
left from its origin would be the word "and" and the Little Blind
Text should turn around and return to its own, safe country. But
nothing the copy said could convince her and so it didn’t take long
until a few insidious Copy Writers ambushed her, made her drunk with
Longe and Parole and dragged her into their agency, where they
abused her for their projects again and again.
