# @buzz-dee/potrace-ts

A TypeScript implementation of Potrace for converting bitmap image data to scalable vector graphics (SVG).

[![CI](https://github.com/BuZZ-dEE/potrace-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/BuZZ-dEE/potrace-ts/actions/workflows/ci.yml)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/BuZZ-dEE/potrace-ts)
[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/%40buzz-dee%2Fpotrace-ts)](https://libraries.io/npm/%40buzz-dee%2Fpotrace-ts)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)
[![npm bundle size](https://img.shields.io/bundlephobia/min/%40buzz-dee%2Fpotrace-ts)](https://bundlephobia.com/package/%40buzz-dee%2Fpotrace-ts)
[![npm](https://img.shields.io/npm/v/%40buzz-dee%2Fpotrace-ts)](https://www.npmjs.com/package/%40buzz-dee%2Fpotrace-ts)
[![NPM](https://img.shields.io/npm/l/%40buzz-dee%2Fpotrace-ts)](https://github.com/BuZZ-dEE/potrace-ts/blob/main/LICENSE.txt)

> Forked from [potrace-ts](https://github.com/minkicc/potrace-ts), which is forked from [node-potrace](https://github.com/iwsfg/node-potrace).

## Introduction

Potrace traces bitmap images and converts them into vector paths. This package works with `ImageData`, making it suitable for browser canvas workflows and other environments that can provide compatible RGBA pixel data.

## Installation

```bash
npm install @buzz-dee/potrace-ts
```

```bash
pnpm add @buzz-dee/potrace-ts
```

## Usage

```typescript
import {
  Potrace,
  SvgPathSimplifier,
  type PotraceOptions,
} from '@buzz-dee/potrace-ts';

const imageData = canvas.getContext('2d')!.getImageData(0, 0, width, height);

const options: PotraceOptions = {
  threshold: Potrace.THRESHOLD_AUTO,
  turdSize: 2,
  optCurve: true,
};

const potrace = new Potrace(imageData, options);

const svg = potrace.getSVG();
const pathData = potrace.getSVGPath({x: 1, y: 1}, {x: 0, y: 0});
const defaultPathData = potrace.getSVGPath();
const simplified = potrace.getSimplifiedSVGPath(undefined, undefined, {
  flattenTolerance: 0.5,
  simplifyTolerance: 0.1,
});
const simplifiedPath = SvgPathSimplifier.simplifyPath('M 0 0 L 10 0 L 20 0');
```

## API

### `new Potrace(imageData, options?)`

Creates a Potrace instance from `ImageData`.

- `imageData`: RGBA image data to trace.
- `options`: optional tracing and output settings.

### Methods

- `getSVG(scale?)`: returns a complete SVG document string. If `scale` is omitted, it uses configured `width` and `height` scaling, or `{ x: 1, y: 1 }`.
- `getSVGPath(scale?, trans?)`: returns SVG path data only. If `scale` is omitted, it uses configured `width` and `height` scaling, or `{ x: 1, y: 1 }`. If `trans` is omitted, it defaults to `{ x: 0, y: 0 }`.
- `getSimplifiedSVGPath(scale?, trans?, options?)`: returns simplified SVG path data and simplification statistics. `scale` and `trans` use the same defaults as `getSVGPath`.
- `getPathTag(fillColor?, scale?, trans?)`: returns a `<path>` tag.
- `getSymbol(id)`: returns an SVG `<symbol>` tag.
- `setParameters(options)`: updates tracing/output parameters.

`SvgPathSimplifier.simplifyPath(d, options?)` can also simplify arbitrary SVG path data directly.

Scale and translation values use this shape:

```typescript
type TransformPoint = {x: number; y: number};
```

Examples:

```typescript
const path = potrace.getSVGPath();
const scaledPath = potrace.getSVGPath({x: 2, y: 2});
const movedPath = potrace.getSVGPath(undefined, {x: 10, y: 20});
const scaledAndMovedPath = potrace.getSVGPath({x: 2, y: 2}, {x: 10, y: 20});
```

Simplification options use this shape:

```typescript
interface SimplifyOptions {
  /** Resolution used while flattening curves. */
  flattenTolerance?: number;
  /** Ramer-Douglas-Peucker epsilon used to simplify flattened points. */
  simplifyTolerance?: number;
}
```

The simplified path result contains the path data and statistics:

```typescript
interface SimplifyResult {
  originalPath: string;
  d: string;
  stats: {
    pointsBefore: number;
    pointsAfter: number;
    reductionPercent: number;
    subPaths: number;
  };
}
```

### Options

```typescript
interface PotraceOptions {
  /** How to resolve ambiguities in path decomposition. Defaults to `Potrace.TURNPOLICY_MINORITY`. */
  turnPolicy?: string;
  /** Suppress speckles up to this size. Defaults to `2`. */
  turdSize?: number;
  /** Corner threshold parameter. Defaults to `1`. */
  alphaMax?: number;
  /** Whether curve optimization is enabled. Defaults to `true`. */
  optCurve?: boolean;
  /** Curve optimization tolerance. Defaults to `0.2`. */
  optTolerance?: number;
  /** Threshold below which luminance is considered black, from `0` to `255`, or `Potrace.THRESHOLD_AUTO`. */
  threshold?: number;
  /** Whether darker pixels are traced as foreground. Defaults to `true`. */
  blackOnWhite?: boolean;
  /** Foreground color. Defaults to `Potrace.COLOR_AUTO`; ignored when exporting as `<symbol>`. */
  color?: string;
  /** Background color. Defaults to `Potrace.COLOR_TRANSPARENT`; ignored when exporting as `<symbol>`. */
  background?: string;
  /** Output SVG width. Defaults to the source image width. */
  width?: number;
  /** Output SVG height. Defaults to the source image height. */
  height?: number;
}
```

Defaults:

- `turnPolicy`: `Potrace.TURNPOLICY_MINORITY`
- `turdSize`: `2`
- `alphaMax`: `1`
- `optCurve`: `true`
- `optTolerance`: `0.2`
- `threshold`: `Potrace.THRESHOLD_AUTO`
- `blackOnWhite`: `true`
- `color`: `Potrace.COLOR_AUTO`
- `background`: `Potrace.COLOR_TRANSPARENT`
- `width`: source image width
- `height`: source image height

## Development

This project uses pnpm.

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
```

Available scripts:

- `pnpm build`: builds the package with Rolldown.
- `pnpm lint`: lints source files.
- `pnpm test`: runs the Jest test suite.
- `pnpm dev`: runs TypeScript in watch mode.

## CI and Publishing

GitHub Actions runs build, lint, and test checks on pushes and pull requests targeting `main`.

Publishing is handled by the `Publish` workflow and runs only for version tags such as `v1.2.3` or `v1.2.3-beta.1`.

## License

This project is licensed under GPLv2, inherited from [node-potrace](https://github.com/iwsfg/node-potrace.git). For more details, please check the [LICENSE.txt](./LICENSE.txt) file.
