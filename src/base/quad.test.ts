import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Quad} from './quad';

describe('Quad', () => {
  it('initializes a 3x3 matrix with zeroes', () => {
    const quad = new Quad();

    assert.deepEqual(quad.data, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('returns values by matrix coordinate', () => {
    const quad = new Quad();
    quad.data = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    assert.equal(quad.at(0, 0), 1);
    assert.equal(quad.at(1, 2), 6);
    assert.equal(quad.at(2, 1), 8);
  });
});
