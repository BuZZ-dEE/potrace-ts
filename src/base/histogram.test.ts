import {Bitmap} from './bitmap';
import {Histogram} from './histogram';

describe('Histogram', () => {
  it('creates a correctly sized storage array for a pixel count', (): void => {
    expect(new Histogram(10).data).toBeInstanceOf(Uint8Array);
    expect(new Histogram(300).data).toBeInstanceOf(Uint16Array);
    expect(new Histogram(70000).data).toBeInstanceOf(Uint32Array);
  });

  it('collects luminance values from a bitmap', (): void => {
    const bitmap = new Bitmap(4, 1);
    bitmap.data.set([0, 10, 10, 255]);

    const histogram = new Histogram(bitmap);

    expect(histogram.pixels).toBe(4);
    expect(histogram.data[0]).toBe(1);
    expect(histogram.data[10]).toBe(2);
    expect(histogram.data[255]).toBe(1);
  });

  it('normalizes threshold ranges and rejects invalid ranges', (): void => {
    const histogram = new Histogram(4);

    expect(histogram.multilevelThresholding(0)).toEqual([]);
    expect(() => histogram.multilevelThresholding(1, 20, 10)).toThrow(
      'Invalid range "20...10"',
    );
  });

  it('computes automatic thresholds', (): void => {
    const bitmap = new Bitmap(6, 1);
    bitmap.data.set([0, 0, 0, 255, 255, 255]);

    const histogram = new Histogram(bitmap);

    expect(histogram.multilevelThresholding(1)).toEqual([1]);
    expect(histogram.autoThreshold()).toBe(1);
  });

  it('returns dominant colors within a range', (): void => {
    const bitmap = new Bitmap(5, 1);
    bitmap.data.set([10, 10, 20, 20, 20]);

    const histogram = new Histogram(bitmap);

    expect(histogram.getDominantColor(0, 30)).toBe(20);
    expect(histogram.getDominantColor(30, 40)).toBe(-1);
    expect(histogram.getDominantColor(10, 10)).toBe(10);
    expect(histogram.getDominantColor(11, 11)).toBe(-1);
  });

  it('computes and caches histogram stats', (): void => {
    const bitmap = new Bitmap(4, 1);
    bitmap.data.set([0, 10, 10, 20]);

    const histogram = new Histogram(bitmap);
    const stats = histogram.getStats(0, 20);

    expect(stats.pixels).toBe(4);
    expect(stats.levels.mean).toBe(10);
    expect(stats.levels.median).toBe(20);
    expect(stats.levels.unique).toBe(3);
    expect(stats.pixelsPerLevel.peak).toBe(2);
    expect(histogram.getStats(0, 20)).toBe(stats);
    expect(histogram.getStats(0, 20, true)).not.toBe(stats);
  });
});
