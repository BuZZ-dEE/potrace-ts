import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Sum} from './sum';

describe('Sum', () => {
  it('stores all cumulative sum values passed to the constructor', () => {
    const sum = new Sum(1, 2, 3, 4, 5);

    assert.equal(sum.x, 1);
    assert.equal(sum.y, 2);
    assert.equal(sum.xy, 3);
    assert.equal(sum.x2, 4);
    assert.equal(sum.y2, 5);
  });
});
