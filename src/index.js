export function $(...terms) {
  const p = new Yuyo();
  p.$(...terms);
  return p;
}

class Vector {
  constructor(terms, out) {
    this.terms = terms;
    this.out = out;
  }

  get(i) {
    return this.out(this.terms[i]);
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.terms.length; i++)
      if (i in this.terms)
        yield this.out(this.terms[i]);
  }
}

function loadAsyncIterable(load, v) {
  return x => ({
    async *[Symbol.asyncIterator]() {
      for await (const t of v)
        yield load(t)(x);
    }
  });
}

function loadIterable(load, v) {
  return x => ({
    *[Symbol.iterator]() {
      for (const t of v)
        yield load(t)(x);
    }
  });
}

function loadPromise(load, v) {
  return async function (x) {
    return load(await v)(x);
  };
}

function loadVector(load, v) {
  // TODO: What's the order of the tensoring?
  return x => new Vector(v.terms, t => load(v.out(t))(x));
}

function onAsyncIterable(on, f, v) {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const t of v)
        yield on(f, t);
    }
  };
}

function onIterable(on, f, v) {
  return {
    *[Symbol.iterator]() {
      for (const t of v)
        yield on(f, t);
    }
  };
}

function onPromise(on, f, v) {
  return v.then(t => on(f, t));
}

function onVector(on, f, v) {
  return new Vector(v.terms, t => on(f, v.out(t)));
}

function onFunction(on, f, v) {
  const mapped = t => t instanceof Function ? i => mapped(t(...i)) : f(t);
  return mapped;
}

function overValue(on, f, v) {
  const m = h => h.map(t => t instanceof Array ? m(t) : on(t, v));
  return m(f);
}

const loadedSym = Symbol("loaded");

class Yuyo extends Array {
  static load(v) {
    // f (g1, g2) = h; x f g1 = h(x)(1)
    // X*xX X*xI*xX -> X*xI*xX
    // (x1, x2) g = h; x1 g = h(1)
    // I*xX X*xX -> I*X
    let w;

    if (v instanceof Function) {
      if (v[loadedSym]) return v;

      w = x => x instanceof Array ? v(...x) : v(x);
    } else if (v instanceof Yuyo)
      w = x => v.act(x);
    else if (v instanceof Vector)
      w = loadVector(Yuyo.load, v);
    else if (v instanceof Array) {
      if (v[loadedSym]) return v;

      w = v.map(Yuyo.load);
    } else if (v instanceof Promise)
      w = loadPromise(Yuyo.load, v);
    else if (v === undefined) // TODO: Keep this? Is this useful?
      w = x => x;
    else if (v === null)
      w = () => v;
    else if (v[Symbol.iterator] instanceof Function)
      w = loadIterable(Yuyo.load, v);
    else if (v[Symbol.asyncIterator] instanceof Function)
      w = loadAsyncIterable(Yuyo.load, v);
    else
      w = () => v;

    w[loadedSym] = true;
    return w;
  }

  static on(f, v) {
    // f is a loaded function.
    // TODO: Is there a problem with this not being recursive?
    // TODO: How does one do raw mapping of the terms, besides reccursively iterating?
    let w;

    if (v instanceof Function)
      w = onFunction(on, f, v);
    else if (v instanceof Yuyo)
      w = v.copy().$(f);
      //w = v.copy().$(f).act();
    else if (v instanceof Vector)
      w = onVector(on, f, v);
    else if (v instanceof Promise)
      w = onPromise(on, f, v);
    else if (v === undefined)
      w = f(v);
    else if (v === null)
      w = null;
    else if (v instanceof Array)
      w = tab(v).$(f).act();
      // Expand tensor only when passed as an argument of a function
      // that is not known to be a tensor product of functions.
    else if (v[Symbol.iterator] instanceof Function)
      w = onIterable(on, f, v);
    else if (v[Symbol.asyncIterator] instanceof Function)
      w = onAsyncIterable(on, f, v);
    else
      w = f(v);

    return w;
  }

  static over(f, v) {
    let w;

    if (v instanceof Yuyo || v instanceof Vector)
      w = overValue(f, v);
    else if (v instanceof Array)
      // Empty values of f are treated as zero not as the identity.
      w = f.map((t, i) => t instanceof Array ? Yuyo.over(t, v[i]) : Yuyo.on(t, v[i]));
    else if (v === null)
      w = null;
    else
      w = overValue(f, v);

    return w;
  }

  $(...terms) {
    this.push(terms.length === 1
      ? Yuyo.load(terms[0])
      : x => new Vector(terms, t => Yuyo.load(t)(x))
    );

    // Cover with composition of sums.
    // Zip with tensor product of functions.
    return this;
  }

  copy() {
    const p = new Yuyo();
    p.push(...this);
    return p;
  }

  act(x) {
     // avoid lazy evaluations as much as possible.
    let r = x;

    for (const f of this)
      r = f instanceof Array ? Yuyo.over(f, r) : Yuyo.on(f, r);

    return r;
  }

