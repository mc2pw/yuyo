import * as sym from './symbol';

/**
 * Wraps a function to indicate that it only takes one argument.
 *
 * @param {Function} f
 * @return {Function}
 */
export function unary(f) {
  f[sym.unary] = true;
  return f;
}

/**
 * Curry a function allowing the action (first argument) to be provided when
 * the function is used within a Yuyo.
 *
 * @param {Object} f
 * @return {Function}
 */
export function abstract(f) {
  return (...v) => ({
    [sym.prepare](action) {
      return f(action, ...v);
    },
  });
}

// When using fill the yuyo has to be recreated before each iteration
// to reset the state. In a sense, this makes fill(action) of affine type.
// A composition that has an affine type is also affine?
// TODO: mark fill(action) as affine? Pass the affine property to the yuyo?
/**
 * Accumulates the effect of the values on the first value.
 *
 * @function fill
 * @param {Function} effect
 * @return {Function}
 */
export const fill = abstract(function(action, effect) {
  let r;
  let a = (v) => { // null is handled by theory. This can be used for XNNO.
    a = (v) => r = action(action(effect, v), r);
    return r = v;
  };

  return unary((v) => a(v));
});

/**
 * Pick the first count values.
 *
 * @param {number} count
 * @return {Function}
 */
export function pick(count) {
  let k = 0;

  return unary((v) => k++ < count ? v : null);
};

/**
 * Allows a function to call itself.
 *
 * @param {Function} f
 * @return {*}
 */
export function feedback(f) {
  // continuation
  // (f => f((g => g(g))(g => n => f(g(g))(n))))
  const g = (...t) => f(g)(...t);
  return f(g);
}

/**
 * Yields undefined forever.
 *
 * @const {Iterator}
 */
export const forever = {
  next() {
    return {done: false};
  },
  [Symbol.iterator]() {
    return this;
  },
};

// Identity with secondary effects
// TODO: Send messages, errors, etc.
/**
 * Prints with a tag.
 *
 * @param {string} tag
 * @return {Function}
 */
export function print(tag) {
  return unary((x) => {
    console.log(tag, x);
    return x;
  });
}

/**
 * @param {number} duration
 * @return {Function}
 */
export function sleep(duration) {
  return unary(
      (x) => new Promise((resolve) => setTimeout(resolve, duration, x)),
  );
}

/**
 * @param {Array} dst
 * @return {Function}
 */
export function push(dst) {
  return unary((x) => {
    dst.push(x);
    return x;
  });
}

// TODO: define req: abstract function that returns null based on a test?
// What if the test is applied on a vector? Should the result be `any`?
// Does the test get executed after the first true? What about arrays becoming
// null due to tensoring? Does the rest of the array execute after the null?

/**
 * @param {Array} keys
 * @return {Function}
 */
export function arrayToObject(keys) {
  return unary((arr) => {
    const r = {};

    for (let i = 0; i < keys.length; i++) {
      r[keys[i]] = arr[i];
    }

    return r;
  });
}

/**
 * @function tab
 * @return {Function}
 */
export const tab = abstract(function(action) {
  return (v) => action(arrayToObject(Object.keys(v)), Object.values(v));
});

// TODO: Define zip using iterable.turn and allow it being applied to objects
// and arrays.

// TODO: What about zip?
// With zip one takes a yuyo with some factors being arrays (not vectors,
// which are of a sum type). The result is an array. Each factor has to have
// its items mapped to appending functions.
// Zip is related to function composition.
// tab is used when evaluating a function on an array of yuyos.
// When is zip used? It would have to be as the argument of a function
// that then takes each factor as an argument.
// One should be able to zip iterators not just arrays.
// Since zip is function composition this would mean converting the iterators
// into functions, composing and then converting back to an interator.
// iter($(() => it1.next()).$(x => [x, it2.next()]).$(x => [x, v]).act())
// Zip-compose with
// iter($(() => it1.next()).$(x => it2.next()(x)).$(x => v(x)).act())
// Values are treated as infinitely repeating iterators.
// Zipping resolvables means passing the same arg to all the resolvables,
// i.e. pairing the resolvables. $([f, g]) zips resolvables f and g.
// Zip acts recursively? No need to zip recursively, since zip takes
// an array of iterables, and the not yet zipped produced arrays can be zipped
// when needed.

/**
 * @function match
 * @param {Function} action
 * @param {Iterable} it
 * @return {Function}
 */
export const match = abstract(function(action, it) {
  // Provide a way for iterables to behave like arrays inside yuyos.
  // The result is affine, similar to fill.
  const iter = it[Symbol.asyncIterator] instanceof Function ?
    it[Symbol.asyncIterator]() :
    it[Symbol.iterator]();

  return (v) => action(({value, done}) => ({
    value: action(value, v),
    done,
  }), iter.next());
});
