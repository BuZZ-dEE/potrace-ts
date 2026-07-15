import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {SvgPathSimplifier} from './svg-path-simplifier';

describe('SvgPathSimplifier', () => {
  it('simplifies collinear line points', (): void => {
    const result = SvgPathSimplifier.simplifyPath('M 0 0 L 10 0 L 20 0', {
      simplifyTolerance: 0.1,
    });

    assert.equal(result.originalPath, 'M 0 0 L 10 0 L 20 0');
    assert.equal(result.d, 'M 0 0 L 20 0');
    assert.equal(result.stats.pointsBefore, 3);
    assert.equal(result.stats.pointsAfter, 2);
    assert.equal(result.stats.reductionPercent, 33.3);
    assert.equal(result.stats.subPaths, 1);
  });

  it('preserves corners when simplifying relative closed paths', (): void => {
    const result = SvgPathSimplifier.simplifyPath('M 0 0 l 10 0 l 0 10 z', {
      simplifyTolerance: 0.1,
    });

    assert.equal(result.d, 'M 0 0 L 10 0 L 10 10 Z');
    assert.equal(result.stats.pointsBefore, 4);
    assert.equal(result.stats.pointsAfter, 3);
    assert.equal(result.stats.reductionPercent, 25);
    assert.equal(result.stats.subPaths, 1);
  });

  it('flattens cubic curves before simplifying', (): void => {
    const result = SvgPathSimplifier.simplifyPath('M 0 0 C 0 10 10 10 10 0', {
      flattenTolerance: 10,
      simplifyTolerance: 0.1,
    });

    assert.match(result.d, /^M 0 0 L /);
    assert.equal(result.stats.pointsBefore, 4);
    assert.ok(result.stats.pointsAfter >= 3);
    assert.equal(result.stats.subPaths, 1);
  });

  it('flattens quadratic curves before simplifying', (): void => {
    const result = SvgPathSimplifier.simplifyPath('M 0 0 Q 10 10 20 0', {
      flattenTolerance: 10,
      simplifyTolerance: 0.1,
    });

    assert.match(result.d, /^M 0 0 L /);
    assert.ok(result.stats.pointsBefore >= 3);
    assert.ok(result.stats.pointsAfter >= 3);
    assert.equal(result.stats.subPaths, 1);
  });

  it('returns empty output for empty path data', (): void => {
    const result = SvgPathSimplifier.simplifyPath('');

    assert.equal(result.d, '');
    assert.equal(result.stats.pointsBefore, 0);
    assert.equal(result.stats.pointsAfter, 0);
    assert.equal(result.stats.reductionPercent, 0);
    assert.equal(result.stats.subPaths, 0);
  });
});
