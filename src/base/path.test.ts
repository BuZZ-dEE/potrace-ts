import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Curve} from './curve';
import {Path} from './path';

describe('Path', () => {
  it('initializes path metadata and containers', () => {
    const path = new Path();

    assert.equal(path.area, 0);
    assert.equal(path.len, 0);
    assert.ok(path.curve instanceof Curve);
    assert.equal(path.curve.n, 0);
    assert.deepEqual(path.pt, []);
  });

  it('initializes bounds to sentinel values', () => {
    const path = new Path();

    assert.equal(path.minX, 100000);
    assert.equal(path.minY, 100000);
    assert.equal(path.maxX, -1);
    assert.equal(path.maxY, -1);
  });
});
