import {Quad} from './quad';

describe('Quad', () => {
  it('initializes a 3x3 matrix with zeroes', () => {
    const quad = new Quad();

    expect(quad.data).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('returns values by matrix coordinate', () => {
    const quad = new Quad();
    quad.data = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    expect(quad.at(0, 0)).toBe(1);
    expect(quad.at(1, 2)).toBe(6);
    expect(quad.at(2, 1)).toBe(8);
  });
});
