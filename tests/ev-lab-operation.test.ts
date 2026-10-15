import { describe, expect, test } from "bun:test";
import { pmsmModel as model } from "../src/features/ev-lab/models/pmsm";
import { validateModel } from "../src/features/ev-lab/model";
import {
  advancePlayback,
  clarke,
  movingAssembly,
  rotateAround,
  synchronousRpm,
  synchronousState,
  TAU,
  threePhase,
} from "../src/features/ev-lab/operation/electromagnetics";
const lesson = model.operation!;
describe("Three-phase and synchronous relationships", () => {
  test("the declared lesson is valid, illustrative and matches eight magnetic poles", () => {
    expect(validateModel(model)).toEqual([]);
    expect(model.components.find((c) => c.id === "magnets")!.parts.length).toBe(
      2 * lesson.polePairs,
    );
    expect(model.capabilities.simulation).toBe(false);
    const invalid = structuredClone(model);
    invalid.operation!.polePairs = 0;
    invalid.operation!.phaseOffsets = [0, 0, 0];
    invalid.operation!.rotatingAssemblyId = "unknown";
    expect(validateModel(invalid).length).toBeGreaterThanOrEqual(3);
  });
  test("sinusoids are separated by 120 electrical degrees and sum to zero throughout a cycle", () => {
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const [a, b, c] = threePhase(angle, lesson.phaseOffsets);
      expect(a + b + c).toBeCloseTo(0, 12);
      expect(threePhase(angle + TAU / 3, lesson.phaseOffsets)[1]).toBeCloseTo(a, 12);
      expect(threePhase(angle - TAU / 3, lesson.phaseOffsets)[2]).toBeCloseTo(a, 12);
      for (const v of [a, b, c]) expect(Math.abs(v)).toBeLessThanOrEqual(1);
    }
  });
  test("Clarke vector has constant unit magnitude and the expected advancing angle", () => {
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const vector = clarke(threePhase(angle, lesson.phaseOffsets));
      expect(vector.alpha).toBeCloseTo(Math.cos(angle), 12);
      expect(vector.beta).toBeCloseTo(Math.sin(angle), 12);
      expect(Math.hypot(vector.alpha, vector.beta)).toBeCloseTo(1, 12);
    }
  });
  test("one electrical cycle moves this four-pole-pair rotor 90 mechanical degrees", () => {
    expect(synchronousState(TAU, lesson).mechanical).toBeCloseTo(Math.PI / 2, 12);
    expect(synchronousState(4 * TAU, lesson).mechanical).toBeCloseTo(TAU, 12);
    for (const phase of [0, 1, 2, 5, 10, 20]) {
      const state = synchronousState(phase, lesson);
      expect(state.fieldMechanical - state.mechanical).toBeCloseTo(
        lesson.electricalLead / lesson.polePairs,
        12,
      );
      expect(state.electrical - lesson.polePairs * state.mechanical).toBeCloseTo(
        lesson.electricalLead,
        12,
      );
    }
    const a = synchronousState(1, lesson),
      b = synchronousState(2, lesson);
    expect(b.fieldMechanical - a.fieldMechanical).toBeCloseTo(b.mechanical - a.mechanical, 12);
  });
  test("synchronous speed uses pole pairs, not the count of individual poles", () => {
    expect(synchronousRpm(50, 4)).toBe(750);
    expect(synchronousRpm(100, 4)).toBe(1500);
    expect(synchronousRpm(50, 2)).toBe(1500);
    expect(synchronousRpm(0, 4)).toBe(0);
  });
});
describe("Animation geometry and playback", () => {
  test("only the declared rotating assembly is animated, including inner bearing races", () => {
    const moving = model.components
      .flatMap((c) => c.parts)
      .filter((p) => movingAssembly(model, p.assemblyId));
    expect(moving).toHaveLength(12);
    expect(moving.map((p) => p.id).toSorted()).toEqual(
      [
        "rotor.core",
        "shaft.main",
        "bearings.inner.-1",
        "bearings.inner.1",
        ...Array.from({ length: 8 }, (_, i) => `magnets.pole.${i + 1}`),
      ].toSorted(),
    );
    for (const c of model.components.filter((c) =>
      ["housing", "stator", "windings"].includes(c.id),
    ))
      for (const p of c.parts) expect(movingAssembly(model, p.assemblyId)).toBeUndefined();
  });
  test("rotations preserve pivots, distances, axis-parallel position and reversibility", () => {
    const p: [number, number, number] = [3, 4, 7],
      pivot: [number, number, number] = [1, 2, 3];
    const axis: [number, number, number] = [0, 0, 2];
    expect(rotateAround(pivot, pivot, axis, 1.3)).toEqual(pivot);
    const rotated = rotateAround(p, pivot, axis, Math.PI / 2);
    expect(rotated[0]).toBeCloseTo(-1, 12);
    expect(rotated[1]).toBeCloseTo(4, 12);
    expect(rotated[2]).toBe(7);
    const returned = rotateAround(rotated, pivot, axis, -Math.PI / 2);
    returned.forEach((v, i) => expect(v).toBeCloseTo(p[i], 12));
    expect(rotateAround([0, 1, 0], [0, 0, 0], [1, 0, 0], Math.PI / 2)[2]).toBeCloseTo(1, 12);
    expect(p).toEqual([3, 4, 7]);
  });
  test("speed changes time progression without changing electromagnetic relationships", () => {
    const slow = advancePlayback(0, 0.05, 0.5, 0.25, 4);
    const fast = advancePlayback(0, 0.05, 0.5, 2, 4);
    expect(fast).toBeCloseTo(8 * slow, 12);
    expect(advancePlayback(0, 20, 0.5, 1, 4)).toBeCloseTo(advancePlayback(0, 0.1, 0.5, 1, 4), 12);
    expect(advancePlayback(4 * TAU - 0.01, 0.05, 0.5, 1, 4)).toBeLessThan(1);
  });
});
