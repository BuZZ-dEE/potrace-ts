import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Curve} from './base/curve';
import {Point} from './base/point';
import {Quad} from './base/quad';
import * as utils from './utils';

describe('utils', () => {
  it('adds, replaces, and caches HTML attributes', () => {
    assert.equal(
      utils.setHtmlAttribute('<svg></svg>', 'width', '10'),
      '<svg width="10"></svg>',
    );
    assert.equal(
      utils.setHtmlAttribute('<svg width="10"></svg>', 'width', '20'),
      '<svg width="20"></svg>',
    );
    assert.equal(utils.getAttrRegexp('width'), utils.getAttrRegexp('width'));
    assert.equal(utils.setHtmlAttr, utils.setHtmlAttribute);
  });

  it('handles numeric helpers', () => {
    assert.equal(utils.fixed(1.25), '1.25');
    assert.equal(utils.mod(7, 5), 2);
    assert.equal(utils.mod(3, 5), 3);
    assert.equal(utils.mod(-1, 5), 4);
    assert.equal(utils.sign(3), 1);
    assert.equal(utils.sign(-3), -1);
    assert.equal(utils.sign(0), 0);
    assert.equal(utils.between(5, 1, 5), true);
    assert.equal(utils.between(6, 1, 5), false);
    assert.equal(utils.clamp(10, 0, 5), 5);
    assert.equal(utils.clamp(-1, 0, 5), 0);
    assert.equal(utils.isNumber(1), true);
    assert.equal(utils.isNumber('1'), false);
  });

  it('computes geometry helper values', () => {
    const p0 = new Point(0, 0);
    const p1 = new Point(3, 4);
    const p2 = new Point(5, 0);
    const p3 = new Point(5, 5);

    assert.equal(utils.xprod(new Point(2, 3), new Point(4, 5)), -2);
    assert.equal(utils.cyclic(2, 3, 5), true);
    assert.equal(utils.cyclic(5, 1, 2), true);
    assert.equal(utils.cyclic(2, 5, 4), false);
    assert.equal(utils.dpara(p0, p1, p2), -20);
    assert.equal(utils.cprod(p0, p1, p2, p3), 15);
    assert.equal(utils.iprod(p0, p1, p2), 15);
    assert.equal(utils.iprod1(p0, p1, p2, p3), 20);
    assert.equal(utils.ddist(p0, p1), 5);
    assert.deepEqual(
      utils.interval(0.25, p0, new Point(8, 4)),
      new Point(2, 1),
    );
    assert.deepEqual(utils.dorth_infty(p0, p1), new Point(-1, 1));
    assert.equal(utils.ddenom(p0, p1), 7);
  });

  it('evaluates quadratic forms and color luminance', () => {
    const quad = new Quad();
    quad.data = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    assert.equal(utils.quadform(quad, new Point(2, 3)), 156);
    assert.equal(utils.luminance(255, 255, 255), 255);
    assert.equal(utils.luminance(0, 0, 0), 0);
    assert.equal(utils.luminance(255, 0, 0), 54);
  });

  it('renders curve path instructions', () => {
    const curve = new Curve(2);
    curve.c = [
      new Point(1, 1),
      new Point(2, 2),
      new Point(3, 3),
      new Point(4, 4),
      new Point(5, 5),
      new Point(6, 6),
    ];
    curve.tag = ['CORNER', 'CURVE'];

    assert.equal(
      utils.renderCurve(curve, {x: 2, y: 3}, {x: 1, y: -1}),
      'M 13 17 L 5 5 7 8 C 9 11, 11 14, 13 17',
    );
  });

  it('evaluates Bezier curves and tangents', () => {
    const p0 = new Point(0, 0);
    const p1 = new Point(0, 3);
    const p2 = new Point(3, 2);
    const p3 = new Point(3, 0);

    assert.deepEqual(utils.bezier(0, p0, p1, p2, p3), p0);
    assert.deepEqual(utils.bezier(1, p0, p1, p2, p3), p3);
    assert.deepEqual(utils.bezier(0.5, p0, p1, p2, p3), new Point(1.5, 1.875));
    assert.ok(
      utils.tangent(p0, p1, p2, p3, new Point(0, 0), new Point(1, 0)) >= 0,
    );
    assert.equal(
      utils.tangent(p0, p0, p0, p0, new Point(0, 0), new Point(1, 0)),
      -1,
    );
  });
});
