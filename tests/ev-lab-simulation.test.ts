import { describe, expect, test } from "bun:test";
import {
  angularSpeedToRpm,
  calculatePoint,
  comparePoints,
  hpToWatts,
  rpmToAngularSpeed,
  visualCyclesPerSecond,
  wattsToHp,
  WATTS_PER_HP,
} from "../src/features/ev-lab/simulation/physics";
import { motorPowerLesson, withinLesson } from "../src/features/ev-lab/simulation/definition";
import { pmsmModel } from "../src/features/ev-lab/models/pmsm";
import { validateModel } from "../src/features/ev-lab/model";

describe("Steady motor calculations in SI", () => {
  const example = { angularSpeed: rpmToAngularSpeed(3000), torque: 150, efficiency: 0.9 };
  test("rpm conversions preserve known values and precision", () => {
    expect(rpmToAngularSpeed(0)).toBe(0);
    expect(rpmToAngularSpeed(60)).toBeCloseTo(2 * Math.PI, 12);
    expect(rpmToAngularSpeed(3000)).toBeCloseTo(100 * Math.PI, 12);
    for (const rpm of [0, 0.001, 23.456, 3000, 12000])
      expect(angularSpeedToRpm(rpmToAngularSpeed(rpm))).toBeCloseTo(rpm, 10);
  });
  test("worked example produces known mechanical, electrical and loss powers", () => {
    const result = calculatePoint(example);
    expect(result.mechanical).toBeCloseTo(47123.8898038469, 8);
    expect(result.electrical).toBeCloseTo(52359.8775598299, 8);
    expect(result.losses).toBeCloseTo(5235.987755983, 8);
    expect(result.mechanical + result.losses).toBe(result.electrical);
  });
  test("power scales with torque and speed; efficiency changes input, not output", () => {
    const base = calculatePoint(example);
    expect(calculatePoint({ ...example, torque: 300 }).mechanical).toBe(base.mechanical * 2);
    expect(calculatePoint({ ...example, angularSpeed: example.angularSpeed * 2 }).mechanical).toBe(
      base.mechanical * 2,
    );
    const lower = calculatePoint({ ...example, efficiency: 0.5 });
    expect(lower.mechanical).toBe(base.mechanical);
    expect(lower.electrical).toBeGreaterThan(base.electrical);
    expect(lower.losses).toBeGreaterThan(base.losses);
    expect(calculatePoint({ ...example, efficiency: 1 }).losses).toBe(0);
    expect(calculatePoint({ ...example, efficiency: 0.01 }).electrical).toBeCloseTo(
      base.mechanical * 100,
      7,
    );
  });
  test("zero torque and zero speed are valid algebraic limits", () => {
    for (const point of [
      { ...example, torque: 0 },
      { ...example, angularSpeed: 0 },
      { angularSpeed: 0, torque: 0, efficiency: 1 },
    ])
      expect(calculatePoint(point)).toEqual({ mechanical: 0, electrical: 0, losses: 0 });
  });
  test("rejects negatives, nonfinite inputs, zero/invalid efficiency and numeric overflow", () => {
    for (const key of ["angularSpeed", "torque", "efficiency"] as const)
      for (const value of [-1, NaN, Infinity, -Infinity])
        expect(() => calculatePoint({ ...example, [key]: value })).toThrow(RangeError);
    for (const efficiency of [0, 1.001])
      expect(() => calculatePoint({ ...example, efficiency })).toThrow(RangeError);
    expect(() => calculatePoint({ ...example, angularSpeed: 1e308, torque: 1e308 })).toThrow(
      RangeError,
    );
    expect(() => calculatePoint({ ...example, efficiency: Number.MIN_VALUE })).toThrow(RangeError);
  });
  test("mechanical hp conversion distinguishes it from metric CV and electrical hp", () => {
    expect(WATTS_PER_HP).toBeCloseTo(745.6998715822702, 10);
    expect(wattsToHp(100000)).toBeCloseTo(134.1022089595, 8);
    expect(hpToWatts(1)).not.toBe(746);
    expect(hpToWatts(1)).not.toBeCloseTo(735.49875);
    expect(hpToWatts(wattsToHp(47123.8898038469))).toBeCloseTo(47123.8898038469, 8);
    expect(wattsToHp(0)).toBe(0);
  });
  test("comparison uses the same equations, preserves inputs and gives signed deltas", () => {
    const a = Object.freeze(example),
      b = Object.freeze({ ...example, torque: 100 });
    const result = comparePoints(a, b);
    expect(result.first).toEqual(calculatePoint(a));
    expect(result.second).toEqual(calculatePoint(b));
    expect(result.delta.mechanical).toBeLessThan(0);
    expect(comparePoints(b, a).delta.mechanical).toBe(-result.delta.mechanical);
    expect(comparePoints(a, a).delta).toEqual({ mechanical: 0, electrical: 0, losses: 0 });
    expect(comparePoints({ ...a, torque: 0 }, a).delta.mechanical).toBe(
      calculatePoint(a).mechanical,
    );
    expect(() => comparePoints(a, { ...b, efficiency: 0 })).toThrow();
  });
});

describe("Lesson bounds and visual time", () => {
  test("illustrative ranges, valid defaults, both extremes and model contract", () => {
    expect(validateModel(pmsmModel)).toEqual([]);
    for (const point of motorPowerLesson.defaults)
      expect(withinLesson(point, motorPowerLesson)).toBe(true);
    const minimum = { angularSpeed: 0, torque: 0, efficiency: 0.5 };
    const maximum = { angularSpeed: rpmToAngularSpeed(12000), torque: 400, efficiency: 1 };
    expect(withinLesson(minimum, motorPowerLesson)).toBe(true);
    expect(withinLesson(maximum, motorPowerLesson)).toBe(true);
    expect(calculatePoint(maximum).mechanical).toBeCloseTo(502654.8245743669, 7);
    for (const point of [
      { ...maximum, torque: 401 },
      { ...minimum, efficiency: 0.49 },
      { ...minimum, angularSpeed: NaN },
    ])
      expect(withinLesson(point, motorPowerLesson)).toBe(false);
    const bad = structuredClone(pmsmModel);
    bad.simulation!.defaults[0].efficiency = 0;
    expect(validateModel(bad)).toContain("Escenario de simulación inválido");
    bad.simulation!.defaultTimeScale = 2;
    expect(validateModel(bad)).toContain("Parámetros de simulación inválidos");
  });
  test("scaled playback is proportional to rpm and time scale without changing physics", () => {
    const omega = rpmToAngularSpeed(3000);
    expect(visualCyclesPerSecond(omega, 1 / 200, 4)).toBeCloseTo(1, 12);
    expect(visualCyclesPerSecond(omega * 2, 1 / 200, 4)).toBeCloseTo(2, 12);
    expect(visualCyclesPerSecond(omega, 1 / 100, 4)).toBeCloseTo(2, 12);
    expect(visualCyclesPerSecond(0, 1 / 200, 4)).toBe(0);
    for (const scale of motorPowerLesson.timeScales)
      expect(visualCyclesPerSecond(rpmToAngularSpeed(12000), scale, 4) / 4).toBeLessThanOrEqual(2);
    for (const scale of [0, -1, 2, NaN])
      expect(() => visualCyclesPerSecond(omega, scale, 4)).toThrow();
  });
});
