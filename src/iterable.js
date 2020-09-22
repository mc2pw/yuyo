import { abstract } from "./func";

//TODO: What happens when a function returns a yuyoIterable?
// A unary operation could take the result and process it in its entirety same as it
// occurs with arrays. Write this using fill??
/*export const yuyo = el(yy => el(it => {
  for (const t of arr)
    yy.$(t);

  return yy;
}));*/

// Accumulators

// This is similar to the algebra of an operad.
// The difference is that one chooses exactly one operation for each arity
// (perhaps depending on the state).
// If one was to use a list instead of a tree, there would be exactly one operation,
// and this operation may have the shape of a tree.
// To avoid filling arrays with infinite iterators one can instead have three
// operations (nullary, unary and binary) from which to form all other operations.
// The first term could help choose the operation meaning that the tree is actually
// the product of the terms and the operations such that the operations correspond
// to the size of the levels where they appear.
// To simplify, exclude nullary operations.
// One could also have a "flat" tree where the branching is indicated by certain
// terms which are the same as the formal operations.
// action(null, x) is the operation corresponding to x.
// action(s, null) is not necessarily null. null is the nullary operation (a constant).
// The action(null, x) operation is 1-ary when there are no more terms.
// The operation is applied to null.
// digest(r) takes the result of the action to complete the operation.
// digest(null) should always be null, since there is exactly one nullary operation
// unless there is some intermediate 1-ary operation.
// action(-, -) should be action(-, digest(-)).
/*export flow = isBranch => (init, action) {
  if (tree != null && tree[treeSym]) {
    let r = null;
    let a = v => {
      a = v => action(r, v); // TODO: use yuyoOn and check use of $(f).act(x)
      return init(v);
    }

    for (const t of tree)
      r = a(flow(t, init, action));

    return r;
  } else return tree;
}*/

/*export function memo(tree) {
  return $(...flow(tree, v => [v], (s, v) => push(s, $(...v))));
}*/

// TODO: Async versions of certain accumulators?

/*export function nullify(it) {
  // Initializes iterable only once.
  const m = it[Symbol.iterator]();
  const {value, done} = m.next();

  if (done) return null;

  let next = () => {
    next = () => m.next();
    return {value, done};
  };

  return {
    [Symbol.iterator]() {
      return { next };
    }
  }
}*/

export function last(it) {
  let r;
  for (r of it);
  return r;
}

// Use together with fill and filter.
export function* until(it) {
  let r;
  for (r of it) {
    if (r === null)
      break;

    yield r;
  }
}

export function* filter(it) {
  for (const v of it)
    if (v !== null)
      yield v;
}

// Provide a way for iterables to behave like arrays inside yuyos.
// The result is affine, similar to fill.
export const turn = abstract(function (it) {
  const iter = it[Symbol.asyncIterator] instanceof Function
    ? it[Symbol.asyncIterator]()
    : it[Symbol.iterator]();

  return v => this.action(({value, done}) => ({
    value: this.action(value, v),
    done
  }), iter.next());
});
