import * as sym from './symbol';
import * as core from './core';
import * as iter from './iterable';
import {unary} from './func';
import {Vector} from './vector';
import tensor from './action/tensor';

export * from './func';
export {sym as symbol};

/** A Yuyo is a composition. */
export class Yuyo extends Array {
  /**
   * Adds a new step to the Yuyo.
   *
   * @param {...*} terms
   * @return {Yuyo}
   */
  $(...terms) {
    const theory = Yuyo.theory;

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
    const theory = Yuyo.theory;
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
    const theory = Yuyo.theory;
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

  /**
   * @generator
   * @function climb
   * @param {Function} gen
   * @yield {*}
   */
  * climb(gen) {
    const tree = this[sym.act]();

    if (iter.isBranch(tree)) {
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

    if (iter.isAsyncBranch(tree)) {
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
  [sym.flat]() {
    return this.climb(iter.flat);
  }

  /**
   * @return {AsyncIterator}
   */
  [sym.asyncFlat]() {
    return this.asyncClimb(iter.asyncFlat);
  }

  /**
   * @return {Iterator}
   */
  flat() {
    return this[sym.flat]();
  }

  /**
   * @return {AsyncIterator}
   */
  asyncFlat() {
    return this[sym.asyncFlat]();
  }

  /**
   * @return {AsyncIterator}
   */
  mix() {
    return this.climb(iter.mix);
  }

  /**
   * @return {AsyncIterator}
   */
  asyncMix() {
    return this.asyncClimb(iter.asyncMix);
  }

  /**
   * @return {AsyncIterator}
   */
  merge() {
    return this.asyncClimb(iter.merge);
  }

  /**
   * @return {*}
   */
  last() {
    return iter.last(this.flat());
  }

  /**
   * @return {Promise}
   */
  asyncLast() {
    return iter.asyncLast(this.asyncFlat());
  }

  /**
   * @return {Iterator}
   */
  filter() {
    return iter.filter(this.flat());
  }

  /**
   * @return {AsyncIterator}
   */
  asyncFilter() {
    return iter.asyncFilter(this.asyncFlat());
  }

  /**
   * @return {Iterator}
   */
  finish() {
    return iter.finish(this.flat());
  }

  /**
   * @return {AsyncIterator}
   */
  asyncFinish() {
    return iter.asyncFinish(this.asyncFlat());
  }

  /**
   * @return {Yuyo}
   */
  flat$() {
    return $(this.flat());
  }

  /**
   * @return {Yuyo}
   */
  asyncFlat$() {
    return $(this.asyncFlat());
  }

  /**
   * @return {Yuyo}
   */
  filter$() {
    return $(this.filter());
  }

  /**
   * @return {Yuyo}
   */
  asyncFilter$() {
    return $(this.asyncFilter());
  }

  /**
   * @return {Yuyo}
   */
  finish$() {
    return $(this.finish());
  }

  /**
   * @return {Yuyo}
   */
  asyncFinish$() {
    return $(this.asyncFinish());
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
