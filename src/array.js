import {unary, abstract} from './func';

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
