/** An array with a function applied each time an itm is accessed.
 *
 * @ignore
 */
export class Vector {
  /**
   * @param {Array} terms
   * @param {Function} out
   */
  constructor(terms, out) {
    this.terms = terms;
    this.out = out;
  }

  /**
   * @param {number} i
   * @return {*}
   */
  get(i) {
    if (i >= this.terms.length) return null;

    return this.out(this.terms[i]);
  }

  /**
   * @generator
   * @yield {*}
   */
  * [Symbol.iterator]() {
    for (let i = 0; i < this.terms.length; i++) {
      if (i in this.terms) yield this.out(this.terms[i]);
    }
  }

  /**
   * @generator
   * @yield {*}
   */
  async* [Symbol.asyncIterator]() {
    for (let i = 0; i < this.terms.length; i++) {
      if (i in this.terms) yield await this.out(this.terms[i]);
    }
  }
}

/** An array.
 *
 * @ignore
 */
export class Tensor extends Array {
  /**
   * @param {Iterable} arr
   * @param {Function} func
   * @return {Tensor}
   */
  static create(arr, func) {
    const t = new Tensor();

    for (const v of arr) {
      t.push(func(v));
    }

    return t;
  }

  /**
   * This makes map return an Array.
   * @return {Type}
   */
  static get [Symbol.species]() {
    return Array;
  }
}
