import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Bitmap} from './bitmap';
import {Histogram} from './histogram';

describe('Histogram', () => {
  it('creates a correctly sized storage array for a pixel count', (): void => {
    assert.ok(new Histogram(10).data instanceof Uint8Array);
    assert.ok(new Histogram(300).data instanceof Uint16Array);
    assert.ok(new Histogram(70000).data instanceof Uint32Array);
  });

  it('collects luminance values from a bitmap', (): void => {
    const bitmap = new Bitmap(4, 1);
    bitmap.data.set([0, 10, 10, 255]);

    const histogram = new Histogram(bitmap);

    assert.equal(histogram.pixels, 4);
    assert.equal(histogram.data[0], 1);
    assert.equal(histogram.data[10], 2);
    assert.equal(histogram.data[255], 1);
  });

  it('normalizes threshold ranges and rejects invalid ranges', (): void => {
    const histogram = new Histogram(4);

    assert.deepEqual(histogram.multilevelThresholding(0), []);
    assert.throws(
      () => histogram.multilevelThresholding(1, 20, 10),
      /Invalid range "20\.\.\.10"/,
    );
  });

  it('computes automatic thresholds', (): void => {
    const bitmap = new Bitmap(6, 1);
    bitmap.data.set([0, 0, 0, 255, 255, 255]);

    const histogram = new Histogram(bitmap);

    assert.deepEqual(histogram.multilevelThresholding(1), [1]);
    assert.equal(histogram.autoThreshold(), 1);
  });

  it('returns dominant colors within a range', (): void => {
    const bitmap = new Bitmap(5, 1);
    bitmap.data.set([10, 10, 20, 20, 20]);

    const histogram = new Histogram(bitmap);

    assert.equal(histogram.getDominantColor(0, 30), 20);
    assert.equal(histogram.getDominantColor(30, 40), -1);
    assert.equal(histogram.getDominantColor(10, 10), 10);
    assert.equal(histogram.getDominantColor(11, 11), -1);
  });

  it('computes and caches histogram stats', (): void => {
    const bitmap = new Bitmap(4, 1);
    bitmap.data.set([0, 10, 10, 20]);

    const histogram = new Histogram(bitmap);
    const stats = histogram.getStats(0, 20);

    assert.equal(stats.pixels, 4);
    assert.equal(stats.levels.mean, 10);
    assert.equal(stats.levels.median, 20);
    assert.equal(stats.levels.unique, 3);
    assert.equal(stats.pixelsPerLevel.peak, 2);
    assert.equal(histogram.getStats(0, 20), stats);
    assert.notEqual(histogram.getStats(0, 20, true), stats);
  });
});
