import {i2a, ai2a} from './util';
import {
  $,
  unary,
} from '../src/index';

test('manipulation iterations', async () => {
  const isArray = unary((x) => x instanceof Array ? x : null);

  const t1 = $();
  const t2 = $(1);
  const t3 = $(1, 2, null, 3);
  const t4 = $(1, null, 2).$((x) => x+1);
  const t5 = $(null);
  const t6 = $(null, 1, 2);
  const t7 = $(null, 1, null).$((x) => x+1, 3);
  const t8 = $([], 1, [2, 3], 2).$(isArray).$(unary((x) => [...x, 4]), 5);

  const rFlat1 = [];
  const rFlat2 = [1];
  const rFlat3 = [1, 2, null, 3];
  const rFlat4 = [2, null, 3];
  const rFlat5 = [null];
  const rFlat6 = [null, 1, 2];
  const rFlat7 = [null, 2, 3, null];
  const rFlat8 = [[4], 5, null, [2, 3, 4], 5, null];

  const rFilter1 = [];
  const rFilter2 = [1];
  const rFilter3 = [1, 2, 3];
  const rFilter4 = [2, 3];
  const rFilter5 = [];
  const rFilter6 = [1, 2];
  const rFilter7 = [2, 3];
  const rFilter8 = [[4], 5, [2, 3, 4], 5];

  const rFinish1 = [];
  const rFinish2 = [1];
  const rFinish3 = [1, 2];
  const rFinish4 = [2];
  const rFinish5 = [];
  const rFinish6 = [];
  const rFinish7 = [];
  const rFinish8 = [[4], 5];

  const rLast1 = undefined;
  const rLast2 = 1;
  const rLast3 = 3;
  const rLast4 = 3;
  const rLast5 = null;
  const rLast6 = 2;
  const rLast7 = null;
  const rLast8 = null;

  expect(i2a(t1.flat())).toEqual(rFlat1);
  expect(i2a(t2.flat())).toEqual(rFlat2);
  expect(i2a(t3.flat())).toEqual(rFlat3);
  expect(i2a(t4.flat())).toEqual(rFlat4);
  expect(i2a(t5.flat())).toEqual(rFlat5);
  expect(i2a(t6.flat())).toEqual(rFlat6);
  expect(i2a(t7.flat())).toEqual(rFlat7);
  expect(i2a(t8.flat())).toEqual(rFlat8);
  expect(await ai2a(t1.asyncFlat())).toEqual(rFlat1);
  expect(await ai2a(t2.asyncFlat())).toEqual(rFlat2);
  expect(await ai2a(t3.asyncFlat())).toEqual(rFlat3);
  expect(await ai2a(t4.asyncFlat())).toEqual(rFlat4);
  expect(await ai2a(t5.asyncFlat())).toEqual(rFlat5);
  expect(await ai2a(t6.asyncFlat())).toEqual(rFlat6);
  expect(await ai2a(t7.asyncFlat())).toEqual(rFlat7);
  expect(await ai2a(t8.asyncFlat())).toEqual(rFlat8);

  expect(i2a(t1.filter())).toEqual(rFilter1);
  expect(i2a(t2.filter())).toEqual(rFilter2);
  expect(i2a(t3.filter())).toEqual(rFilter3);
  expect(i2a(t4.filter())).toEqual(rFilter4);
  expect(i2a(t5.filter())).toEqual(rFilter5);
  expect(i2a(t6.filter())).toEqual(rFilter6);
  expect(i2a(t7.filter())).toEqual(rFilter7);
  expect(i2a(t8.filter())).toEqual(rFilter8);
  expect(await ai2a(t1.asyncFilter())).toEqual(rFilter1);
  expect(await ai2a(t2.asyncFilter())).toEqual(rFilter2);
  expect(await ai2a(t3.asyncFilter())).toEqual(rFilter3);
  expect(await ai2a(t4.asyncFilter())).toEqual(rFilter4);
  expect(await ai2a(t5.asyncFilter())).toEqual(rFilter5);
  expect(await ai2a(t6.asyncFilter())).toEqual(rFilter6);
  expect(await ai2a(t7.asyncFilter())).toEqual(rFilter7);
  expect(await ai2a(t8.asyncFilter())).toEqual(rFilter8);

  expect(i2a(t1.finish())).toEqual(rFinish1);
  expect(i2a(t2.finish())).toEqual(rFinish2);
  expect(i2a(t3.finish())).toEqual(rFinish3);
  expect(i2a(t4.finish())).toEqual(rFinish4);
  expect(i2a(t5.finish())).toEqual(rFinish5);
  expect(i2a(t6.finish())).toEqual(rFinish6);
  expect(i2a(t7.finish())).toEqual(rFinish7);
  expect(i2a(t8.finish())).toEqual(rFinish8);
  expect(await ai2a(t1.asyncFinish())).toEqual(rFinish1);
  expect(await ai2a(t2.asyncFinish())).toEqual(rFinish2);
  expect(await ai2a(t3.asyncFinish())).toEqual(rFinish3);
  expect(await ai2a(t4.asyncFinish())).toEqual(rFinish4);
  expect(await ai2a(t5.asyncFinish())).toEqual(rFinish5);
  expect(await ai2a(t6.asyncFinish())).toEqual(rFinish6);
  expect(await ai2a(t7.asyncFinish())).toEqual(rFinish7);
  expect(await ai2a(t8.asyncFinish())).toEqual(rFinish8);

  expect(t1.last()).toEqual(rLast1);
  expect(t2.last()).toEqual(rLast2);
  expect(t3.last()).toEqual(rLast3);
  expect(t4.last()).toEqual(rLast4);
  expect(t5.last()).toEqual(rLast5);
  expect(t6.last()).toEqual(rLast6);
  expect(t7.last()).toEqual(rLast7);
  expect(t8.last()).toEqual(rLast8);
  expect(await t1.asyncLast()).toEqual(rLast1);
  expect(await t2.asyncLast()).toEqual(rLast2);
  expect(await t3.asyncLast()).toEqual(rLast3);
  expect(await t4.asyncLast()).toEqual(rLast4);
  expect(await t5.asyncLast()).toEqual(rLast5);
  expect(await t6.asyncLast()).toEqual(rLast6);
  expect(await t7.asyncLast()).toEqual(rLast7);
  expect(await t8.asyncLast()).toEqual(rLast8);
});

// TODO: Test mix and merge.
