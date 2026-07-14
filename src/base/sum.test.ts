import {Sum} from './sum';

describe('Sum', () => {
  it('stores all cumulative sum values passed to the constructor', () => {
    const sum = new Sum(1, 2, 3, 4, 5);

    expect(sum.x).toBe(1);
    expect(sum.y).toBe(2);
    expect(sum.xy).toBe(3);
    expect(sum.x2).toBe(4);
    expect(sum.y2).toBe(5);
  });
});
