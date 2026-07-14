import {Bitmap} from './bitmap';
import {Histogram} from './histogram';
import {Point} from './point';

describe('Bitmap', () => {
  it('stores dimensions and allocates one byte per pixel', () => {
    const bitmap = new Bitmap(3, 2);

    expect(bitmap.width).toBe(3);
    expect(bitmap.height).toBe(2);
    expect(bitmap.size).toBe(6);
    expect(bitmap.arrayBuffer.byteLength).toBe(6);
    expect(bitmap.data).toBeInstanceOf(Uint8Array);
    expect(bitmap.data).toHaveLength(6);
  });

  it('returns pixel values at coordinates', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 20, 30]);

    expect(bitmap.getValueAt(0, 0)).toBe(0);
    expect(bitmap.getValueAt(1, 0)).toBe(10);
    expect(bitmap.getValueAt(0, 1)).toBe(20);
    expect(bitmap.getValueAt(1, 1)).toBe(30);
  });

  it('converts valid indexes to points', () => {
    const bitmap = new Bitmap(3, 2);

    expect(bitmap.indexToPoint(0)).toEqual(new Point(0, 0));
    expect(bitmap.indexToPoint(4)).toEqual(new Point(1, 1));
    expect(bitmap.indexToPoint(5)).toEqual(new Point(2, 1));
  });

  it('sets negative index conversions to -1 coordinates', () => {
    const bitmap = new Bitmap(3, 2);

    expect(bitmap.indexToPoint(-1)).toEqual(new Point(-1, -1));
    expect(bitmap.indexToPoint(6)).toEqual(new Point(0, 2));
  });

  it('reuses a provided point when converting indexes', () => {
    const bitmap = new Bitmap(3, 2);
    const point = new Point();

    expect(bitmap.indexToPoint(2, point)).toBe(point);
    expect(point).toEqual(new Point(2, 0));
  });

  it('converts points and coordinate pairs to indexes', () => {
    const bitmap = new Bitmap(3, 2);

    expect(bitmap.pointToIndex(0, 0)).toBe(0);
    expect(bitmap.pointToIndex(2, 1)).toBe(5);
    expect(bitmap.pointToIndex(new Point(1, 1))).toBe(4);
  });

  it('returns -1 when converting negative coordinates to indexes', () => {
    const bitmap = new Bitmap(3, 2);

    expect(bitmap.pointToIndex(-1, 0)).toBe(-1);
    expect(bitmap.pointToIndex(3, 0)).toBe(3);
    expect(bitmap.pointToIndex(0, -1)).toBe(-1);
    expect(bitmap.pointToIndex(0, 2)).toBe(6);
  });

  it('copies bitmap data without sharing the underlying typed array', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 20, 30]);

    const copy = bitmap.copy();

    expect(copy).toBeInstanceOf(Bitmap);
    expect(copy.width).toBe(2);
    expect(copy.height).toBe(2);
    expect(Array.from(copy.data)).toEqual([0, 10, 20, 30]);
    expect(copy.data).not.toBe(bitmap.data);
  });

  it('copies bitmap data through a value transformer', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 20, 30]);

    const copy = bitmap.copy((value, index) => value + index);

    expect(Array.from(copy.data)).toEqual([0, 11, 22, 33]);
  });

  it('creates and caches a histogram', () => {
    const bitmap = new Bitmap(2, 2);
    bitmap.data.set([0, 10, 10, 255]);

    const histogram = bitmap.histogram();

    expect(histogram).toBeInstanceOf(Histogram);
    expect(histogram.data[0]).toBe(1);
    expect(histogram.data[10]).toBe(2);
    expect(histogram.data[255]).toBe(1);
    expect(bitmap.histogram()).toBe(histogram);
  });
});
