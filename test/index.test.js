import {
  $,
  last,
  push,
  tab,
} from '../src/index';

/**
 * @param {Yuyo} yy
 * @return {Array}
 */
function y2a(yy) {
  const dst = [];
  last(yy.$(push(dst)).flat());
  return dst;
};

test('creates simple vector', () => {
  const t1 = $(1, $(2, $(3, 4, 5)));
  const t2 = $($(1), $(2, null, 3), null, 4, 5);
  const t3 = $(1, 2, 3, 4, 5);
  const t4 = $(null);
  const t5 = $();
  const t6 = $(1);
  const t7 = $($($(1)));

  const r1 = [1, 2, 3, 4, 5];
  const r2 = [];
  const r3 = [1];

  expect(y2a(t1)).toEqual(r1);
  expect(y2a(t2)).toEqual(r1);
  expect(y2a(t3)).toEqual(r1);
  expect(y2a(t4)).toEqual(r2);
  expect(y2a(t5)).toEqual(r2);
  expect(y2a(t6)).toEqual(r3);
  expect(y2a(t7)).toEqual(r3);
});

test('creates vector with tensors', () => {
  const s1 = $(1, 2);
  const s2 = $(3, 4);

  const t1 = $([s1, s2]);
  const t2 = $({s1, s2}).$(tab());
  const t3 = $([5, s1], [s2, 6]);
  const t4 = $([5, s1, 6]);

  const r1 = [[1, 3], [1, 4], [2, 3], [2, 4]];
  const r2 = [
    {s1: 1, s2: 3}, {s1: 1, s2: 4},
    {s1: 2, s2: 3}, {s1: 2, s2: 4},
  ];
  const r3 = [
    [5, 1], [5, 2],
    [3, 6], [4, 6],
  ];
  const r4 = [[5, 1, 6], [5, 2, 6]];

  expect(y2a(t1)).toStrictEqual(r1);
  expect(y2a(t2)).toStrictEqual(r2);
  expect(y2a(t3)).toStrictEqual(r3);
  expect(y2a(t4)).toStrictEqual(r4);
});

test('creates function vectors', () => {
  const f1 = (x) => $(x, x + 1);
  const f2 = (x) => 3*x;
  const f3 = (x) => x*x;
  const f4 = (x, y) => $(x-y, x+y);

  const t1 = $(1).$(f1).$(f2);
  const t2 = $(1).$($(f1).$(f3));
  const t3 = $([1, 2]).$($([f1, f2], f4).$(f4, undefined));

  const r1 = [3, 6];
  const r2 = [1, 4];
  const r3 = [
    -5, 7, [1, 6], -4, 8, [2, 6],
    NaN, NaN, -1, NaN, NaN, 3,
  ];

  expect(y2a(t1)).toEqual(r1);
  expect(y2a(t2)).toEqual(r2);
  expect(y2a(t3)).toEqual(r3);
  // TODO: This fails!
  // for(const k of $([$(1, 2), $(3, 4)]).walk(fg.list)) console.log(k);
});
