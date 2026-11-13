import { describe, expect, test } from "bun:test";
import { pmsmModel as model } from "../src/features/ev-lab/models/pmsm";
import {
  partAppearance,
  separationOffsets,
  selectionOffset,
} from "../src/features/ev-lab/exploration";
import { validateModel } from "../src/features/ev-lab/model";

const ids = model.components.flatMap((c) => c.parts.map((p) => p.id));
describe("Reusable disassembly plan", () => {
  test("covers every stable part exactly once and validates enabled capabilities", () => {
    expect(validateModel(model)).toEqual([]);
    const assigned = model.disassembly!.groups.flatMap((g) => g.partIds);
    expect(assigned.toSorted()).toEqual(ids.toSorted());
    expect(new Set(assigned).size).toBe(65);
    for (const key of ["explode", "transparency", "isolation"] as const)
      expect(model.capabilities[key]).toBe(true);
  });
  test("rejects duplicate assignments, unknown directions and reversed stages", () => {
    const broken = structuredClone(model);
    broken.disassembly!.groups[1].partIds.push(ids[0], "missing");
    broken.disassembly!.groups[0].steps[0].range = [0.8, 0.1];
    broken.disassembly!.groups[0].steps[0].directionFrom = "missing";
    expect(validateModel(broken).some((e) => e.includes("Pieza de separación inválida"))).toBe(
      true,
    );
    expect(validateModel(broken).some((e) => e.includes("Etapa de separación inválida"))).toBe(
      true,
    );
  });
  test("is reversible, continuous at stage boundaries and never mutates source data", () => {
    const original = JSON.stringify(model);
    const zero = separationOffsets(model, 0);
    for (const id of ids) expect(zero[id].every((v) => v === 0)).toBe(true);
    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      const offsets = separationOffsets(model, p);
      for (const vector of Object.values(offsets)) expect(vector.every(Number.isFinite)).toBe(true);
    }
    for (const boundary of [0.25, 0.7]) {
      const before = separationOffsets(model, boundary - 0.00001);
      const after = separationOffsets(model, boundary + 0.00001);
      for (const id of ids)
        for (let axis = 0; axis < 3; axis++)
          expect(Math.abs(before[id][axis] - after[id][axis])).toBeLessThan(0.00001);
    }
    expect(separationOffsets(model, 0)).toEqual(zero);
    expect(separationOffsets(model, -1)).toEqual(zero);
    expect(separationOffsets(model, NaN)).toEqual(zero);
    expect(separationOffsets(model, 2)).toEqual(separationOffsets(model, 1));
    expect(JSON.stringify(model)).toBe(original);
  });
  test("keeps rotor, shaft and magnets rigid and windings with their stator", () => {
    for (const progress of [0, 0.1, 0.25, 0.45, 0.7, 0.9, 1]) {
      const offsets = separationOffsets(model, progress);
      for (const c of model.components.filter((c) => ["rotor", "magnets", "shaft"].includes(c.id)))
        for (const p of c.parts) expect(offsets[p.id]).toEqual(offsets["shaft.main"]);
      for (const c of model.components.filter((c) => ["windings", "stator"].includes(c.id)))
        for (const p of c.parts) expect(offsets[p.id]).toEqual(offsets["stator.yoke"]);
      for (const side of [-1, 1]) {
        for (const p of model.components
          .find((c) => c.id === "bearings")!
          .parts.filter(
            (p) =>
              p.id === `bearings.inner.${side}` ||
              p.id === `bearings.outer.${side}` ||
              p.id.startsWith(`bearings.ball.${side}.`),
          ))
          expect(offsets[p.id]).toEqual(offsets[`housing.end.${side}`]);
      }
    }
  });
  test("clears supports before axial extraction and shell before lateral separation", () => {
    const support = separationOffsets(model, 0.25);
    expect(support["housing.end.1"][2] + 1.46 - 0.11).toBeGreaterThan(3.8 + 4.25 / 2);
    expect(support["rotor.core"]).toEqual([0, 0, 0]);
    const extracted = separationOffsets(model, 0.7);
    expect(extracted["shaft.main"][2] - 4.25 / 2).toBeGreaterThan(2.55 / 2);
    expect(extracted["stator.yoke"][2] + 1.35).toBeLessThan(-2.55 / 2);
    expect(extracted["housing.shell"][1]).toBe(0);
    expect(extracted["stator.yoke"][0]).toBe(0);
    expect(separationOffsets(model, 1)["housing.shell"][1]).toBe(2);
  });
  test("selection focus follows translated parts and works with another resource's IDs", () => {
    const offsets = separationOffsets(model, 1);
    expect(selectionOffset(model, { componentId: "rotor" }, offsets)).toEqual(
      offsets["rotor.core"],
    );
    expect(
      selectionOffset(model, { componentId: "bearings", partId: "bearings.inner.-1" }, offsets),
    ).toEqual(offsets["bearings.inner.-1"]);
    const other = structuredClone(model);
    other.components[0].id = "battery-case";
    other.disassembly!.groups.forEach((g) =>
      g.steps.forEach((step) => {
        if (step.directionFrom === "housing") step.directionFrom = "battery-case";
      }),
    );
    other.components[0].explodeDirection = [3, 0, 0];
    expect(separationOffsets(other, 1)["housing.shell"]).toEqual([3, 0, 0]);
  });
});

describe("Visibility without extra geometry", () => {
  test("uses a single non-occluding shell when transparent and hides it at 100%", () => {
    const housing = model.components[0];
    for (const part of housing.parts) {
      const appearance = partAppearance(model, housing.id, part.id, 0.6, null);
      expect(appearance.visible).toBe(part.id === "housing.shell");
      expect(appearance.pickable).toBe(false);
      expect(appearance.opacity).toBeCloseTo(0.4);
      expect(partAppearance(model, housing.id, part.id, 1, null).visible).toBe(false);
      expect(partAppearance(model, housing.id, part.id, 0, null).visible).toBe(true);
    }
  });
  test("only selected component is rendered and pickable when isolated", () => {
    for (const component of model.components)
      for (const part of component.parts) {
        const view = partAppearance(model, component.id, part.id, 0, "windings");
        expect(view.visible).toBe(component.id === "windings");
        expect(view.pickable).toBe(component.id === "windings");
      }
  });
});
