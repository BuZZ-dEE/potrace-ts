import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Potrace} from './potrace';

function createImageData(
  width: number,
  height: number,
  rgba: [number, number, number, number],
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    data.set(rgba, i * 4);
  }

  return {width, height, data} as ImageData;
}

describe('Potrace', () => {
  it('generates an SVG with configured dimensions and background', () => {
    const potrace = new Potrace(createImageData(2, 3, [255, 255, 255, 255]), {
      background: 'white',
      color: 'black',
      width: 20,
      height: 30,
    });

    assert.equal(
      potrace.getSVG(),
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 20 30" version="1.1">\n' +
        '\t<rect x="0" y="0" width="100%" height="100%" fill="white" />\n' +
        '\t<path d="" stroke="none" fill="black" fill-rule="evenodd"/>\n' +
        '</svg>',
    );
  });

  it('traces opaque black pixels into a non-empty path', () => {
    const potrace = new Potrace(createImageData(2, 2, [0, 0, 0, 255]), {
      threshold: 128,
    });

    assert.match(
      potrace.getPathTag(),
      /^<path d=".+" stroke="none" fill="black" fill-rule="evenodd"\/>$/,
    );
  });

  it('generates SVG path data directly', () => {
    const potrace = new Potrace(createImageData(2, 2, [0, 0, 0, 255]), {
      threshold: 128,
    });

    const path = potrace.getSVGPath();

    assert.match(path, /^M /);
    assert.equal(path.includes('<path'), false);
  });

  it('applies explicit and configured scaling and translation to SVG path data', () => {
    const image = createImageData(2, 3, [0, 0, 0, 255]);
    const explicit = new Potrace(image, {threshold: 128}).getSVGPath(
      {x: 2, y: 3},
      {x: 5, y: 7},
    );
    const configured = new Potrace(image, {
      threshold: 128,
      width: 4,
      height: 9,
    }).getSVGPath(undefined, {x: 5, y: 7});

    assert.equal(configured, explicit);
  });

  it('generates simplified SVG path data with statistics', () => {
    const potrace = new Potrace(createImageData(2, 2, [0, 0, 0, 255]), {
      threshold: 128,
    });

    const simplified = potrace.getSimplifiedSVGPath(undefined, undefined, {
      flattenTolerance: 0.5,
      simplifyTolerance: 0.1,
    });

    assert.equal(simplified.originalPath, potrace.getSVGPath());
    assert.equal(typeof simplified.d, 'string');
    assert.ok(simplified.stats.pointsBefore >= simplified.stats.pointsAfter);
    assert.ok(simplified.stats.subPaths >= 0);
  });

  it('validates supported option values', () => {
    const image = createImageData(1, 1, [255, 255, 255, 255]);

    assert.throws(
      () => new Potrace(image, {turnPolicy: 'diagonal'}),
      /Bad turnPolicy value/,
    );
    assert.throws(
      () => new Potrace(image, {threshold: 256}),
      /Bad threshold value/,
    );
    assert.throws(
      () => new Potrace(image, {optCurve: 'yes' as unknown as boolean}),
      /'optCurve' must be Boolean/,
    );
  });
});
