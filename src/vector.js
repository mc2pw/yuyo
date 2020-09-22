import * as sym from "./symbol";

export class Vector {
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

export class Tensor extends Array {
  static create(arr, func) {
    const t = new Tensor();

    for (const v of arr)
      t.push(func(v));

    return t;
  }
}
