import {y2a} from './util';
import {
  $,
  tab,
} from '../src/index';

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
  const f5 = (x, y) => [x, y];
  const f6 = (x) => [x-1, x+1];
  const f7 = (x, y) => x*y + 1;

  const t1 = $(1).$(f1).$(f2);
  const t2 = $(1).$($(f1).$(f3));
  const t3 = $([1, 2]).$($([f1, f2], f4).$(f4, undefined));
  const t4 = $([$(1, 2), $(3, 4)]).$(f4);
  const t5 = $([$(1, 2), $(3, 4)]).$(f5);
  const t6 = $([$(1, 2), $(3, 4)]).$(f4, f5);
  const t7 = $(1, $(2, 3), 4, $(5)).$([$(f6).$(f7), $(f3)]).$(f4);
  const t8 = $([1, [2, 3]], [4, [5, 6]]).$([[f2, f3], f4]);

  const r1 = [3, 6];
  const r2 = [1, 4];
  const r3 = [
    -5, 7, [1, 6], -4, 8, [2, 6],
    NaN, NaN, -1, NaN, NaN, 3,
  ];
  const r4 = [-2, 4, -3, 5, -1, 5, -2, 6];
  const r5 = [[1, 3], [1, 4], [2, 3], [2, 4]];
  const r6 = [-2, 4, [1, 3], -3, 5, [1, 4], -1, 5, [2, 3], -2, 6, [2, 4]];
  const r7 = [0, 2, 0, 8, 0, 18, 0, 32, 0, 50];
  const r8 = [
    [[3, 1], -1], [[3, 1], 5],
    [[12, 16], -1], [[12, 16], 11],
  ];

  expect(y2a(t1)).toEqual(r1);
  expect(y2a(t2)).toEqual(r2);
  expect(y2a(t3)).toEqual(r3);
  expect(y2a(t4)).toEqual(r4);
  expect(y2a(t5)).toEqual(r5);
  expect(y2a(t6)).toEqual(r6);
  expect(y2a(t7)).toEqual(r7);
  expect(y2a(t8)).toEqual(r8);
});

test('vectors within vectors', () => {
  const f1 = (x) => x+1;
  const f2 = (x) => $(x+2, x+3);
  const f3 = (x) => $();
  const f4 = (x, y) => x+y;
  const f5 = (x) => [x, null];
  const f6 = (x) => $(x, null);
  const f7 = (x) => [x, [x, x]];
  const f8 = (x, y) => [x, y];

  const t1 = $($());
  const t2 = $($(), 1, $(2, 3));
  const t3 = $().$(f1);
  const t4 = $(1, $(), $(2), $(3, $(4, 5), 6), $(7, 8)).$(f1, f2, f3);
  const _t5 = $([$(1, 2), $(3, 4)]);
  const t5 = _t5.copy().$(f8);
  const t6 = $(_t5, [5, 6]).$(f4);
  const t7 = $(null, 1).$(f5, f6, $(f7).$([undefined, f4]));

  const b1 = t1.act();
  expect(b1.get(0).get(0)).toEqual(null);

  const b2 = t2.act();
  expect(b2.get(0).get(0)).toEqual(null);
  expect(b2.get(1)).toEqual(1);
  expect(b2.get(2).get(0)).toEqual(2);
  expect(b2.get(2).get(1)).toEqual(3);

  const b3 = t3.act();
  expect(b3.get(0)).toEqual(null);

  const b4 = t4.act();
  expect(b4.get(0).get(0)).toEqual(2);
  expect(b4.get(0).get(1).act().get(0)).toEqual(3);
  expect(b4.get(0).get(1).act().get(1)).toEqual(4);
  expect(b4.get(0).get(2).act().get(0)).toEqual(null);
  expect(b4.get(1).get(0)).toEqual(null);
  expect(b4.get(2).get(0)).toEqual(3);
  expect(b4.get(2).get(1).act().get(0)).toEqual(4);
  expect(b4.get(2).get(1).act().get(1)).toEqual(5);
  expect(b4.get(2).get(2).act().get(0)).toEqual(null);
  expect(b4.get(3).get(0).get(0)).toEqual(4);
  expect(b4.get(3).get(0).get(1).act().get(0)).toEqual(5);
  expect(b4.get(3).get(0).get(1).act().get(1)).toEqual(6);
  expect(b4.get(3).get(0).get(2).act().get(0)).toEqual(null);
  expect(b4.get(3).get(1).get(0).get(0)).toEqual(5);
  expect(b4.get(3).get(1).get(0).get(1).act().get(0)).toEqual(6);
  expect(b4.get(3).get(1).get(0).get(1).act().get(1)).toEqual(7);
  expect(b4.get(3).get(1).get(0).get(2).act().get(0)).toEqual(null);
  expect(b4.get(3).get(1).get(1).get(0)).toEqual(6);
  expect(b4.get(3).get(1).get(1).get(1).act().get(0)).toEqual(7);
  expect(b4.get(3).get(1).get(1).get(1).act().get(1)).toEqual(8);
  expect(b4.get(3).get(1).get(1).get(2).act().get(0)).toEqual(null);
  expect(b4.get(3).get(2).get(0)).toEqual(7);
  expect(b4.get(3).get(2).get(1).act().get(0)).toEqual(8);
  expect(b4.get(3).get(2).get(1).act().get(1)).toEqual(9);
  expect(b4.get(3).get(2).get(2).act().get(0)).toEqual(null);
  expect(b4.get(4).get(0).get(0)).toEqual(8);
  expect(b4.get(4).get(0).get(1).act().get(0)).toEqual(9);
  expect(b4.get(4).get(0).get(1).act().get(1)).toEqual(10);
  expect(b4.get(4).get(0).get(2).act().get(0)).toEqual(null);
  expect(b4.get(4).get(1).get(0)).toEqual(9);
  expect(b4.get(4).get(1).get(1).act().get(0)).toEqual(10);
  expect(b4.get(4).get(1).get(1).act().get(1)).toEqual(11);
  expect(b4.get(4).get(1).get(2).act().get(0)).toEqual(null);

  const _b5 = _t5.act();
  expect(_b5[0].get(0)).toEqual(1);
  expect(_b5[0].get(1)).toEqual(2);
  expect(_b5[1].get(0)).toEqual(3);
  expect(_b5[1].get(1)).toEqual(4);

  const b5 = t5.act();
  expect(b5.get(0).get(0)).toEqual([1, 3]);
  expect(b5.get(0).get(1)).toEqual([1, 4]);
  expect(b5.get(1).get(0)).toEqual([2, 3]);
  expect(b5.get(1).get(1)).toEqual([2, 4]);

  const b6 = t6.act();
  expect(b6.get(0).get(0).get(0)).toEqual(4);
  expect(b6.get(0).get(0).get(1)).toEqual(5);
  expect(b6.get(0).get(1).get(0)).toEqual(5);
  expect(b6.get(0).get(1).get(1)).toEqual(6);
  expect(b6.get(1)).toEqual(11);

  const b7 = t7.act();
  expect(b7.get(0)).toEqual(null);
  expect(b7.get(1).get(0)).toEqual([1, null]);
  expect(b7.get(1).get(1).act().get(0)).toEqual(1);
  expect(b7.get(1).get(1).act().get(1)).toEqual(null);
  expect(b7.get(1).get(2)).toEqual([1, 2]);
});
