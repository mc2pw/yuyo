import * as core from "../core";
import * as sym from "../symbol";
import vector from "./vector";

// What about functions as entries?
const _formal = {
  action: vector.action, // Empty values need to be handled in another layer.
  prepare(f) {
    let w;

    // Recognizing sym.prepare does not make sense here.
    if (f == null)
      w = f;
    else if (f[sym.act] instanceof Function)
      w = f[sym.act]();
    else
      w = f;

    const u = core.prepareCollection(this.action.bind(this), w);

    if (u instanceof Function && !(w instanceof Function))
      return u;
    else
      return x => this.append(u, x);
  },
  apply(f, v) {
    let w;

    // The elemental values are null and arrays.
    if (v instanceof Array)
      w = f(v);
    else if (v === null)
      w = null;
    else
      w = core.applyFunc(this.apply.bind(this), f, v);

    return w;
  },
  append(f, v) {
    return [...v, f];
  }
};

// This can be implemented with the tensor action, but since tensor action
// already requires the formal action, it's probably better to implement it
// this way.
const formal = {
  ..._formal,
  prepare: _formal.prepare.bind(_formal),
  append(f, v) {
    v.push(f);
    return v;
  }
};

export default formal;
