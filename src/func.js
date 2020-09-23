import * as sym from "./symbol";

export function unary(f) {
  f[sym.unary] = true;
  return f;
}

export const abstract = f => function (...v) {
  const theory = {};

  return {
    [sym.prepare](action) {
      theory.action = action;
      return f.call(theory, ...v);
    }
  };
};

// When using fill the yuyo has to be recreated before each iteration
// to reset the state. In a sense, this makes fill(action) of affine type.
// A composition that has an affine type is also affine?
// TODO: mark fill(action) as affine? Pass the affine property to the yuyo?
export const fill = abstract(function (action) {
  let r;
  let a = v => { // null is handled by theory. This can be used for XNNO.
    a = v => r = this.action(this.action(action, v), r);
    return r = v;
  };

  return unary(v => a(v));
});

// TODO: Catch errors by providing a way to use the second term only if the
// first is null? This would work as an if else.
export function pick(count) {
  let k = 0;

  return unary(v => k++ < count ? v : null);
};

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
// TODO: Send messages, errors, etc.

export const print = unary(x => {
  console.log(x);
  return x;
});

export const sleep = duration => unary(function (x) {
  return new Promise(resolve => setTimeout(resolve, duration, x));
});

export const push = dst => unary(x => {
  dst.push(x);
  return x;
});
