import { $, fungion } from '../src/index';
import * as fg from '../src/index';

test('creates simple vector', () => {
  expect(fg.list(1, $(2, $(3, 4, 5))).items).toEqual([1, 2, 3, 4, 5]);
  expect(fg.list($(1), $(2, null, 3), null, 4, 5).items).toEqual([1, 2, 3, 4, 5]);
  expect(fg.list(1, 2, 3, 4, 5).items).toEqual([1, 2, 3, 4, 5]);
  expect(fg.list(null).items).toEqual([]);
  expect(fg.list().items).toEqual([]);
  expect(fg.list(1).items).toEqual([1]);
  expect(fg.list($($(1))).items).toEqual([1]);
});

test('creates vector with tensors', () => {
  const s = $(1, 2);
  const t = $(3, 4);
  expect(fg.list([s, t]).items).toStrictEqual([[1, 3], [1, 4], [2, 3], [2, 4]]);
  expect(fg.list({s, t}).items).toStrictEqual([
    {s: 1, t: 3}, {s: 1, t: 4},
    {s: 2, t: 3}, {s: 2, t: 4}
  ]);
  expect(fg.list([5, s], [t, 6]).items).toStrictEqual([
    [5, 1], [5, 2],
    [3, 6], [4, 6]
  ]);
  expect(fg.list([5, s, 6]).items).toStrictEqual([
    [5, 1, 6], [5, 2, 6]
  ]);
});

test('creates function vectors', () => {
  const f = x => $(x, x + 1);
  const g = x => 3*x;
  const h = x => x*x;
  const i = (x, y) => $(x-y, x+y);

  expect(fg.list($(1).$(f).$(g)).items).toEqual([3, 6]);
  expect(fg.list($(1).$($(f).$(h))).items).toEqual([1, 4]);
  expect(fg.list($([1, 2]).$($([f, g], i).$(i, undefined))).items).toEqual([
    -5, 7, -4, 8, [1, 6], [2, 6],
    NaN, NaN, NaN, NaN, -1, 3
  ]);

  //TODO: This fails!
  // for(const k of $([$(1, 2), $(3, 4)]).walk(fg.list)) console.log(k);
});
