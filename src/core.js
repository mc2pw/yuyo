import {Vector} from './vector';

/**
 * @param {Function} action
 * @param {AsyncIterable} v
 * @return {AsyncIterable}
 */
function prepareAsyncIterable(action, v) {
  return (x) => ({
    async* [Symbol.asyncIterator]() {
      for await (const t of v) {
        yield action(t, x);
      }
    },
  });
}

/**
 * @param {Function} action
 * @param {Iterable} v
 * @return {Iterable}
 */
function prepareIterable(action, v) {
  return (x) => ({
    * [Symbol.iterator]() {
      for (const t of v) {
        yield action(t, x);
      }
    },
  });
}

/**
 * @param {Function} action
 * @param {Promise} v
 * @return {Promise}
 */
function preparePromise(action, v) {
  return async function(x) {
    return action(await v, x);
  };
}

/**
 * @param {Function} action
 * @param {Vector} v
 * @return {Vector}
 */
function prepareVector(action, v) {
  return (x) => new Vector(v.terms, (t) => action(v.out(t), x));
}

/**
 * @param {Function} action
 * @param {Function} f
 * @param {AsyncIterable} v
 * @return {AsyncIterable}
 */
function applyToAsyncIterable(action, f, v) {
  return {
    async* [Symbol.asyncIterator]() {
      for await (const t of v) {
        yield action(f, t);
      }
    },
  };
}

/**
 * @param {Function} action
 * @param {Function} f
 * @param {Iterable} v
 * @return {Iterable}
 */
function applyToIterable(action, f, v) {
  return {
    * [Symbol.iterator]() {
      for (const t of v) {
        yield action(f, t);
      }
    },
  };
}

/**
 * @param {Function} action
 * @param {Function} f
 * @param {Promise} v
 * @return {Promise}
 */
async function applyToPromise(action, f, v) {
  return action(f, await v);
}

/**
 * @param {Function} action
 * @param {Function} f
 * @param {Vector} v
 * @return {Vector}
 */
function applyToVector(action, f, v) {
  return new Vector(v.terms, (t) => action(f, v.out(t)));
}

/**
 * @param {Function} action
 * @param {Function} f
 * @param {Function} v
 * @return {Function}
 */
function applyToFunction(action, f, v) {
  const mapped = (t) => typeof t === 'function' ?
    (...i) => mapped(t(...i)) :
    action(f, t);
  return mapped(v);
}

/**
 * @ignore
 * @param {Function} action
 * @param {*} v
 * @return {*}
 */
export function prepareCollection(action, v) {
  // Using $ as the function turns the arrays into yuyos.
  let w;

  if (v instanceof Vector) {
    w = prepareVector(action, v);
  } else if (v instanceof Promise) {
    w = preparePromise(action, v);
  } else if (v[Symbol.iterator] && !(typeof v === 'string')) {
    w = prepareIterable(action, v);
  } else if (v[Symbol.asyncIterator]) {
    w = prepareAsyncIterable(action, v);
  } else {
    w = v;
  }

  return w;
}

/**
 * @ignore
 * @param {Function} action
 * @param {Function} f
 * @param {*} v
 * @return {*}
 */
export function applyFunc(action, f, v) {
  // TODO: Is there a problem with this not being recursive?
  // TODO: How does one do raw mapping of the terms, besides reccursively
  // iterating?
  let w;

  if (typeof v === 'function') {
    w = applyToFunction(action, f, v);
  } else if (v instanceof Vector) {
    w = applyToVector(action, f, v);
  } else if (v instanceof Promise) {
    w = applyToPromise(action, f, v);
  } else if (v[Symbol.iterator] && !(typeof v === 'string')) {
    w = applyToIterable(action, f, v);
  } else if (v[Symbol.asyncIterator]) {
    w = applyToAsyncIterable(action, f, v);
  } else {
    w = f(v);
  }

  return w;
}

/**
 * @ignore
 * @param {Function} action
 * @param {*} start
 * @param {Iterable} steps
 * @return {*}
 */
export function fold(action, start, steps) {
  let v = start;

  for (const f of steps) {
    if (v === null) {
      return null;
    }

    v = action(f, v);
  }

  return v;
}

/**
 * Same as fold but treats the empty entries of an Array as if thery were
 * undefined.
 *
 * @ignore
 * @param {Function} action
 * @param {*} start
 * @param {*} steps
 * @return {*}
 */
export function foldArray(action, start, steps) {
  let v = start;

  for (let i = 0; i < steps.length; i++) {
    if (v === null) {
      return null;
    }

    v = action(steps[i], v);
  }

  return v;
}
