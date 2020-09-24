import * as sym from './symbol';
import * as core from './core';
import {unary} from './func';
import {Vector} from './vector';
import tensor from './action/tensor';

export * from './func';
export * from './iterable';
export * from './array';
export {sym as symbol};

/** Base class that does not assume a theory. */
class YuyoBase extends Array {
  /**
   * Adds a new step to the Yuyo.
   *
   * @param {...*} terms
   * @return {Yuyo}
   */
  $(...terms) {
    const theory = this.constructor.theory;

    this.push(
      terms.length === 1 ?
      theory.prepare(terms[0]) :
      unary((x) => new Vector(terms, (t) => theory.action(t, x))),
    );

    // Cover with composition of sums.
    // Zip with tensor product of functions.
    return this;
  }

  /**
   * Creates a copy of the Yuyo.
   *
   * @return {Yuyo}
   */
  copy() {
    const p = new Yuyo();

    for (const f of this) {
      p.push(f);
    }

    return p;
  }

  /**
   * Creates a precomposed copy. Precomposable is a duck-type.
   *
   * @param {*} f
   * @return {Yuyo}
   */
  [sym.pre](f) {
    const theory = this.constructor.theory;
    return theory.action(f, this[sym.act]());
  }

  /**
   * Acts based on the theory of the Yuyo. Actor is a duck-type.
   *
   * @param {*} x
   * @return {*}
   */
  [sym.act](x) {
    // avoid lazy evaluations as much as possible.
    const theory = this.constructor.theory;
    return core.fold(theory.apply.bind(theory), x, this);
  }

  /**
   * Same as [Symbol('act')].
   *
   * @param {*} x
   * @return {*}
   */
  act(x) {
    return this[sym.act](x);
  }
}

/**
 * @param {*} tree
 * @return {boolean}
 */
function _isBranch(tree) {
  return tree[Symbol.iterator] instanceof Function && !(tree instanceof Array);
}

/**
 * @param {*} tree
 * @return {boolean}
 */
function isBranch(tree) {
  return tree != null && _isBranch(tree);
}

/**
 * @param {*} tree
 * @return {boolean}
 */
function isAsyncBranch(tree) {
  return tree != null && (
    tree[Symbol.asyncIterator] instanceof Function ||
    _isBranch(tree)
  );
}

/**
 * @param {*} it
 * @return {Iterator}
 */
function getIterator(it) {
  return isBranch(it) ? it[Symbol.iterator]() : (function* () {
    yield it;
  })();
}

/**
 * @param {*} it
 * @return {AsyncIterator}
 */
function getAsyncIterator(it) {
  if (it != null) {
    if (it[Symbol.asyncIterator] instanceof Function) {
      return it[Symbol.asyncIterator]();
    } else if (_isBranch(it)) {
      return it[Symbol.iterator]();
    }
  }

  return (async function* () {
    yield await it;
  })();
}

/**
 * @generator
 * @function flat
 * @param {Iterable} tree
 * @yield {*}
 */
function* flat(tree) {
  for (const t of tree) {
    if (isBranch(t)) {
      yield* flat(t);
    } else if (t instanceof Yuyo) {
      yield* t.flat();
    } else yield t;
  }
}

/**
 * @generator
 * @function asyncFlat
 * @param {Iterable} tree
 * @yield {*}
 */
async function* asyncFlat(tree) {
  for await (const t of tree) {
    if (isAsyncBranch(t)) {
      for await (const v of asyncFlat(t)) {
        yield v;
      }
    } else if (t instanceof Yuyo) {
      for await (const v of t.asyncFlat()) {
        yield v;
      }
    } else yield t;
  }
}

/**
 * @generator
 * @function asyncOnce0
 * @param {AsyncIterable} its
 * @param {Array} iters
 * @param {Function} cb
 * @yield {*}
 */
