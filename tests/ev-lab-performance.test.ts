import { describe, expect, test } from "bun:test";
import { limitedGraphics } from "../src/features/ev-lab/viewer/graphicsPolicy";

describe("Conservative graphics capabilities", () => {
  test("primary touch devices use the same budget in portrait and landscape", () => {
    expect(limitedGraphics({ coarsePointer: true, cores: 8, memoryGiB: 8 })).toBe(true);
  });
  test("powerful fine-pointer desktops retain quality even in narrow windows", () => {
    expect(limitedGraphics({ coarsePointer: false, cores: 12, memoryGiB: 8 })).toBe(false);
  });
  test("known limited CPU or RAM is sufficient to select the conservative budget", () => {
    expect(limitedGraphics({ coarsePointer: false, cores: 4, memoryGiB: 8 })).toBe(true);
    expect(limitedGraphics({ coarsePointer: false, cores: 8, memoryGiB: 4 })).toBe(true);
  });
  test("missing or invalid capacity hints do not classify a desktop as low capacity", () => {
    expect(limitedGraphics({ coarsePointer: false })).toBe(false);
    expect(limitedGraphics({ coarsePointer: false, cores: 0, memoryGiB: -1 })).toBe(false);
  });
});
