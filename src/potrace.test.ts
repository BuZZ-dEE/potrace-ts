import { Potrace } from "./potrace";

function createImageData(width: number, height: number, rgba: [number, number, number, number]): ImageData {
    const data = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < width * height; i++) {
        data.set(rgba, i * 4);
    }

    return { width, height, data } as ImageData;
}

describe("Potrace", () => {
    it("calls the constructor callback after processing image data", () => {
        const callback = jest.fn();

        new Potrace(createImageData(1, 1, [255, 255, 255, 255]), callback);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("generates an SVG with configured dimensions and background", () => {
        const potrace = new Potrace(createImageData(2, 3, [255, 255, 255, 255]), jest.fn(), {
            background: "white",
            color: "black",
            width: 20,
            height: 30,
        });

        expect(potrace.getSVG()).toBe(
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 20 30" version="1.1">\n' +
            '\t<rect x="0" y="0" width="100%" height="100%" fill="white" />\n' +
            '\t<path d="" stroke="none" fill="black" fill-rule="evenodd"/>\n' +
            '</svg>'
        );
    });

    it("traces opaque black pixels into a non-empty path", () => {
        const potrace = new Potrace(createImageData(2, 2, [0, 0, 0, 255]), jest.fn(), {
            threshold: 128,
        });

        expect(potrace.getPathTag()).toMatch(/^<path d=".+" stroke="none" fill="black" fill-rule="evenodd"\/>$/);
    });

    it("validates supported option values", () => {
        const image = createImageData(1, 1, [255, 255, 255, 255]);

        expect(() => new Potrace(image, jest.fn(), { turnPolicy: "diagonal" })).toThrow("Bad turnPolicy value");
        expect(() => new Potrace(image, jest.fn(), { threshold: 256 })).toThrow("Bad threshold value");
        expect(() => new Potrace(image, jest.fn(), { optCurve: "yes" as unknown as boolean })).toThrow("'optCurve' must be Boolean");
    });
});