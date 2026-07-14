import {Curve} from './curve';

describe('Curve', () => {
  it('initializes arrays from the segment count', () => {
    const curve = new Curve(3);

    expect(curve.n).toBe(3);
    expect(curve.tag).toHaveLength(3);
    expect(curve.c).toHaveLength(9);
    expect(curve.alphaCurve).toBe(0);
    expect(curve.vertex).toHaveLength(3);
    expect(curve.alpha).toHaveLength(3);
    expect(curve.alpha0).toHaveLength(3);
    expect(curve.beta).toHaveLength(3);
  });
});
