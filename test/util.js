import {
  push,
} from '../src/index';

/**
 * @param {Yuyo} yy
 * @return {Array}
 */
export function y2a(yy) {
  const dst = [];
  yy.$(push(dst)).last();
  return dst;
};

/**
 * @param {Yuyo} yy
 * @return {Array}
 */
export async function ay2a(yy) {
  const dst = [];
  await yy.$(push(dst)).asyncLast();
  return dst;
};

/**
 * @param {Iterable} it
 * @return {Array}
 */
export function i2a(it) {
  const dst = [];

  for (const v of it) {
    dst.push(v);
  }

  return dst;
}

/**
 * @param {AsyncIterable} it
 * @return {Array}
 */
export async function ai2a(it) {
  const dst = [];

  for await (const v of it) {
    dst.push(v);
  }

  return dst;
}
