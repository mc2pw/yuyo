import * as core from "./core";
import * as sym from "./symbol";

export function unary(f) {
  f[sym.unary] = true;
  return f;
}

export function abstract(f) {
  const theory = {};

  return {
    [sym.prepare](action) {
      theory.action = action;
      return f.bind(theory);
    }
  };
}

// When using fill the yuyo has to be recreated before each iteration
// to reset the state. In a sense, this makes fill(action) of affine type.
// A composition that has an affine type is also affine?
// TODO: mark fill(action) as affine? Pass the affine property to the yuyo?
// TODO: What about continuation style as an alternative to fill? feedback(f)
export const fill = abstract(action => {
  let r;
  let a = v => { // null is handled by theory. This can be used for XNNO.
    a = v => r = this.action(action(v), r);
    return r = v;
  };

  return v => a(v);
});

// continuation
// (f => f((g => g(g))(g => n => f(g(g))(n))))
export function feedback(f) {
  const g = (...t) => f(g)(...t);
  return f(g);
}

export const forever = {
  next() {
    return {done: false};
  },
  [Symbol.iterator]() {
    return this;
  }
};

// Identity with secondary effects

export const print = unary(x => {
  console.log(x);
  return x;
});

export const sleep = duration => unary(async function (x) {
  return new Promise(resolve => setTimeout(resolve, duration, x));
});
