/**
 * Cumulative sums used while fitting polygons to paths.
 *
 * @param {number} x - Sum of x coordinates.
 * @param {number} y - Sum of y coordinates.
 * @param {number} xy - Sum of x*y products.
 * @param {number} x2 - Sum of squared x coordinates.
 * @param {number} y2 - Sum of squared y coordinates.
 */
export class Sum {
    x: number;
    y: number;
    xy: number;
    x2: number;
    y2: number;
    constructor(x: number, y: number, xy: number, x2: number, y2: number) {
        this.x = x;
        this.y = y;
        this.xy = xy;
        this.x2 = x2;
        this.y2 = y2;
    }
}
