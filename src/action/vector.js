import * as sym from '../symbol';
import * as core from '../core';

const vector = {
  action(f, v) {
    return this.apply(this.prepare(f), v);
  },
  prepare(f) {
    let w;

    if (f == null) {
      w = f;
    } else if (f[sym.prepare] instanceof Function) {
      w = f[sym.prepare](this.action.bind(this));
    } else if (f[sym.act] instanceof Function) {
      w = f;
    } else {
      w = core.prepareCollection(this.action.bind(this), f);
    }

    return w;
  },
  apply(f, v) {
    // Valid values of f are the ones that don't require some sort of lazy
    // evaluation,
    // hece the use of prepare. f can be any of the results of prepare:
    // Array (not Vector, nor Yuyo), Function, "constant" values. sym.tree is
    // never set since it only applies to iterables, which are not considered
    // constant.
    // $(f).act(x) should be the same as call(prepare(f), x).
    let w;

    if (f === undefined) {
      w = v;
    } else if (f === null) {
      w = f;
    } else if (f[sym.act] instanceof Function) {
      w = f[sym.act](v);
    } else if (f instanceof Function) {
      w = this.applyFunc(f, v);
    } else {
      w = f;
    }

    return w;
  },
  applyFunc(f, v) {
    return f(v);
  },
};

export default vector;