  *[Symbol.iterator]() {
    yield this.act();
  }

  // For resolvers this would be
  // $(v).$(f, g).
  // TODO: What happens if this is used with async iterables? Done may end up
  // being a promise instead of a boolean.
  mix(col) {
    const funcs = memo(this.copy().$(v => ({it: col(v)}))).$(({it}) => () => it.next());

    const next = () => $(row => ({
       value: $(({value, done}) => done ? null : value).act(row),
       done: last(flat($(true, ({done}) => done).$(fill((s, v) => s && v)).act(row)))
    })).act(funcs.act());

    return {
      [Symbol.iterator]() {
        return { next };
      }
    };
  }

  merge(col) {
    const sources = memo(this.copy()
    .$(v => ({it: col(v)})); // If the position is needed col can include it.
    .$(({it}) => ({
      advance(done) {
        this.promise = done ? null : $(result => ({result, source: this})).act(it.next());
      }
    }))
    .$(source => source.advance(false)))

    async function next() {
      const promises = nullify(flat($(states).$(({promise}) => promise)));

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

  /*array() {

  }*/
}

// Accumulators

// This is similar to the algebra of an operad.
// The difference is that one chooses exactly one operation for each arity
// (perhaps depending on the state).
// If one was to use a list instead of a tree, there would be exactly one operation,
// and this operation may have the shape of a tree.
// To avoid filling arrays with infinite iterators one can instead have three
// operations (nullary, unary and binary) from which to form all other operations.
// The first term could help choose the operation meaning that the tree is actually
// the product of the terms and the operations such that the operations correspond
// to the size of the levels where they appear.
// To simplify, exclude nullary operations.
// One could also have a "flat" tree where the branching is indicated by certain
// terms which are the same as the formal operations.
// action(null, x) is the operation corresponding to x.
// action(s, null) is not necessarily null. null is the nullary operation (a constant).
// The action(null, x) operation is 1-ary when there are no more terms.
// The operation is applied to null.
// digest(r) takes the result of the action to complete the operation.
// digest(null) should always be null, since there is exactly one nullary operation
// unless there is some intermediate 1-ary operation.
// action(-, -) should be action(-, digest(-)).
function flow(tree, init, action) {
  if (tree != null && tree[Symbol.iterator] instanceof Function) {
    let r = null;
    let a = v => {
      a = v => action(r, v);
      return v;
    }

    for (const t of tree)
      r = a(memo(t, action));

    return r;
  } else return tree;
}

function memo(tree) {
  return $(...flow(tree, v => [v], (s, v) => push(s, $(...v))));
}

/*function yuyo(arr) {

}*/

// TODO: convert yuyo to array and back?
// TODO: Async versions of certain accumulators?

function nullify(it) {
  // Initializes iterable only once.
  const m = it[Symbol.iterator]();
  const {value, done} = m.next();

  if (done) return null;

  let next = () => {
    next = () => m.next();
    return {value, done};
  };

  return {
    [Symbol.iterator]() {
      return { next };
    }
  }
}

function* flat(tree) {
  if (tree === null);
  else if (tree !== undefined && tree[Symbol.iterator] instanceof Function) {
    for (const t of tree)
      yield* flat(i);
  } else yield tree;
}

async function* asyncFlat(tree) {
  if (tree === null);
  else if (tree !== undefined && (
    tree[Symbol.asyncIterator] instanceof Function
    || tree[Symbol.iterator] instanceof Function
  )) {
    for await (const t of tree)
      yield* flat(i);
  } else yield t;
}

function fill(action) {
  let r;
  let a = v => {
    a = v => r = Yuyo.on(s => action(s, v), r);
    return r = v;
  };

  return a;
}

function zip(arr) {
  const p = new Yuyo();

  for (let i = 0; i < arr.length;) {
  }
}

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
// Values are treated as infinitely repeating iterators.
// Zipping resolvables means passing the same arg to all the resolvables,
// i.e. pairing the resolvables. $([f, g]) zips resolvables f and g.
// Zip acts recursively? No need for zip recursively, since zip takes
// an array of iterables, and the not yet zipped produced arrays can be zipped
// when needed.
function tab(arr) {
  const p = new Yuyo();
  // TODO: convert arr to yuyo?
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) {
      let u = arr[i];

      // No need to expand recursively.
      if (u instanceof Yuyo)
        p.$(u.copy().$(v => t => [...t, v]).act());
      else if (u === null)
        return $(null); // TODO: How does this affect execution?
      else
        p.$(t => {
          t.push(u);
          return t;
        });
    } else {
      p.$(t => {
        t.length++;
        return t;
      });
    }
  }

  // If arr has no paths, then p.act should be an Array.
  return p;
}

// Util

function push(arr, item) {
  arr.push(item);
  return arr;
}

function* forever() {
  while (1) yield;
}

function last(it) {
  let r;
  for (r of it);
  return r;
}
