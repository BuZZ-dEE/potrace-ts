/**
 * Two-dimensional point.
 *
 * @param {number} [x=0] - X coordinate.
 * @param {number} [y=0] - Y coordinate.
 */
export class Point {
    x: number;
    y: number;
    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
    /**
     * Creates a copy of this point.
     *
     * @returns {Point} Copied point.
     */
    copy(): Point {
        return new Point(this.x, this.y);
    }
}
