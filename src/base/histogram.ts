
// Histogram
import * as utils from "../utils"
import { Bitmap } from "./bitmap";

const COLOR_DEPTH = 256;
const COLOR_RANGE_END = COLOR_DEPTH - 1;

/**
 * Calculates the lookup-table index for a pair of color levels.
 *
 * The column is multiplied by 256 and the row is added, so `(index(i, j) + 1) === index(i, j + 1)`.
 *
 * Note: this is different from how indexes are calculated in {@link Bitmap}.
 *
 * @param {number} x - Column color level.
 * @param {number} y - Row color level.
 * @returns {number} Flat lookup-table index.
 * @private
 */
function index(x: number, y: number): number {
    return COLOR_DEPTH * x + y;
}

function normalizeMinMax(levelMin?: number, levelMax?: number): Array<number> {
    /**
     * Shared parameter normalization for methods 'multilevelThresholding', 'autoThreshold', 'getDominantColor' and 'getStats'
     *
     * @param {number} [levelMin] - Minimum color level.
     * @param {number} [levelMax] - Maximum color level.
     * @returns {number[]} Normalized `[levelMin, levelMax]` range.
     * @private
     */
    levelMin = typeof levelMin === 'number' ? utils.clamp(Math.round(levelMin), 0, COLOR_RANGE_END) : 0;
    levelMax = typeof levelMax === 'number' ? utils.clamp(Math.round(levelMax), 0, COLOR_RANGE_END) : COLOR_RANGE_END;

    if (levelMin > levelMax) {
        throw new Error('Invalid range "' + levelMin + '...' + levelMax + '"');
    }

    return [levelMin, levelMax];
}

export enum HistogramMode {
    MODE_LUMINANCE = 'luminance',
    MODE_R = 'r',
    MODE_G = 'g',
    MODE_B = 'b'
}

type HistogramArray = Uint8Array | Uint16Array | Uint32Array;

interface HistogramStats {
    levels: {
        mean: number;
        median: number | null;
        stdDev: number;
        unique: number;
    };
    pixelsPerLevel: {
        mean: number;
        median: number;
        peak: number;
    };
    pixels: number;
}

/**
 * One-dimensional histogram of 8-bit color or luminance values.
 *
 * @param {number|Bitmap|ImageData} imageSource - Pixel count for an empty histogram, a {@link Bitmap}, or RGBA {@link ImageData} to collect values from.
 * @param {HistogramMode} [mode=HistogramMode.MODE_LUMINANCE] - Channel to collect from `ImageData`. `Bitmap` values are already treated as luminance values.
 * @protected
 */
export class Histogram {
    data: HistogramArray;
    pixels: number;
    _sortedIndexes?: Array<number>;
    _cachedStats: { [key: string]: HistogramStats } = {};
    _lookupTableH?: Float64Array;

    constructor(imageSource: number | Bitmap | ImageData, mode: HistogramMode = HistogramMode.MODE_LUMINANCE) {

        this.pixels = 0;

        if (typeof imageSource === 'number') {
            this.data = this._createArray(imageSource);
        } else if (imageSource instanceof Bitmap) {
            this.data = this._collectValuesBitmap(imageSource);
        } else if (imageSource instanceof ImageData) {
            this.data = this._collectValuesJimp(imageSource, mode);
        } else {
            throw new Error('Unsupported image source');
        }
    }

    static MODE_LUMINANCE = HistogramMode.MODE_LUMINANCE;
    static MODE_R = HistogramMode.MODE_R;
    static MODE_G = HistogramMode.MODE_G;
    static MODE_B = HistogramMode.MODE_B;

    /**
     * Initializes a histogram data array for an image of the given pixel size.
     *
     * @param {number} imageSize - Number of source pixels.
     * @returns {HistogramArray} Histogram storage array.
     * @private
     */
    _createArray(imageSize: number): HistogramArray {
        const  ArrayType = imageSize <= Math.pow(2, 8) ? Uint8Array
            : imageSize <= Math.pow(2, 16) ? Uint16Array : Uint32Array;

        this.pixels = imageSize;

        return new ArrayType(COLOR_DEPTH);
    }

