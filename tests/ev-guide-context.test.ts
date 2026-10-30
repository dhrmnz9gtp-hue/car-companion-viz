import { describe, expect, test } from "bun:test";
import {
  educationSearch,
  labOriginSearch,
  guideSnapshot,
  GUIDE_SECTIONS,
} from "../src/lib/ev-guide-context";

describe("Educational guide navigation boundaries", () => {
  test("only the explicit education context activates the generic guide", () => {
    expect(
      educationSearch({ guide: "education", section: "motor", url: "https://invalid.test" }),
    ).toEqual({ guide: "education", section: "motor" });
    for (const guide of [null, true, [], "tesla", "EDUCATION"])
      expect(educationSearch({ guide, section: "motor" })).toEqual({});
  });
  test("only known sections are restored, otherwise battery is the safe default", () => {
    for (const section of GUIDE_SECTIONS)
      expect(educationSearch({ guide: "education", section }).section).toBe(section);
    expect(educationSearch({ guide: "education", section: "https://invalid.test" }).section).toBe(
      "bateria",
    );
  });
  test("lab origin is an identifier, never a caller supplied return URL", () => {
    expect(labOriginSearch({ from: "ev-guide", returnTo: "https://invalid.test" })).toEqual({
      from: "ev-guide",
    });
    expect(labOriginSearch({ from: "https://invalid.test" })).toEqual({});
  });
  test("restoration data rejects malformed coordinates and focus selectors", () => {
    expect(
      guideSnapshot({ section: "motor", pageY: -10, frameY: Infinity, focus: "#arbitrary" }),
    ).toEqual({ section: "motor", pageY: 0, frameY: 0, focus: "section" });
    expect(
      guideSnapshot({ section: "motor", pageY: 200, frameY: 300, focus: "motor-link" }),
    ).toEqual({ section: "motor", pageY: 200, frameY: 300, focus: "motor-link" });
    expect(guideSnapshot(null).section).toBe("bateria");
    expect(guideSnapshot({ pageY: 100000000 }).pageY).toBe(100000);
  });
});
