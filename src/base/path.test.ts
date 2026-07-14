import {Curve} from './curve';
import {Path} from './path';

describe('Path', () => {
  it('initializes path metadata and containers', () => {
    const path = new Path();

    expect(path.area).toBe(0);
    expect(path.len).toBe(0);
    expect(path.curve).toBeInstanceOf(Curve);
    expect(path.curve.n).toBe(0);
    expect(path.pt).toEqual([]);
  });

  it('initializes bounds to sentinel values', () => {
    const path = new Path();

    expect(path.minX).toBe(100000);
    expect(path.minY).toBe(100000);
    expect(path.maxX).toBe(-1);
    expect(path.maxY).toBe(-1);
  });
});
