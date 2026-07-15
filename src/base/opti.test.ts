import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Opti} from './opti';
import {Point} from './point';

describe('Opti', () => {
  it('initializes optimization defaults', () => {
    const opti = new Opti();

    assert.equal(opti.pen, 0);
    assert.equal(opti.c.length, 2);
    assert.deepEqual(opti.c[0], new Point());
    assert.deepEqual(opti.c[1], new Point());
    assert.notEqual(opti.c[0], opti.c[1]);
    assert.equal(opti.t, 0);
    assert.equal(opti.s, 0);
    assert.equal(opti.alpha, 0);
  });
});