    /**
     * Aggregates channel data from RGBA {@link ImageData}.
     *
     * @param {ImageData} source - Source image data.
     * @param {HistogramMode} mode - Channel to aggregate.
     * @returns {HistogramArray} Histogram storage array.
     * @private
     */
    _collectValuesJimp(source: ImageData, mode: HistogramMode): HistogramArray {
        const  pixelData = source.data;
        const  data = this._createArray(source.width * source.height);

        const w = source.width;
        const h = source.height;
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const idx = (y * w + x) * 4; // rgba
                const  val = mode === Histogram.MODE_R ? pixelData[idx]
                    : mode === Histogram.MODE_G ? pixelData[idx + 1]
                        : mode === Histogram.MODE_B ? pixelData[idx + 2]
                            : utils.luminance(pixelData[idx], pixelData[idx + 1], pixelData[idx + 2]);

                data[val]++;
            }
        }
        return data;
    }

    /**
     * Aggregates luminance values from a {@link Bitmap} instance.
     *
     * @param {Bitmap} source - Source bitmap.
     * @returns {HistogramArray} Histogram storage array.
     * @private
     */
    _collectValuesBitmap(source: Bitmap): HistogramArray {
        const  data = this._createArray(source.size);
        const  len = source.data.length;
        let  color;

        for (let  i = 0; i < len; i++) {
            color = source.data[i];
            data[color]++
        }
        return data;
    }

    /**
     * Returns color levels sorted by their occurrence count in ascending order.
     *
     * @param {boolean} [refresh] - Rebuild the sorted index cache when true.
     * @returns {number[]} Sorted color levels.
     * @private
     */
    _getSortedIndexes(refresh?: boolean): Array<number> {
        if (!refresh && this._sortedIndexes) {
            return this._sortedIndexes;
        }

        const  data = this.data;
        const  indexes = new Array(COLOR_DEPTH);
        let  i = 0;

        for (i; i < COLOR_DEPTH; i++) {
            indexes[i] = i;
        }

        indexes.sort(function (a, b): number {
            return data[a] > data[b] ? 1 : data[a] < data[b] ? -1 : 0;
        });

        this._sortedIndexes = indexes;
        return indexes;
    }

    /**
     * Builds lookup table H from lookup tables P and S.
     *
     * See {@link http://www.iis.sinica.edu.tw/page/jise/2001/200109_01.pdf|this paper} for more details.
     *
     * @returns {Float64Array} Lookup table H.
     * @private
     */
    _thresholdingBuildLookupTable(): Float64Array {
        const  P = new Float64Array(COLOR_DEPTH * COLOR_DEPTH);
        const  S = new Float64Array(COLOR_DEPTH * COLOR_DEPTH);
        const  H = new Float64Array(COLOR_DEPTH * COLOR_DEPTH);
        const  pixelsTotal = this.pixels;
        let  i, j, idx, tmp;

        // diagonal
        for (i = 1; i < COLOR_DEPTH; ++i) {
            idx = index(i, i);
            tmp = this.data[i] / pixelsTotal;

            P[idx] = tmp;
            S[idx] = i * tmp;
        }

        // calculate first row (row 0 is all zero)
        for (i = 1; i < COLOR_DEPTH - 1; ++i) {
            tmp = this.data[i + 1] / pixelsTotal;
            idx = index(1, i);

            P[idx + 1] = P[idx] + tmp;
            S[idx + 1] = S[idx] + (i + 1) * tmp;
        }

        // using row 1 to calculate others
        for (i = 2; i < COLOR_DEPTH; i++) {
            for (j = i + 1; j < COLOR_DEPTH; j++) {
                P[index(i, j)] = P[index(1, j)] - P[index(1, i - 1)];
                S[index(i, j)] = S[index(1, j)] - S[index(1, i - 1)];
            }
        }

        // now calculate H[i][j]
        for (i = 1; i < COLOR_DEPTH; ++i) {
            for (j = i + 1; j < COLOR_DEPTH; j++) {
                idx = index(i, j);
                H[idx] = P[idx] !== 0 ? S[idx] * S[idx] / P[idx] : 0;
            }
        }

        return this._lookupTableH = H;
    }

    /**
     * Implements the algorithm for multilevel thresholding.
     *
     * Receives the desired number of color stops and returns an array of thresholds. The search can be limited to a range.
     *
     * @param {number} amount - How many thresholds should be calculated.
     * @param {number} [levelMin=0] - Histogram segment start.
     * @param {number} [levelMax=255] - Histogram segment end.
     * @returns {number[]} Calculated threshold levels.
     */
    multilevelThresholding(amount: number, levelMin?: number, levelMax?: number): Array<number> {
        const normalizedLevelMin = normalizeMinMax(levelMin, levelMax);
        levelMax = normalizedLevelMin[1];
        levelMin = normalizedLevelMin[0];
        amount = Math.min(levelMax - levelMin - 2, ~~amount);

        if (amount < 1) {
            return [];
        }

        if (!this._lookupTableH) {
            this._thresholdingBuildLookupTable();
        }

        const  H = this._lookupTableH!;

        let  colorStops: Array<number> | null = null;
        let  maxSig = 0;

        if (amount > 4) {
            console.log('[Warning]: Threshold computation for more than 5 levels may take a long time');
        }

        const iterateRecursive = function (startingPoint: number, prevVariance?: number, indexes?: Array<number>, previousDepth?: number): void {
            startingPoint = (startingPoint || 0) + 1;
            prevVariance = prevVariance || 0;
            indexes = indexes || (new Array(amount));
            previousDepth = previousDepth || 0;

            const  depth = previousDepth + 1; // t
            let  variance;

            for (let  i = startingPoint; i < levelMax! - amount + previousDepth; i++) {
                variance = prevVariance + H[index(startingPoint, i)];
                indexes[depth - 1] = i;

                if (depth + 1 < amount + 1) {
                    // we need to go deeper
                    iterateRecursive(i, variance, indexes, depth);
                } else {
                    // enough, we can compare values now
                    variance += H[index(i + 1, levelMax!)];

                    if (maxSig < variance) {
                        maxSig = variance;
                        colorStops = indexes.slice();
                    }
                }
            }
        }

        iterateRecursive(levelMin || 0);

        return colorStops ? colorStops : [];
    }

    /**
     * Automatically finds a threshold value using multilevel thresholding.
     *
     * @param {number} [levelMin=0] - Histogram segment start.
     * @param {number} [levelMax=255] - Histogram segment end.
     * @returns {number|null} Calculated threshold, or `null` when no threshold is available.
     */
    autoThreshold(levelMin?: number, levelMax?: number): number | null {
        const  value = this.multilevelThresholding(1, levelMin, levelMax);
        return value.length ? value[0] : null;
    }

    /**
     * Returns the dominant color level in the given range.
     *
     * @param {number} levelMin - Histogram segment start.
     * @param {number} levelMax - Histogram segment end.
     * @param {number} [tolerance=1] - Neighboring level tolerance.
     * @returns {number} Dominant color level, or `-1` if the range contains no colors.
     */
    getDominantColor(levelMin: number, levelMax: number, tolerance?: number): number {
        const normalized = normalizeMinMax(levelMin, levelMax);
        levelMax = normalized[1];
        levelMin = normalized[0];
        tolerance = tolerance || 1;

        const  colors = this.data;
        let dominantIndex = -1,
            dominantValue = -1,
            i, j, tmp;

        if (levelMin === levelMax) {
            return colors[levelMin] ? levelMin : -1;
        }

        for (i = levelMin; i <= levelMax; i++) {
            tmp = 0;

            for (j = ~~(tolerance / -2); j < tolerance; j++) {
                tmp += utils.between(i + j, 0, COLOR_RANGE_END) ? colors[i + j] : 0;
            }

            const  summIsBigger = tmp > dominantValue;
            const  summEqualButMainColorIsBigger = dominantValue === tmp && (dominantIndex < 0 || colors[i] > colors[dominantIndex]);

            if (summIsBigger || summEqualButMainColorIsBigger) {
                dominantIndex = i;
                dominantValue = tmp;
            }
        }

        return dominantValue <= 0 ? -1 : dominantIndex;
    }

    /**
     * Returns stats for histogram or its segment.
     *
     * Returned object contains median, mean and standard deviation for pixel values;
     * peak, mean and median number of pixels per level and few other values
     *
     * If no pixels colors from specified range present on the image - most values will be NaN
     *
     * @param {number} levelMin - Histogram segment start.
     * @param {number} levelMax - Histogram segment end.
     * @param {boolean} [refresh=false] - Recompute cached stats when true.
     * @returns {HistogramStats} Histogram statistics for the requested segment.
     */
    getStats(levelMin: number, levelMax: number, refresh?: boolean): HistogramStats {
        const normalized = normalizeMinMax(levelMin, levelMax);
        levelMax = normalized[1];
        levelMin = normalized[0];

        if (!refresh && this._cachedStats[levelMin + '-' + levelMax]) {
            return this._cachedStats[levelMin + '-' + levelMax];
        }

        const  data = this.data;
        const  sortedIndexes = this._getSortedIndexes();

        let  pixelsTotal = 0;
        let  medianValue = null;
        let  tmpSumOfDeviations = 0;
        let  tmpPixelsIterated = 0;
        let  allPixelValuesCombined = 0;
        let  i, tmpPixels, tmpPixelValue;

        let  uniqueValues = 0; // counter for levels that's represented by at least one pixel
        let  mostPixelsPerLevel = 0;

        // Finding number of pixels and mean

        for (i = levelMin; i <= levelMax; i++) {
            pixelsTotal += data[i];
            allPixelValuesCombined += data[i] * i;

            uniqueValues += data[i] === 0 ? 0 : 1;

            if (mostPixelsPerLevel < data[i]) {
                mostPixelsPerLevel = data[i];
            }
        }

        const meanValue = allPixelValuesCombined / pixelsTotal;
        const pixelsPerLevelMean = pixelsTotal / (levelMax - levelMin);
        const pixelsPerLevelMedian = pixelsTotal / uniqueValues;
        const medianPixelIndex = Math.floor(pixelsTotal / 2);

        // Finding median and standard deviation

        for (i = 0; i < COLOR_DEPTH; i++) {
            tmpPixelValue = sortedIndexes[i];
            tmpPixels = data[tmpPixelValue];

            if (tmpPixelValue < levelMin || tmpPixelValue > levelMax) {
                continue;
            }

            tmpPixelsIterated += tmpPixels;
            tmpSumOfDeviations += Math.pow(tmpPixelValue - meanValue, 2) * tmpPixels;

            if (medianValue === null && tmpPixelsIterated >= medianPixelIndex) {
                medianValue = tmpPixelValue;
            }
        }

        return this._cachedStats[levelMin + '-' + levelMax] = {
            // various pixel counts for levels (0..255)

            levels: {
                mean: meanValue,
                median: medianValue,
                stdDev: Math.sqrt(tmpSumOfDeviations / pixelsTotal),
                unique: uniqueValues
            },

            // what's visually represented as bars
            pixelsPerLevel: {
                mean: pixelsPerLevelMean,
                median: pixelsPerLevelMedian,
                peak: mostPixelsPerLevel
            },

            pixels: pixelsTotal
        };
    }
}
