import type { ModelDefinition, SynchronousLesson, Vec3 } from "../model";
export const TAU = 2 * Math.PI;
export const wrapAngle = (angle: number, period = TAU) => ((angle % period) + period) % period;
export const synchronousRpm = (frequencyHz: number, polePairs: number) =>
  (60 * frequencyHz) / polePairs;
export function threePhase(angle: number, offsets: SynchronousLesson["phaseOffsets"]): Vec3 {
  return offsets.map((offset) => Math.cos(angle + offset)) as Vec3;
}
export function clarke([a, b, c]: Vec3) {
  return { alpha: (2 / 3) * (a - (b + c) / 2), beta: (b - c) / Math.sqrt(3) };
}
/** Illustrative prescribed synchronism. No torque equation or magnetic field solve. */
export function synchronousState(electricalAdvance: number, lesson: SynchronousLesson) {
  const electrical = electricalAdvance + lesson.electricalLead;
  const currents = threePhase(electrical, lesson.phaseOffsets);
  return {
    electrical,
    currents,
    vector: clarke(currents),
    mechanical: electricalAdvance / lesson.polePairs,
    fieldMechanical: electrical / lesson.polePairs,
  };
}
/** Rodrigues rotation in model coordinates, usable with any normalized or non-unit axis. */
export function rotateAround(position: Vec3, pivot: Vec3, axis: Vec3, angle: number): Vec3 {
  const norm = Math.hypot(...axis);
  if (!norm) return [...position];
  const [x, y, z] = axis.map((v) => v / norm);
  const [a, b, c] = position.map((v, i) => v - pivot[i]);
  const dot = x * a + y * b + z * c,
    cos = Math.cos(angle),
    sin = Math.sin(angle);
  return [
    a * cos + (y * c - z * b) * sin + x * dot * (1 - cos) + pivot[0],
    b * cos + (z * a - x * c) * sin + y * dot * (1 - cos) + pivot[1],
    c * cos + (x * b - y * a) * sin + z * dot * (1 - cos) + pivot[2],
  ];
}
export function movingAssembly(model: ModelDefinition, assemblyId: string) {
  const target = model.operation?.rotatingAssemblyId;
  const visited = new Set<string>();
  let assembly = model.assemblies.find((a) => a.id === assemblyId);
  while (assembly && !visited.has(assembly.id)) {
    if (assembly.id === target) return assembly;
    visited.add(assembly.id);
    assembly = model.assemblies.find((a) => a.id === assembly!.parentId);
  }
  return undefined;
}
export function advancePlayback(
  phase: number,
  elapsedSeconds: number,
  cyclesPerSecond: number,
  speed: number,
  cycleCount: number,
) {
  // A stalled/background tab must not fast-forward the lesson on its next frame.
  return wrapAngle(
    phase + TAU * cyclesPerSecond * speed * Math.min(0.1, Math.max(0, elapsedSeconds)),
    TAU * cycleCount,
  );
}
