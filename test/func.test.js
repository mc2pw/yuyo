import {y2a, ay2a} from './util';
import {
  $,
  unary,
  fill,
  pick,
  feedback,
  forever,
  print,
  sleep,
  push,
  tab,
} from '../src/index';

test('accumulate values', () => {
  const t1 = $(1, 2, 3, 4, 5).$(fill((v) => (s) => s+v));
  const t2 = $(1, 2, 3, 4, 5).$(feedback(
      (f) => (x) => x === 1 ? 1 : x + f(x-1),
  ));
  const t3 = $([], 1, 2, 3).$(fill((v) => unary((s) => {
    s.push(v);
    return s;
  })));
  const _t4 = $(1, forever).$(
      fill(() => (s) => s+1),
  ).$(
      (x) => x%2 === 0 ? x : null,
  );
  const t4 = _t4.filter$().$(pick(5)).finish$();

  const r1 = [1, 3, 6, 10, 15];
  const r2 = [[], [1], [1, 2], [1, 2, 3]];
  const r3 = [2, 4, 6, 8, 10];

  expect(y2a(t1)).toEqual(r1);
  expect(y2a(t2)).toEqual(r1);
  expect(y2a(t3)).toEqual(r2);
  expect(y2a(t4)).toEqual(r3);
});

jest.useFakeTimers();

test('identity with side effects', async () => {
  // print
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const tPrint = $(1, 2).$(print('tag'));
  const rPrint = [1, 2];

  expect(y2a(tPrint)).toEqual(rPrint);
  expect(spy).toHaveBeenNthCalledWith(1, 'tag', 1);
  expect(spy).toHaveBeenNthCalledWith(2, 'tag', 2);

  // sleep
  const td = 1000;
  const task = $(1, 2).$(sleep(td)).asyncFlat();

  for (let i = 1; i <= 2; i++) {
    const p = task.next();
    jest.advanceTimersByTime(td);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), td, i);
    expect(await p).toEqual({
      value: i,
      done: false,
    });
  }

  expect((await task.next()).done).toEqual(true);

  // push
  const dst = [];
  const tPush = $(1, 2).$(push(dst));
  const rPush = [1, 2];

  expect(y2a(tPush)).toEqual(rPush);
  expect(dst).toEqual(rPush);
});

test('match and tab', async () => {
  // match, flat and act allow applying functions resulting from a Yuyo.
  const f1 = () => $(0, forever)
      .$(fill(() => (s) => s+1))
      .$((x) => ({a, b}) => x + a + b);

  const _t = $({
    a: $(1, 2, 3),
    b: $(10, 20, 30),
  }).$(tab());
  const t1 = _t.copy().$(f1().match()).finish$();
  const t2 = _t.copy().$(f1().asyncMatch()).finish$();

  const r1 = [11, 22, 33, 15, 26, 37, 19, 30, 41];

  expect(y2a(t1)).toEqual(r1);
  expect(await ay2a(t2)).toEqual(r1);
});
