import {Point} from './point';

describe('Point', () => {
  it('defaults missing coordinates to zero', () => {
    expect(new Point()).toEqual({x: 0, y: 0});
    expect(new Point(5)).toEqual({x: 5, y: 0});
    expect(new Point(undefined, 7)).toEqual({x: 0, y: 7});
  });

  it('copies coordinates into a new point', () => {
    const point = new Point(2, 3);
    const copy = point.copy();

    expect(copy).toEqual(point);
    expect(copy).not.toBe(point);
  });
});
