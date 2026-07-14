import {Curve} from './base/curve';
import {Point} from './base/point';
import {Quad} from './base/quad';
import * as utils from './utils';

describe('utils', () => {
  it('adds, replaces, and caches HTML attributes', () => {
    expect(utils.setHtmlAttribute('<svg></svg>', 'width', '10')).toBe(
      '<svg width="10"></svg>',
    );
    expect(
      utils.setHtmlAttribute('<svg width="10"></svg>', 'width', '20'),
    ).toBe('<svg width="20"></svg>');
    expect(utils.getAttrRegexp('width')).toBe(utils.getAttrRegexp('width'));
    expect(utils.setHtmlAttr).toBe(utils.setHtmlAttribute);
  });

  it('handles numeric helpers', () => {
    expect(utils.fixed(1.25)).toBe('1.25');
    expect(utils.mod(7, 5)).toBe(2);
    expect(utils.mod(3, 5)).toBe(3);
    expect(utils.mod(-1, 5)).toBe(4);
    expect(utils.sign(3)).toBe(1);
    expect(utils.sign(-3)).toBe(-1);
    expect(utils.sign(0)).toBe(0);
    expect(utils.between(5, 1, 5)).toBe(true);
    expect(utils.between(6, 1, 5)).toBe(false);
    expect(utils.clamp(10, 0, 5)).toBe(5);
    expect(utils.clamp(-1, 0, 5)).toBe(0);
    expect(utils.isNumber(1)).toBe(true);
    expect(utils.isNumber('1')).toBe(false);
  });

  it('computes geometry helper values', () => {
    const p0 = new Point(0, 0);
    const p1 = new Point(3, 4);
    const p2 = new Point(5, 0);
    const p3 = new Point(5, 5);

    expect(utils.xprod(new Point(2, 3), new Point(4, 5))).toBe(-2);
    expect(utils.cyclic(2, 3, 5)).toBe(true);
    expect(utils.cyclic(5, 1, 2)).toBe(true);
    expect(utils.cyclic(2, 5, 4)).toBe(false);
    expect(utils.dpara(p0, p1, p2)).toBe(-20);
    expect(utils.cprod(p0, p1, p2, p3)).toBe(15);
    expect(utils.iprod(p0, p1, p2)).toBe(15);
    expect(utils.iprod1(p0, p1, p2, p3)).toBe(20);
    expect(utils.ddist(p0, p1)).toBe(5);
    expect(utils.interval(0.25, p0, new Point(8, 4))).toEqual(new Point(2, 1));
    expect(utils.dorth_infty(p0, p1)).toEqual(new Point(-1, 1));
    expect(utils.ddenom(p0, p1)).toBe(7);
  });

  it('evaluates quadratic forms and color luminance', () => {
    const quad = new Quad();
    quad.data = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    expect(utils.quadform(quad, new Point(2, 3))).toBe(156);
    expect(utils.luminance(255, 255, 255)).toBe(255);
    expect(utils.luminance(0, 0, 0)).toBe(0);
    expect(utils.luminance(255, 0, 0)).toBe(54);
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

    expect(utils.renderCurve(curve, {x: 2, y: 3}, {x: 1, y: -1})).toBe(
      'M 13 17 L 5 5 7 8 C 9 11, 11 14, 13 17',
    );
  });

  it('evaluates Bezier curves and tangents', () => {
    const p0 = new Point(0, 0);
    const p1 = new Point(0, 3);
    const p2 = new Point(3, 2);
    const p3 = new Point(3, 0);

    expect(utils.bezier(0, p0, p1, p2, p3)).toEqual(p0);
    expect(utils.bezier(1, p0, p1, p2, p3)).toEqual(p3);
    expect(utils.bezier(0.5, p0, p1, p2, p3)).toEqual(new Point(1.5, 1.875));
    expect(
      utils.tangent(p0, p1, p2, p3, new Point(0, 0), new Point(1, 0)),
    ).toBeGreaterThanOrEqual(0);
    expect(
      utils.tangent(p0, p0, p0, p0, new Point(0, 0), new Point(1, 0)),
    ).toBe(-1);
  });
});
