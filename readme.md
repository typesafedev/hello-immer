# hello immer

immer is a tiny package that allows you to easily work with immutable state using a tiny api.

This assumes that immutability is a good thing because it is separates the effects of causality from mutation.
In react, reconciliation via immutability can be done in log n time instead of the usual linear time - note linear time is already very good, most devs are happy with linear time - react already only re-renders a child sub tree once it knows child node has changed. Therefore re-renders of the DOM is even more performant with immutable structures.

## Basics

To get started, you just need to learn 1 function called produce().
Within produce(), you can **mutate** a temp copy of the currentState called the draftState to produce
the nextState. This nextState is an immutable object produced via Object.freeze().
So we mutate locally within the produce() function, the produced object from produce() is immutable
and the original object is not mutated.

This is unlike packages like immutablejs which require you to learn 100s of new types and functions.
Immer works with native javascript types so there is no need to convert between immutable types and js types.

produce() api is strongly typed with no string based path selectors.
Deep updates are easy.

```typescript

import { produce } from "immer";

const obj = { foo: "foo", bar: { baz: "baz" }}
const clone = { ...obj }

const cloneWithSpread = { ...obj, bar: { baz: "bar1" }}
// cloneWithSpread is still mutable.
cloneWithSpread.bar.baz = "bar2"
// Of course, we can always call Object.freeze() on cloneWithSpread to make it immutable to 1 level

const cloneWithImmer = produce(obj, draft => {
    draft.bar.baz = "bar1"
})
// cloneWithImmer is not mutable.
cloneWithImmer.bar.baz = "bar2" // TypeError: Cannot assign to read only property 'baz' of object '#<Object>'

```

```json
  "eslintConfig": {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": 2020,
      "sourceType": "module"
    },
    "plugins": [
      "fp"
    ],
    "extends": [
      "plugin:fp/recommended" /* A really strict set of functional rules  */
    ]
  }
```
