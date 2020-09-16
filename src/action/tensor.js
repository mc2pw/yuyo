import * as core from "../core";
import * as sym from "../symbol";
import { Tensor } from "../vector";
import vector from "./vector";
import formal from "./formal";

const tensor = {
  ...vector,
  apply(f, v) {
    let w;

    if (v instanceof Array && !(v[sym.act] instanceof Function)) {
      if (f instanceof Tensor)
        w = this.applyTensor(f, v);
      else
        w = this.applyToTensor(f, v);
    } else
      w = this.applyPairing(f, v);

    return w;
  },
  prepare(v) {
    let w;

    if (v instanceof Array && !(v[sym.act] instanceof Function)) {
      if (v instanceof Tensor)
        w = v;
      else
        w = Tensor.create(v, this.prepare.bind(this));
    } else {
      w = this.prepareUnary(v);

      if (w instanceof Function && !(v instanceof Function))
        w[sym.unary] = true;
    }

    return w;
  },
  applyPairing(f, v) {
    let w;

    if (f instanceof Tensor)
      w = f.map(t => this.applyPairing(t, v));
    else
      w = this.applyUnary(f, v);

    return w;
  },
  applyTensor(f, v) {
    return f.map((t, i) => this.apply(t, v[i]));
  },
  applyToTensor(f, v) {
    return vector.apply.call({
      applyFunc: this.applyFuncToTensor.bind(this)
    }, f, v);
  },
  applyUnary: vector.apply,
  prepareUnary: vector.prepare,
  applyFunc(f, v) {
    return core.applyFunc(this._applyFunc.bind(this), f, v);
  },
  applyFuncToTensor(f, v) {
    const w = core.fold(formal.action.bind(formal), [], v);
    const g = f[sym.unary] ? f : x => f(...x);
    return this.applyFunc(g, w);
  },
  _applyFunc(f, v) {
    let w;

    if (v instanceof Array && !(v[sym.act] instanceof Function))
      w = this.applyFuncToTensor(f, v);
    else
      w = this.applyFunc(f, v);

    return w;
  }
};

// The action corresponds to a functor from the free cat or 2-colimit.
export default tensor;
