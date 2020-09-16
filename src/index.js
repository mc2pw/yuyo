import * as sym from "symbol";
import * as core from "core";

export default function yuyo(theory) {
  class Yuyo extends YuyoBase {
    static function $(...terms) {
      const p = new Yuyo();
      p.$(...terms);
      return p;
    }
  }

  Yuyo.theory = theory;
  return Yuyo;
}

export class YuyoBase extends Array {
  $(...terms) {
    const theory = this.constructor.theory;

    this.push(terms.length === 1
      ? theory.prepare(terms[0])
      : x => new Vector(terms, t => theory.action(t, x))
    );

    // Cover with composition of sums.
    // Zip with tensor product of functions.
    return this;
  }

  copy() {
    const p = new Yuyo();

    for (let i = 0; i < this.length; i++)
      if (i in this)
        p[i] = this[i];

    return p;
  }

  // TODO: Document the fact that this is used for duck typing.
  [sym.pre](f) {
    return this.copy().$(f);
  }

  // TODO: Document the fact that this is used for duck typing.
  [sym.act](x) {
    // avoid lazy evaluations as much as possible.
    const theory = this.constructor.theory;
    return core.fold(theory.apply.bind(theory), x, this.factors());
  }

  *[Symbol.iterator]() {
    yield this[sym.act]();
  }

  // Useful for applying functors, allows changing each factor through map.
  *factors() {
    for (let i = 0; i < this.length; i++)
      if (i in this)
        yield this[i];
  }

  // Other methods
  // -------------
  // For resolvers this would be
  // $(v).$(f, g).
  // TODO: What happens if this is used with async iterables? done may end up
  // being a promise instead of a boolean.
  mix(col) {
    const funcs = memo(this.copy().$(v => ({it: col(v)}))).$(({it}) => () => it.next());

    const next = () => $(row => ({
       value: call(({value, done}) => done ? null : value, row),
       done: last(flat($(true, ({done}) => done).$(fill((s, v) => s && v)).act(row)))
    })).act(funcs.act());

    return {
      [Symbol.iterator]() {
        return { next };
      }
    };
  }

  // TODO: Decouple merge and mix from yuyo, just like zip is decoupled.
  merge(col) {
    const sources = memo(this.copy()
    .$(v => ({it: col(v)})) // If the position is needed col can include it.
    .$(({it}) => ({
      advance(done) {
        this.promise = done ? null : call(result => ({result, source: this}), it.next());
      }
    }))
    .$(source => source.advance(false)));

    function next() {
      const promises = nullify(flat($(sources).$(({promise}) => promise)));

      return $(({promises}) => promises === null
        ? {done : true}
        : $(t => {
          t.source.advance(t.result.done);
          return t.result;
        }).$(result => ({
          value: result,
          done: false
        })).act(Promise.race(promises))
      ).act({promises});
    }

    return {
      [Symbol.asyncIterator]() {
        return { next };
      }
    };
  }
}
