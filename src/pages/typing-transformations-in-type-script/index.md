---
title: Typing transformations in TypeScript
date: 2020-05-30
image: ./featured.png
categories:
- Tech
medium:
- Programming
- blockchain
- cryptocurrency
- javascript
- typescript
steem:
- eos
- utopian-io
- steemdev
- programming
- cryptocurrency
---

I really enjoy using TypeScript and use it in all of my own projects. There's just something about knowing what types your objects and functions are, and the great code completion in VSCode, that I always miss when working on a JavaScript project.

One big annoyance for me is when I have a certain type of an object and I want to create a copy of that type where some fields have a different type.
I run into this a lot when receiving a type from a third-party library or an API request and I want to process and transform this object to make it easier to work with. As an example, consider an API endpoint that returns this type:

```typescript
type ApiReponse = {
  foo: number;
  bar: string;
  veryBigNumber: string; // overflows JS Number type, so it's encoded as a string by the API endpoint
  date: string; // as ISOString "2020-05-30T11:39:40.230Z"
}
```

In my code I want to work with a JavaScript `Date` object instead of an ISOString, so in my API fetch function I do this transformation:

```typescript
type TransformedApiReponse = ?

const request = async ():Promise<TransformedApiReponse[]> => {
  const result = await fetch<ApiReponse[]>(url)
  return result.map(response => ({
    ...response,
    veryBigNumber: new BigNumber(response.veryBigNumber),
    date: new Date(response.date),
  }))
}
```

While TypeScript allows you to easily extend an object type using the `& { newKey: string; }` construct, it's hard to change an existing type.
Or so I thougt.
I used to copy and paste the existing ApiRepsonse type and then change the `date` field. However, if the type comes from a third-party library that's not possible and there's an easier much better way using [`omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittk), one of TypeScript's utility types:

```typescript
// before
type TransformedApiReponse = {
  foo: number;
  bar: string;
  veryBigNumber: BigNumber; // changed
  date: Date; // changed
}

// now
type TransformedApiReponse = Omit<ApiReponse, "date" | "veryBigNumber"> & {
    veryBigNumber: BigNumber;
    date: Date;
}

type New = Omit<ApiReponse,"date" | "veryBigNumber">
  & {
      veryBigNumber: BigNumber;
      date: Date;
  }
```

First, we use `Omit` to remove the `date` and `veryBigNumber` field from the `ApiReponse` type and then we extend the resulting type using the new type values.

This way, we only specify the change set for the type instead of the whole type, and if the API endpoint's response type changes we only need to update the original `ApiReponse` type.

Have a look at some of the other [TypeScript utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittk) - they can be very useful.
These are the ones I use most often:

```
Omit, Pick, Partial, ReturnType
```