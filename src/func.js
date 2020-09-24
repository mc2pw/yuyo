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
