import * as sym from "./symbol";
import { Vector } from "./vector";

function prepareAsyncIterable(action, v) {
  return x => ({
    async *[Symbol.asyncIterator]() {
      for await (const t of v)
        yield action(t, x);
    }
  });
}

function prepareIterable(action, v) {
  return x => ({
    *[Symbol.iterator]() {
      for (const t of v)
        yield action(t, x);
    }
  });
}

function preparePromise(action, v) {
  return async function (x) {
    return action(await v, x);
  };
}

function prepareVector(action, v) {
  return x => new Vector(v.terms, t => action(v.out(t), x));
}

function applyToAsyncIterable(action, f, v) {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const t of v)
        yield action(f, t);
    }
  };
}

function applyToIterable(action, f, v) {
  return {
    *[Symbol.iterator]() {
      for (const t of v)
        yield action(f, t);
    }
  };
}

async function applyToPromise(action, f, v) {
  return action(f, await v);
}

function applyToVector(action, f, v) {
  return new Vector(v.terms, t => action(f, v.out(t)));
}

function applyToFunction(action, f, v) {
  const mapped = t => t instanceof Function ? (...i) => mapped(t(...i)) : action(f, t);
  return mapped(v);
}

/*export function prepare(action, v) {
  // Turn some values into unary functions.
  // Set symbols on arrays when preparing.

  let w;

  if (v instanceof Function)
    // Using $ as the function turns the arrays into yuyos.
    w = v;
  else if (v instanceof Vector)
    w = prepareVector(action, v);
  else if (v instanceof Promise)
    w = preparePromise(action, v);
  else if (v == null)
    w = v;
  else if (v[sym.prepare] instanceof Function)
    w = v[sym.prepare](action);
  else if (v[sym.act] instanceof Function)
    w = x => v[sym.act](x);
  else if (v[Symbol.iterator] instanceof Function)
    w = prepareIterable(action, v);
  else if (v[Symbol.asyncIterator] instanceof Function)
    w = prepareAsyncIterable(action, v);
  else
    w = v;

  return w;
}*/

export function prepare(action, v) {
  // Turn some values into unary functions.
  // Set symbols on arrays when preparing.
  // Using $ as the function turns the arrays into yuyos.

  let w;

  if (v instanceof Vector)
    w = prepareVector(action, v);
  else if (v instanceof Promise)
    w = preparePromise(action, v);
  else if (v == null)
    w = v;
  else if (v[sym.prepare] instanceof Function)
    w = v[sym.prepare](action);
  else if (v[Symbol.iterator] instanceof Function)
    w = prepareIterable(action, v);
  else if (v[Symbol.asyncIterator] instanceof Function)
    w = prepareAsyncIterable(action, v);
  else
    w = v;

  return w;
}



// Instead of marking "trees" in Yuyo, mark the arrays.
// Create several Yuyo like classes, the more complicated ones can for
// example give especial meaning to arrays (product and pairing).

export function applyFunc(action, f, v) {
  // pass arg variadic.
  // TODO: Is there a problem with this not being recursive?
  // TODO: How does one do raw mapping of the terms, besides reccursively iterating?
  let w;

  if (v instanceof Function)
    w = applyToFunction(action, f, v);
  else if (v instanceof Vector)
    w = applyToVector(action, f, v);
  else if (v instanceof Promise)
    w = applyToPromise(action, f, v);
  else if (v === null)
    w = null;
  else if (v === undefined)
    w = f(v);
  else if (v[sym.pre] instanceof Function)
    w = v[sym.pre](f);
    //TODO: should this be v.pre().act()??
  else if (v[Symbol.iterator] instanceof Function)
    w = applyToIterable(action, f, v);
  else if (v[Symbol.asyncIterator] instanceof Function)
    w = applyToAsyncIterable(action, f, v);
  else
    w = f(v);

  return w;
}

function fold(action, start, steps) {
  let v = start;

  for (const f of steps) {
    if (v === null)
      return null;

    v = action(f, v);
  }

  return v;
}

/*export const callUnary = createCall(callFunc);

export const apply = action => (f, v) => {
  let w;

  if (f === undefined)
    w = v; // TODO: Is this needed?
  else if (f instanceof Function)
    if (f[sym.raw])
      w = f(v);
    else
      w = action(f, v);
  else
    w = f

  return w;
};*/
/*
  else if (f instanceof Array)
    w = callArray(handle, f, v);
*/

/*export function callArray(handle, f, v) {
  let w;

  if (v instanceof Array && !v[sym.tree])
    // Empty values of f are treated as zero not as the identity.
    w = f.map((t, i) => call(handle, t, v[i]));
  else
    w = callPairing(handle, f, v);

  return w;
}*/

/*export function precall(f, v) {
  f = prepare(f); // prepareArray? Separate array operations just like variadic?
  return f instanceof Array ? callPairing(ev, f, v) : f(v);
}*/

/*export function precall(f, v) {
  return prepare(f)(v);
}*/

//export const ev = (h, x) => h(x); // The ev operation has to handled by the transpiler.

// Place in a different module??
/*
export const tab = unary(arr => {
  // Return iterable (generator) instead then apply yuyo. Take iterable?
  const p = new Yuyo();
  // TODO: convert arr to yuyo?
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) {
      let u = arr[i];

      // No need to expand recursively.
      if (u instanceof Yuyo) {
        p.$() // use call
        p.$(u.copy().$(copy).$(push(v)).act());
      } else if (u === null)
        return $();
        //return $(null); // TODO: How does this affect execution?
      else
        p.$(push(u));
    } else {
      p.$(incrLength);
    }
  }

  // If arr has no paths, then p.act should be an Array.
  return p;
});*/
