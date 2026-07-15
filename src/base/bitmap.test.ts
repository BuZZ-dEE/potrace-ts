import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Bitmap} from './bitmap';
import {Histogram} from './histogram';
import {Point} from './point';

describe('Bitmap', () => {
  it('stores dimensions and allocates one byte per pixel', () => {
    const bitmap = new Bitmap(3, 2);

    assert.equal(bitmap.width, 3);
    assert.equal(bitmap.height, 2);
    assert.equal(bitmap.size, 6);
    assert.equal(bitmap.arrayBuffer.byteLength, 6);
    assert.ok(bitmap.data instanceof Uint8Array);
    assert.equal(bitmap.data.length, 6);
  });

  it('returns pixel values at coordinates', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 20, 30]);

    assert.equal(bitmap.getValueAt(0, 0), 0);
    assert.equal(bitmap.getValueAt(1, 0), 10);
    assert.equal(bitmap.getValueAt(0, 1), 20);
    assert.equal(bitmap.getValueAt(1, 1), 30);
  });

  it('converts valid indexes to points', () => {
    const bitmap = new Bitmap(3, 2);

    assert.deepEqual(bitmap.indexToPoint(0), new Point(0, 0));
    assert.deepEqual(bitmap.indexToPoint(4), new Point(1, 1));
    assert.deepEqual(bitmap.indexToPoint(5), new Point(2, 1));
  });

  it('sets negative index conversions to -1 coordinates', () => {
    const bitmap = new Bitmap(3, 2);

    assert.deepEqual(bitmap.indexToPoint(-1), new Point(-1, -1));
    assert.deepEqual(bitmap.indexToPoint(6), new Point(0, 2));
  });

  it('reuses a provided point when converting indexes', () => {
    const bitmap = new Bitmap(3, 2);
    const point = new Point();

    assert.equal(bitmap.indexToPoint(2, point), point);
    assert.deepEqual(point, new Point(2, 0));
  });

  it('converts points and coordinate pairs to indexes', () => {
    const bitmap = new Bitmap(3, 2);

    assert.equal(bitmap.pointToIndex(0, 0), 0);
    assert.equal(bitmap.pointToIndex(2, 1), 5);
    assert.equal(bitmap.pointToIndex(new Point(1, 1)), 4);
  });

  it('returns -1 when converting negative coordinates to indexes', () => {
    const bitmap = new Bitmap(3, 2);

    assert.equal(bitmap.pointToIndex(-1, 0), -1);
    assert.equal(bitmap.pointToIndex(3, 0), 3);
    assert.equal(bitmap.pointToIndex(0, -1), -1);
    assert.equal(bitmap.pointToIndex(0, 2), 6);
  });

  it('copies bitmap data without sharing the underlying typed array', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 20, 30]);

    const copy = bitmap.copy();

    assert.ok(copy instanceof Bitmap);
    assert.equal(copy.width, 2);
    assert.equal(copy.height, 2);
    assert.deepEqual(Array.from(copy.data), [0, 10, 20, 30]);
    assert.notEqual(copy.data, bitmap.data);
  });

  it('copies bitmap data through a value transformer', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 20, 30]);

    const copy = bitmap.copy((value, index) => value + index);

    assert.deepEqual(Array.from(copy.data), [0, 11, 22, 33]);
  });

  it('creates and caches a histogram', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 10, 255]);

    const histogram = bitmap.histogram();

    assert.ok(histogram instanceof Histogram);
    assert.equal(histogram.data[0], 1);
    assert.equal(histogram.data[10], 2);
    assert.equal(histogram.data[255], 1);
    assert.equal(bitmap.histogram(), histogram);
  });
});
