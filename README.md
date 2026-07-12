# @buzz-dee/potrace-ts

A TypeScript implementation of Potrace for converting bitmap image data to scalable vector graphics (SVG).

> Forked from [node-potrace](https://github.com/iwsfg/node-potrace.git)

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
import { Potrace } from "@buzz-dee/potrace-ts";

const imageData = canvas.getContext("2d")!.getImageData(0, 0, width, height);

const potrace = new Potrace(imageData, () => {}, {
  threshold: Potrace.THRESHOLD_AUTO,
  turdSize: 2,
  optCurve: true,
});

const svg = potrace.getSVG();
const pathData = potrace.getSVGPath({ x: 1, y: 1 }, { x: 0, y: 0 });
```

## API

### `new Potrace(imageData, callback, options?)`

Creates a Potrace instance from `ImageData`.

- `imageData`: RGBA image data to trace.
- `callback`: called after image data has been processed.
- `options`: optional tracing and output settings.

### Methods

- `getSVG(scale?)`: returns a complete SVG document string.
- `getSVGPath(scale, trans)`: returns SVG path data only.
- `getPathTag(fillColor?, scale?, trans?)`: returns a `<path>` tag.
- `getSymbol(id)`: returns an SVG `<symbol>` tag.
- `setParameters(options)`: updates tracing/output parameters.

### Options

```typescript
interface PotraceOptions {
  turnPolicy?: string;
  turdSize?: number;
  alphaMax?: number;
  optCurve?: boolean;
  optTolerance?: number;
  threshold?: number;
  blackOnWhite?: boolean;
  color?: string;
  background?: string;
  width?: number;
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
pnpm eslint
pnpm test
```

Available scripts:

- `pnpm build`: builds the package with Rollup.
- `pnpm eslint`: lints source files.
- `pnpm test`: runs the Jest test suite.
- `pnpm dev`: runs TypeScript in watch mode.

## CI and Publishing

GitHub Actions runs build, lint, and test checks on pushes and pull requests targeting `main`.

Publishing is handled by the `Publish` workflow and runs only for version tags such as `v1.2.3` or `v1.2.3-beta.1`.

## License

This project is licensed under GPLv2, inherited from [node-potrace](https://github.com/iwsfg/node-potrace.git). For more details, please check the [LICENSE.txt](./LICENSE.txt) file.
