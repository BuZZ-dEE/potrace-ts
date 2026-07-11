import { Opti } from "./opti";
import { Point } from "./point";

describe("Opti", () => {
    it("initializes optimization defaults", () => {
        const opti = new Opti();

        expect(opti.pen).toBe(0);
        expect(opti.c).toHaveLength(2);
        expect(opti.c[0]).toEqual(new Point());
        expect(opti.c[1]).toEqual(new Point());
        expect(opti.c[0]).not.toBe(opti.c[1]);
        expect(opti.t).toBe(0);
        expect(opti.s).toBe(0);
        expect(opti.alpha).toBe(0);
    });
});