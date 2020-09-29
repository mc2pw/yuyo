import * as core from '../core';
import * as sym from '../symbol';
import {Tensor} from '../vector';
import vector from './vector';
import formal from './formal';

const tensor = {
  ...vector,
  apply(f, v) {
    let w;

    if (Array.isArray(v) && !v[sym.act]) {
      if (f instanceof Tensor) {
        w = this.applyTensor(f, v);
      } else {
        w = this.applyToTensor(f, v);
      }
    } else {
      w = this.applyPairing(f, v);
    }

    return w;
  },
  prepare(v) {
    let w;

    if (Array.isArray(v) && !v[sym.act]) {
      if (v instanceof Tensor) {
        w = v;
      } else {
        w = Tensor.create(v, this.prepare.bind(this));
      }
    } else {
      w = this.prepareUnary(v);

      if (typeof w === 'function' && !(typeof v === 'function')) {
        w[sym.unary] = true;
      }
    }

    return w;
  },
  applyPairing(f, v) {
    let w;

    if (f instanceof Tensor) {
      // Yuyo x gets handled by applyFuncToSimple.
      const m = (x) => Array.isArray(x) ?
        this.applyTensor(f, x) :
        f.map((t) => this.apply(t, x));
      m[sym.unary] = true;
      w = this.applyFuncToSimple(m, v);
    } else {
      w = this.applyUnary(f, v);
    }

    return w;
  },
  applyTensor(f, v) {
    return f.map((t, i) => this.apply(t, v[i]));
  },
  applyToTensor(f, v) {
    return vector.apply.call({
      applyFunc: this.applyFuncToTensor.bind(this),
    }, f, v);
  },
  applyUnary: vector.apply,
  prepareUnary: vector.prepare,
  applyFunc(f, v) {
    let w;

    if (Array.isArray(v) && !v[sym.act]) {
      w = f[sym.unary] ? f(v) : f(...v);
    } else {
      w = this.applyFuncToSimple(f, v);
    }

    return w;
  },
  applyFuncToSimple(f, v) {
    let w;

    if (v === null) {
      w = null;
    } else if (v === undefined) {
      w = f(v);
    } else if (v[sym.pre]) {
      w = v[sym.pre](f);
    } else {
      w = core.applyFunc(this._applyFunc.bind(this), f, v);
    }

    return w;
  },
  applyFuncToTensor(f, v) {
    const w = core.foldArray(formal.action.bind(formal), [], v);
    return this.applyFunc(f, w);
  },
  _applyFunc(f, v) {
    let w;

    if (Array.isArray(v) && !v[sym.act]) {
      w = this.applyFuncToTensor(f, v);
    } else {
      w = this.applyFunc(f, v);
    }

    return w;
  },
};

// The action corresponds to a functor from the free cat or 2-colimit.
export default tensor;
