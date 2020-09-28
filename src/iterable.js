import * as sym from './symbol';

/**
 * @param {Iterable} it
 * @return {*}
 */
export function last(it) {
  let r;
  for (r of it);
  return r;
}

/**
 * @param {AsyncIterable} it
 * @return {*}
 */
export async function asyncLast(it) {
  let r;
  for await (r of it);
  return r;
}

/**
 * @generator
 * @function finish
 * @param {Iterable} it
 * @yield {*}
 */
export function* finish(it) {
  // Use together with fill and filter.
  let r;
  for (r of it) {
    if (r === null) break;

    yield r;
  }
}

/**
 * @generator
 * @function asyncFinish
 * @param {AsyncIterable} it
 * @yield {*}
 */
export async function* asyncFinish(it) {
  let r;
  for await (r of it) {
    if (r === null) break;

    yield r;
  }
}

/**
 * @generator
 * @function filter
 * @param {Iterable} it
 * @yield {*}
 */
export function* filter(it) {
  for (const v of it) {
    if (v !== null) yield v;
  }
}

/**
 * @generator
 * @function filter
 * @param {Iterable} it
 * @yield {*}
 */
export async function* asyncFilter(it) {
  for await (const v of it) {
    if (v !== null) yield v;
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
export function isBranch(tree) {
  return tree != null && _isBranch(tree);
}

/**
 * @param {*} tree
 * @return {boolean}
 */
export function isAsyncBranch(tree) {
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
export function* flat(tree) {
  for (const t of tree) {
    if (isBranch(t)) {
      yield* flat(t);
    } else if (t != null && t[sym.flat] instanceof Function) {
      yield* t[sym.flat]();
    } else yield t;
  }
}

/**
 * @generator
 * @function asyncFlat
 * @param {Iterable} tree
 * @yield {*}
 */
export async function* asyncFlat(tree) {
  for await (const t of tree) {
    if (isAsyncBranch(t)) {
      for await (const v of asyncFlat(t)) {
        yield v;
      }
    } else if (t != null && t[sym.asyncFlat] instanceof Function) {
      for await (const v of t[sym.asyncFlat]()) {
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
 * @param {Object} state
 * @yield {*}
 */
async function* asyncOnce0(its, iters, state) {
  let d = true;

  for await (const it of its) {
    if (!isAsyncBranch(it)) {
      yield await it;
      iters.push(null);
      continue;
    }

    const iter = it[Symbol.asyncIterator] instanceof Function ?
      it[Symbol.asyncIterator]() :
      it[Symbol.iterator]();
    iters.push(iter);

    const {value, done} = await iter.next();

    if (done) {
      yield null;
    } else {
      d = false;
      yield value;
    }
  }

  state.done = d;
}

/**
 * @generator
 * @function asyncOnce
 * @param {AsyncIterable} iters
 * @param {Object} state
 * @yield {*}
 */
async function* asyncOnce(iters, state) {
  let d = true;

  for (const iter of iters) {
    if (iter === null) {
      yield null;
      continue;
    }

    const {value, done} = await iter.next();

    if (done) {
      yield null;
    } else {
      d = false;
      yield value;
    }
  }

  state.done = d;
}

/**
 * @param {Iterable} tree
 * @return {Iterable}
 */
export function mix(tree) {
  const iters = [];

  const next = () => {
    const v = [];
    let d = true;

    for (const iter of iters) {
      const {value, done} = iter.next();

      if (done) {
        v.push(null);
      } else {
        v.push(value);
        d = false;
      }
    }

    return {
      value: v,
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
 * @param {AsyncIterable} tree
 * @return {Iterable}
 */
export function asyncMix(tree) {
  const state = {done: false};
  const iters = [];

  let next = () => {
    next = _next;

    return {
      value: asyncOnce0(tree, iters, state),
      done: state.done,
    };
  };

  const _next = () => {
    return {
      value: asyncOnce(iters, state),
      done: state.done,
    };
  };

  return {
    [Symbol.iterator]() {
      return {
        next() {
          return next();
        },
      };
    },
  };
}

/**
 * @generator
 * @function traverseLL
 * @param {Object} last
 * @yield {*}
 */
function* traverseLL(last) {
  let node = last;

  while (node) {
    yield node;
    node = node.prev;
  }
}

/**
 * @param {Object} last
 * @param {Object} node
 * @return {Object|null}
 */
function removeFromDLL(last, node) {
  let l;

  if (node.prev) {
    if (node.next) {
      node.prev.next = node.next;
      node.next.prev = node.prev;
      l = last;
    } else {
      delete node.prev.next;
      l = node.prev;
    }
  } else if (node.next) {
    delete node.next.prev;
    l = last;
  } else {
    l = null;
  }

  return l;
}

/**
 * @param {Object} last
 * @param {Object} node
 * @return {Object}
 */
function pushIntoDLL(last, node) {
  if (last) {
    last.next = node;
    node.prev = last;
  }

  return node;
}

/**
 * @param {Iterable} tree
 * @return {Iterable}
 */
export function merge(tree) {
  let srcNode; // linked list

  for (const it of tree) {
    const iter = getAsyncIterator(it);
    srcNode = pushIntoDLL(srcNode, {
      advance(done) {
        if (done) {
          srcNode = removeFromDLL(srcNode, this);
        } else {
          this.promise = (async (source) => {
            return {
              result: await iter.next(),
              source,
            };
          })(this);
        }
      },
    });
  }

  for (const s of traverseLL(srcNode)) {
    s.advance(false);
  }

  const promises = function* () {
    for (const s of traverseLL(srcNode)) {
      yield s.promise;
    }
  };

  const next = async function() {
    if (!srcNode) {
      return {done: true};
    }

    const {result, source} = await Promise.race(promises());

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
