import { describe, expect, test } from "bun:test";
import { validateModel } from "../src/features/ev-lab/model";
import { pmsmModel } from "../src/features/ev-lab/models/pmsm";
import { vehicleModelBindings } from "../src/features/ev-lab/library";
import { createGeometry } from "../src/features/ev-lab/viewer/geometry";

describe("Educational resource contract", () => {
  test("PMSM is valid and preserves its seven public component IDs", () => {
    expect(validateModel(pmsmModel)).toEqual([]);
    expect(pmsmModel.components.map((c) => c.id)).toEqual([
      "housing",
      "stator",
      "windings",
      "rotor",
      "magnets",
      "shaft",
      "bearings",
    ]);
    expect(pmsmModel.representation.kind).toBe("generic");
    expect(vehicleModelBindings).toHaveLength(0);
  });
  test("rejects duplicate part identifiers, unknown assemblies and impossible rings", () => {
    const model = structuredClone(pmsmModel);
    model.components[1].parts[0].id = model.components[0].parts[0].id;
    model.components[2].parts[0].assemblyId = "unknown";
    model.components[3].parts[0].geometry = { kind: "annulus", inner: 2, outer: 1, length: 1 };
    expect(validateModel(model).some((e) => e.includes("duplicado"))).toBe(true);
    expect(validateModel(model).some((e) => e.includes("Ensamblaje inexistente"))).toBe(true);
    expect(validateModel(model).some((e) => e.includes("Geometría inválida"))).toBe(true);
  });
  test("prepared capabilities do not advertise unimplemented simulations or animation", () => {
    expect(pmsmModel.animations).toHaveLength(0);
    for (const capability of ["animation", "simulation"] as const)
      expect(pmsmModel.capabilities[capability]).toBe(false);
  });
});

describe("Procedural geometry and mechanical relationships", () => {
  test("stays below the triangle budget, with finite coordinates and unique parts", () => {
    let triangles = 0;
    const ids = new Set<string>();
    for (const component of pmsmModel.components) {
      for (const part of component.parts) {
        expect(ids.has(part.id)).toBe(false);
        ids.add(part.id);
        const geometry = createGeometry(part.geometry);
        expect(Array.from(geometry.attributes.position.array).every(Number.isFinite)).toBe(true);
        triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3;
        geometry.dispose();
      }
    }
    expect(triangles).toBeLessThan(100_000);
    expect(triangles).toBeGreaterThan(1_000);
    console.info(`PMSM: ${triangles} triangles; ${ids.size} mesh parts`);
  });
  test("rotor magnets fit inside stator tooth tips with an air gap", () => {
    const magnets = pmsmModel.components.find((c) => c.id === "magnets")!;
    const teeth = pmsmModel.components
      .find((c) => c.id === "stator")!
      .parts.filter((p) => p.geometry.kind === "box");
    const maximumRotorRadius = Math.max(
      ...magnets.parts.map((p) => (p.geometry.kind === "annulus" ? p.geometry.outer : 0)),
    );
    for (const tooth of teeth) {
      if (tooth.geometry.kind !== "box") throw Error("Expected box");
      const tipRadius =
        Math.hypot(tooth.position[0], tooth.position[1]) - tooth.geometry.size[0] / 2;
      expect(tipRadius).toBeGreaterThan(maximumRotorRadius);
    }
  });
  test("windings extend beyond the core and remain outside the air gap", () => {
    for (const coil of pmsmModel.components.find((c) => c.id === "windings")!.parts) {
      if (coil.geometry.kind !== "tube") throw Error("Expected winding path");
      expect(
        Math.min(...coil.geometry.points.map(([x, y]) => Math.hypot(x, y))) - coil.geometry.radius,
      ).toBeGreaterThan(1.07);
      expect(Math.max(...coil.geometry.points.map((p) => p[2]))).toBeGreaterThan(1.15);
      expect(Math.min(...coil.geometry.points.map((p) => p[2]))).toBeLessThan(-1.15);
    }
  });
  test("shaft fits through bearing inner races and rotating parts share an assembly", () => {
    const shaft = pmsmModel.components.find((c) => c.id === "shaft")!.parts[0];
    if (shaft.geometry.kind !== "cylinder") throw Error("Expected shaft cylinder");
    for (const bearing of pmsmModel.components
      .find((c) => c.id === "bearings")!
      .parts.filter((p) => p.id.includes("inner"))) {
      if (bearing.geometry.kind !== "annulus") throw Error("Expected bearing ring");
      expect(bearing.geometry.inner).toBe(shaft.geometry.radius);
      expect(bearing.assemblyId).toBe(shaft.assemblyId);
    }
    for (const component of pmsmModel.components.filter((c) =>
      ["rotor", "magnets"].includes(c.id),
    )) {
      expect(component.parts.every((p) => p.assemblyId === shaft.assemblyId)).toBe(true);
    }
  });
});
