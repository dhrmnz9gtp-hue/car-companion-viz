import { useState } from "react";
import type { SimulationDefinition } from "./definition";
import { motorPowerLesson, withinLesson } from "./definition";
import { calculatePoint, type OperatingPoint } from "./physics";

export function useSimulation(definition: SimulationDefinition = motorPowerLesson) {
  const [points, setPoints] = useState<[OperatingPoint, OperatingPoint]>(
    () => definition.defaults.map((p) => ({ ...p })) as [OperatingPoint, OperatingPoint],
  );
  const [active, setActive] = useState<0 | 1>(0);
  const [timeScale, setTimeScale] = useState(definition.defaultTimeScale);
  const [axis, setAxis] = useState<"angularSpeed" | "torque">("angularSpeed");
  const point = points[active];
  const update = (key: keyof OperatingPoint, value: number) => {
    const next = { ...point, [key]: value };
    if (!withinLesson(next, definition)) return;
    calculatePoint(next);
    setPoints(
      (previous) =>
        previous.map((p, index) => (index === active ? next : p)) as [
          OperatingPoint,
          OperatingPoint,
        ],
    );
  };
  const reset = () => {
    setPoints(definition.defaults.map((p) => ({ ...p })) as [OperatingPoint, OperatingPoint]);
    setActive(0);
    setTimeScale(definition.defaultTimeScale);
    setAxis("angularSpeed");
  };
  return {
    points,
    point,
    active,
    setActive,
    timeScale,
    setTimeScale,
    axis,
    setAxis,
    update,
    reset,
  };
}
