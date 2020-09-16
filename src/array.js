import {
  call,
  el
} from "./core";

// TODO: Instead of array yuyo conversion do iterable yuyo conversion?
/*export const yuyo = yy => unary(arr => {
  const r = new Yuyo();

  for (const t of arr)
    r.$(t);

  return r;
});*/

// Handle constant
const iterNext = iter => {
};

const maybePush = ({value, done}) => done ? null : push(value);

function* zipFuncs(arr) {
  for (const it of arr) {
    yield call(maybePush, () => it.next());
  }
}

function _zip(arr) {
  return yuyo(arr.map(it => call(
    ({value, done}) => done ? null : push(value),
    it.next()
  )));
}

export const zip = unary(arr => {
  const funcs = _zip(arr);

  function next() {
    const value = funcs.act([]);

    // This can't be a yuyo because of the null value.
    return value => value === null ? {done: true} : {value, done: false};
  };

  return {
    [Symbol.iterator]() {
      return { next };
    }
  };
});

export const asyncZip = unary(arr => {
  const funcs = _zip(arr);

  async function next() {
    const value = await funcs.act([]);

    return value === null ? {done: true} : {value, done: false};
  };

  return {
    [Symbol.asyncIterator]() {
      return { next };
    }
  };
});

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

export const tab = {(arr => {
  // Return iterable (generator) instead then apply yuyo. Take iterable?
  const p = new Yuyo();
  // TODO: convert arr to yuyo?
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) {
      let u = arr[i];

      // No need to expand recursively.
      if (u instanceof Yuyo) {
        p.$() // use call
        p.$(u.copy().$(push)[sym.act](copy));
      } else if (u === null)
        return $();
        //return $(null); // TODO: How does this affect execution?
      else
        p.$(push(u));
    } else {
      p.$(incrLength);
    }
  }

  // If arr has no paths, then p.act should be an Array.
  return p;
});

export const push = item => arr => {
  arr.push(item);
  return arr;
};

export const copy = arr => [...arr];

export const incrLength = arr => {
  arr.length++;
  return arr;
};
