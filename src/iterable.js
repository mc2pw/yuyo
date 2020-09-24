import {abstract} from './func';

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
 * @function until
 * @param {Iterable} it
 * @yield {*}
 */
export function* until(it) {
  // Use together with fill and filter.
  let r;
  for (r of it) {
    if (r === null) break;

    yield r;
  }
}

/**
 * @generator
 * @function asyncUtil
 * @param {AsyncIterable} it
 * @yield {*}
 */
export async function* asyncUntil(it) {
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
 * @function turn
 * @param {Function} action
 * @param {Iterable} it
 * @return {Function}
 */
export const turn = abstract(function(action, it) {
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
