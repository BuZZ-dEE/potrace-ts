import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Point} from './point';

describe('Point', () => {
  it('defaults missing coordinates to zero', () => {
    assert.deepEqual(new Point(), new Point(0, 0));
    assert.deepEqual(new Point(5), new Point(5, 0));
    assert.deepEqual(new Point(undefined, 7), new Point(0, 7));
  });

  it('copies coordinates into a new point', () => {
    const point = new Point(2, 3);
    const copy = point.copy();

    assert.deepEqual(copy, point);
    assert.notEqual(copy, point);
  });
});
