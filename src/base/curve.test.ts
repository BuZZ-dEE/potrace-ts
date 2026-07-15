import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Curve} from './curve';

describe('Curve', () => {
  it('initializes arrays from the segment count', () => {
    const curve = new Curve(3);

    assert.equal(curve.n, 3);
    assert.equal(curve.tag.length, 3);
    assert.equal(curve.c.length, 9);
    assert.equal(curve.alphaCurve, 0);
    assert.equal(curve.vertex.length, 3);
    assert.equal(curve.alpha.length, 3);
    assert.equal(curve.alpha0.length, 3);
    assert.equal(curve.beta.length, 3);
  });
});
