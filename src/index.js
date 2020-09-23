import * as sym from "./symbol";
import * as core from "./core";
import { Vector } from "./vector";
import tensor from "./action/tensor";

import formal from "./action/formal";

export * from "./func";
export * from "./iterable";

export { formal };

class YuyoBase extends Array {
  $(...terms) {
    const theory = this.constructor.theory;

    this.push(terms.length === 1
      ? theory.prepare(terms[0])
      : x => new Vector(terms, t => theory.action(t, x))
    );

    // Cover with composition of sums.
    // Zip with tensor product of functions.
    return this;
  }

  copy() {
    const p = new Yuyo();

    for (const f of this)
      p.push(f);

    return p;
  }

  // TODO: Document the fact that this is used for duck typing.
  [sym.pre](f) {
    return this.copy().$(f);
  }

  // TODO: Document the fact that this is used for duck typing.
  [sym.act](x) {
    // avoid lazy evaluations as much as possible.
    const theory = this.constructor.theory;
    return core.fold(theory.apply.bind(theory), x, this);
  }

  act(x) {
    return this[sym.act](x);
  }

  // TODO: Decouple merge and mix from yuyo, just like zip is decoupled.
  merge(col) {
    const sources = memo(this.copy()
    .$(v => ({it: col(v)})) // If the position is needed col can include it.
    .$(({it}) => ({
      advance(done) {
        this.promise = done ? null : call(result => ({result, source: this}), it.next());
      }
    }))
    .$(source => source.advance(false)));

    function next() {
      const promises = nullify(flat($(sources).$(({promise}) => promise)));

      return $(({promises}) => promises === null
        ? {done : true}
        : $(t => {
          t.source.advance(t.result.done);
          return t.result;
        }).$(result => ({
          value: result,
          done: false
        })).act(Promise.race(promises))
      ).act({promises});
    }

    return {
      [Symbol.asyncIterator]() {
        return { next };
      }
    };
  }
}

function _isBranch(tree) {
  return tree[Symbol.iterator] instanceof Function && !(tree instanceof Array);
}

function isBranch(tree) {
  return tree != null && _isBranch(tree);
}

function isAsyncBranch(tree) {
  return tree != null && (
    tree[Symbol.asyncIterator] instanceof Function
    || _isBranch(tree)
  );
}

function getIterator(it) {
  return isBranch(it) ? it[Symbol.iterator]() : (function* () {
    yield it;
  })();
}

function getAsyncIterator(it) {
  if (it != null) {
    if (it[Symbol.asyncIterator] instanceof Function)
      return it[Symbol.asyncIterator]();
    else if (_isBranch(it))
      return it[Symbol.iterator]();
  }

  return (async function* () {
    yield await it;
  })();
}

function* flat(tree) {
  for (const t of tree) {
    if (isBranch(t))
      yield* flat(t);
    else if (t instanceof Yuyo)
      yield* t.flat();
    else yield t;
  }
}

async function* asyncFlat(tree) {
  for await (const t of tree) {
    if (isAsyncBranch(t)) {
      for await (const v of asyncflat(t))
        yield v;
    } else if (t instanceof Yuyo) {
      for await (const v of t.asyncFlat())
        yield v;
    } else yield t;
  }
}

async function* asyncOnce0(its, iters, cb) {
  for await (const it of its) {
    if (!isAsyncBranch(it)) {
      yield await it;
      iter.push(null);
      continue;
    }

    const iter = it[Symbol.asyncIterator] instanceof Function
      ? it[Symbol.asyncIterator]()
      : it[Symbol.iterator]();
    iters.push(iter);

    const {value, done} = await iter.next();
    cb(done);
    yield done ? null : value;
  }
}

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

function mix(tree) {
  const iters = [];

  function next() {
    const v = [];
    let d = false;

    for (const iter of iters) {
      const {value, done} = iter.next();
      v.push(value);
      d = d && done;
    }

    return {
      value: $(...v),
      done: d
    };
  }

  for (const it of tree)
    iters.push(getIterator(it));

  return {
    [Symbol.iterator]() {
      return {next};
    }
  };
}

function asyncMix(tree) {
  let next, done;
  const iters = [];

  function cb(d) {
    done = done && d;
  }

  function n0() {
    next = n;

    return {
      value: $(asyncOnce0(tree, iters, cb)),
      done
    };
  }

  function n() {
    return {
      value: $(asyncOnce(iters, cb)),
      done
    }
  }

  next = n0;
  return {
    [Symbol.iterator]() {
      return {next};
    }
  };
}

function merge(tree) {
  const sources = [];

  for (const it of tree) {
    const iter = getAsyncIterator(it);
    sources.push({
      advance(done) {
        this.promise = done ? null : (async function () {
          return {
            result: await iter.next(),
            source: this
          };
        })();
      }
    });
  }

  for (const s of sources)
    s.advance(false);

  async function next() {
    const promises = [];

    for (const {promise} of sources) {
      if (promise !== null)
        promises.push(promise);
    }

    if (promises.length)
      return {done: true};

    const {result, source} = await Promise.race(promises);
    source.advance(result.done);

    return {
      value: result,
      done: false
    };
  }

  return {
    [Symbol.asyncIterator]() {
      return {next};
    }
  };
}

export class Yuyo extends YuyoBase {
  *climb(gen) {
    const tree = this[sym.act]();

    if (isBranch(tree))
      yield* gen(tree);
    else
      yield tree;
  }

  async *asyncClimb(gen) {
    const tree = this[sym.act]();

    if (isAsyncBranch(tree)) {
      for await (const v of gen(tree))
        yield v;
    } else
      yield tree;
  }

  flat() {
    return this.climb(flat);
  }

  asyncFlat() {
    return this.asyncClimb(asyncFlat);
  }

  mix() {
    return this.climb(mix);
  }

  asyncMix() {
    return this.asyncClimb(asyncMix);
  }

  merge() {
    return this.asyncClimb(merge);
  }
}

Yuyo.theory = tensor;

export function $(...terms) {
  const p = new Yuyo();
  p.$(...terms);
  return p;
}
