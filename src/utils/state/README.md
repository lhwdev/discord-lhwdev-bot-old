# State

A state managing api which comes with extreme flexibility and power. Inspired a lot by Jetpack
Compose runtime. (note that there is nothing like Snapshot here... It may be overkill)

## `mutableStateOf`

A basic building block for state.

## `derivedStateOf`

A state derived from its parameter calculation. It tracks reading other states('dependency') by
itself, and invalidates when dependencies are changed.

For example,

```js
const a = mutableStateOf(123);
const b = derivedStateOf(() => a.value + 3); // invalidated when a changes
```

## `observedFileStateOf`

A state can be derived from file using this.
