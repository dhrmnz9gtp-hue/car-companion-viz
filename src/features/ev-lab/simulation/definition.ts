import type { OperatingPoint } from "./physics";
import { rpmToAngularSpeed } from "./physics";

export interface SimulationDefinition {
  kind: "steady-motor";
  bounds: Record<keyof OperatingPoint, [number, number]>;
  defaults: [OperatingPoint, OperatingPoint];
  timeScales: number[];
  defaultTimeScale: number;
}

/** Illustrative lesson ranges, never manufacturer limits or a feasibility envelope. */
export const motorPowerLesson: SimulationDefinition = {
  kind: "steady-motor",
  bounds: { angularSpeed: [0, rpmToAngularSpeed(12000)], torque: [0, 400], efficiency: [0.5, 1] },
  defaults: [
    { angularSpeed: rpmToAngularSpeed(3000), torque: 150, efficiency: 0.9 },
    { angularSpeed: rpmToAngularSpeed(6000), torque: 100, efficiency: 0.92 },
  ],
  timeScales: [1 / 400, 1 / 200, 1 / 100],
  defaultTimeScale: 1 / 200,
};

export function withinLesson(point: OperatingPoint, definition: SimulationDefinition) {
  return (Object.keys(definition.bounds) as (keyof OperatingPoint)[]).every(
    (key) =>
      Number.isFinite(point[key]) &&
      point[key] >= definition.bounds[key][0] &&
      point[key] <= definition.bounds[key][1],
  );
}
