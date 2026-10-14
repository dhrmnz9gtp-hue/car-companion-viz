import type { ModelDefinition, Selection, Vec3 } from "./model";

export const clampUnit = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export const ease = (value: number) => value * value * (3 - 2 * value);

/** Pure transforms: never mutate resource geometry or original positions. */
export function separationOffsets(
  model: ModelDefinition,
  separation: number,
): Record<string, Vec3> {
  const offsets: Record<string, Vec3> = {};
  const level = clampUnit(separation);
  for (const group of model.disassembly?.groups ?? []) {
    const offset: Vec3 = [0, 0, 0];
    for (const step of group.steps) {
      const direction = model.components.find((c) => c.id === step.directionFrom)?.explodeDirection;
      if (!direction) continue;
      const phase = ease(clampUnit((level - step.range[0]) / (step.range[1] - step.range[0])));
      for (let axis = 0; axis < 3; axis++) offset[axis] += direction[axis] * step.scale * phase;
    }
    for (const id of group.partIds) offsets[id] = offset;
  }
  return offsets;
}

export function selectionOffset(
  model: ModelDefinition,
  selection: Selection,
  offsets: Record<string, Vec3>,
): Vec3 {
  if (selection?.partId && offsets[selection.partId]) return offsets[selection.partId];
  const parts = model.components.find((c) => c.id === selection?.componentId)?.parts ?? [];
  return parts.reduce<Vec3>(
    (sum, part) =>
      sum.map((value, axis) => value + (offsets[part.id]?.[axis] ?? 0) / parts.length) as Vec3,
    [0, 0, 0],
  );
}

export function partAppearance(
  model: ModelDefinition,
  componentId: string,
  partId: string,
  transparency: number,
  isolatedId: string | null,
) {
  const faded = model.transparency?.componentId === componentId && transparency > 0;
  const visible =
    (!isolatedId || isolatedId === componentId) &&
    (!faded || (transparency < 1 && model.transparency!.shellPartIds.includes(partId)));
  return { visible, opacity: faded ? 1 - clampUnit(transparency) : 1, pickable: visible && !faded };
}
