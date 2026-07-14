/**
 * 3x3 matrix used for quadratic form calculations.
 */
export class Quad {
  data: number[];
  constructor() {
    this.data = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  /**
   * Returns the matrix value at the given coordinates.
   *
   * @param {number} x - Matrix row index.
   * @param {number} y - Matrix column index.
   * @returns {number} Matrix value.
   */
  at(x: number, y: number): number {
    return this.data[x * 3 + y];
  }
}
