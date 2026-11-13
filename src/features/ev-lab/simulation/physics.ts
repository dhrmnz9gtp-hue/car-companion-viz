/** Steady motor quadrant. SI only: rad/s, N·m, W, dimensionless efficiency. */
export interface OperatingPoint {
  angularSpeed: number;
  torque: number;
  efficiency: number;
}

// Mechanical horsepower: 550 ft·lbf/s, using exact SI definitions (NIST SP 811).
export const WATTS_PER_HP = 550 * 0.3048 * 0.45359237 * 9.80665;
export const rpmToAngularSpeed = (rpm: number) => (rpm * 2 * Math.PI) / 60;
export const angularSpeedToRpm = (omega: number) => (omega * 60) / (2 * Math.PI);
export const wattsToHp = (watts: number) => watts / WATTS_PER_HP;
export const hpToWatts = (hp: number) => hp * WATTS_PER_HP;

export function calculatePoint(point: OperatingPoint) {
  const { angularSpeed, torque, efficiency } = point;
  if (
    ![angularSpeed, torque, efficiency].every(Number.isFinite) ||
    angularSpeed < 0 ||
    torque < 0 ||
    efficiency <= 0 ||
    efficiency > 1
  )
    throw new RangeError("Se requieren ω ≥ 0, torque ≥ 0 y 0 < eficiencia ≤ 1, todos finitos.");
  const mechanical = torque * angularSpeed;
  const electrical = mechanical / efficiency;
  const losses = electrical - mechanical;
  if (![mechanical, electrical, losses].every(Number.isFinite))
    throw new RangeError("El punto de operación excede la precisión numérica disponible.");
  return { mechanical, electrical, losses };
}

export function comparePoints(a: OperatingPoint, b: OperatingPoint) {
  const first = calculatePoint(a),
    second = calculatePoint(b);
  return {
    first,
    second,
    delta: {
      mechanical: second.mechanical - first.mechanical,
      electrical: second.electrical - first.electrical,
      losses: second.losses - first.losses,
    },
  };
}

/** Playback time scaling only; neither torque nor efficiency is an acceleration input. */
export function visualCyclesPerSecond(
  angularSpeed: number,
  timeScale: number,
  cyclesPerTurn: number,
) {
  if (
    ![angularSpeed, timeScale, cyclesPerTurn].every(Number.isFinite) ||
    angularSpeed < 0 ||
    timeScale <= 0 ||
    timeScale > 1 ||
    !Number.isInteger(cyclesPerTurn) ||
    cyclesPerTurn < 1
  )
    throw new RangeError("Escala de reproducción inválida.");
  return (angularSpeed / (2 * Math.PI)) * timeScale * cyclesPerTurn;
}