async function* asyncOnce0(its, iters, cb) {
  for await (const it of its) {
    if (!isAsyncBranch(it)) {
      yield await it;
      iter.push(null);
      continue;
    }

    const iter = it[Symbol.asyncIterator] instanceof Function ?
      it[Symbol.asyncIterator]() :
      it[Symbol.iterator]();
    iters.push(iter);

    const {value, done} = await iter.next();
    cb(done);
    yield done ? null : value;
  }
}

/**
 * @generator
 * @function asyncOnce
 * @param {AsyncIterable} iters
 * @param {Function} cb
 * @yield {*}
 */
async function* asyncOnce(iters, cb) {
  for await (const iter of iters) {
    if (iter === null) {
      yield null;
      continue;
    }

    const {value, done} = await iter.next();
    cb(done);
    yield done ? null : value;
  }
}

/**
 * @param {Iterable} tree
 * @return {Iterable}
 */
function mix(tree) {
  const iters = [];

  const next = () => {
    const v = [];
    let d = false;

    for (const iter of iters) {
      const {value, done} = iter.next();
      v.push(value);
      d = d && done;
    }

    return {
      value: $(...v),
      done: d,
    };
  };

  for (const it of tree) {
    iters.push(getIterator(it));
  }

  return {
    [Symbol.iterator]() {
      return {next};
    },
  };
}

/**
 * @param {Iterable} tree
 * @return {Iterable}
 */
function asyncMix(tree) {
  let next;
  let done;
  const iters = [];

  const cb = (d) => {
    done = done && d;
  };

  const n0 = () => {
    next = n;

    return {
      value: $(asyncOnce0(tree, iters, cb)),
      done,
    };
  };

  const n = () => {
    return {
      value: $(asyncOnce(iters, cb)),
      done,
    };
  };

  next = n0;
  return {
    [Symbol.iterator]() {
      return {next};
    },
  };
}

/**
 * @param {Iterable} tree
 * @return {Iterable}
 */
function merge(tree) {
  const sources = [];

  for (const it of tree) {
    const iter = getAsyncIterator(it);
    sources.push({
      advance(done) {
        this.promise = done ? null : (async function(source) {
          return {
            result: await iter.next(),
            source,
          };
        })(this);
      },
    });
  }

  for (const s of sources) {
    s.advance(false);
  }

  const next = async function() {
    const promises = [];

    for (const {promise} of sources) {
      if (promise !== null) {
        promises.push(promise);
      }
    }

    if (promises.length) {
      return {done: true};
    }

    const {result, source} = await Promise.race(promises);
    source.advance(result.done);

    return {
      value: result,
      done: false,
    };
  };

  return {
    [Symbol.asyncIterator]() {
      return {next};
    },
  };
}

/** A Yuyo is a composition. */
export class Yuyo extends YuyoBase {
  /**
  * @generator
  * @function climb
  * @param {Function} gen
  * @yield {*}
  */
  * climb(gen) {
    const tree = this[sym.act]();

    if (isBranch(tree)) {
      yield* gen(tree);
    } else {
      yield tree;
    }
  }

  /**
  * @generator
  * @function asyncClimb
  * @param {Function} gen
  * @yield {*}
  */
  async* asyncClimb(gen) {
    const tree = this[sym.act]();

    if (isAsyncBranch(tree)) {
      for await (const v of gen(tree)) {
        yield v;
      }
    } else {
      yield tree;
    }
  }

  /**
  * @return {Iterator}
  */
  flat() {
    return this.climb(flat);
  }

  /**
  * @return {AsyncIterator}
  */
  asyncFlat() {
    return this.asyncClimb(asyncFlat);
  }

  /**
  * @return {AsyncIterator}
  */
  mix() {
    return this.climb(mix);
  }

  /**
  * @return {AsyncIterator}
  */
  asyncMix() {
    return this.asyncClimb(asyncMix);
  }

  /**
  * @return {AsyncIterator}
  */
  merge() {
    return this.asyncClimb(merge);
  }
}

Yuyo.theory = tensor;

/**
 * @param {...*} terms
 * @return {Yuyo}
 */
export function $(...terms) {
  const p = new Yuyo();
  p.$(...terms);
  return p;
}
