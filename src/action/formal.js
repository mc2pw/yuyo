import * as core from "../core";
import vector from "./vector";

// This can be implemented with the tensor action, but since tensor action
// already requires the formal action, it's probably better to implement it
// this way.
const formalBase = {
  action(f, v) { // Empty values need to be handled in another layer.
    let w;

    if (f instanceof Function)
      w = this.append(f, v);
    else {
      const p = this.prepare(f);

      if (p instanceof Function)
        w = p(v);
      else
        w = this.append(f, v);
    }

    return w;
  },
  prepare: vector.prepare,
  append(f, v) {
    return [...v, f];
  }
};

const formal = {
  ...formalBase,
  prepare: formalBase.prepare.bind(formalBase),
  append(f, v) {
    v.push(f);
    return v;
  }
};

export default formal;
