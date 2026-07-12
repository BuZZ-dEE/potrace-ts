import { Point } from "./point";
import * as utils from "../utils"

// var Histogram;
import { Histogram } from "./histogram";
/**
 * Represents a bitmap where each pixel is a value from `0` to `255`.
 *
 * Used internally to store luminance data.
 *
 * @param {number} w - Bitmap width in pixels.
 * @param {number} h - Bitmap height in pixels.
 */
export class Bitmap {
    private _histogram?: Histogram;

    width: number;
    height: number;
    size: number;
    arrayBuffer: ArrayBuffer;
    data: Uint8Array;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.size = w * h;
        this.arrayBuffer = new ArrayBuffer(this.size);
        this.data = new Uint8Array(this.arrayBuffer);
    }

    /**
     * Returns the pixel value at the given coordinates.
     *
     * @param {number} x - Pixel x coordinate.
     * @param {number} y - Pixel y coordinate.
     * @returns {number} Pixel value.
     */
    getValueAt(x: number, y: number): number {
        const index = this.pointToIndex(x, y);
        return this.data[index];
    }

    /**
     * Converts a flat pixel index to a {@link Point}.
     *
     * @param {number} index - Flat pixel index.
     * @param {Point} [point] - Optional point instance to reuse for the result.
     * @returns {Point} Converted point.
     */
    indexToPoint(index: number, point?: Point): Point {
        point = point ?? new Point();

        if (utils.between(index, 0, this.size)) {
            point.y = Math.floor(index / this.width);
            point.x = index - point.y * this.width;
        } else {
            point.x = -1;
            point.y = -1;
        }

        return point;
    }

    /**
     * Calculates a flat pixel index for a point or coordinate pair.
     *
     * @param {Point|number} pointOrX - Point instance or x coordinate.
     * @param {number} [y] - Pixel y coordinate when the first argument is an x coordinate.
     * @returns {number} Flat pixel index, or `-1` for coordinates outside the accepted range.
     */
    pointToIndex(point: Point): number;
    pointToIndex(x: number, y: number): number;
    pointToIndex(pointOrX: Point | number, y?: number): number {
        let _x = pointOrX,
            _y = y || 0;

        if (pointOrX instanceof Point) {
            _x = pointOrX.x;
            _y = pointOrX.y;
        }

        if (!utils.between(_x as number, 0, this.width) || !utils.between(_y!, 0, this.height)) {
            return -1;
        }

        return this.width * _y + (_x as number);
    }

    /**
     * Makes a copy of the current bitmap.
     *
     * @param {(value: number, index: number) => number} [iterator] - Optional callback used to transform each pixel value.
     * @returns {Bitmap} Copied bitmap.
     */
    copy(iterator?: (value: number, index: number) => number): Bitmap {
        const bm = new Bitmap(this.width, this.height),
            iteratorPresent = typeof iterator === 'function';
            // i;

        if (iteratorPresent) {
            bm.data = this.data.map(iterator!);
        }
        else {
            bm.data = this.data.slice(0);
        }

        return bm;
    }

    /**
     * Creates and caches a histogram for the bitmap values.
     *
     * @returns {Histogram} Histogram for this bitmap.
     */
    histogram(): Histogram {
        if (this._histogram) {
            return this._histogram;
        }

        this._histogram = new Histogram(this);
        return this._histogram;
    }
}
