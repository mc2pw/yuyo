# Class

## `Yuyo`

A Yuyo is a composition.

### `$(terms: ...*): Yuyo`

Adds a new step to the Yuyo.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| terms | ...* |  |

### `copy(): Yuyo`

Creates a copy of the Yuyo.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `[sym.pre](f: *): Yuyo`

Creates a precomposed copy. Precomposable is a duck-type.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| f | * |  |

### `[sym.act](x: *): *`

Acts based on the theory of the Yuyo. Actor is a duck-type.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| x | * |  |

### `act(x: *): *`

Same as [Symbol('act')].

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| x | * |  |

### `climb(gen: Function)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| gen | Function |  |

### `asyncClimb(gen: Function)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| gen | Function |  |

### `[sym.flat](): Iterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `[sym.asyncFlat](): AsyncIterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `flat(): Iterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncFlat(): AsyncIterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `mix()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncMix()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `merge()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `last(): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncLast(): Promise`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `filter(): Iterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncFilter(): AsyncIterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `finish(): Iterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncFinish(): AsyncIterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `match(): Function`

This is provided for consistency.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncMatch(): Function`

This is provided for consistency.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `mix$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncMix$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `merge$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `last$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncLast$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `flat$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncFlat$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `filter$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncFilter$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `finish$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncFinish$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `match$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `asyncMatch$(): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `Vector`

An array with a function applied each time an itm is accessed.

### `constructor(terms: Array, out: Function)`

### `terms: *`

### `out: *`

### `get(i: number): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| i | number |  |

### `[Symbol.iterator]()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `[Symbol.asyncIterator]()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `Tensor`

An array.

### `create(arr: Iterable, func: Function): Tensor`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| arr | Iterable |  |
| func | Function |  |

# Function

## `prepareAsyncIterable(action: Function, v: AsyncIterable): AsyncIterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| v | AsyncIterable |  |

## `prepareIterable(action: Function, v: Iterable): Iterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| v | Iterable |  |

## `preparePromise(action: Function, v: Promise): Promise`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| v | Promise |  |

## `prepareVector(action: Function, v: Vector): Vector`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| v | Vector |  |

## `applyToAsyncIterable(action: Function, f: Function, v: AsyncIterable): AsyncIterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| f | Function |  |
| v | AsyncIterable |  |

## `applyToIterable(action: Function, f: Function, v: Iterable): Iterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| f | Function |  |
| v | Iterable |  |

## `applyToPromise(action: Function, f: Function, v: Promise): Promise`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| f | Function |  |
| v | Promise |  |

## `applyToVector(action: Function, f: Function, v: Vector): Vector`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| f | Function |  |
| v | Vector |  |

## `applyToFunction(action: Function, f: Function, v: Function): Function`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| f | Function |  |
| v | Function |  |

## `prepareCollection(action: Function, v: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| v | * |  |

## `applyFunc(action: Function, f: Function, v: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| f | Function |  |
| v | * |  |

## `fold(action: Function, start: *, steps: Iterable): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| start | * |  |
| steps | Iterable |  |

## `foldArray(action: Function, start: *, steps: *): *`

Same as fold but treats the empty entries of an Array as if thery were undefined.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| action | Function |  |
| start | * |  |
| steps | * |  |

## `unary(f: Function): Function`

Wraps a function to indicate that it only takes one argument.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| f | Function |  |

## `abstract(f: Object): Function`

Curry a function allowing the action (first argument) to be provided when the function is used within a Yuyo.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| f | Object |  |

## `pick(count: number): Function`

Pick the first count values.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| count | number |  |

## `feedback(f: Function): *`

Allows a function to call itself.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| f | Function |  |

## `print(tag: string): Function`

Prints with a tag.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tag | string |  |

## `sleep(duration: number): Function`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| duration | number |  |

## `push(dst: Array): Function`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| dst | Array |  |

## `arrayToObject(keys: Array): Function`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| keys | Array |  |

## `unlessDone(objectPattern: {"value": *, "done": *})`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| objectPattern | {"value": *, "done": *} | nullable: undefined, default: {"value":null,"done":null} |

## `$(terms: ...*): Yuyo`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| terms | ...* |  |

## `last(it: Iterable): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | Iterable |  |

## `asyncLast(it: AsyncIterable): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | AsyncIterable |  |

## `finish(it: Iterable)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | Iterable |  |

## `asyncFinish(it: AsyncIterable)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | AsyncIterable |  |

## `filter(it: Iterable)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | Iterable |  |

## `asyncFilter(it: Iterable)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | Iterable |  |

## `_isBranch(tree: *): boolean`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | * |  |

## `isBranch(tree: *): boolean`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | * |  |

## `isAsyncBranch(tree: *): boolean`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | * |  |

## `getIterator(it: *): Iterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | * |  |

## `getAsyncIterator(it: *): AsyncIterator`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| it | * |  |

## `flat(tree: Iterable)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | Iterable |  |

## `asyncFlat(tree: Iterable)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | Iterable |  |

## `asyncOnce0(its: AsyncIterable, iters: Array, state: Object)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| its | AsyncIterable |  |
| iters | Array |  |
| state | Object |  |

## `asyncOnce(iters: AsyncIterable, state: Object)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| iters | AsyncIterable |  |
| state | Object |  |

## `mix(tree: Iterable): Iterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | Iterable |  |

## `asyncMix(tree: AsyncIterable): Iterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | AsyncIterable |  |

## `traverseLL(last: Object)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| last | Object |  |

## `removeFromDLL(last: Object, node: Object): Object|null`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| last | Object |  |
| node | Object |  |

## `pushIntoDLL(last: Object, node: Object): Object`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| last | Object |  |
| node | Object |  |

## `merge(tree: Iterable): Iterable`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tree | Iterable |  |