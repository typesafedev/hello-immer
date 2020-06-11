# hello immer

immer is a tiny package that allows you to easily work with immutable state using a tiny api.

## Basics

To get started, you just need to learn just 1 function called produce().
Within produce(), you can **mutate** a temp copy of the currentState called the draftState to produce
the nextState. This nextState is an immutable object produced via Object.freeze().

This is unlike packages like immutablejs which require you to learn 100s of new types and functions.
Immer works with native javascript typeps so there is no need to convert between immutable types and js types.

produce() api is strongly types with no string based path selectors.
Deep updates are easy.

```typescript

import { produce } from "immer";

const obj = { foo: "foo", bar: { baz: "baz" }}
const clone = { ...obj }

const cloneWithSpread = { ...obj, bar: { baz: "bar1" }}
// cloneWithSpread is still mutable.
cloneWithSpread.bar.baz = "bar2"

const cloneWithImmer = produce(obj, draft => {
    draft.bar.baz = "bar1"
})
// cloneWithImmer is not mutable.
cloneWithImmer.bar.baz = "bar2" // TypeError: Cannot assign to read only property 'baz' of object '#<Object>'

```
