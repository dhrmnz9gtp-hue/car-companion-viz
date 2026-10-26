import { memo, useId } from "react";
import type { SimulationDefinition } from "./definition";
import {
  angularSpeedToRpm,
  calculatePoint,
  comparePoints,
  wattsToHp,
  type OperatingPoint,
} from "./physics";

const formatter = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const number = (value: number) => formatter.format(value);

export const PowerCurve = memo(function PowerCurve({
  point,
  definition,
  axis,
  setAxis,
}: {
  point: OperatingPoint;
  definition: SimulationDefinition;
  axis: "angularSpeed" | "torque";
  setAxis: (axis: "angularSpeed" | "torque") => void;
}) {
  const id = useId();
  const maximum = definition.bounds[axis][1];
  const end = calculatePoint({ ...point, [axis]: maximum }).mechanical;
  const scale = Math.max(end, 1000);
  const points = Array.from({ length: 21 }, (_, i) => {
    const value = (maximum * i) / 20;
    return `${44 + (220 * i) / 20},${116 - (86 * calculatePoint({ ...point, [axis]: value }).mechanical) / scale}`;
  }).join(" ");
  const displayMaximum = axis === "angularSpeed" ? angularSpeedToRpm(maximum) : maximum;
  return (
    <section className="lab-sim-chart" aria-label="Relación entre torque, velocidad y potencia">
      <div className="lab-sim-chart-title">
        <h4>¿Cómo cambia la potencia?</h4>
        <select
          aria-label="Eje de la gráfica de potencia"
          value={axis}
          onChange={(e) => setAxis(e.target.value as typeof axis)}
        >
          <option value="angularSpeed">Variar rpm</option>
          <option value="torque">Variar torque</option>
        </select>
      </div>
      <svg viewBox="0 0 290 150" role="img" aria-labelledby={id}>
        <title id={id}>
          Potencia mecánica en kW frente a {axis === "angularSpeed" ? "rpm" : "torque"}. Relación
          lineal con{" "}
          {axis === "angularSpeed"
            ? `${number(point.torque)} Nm constantes`
            : `${number(angularSpeedToRpm(point.angularSpeed))} rpm constantes`}
          .
        </title>
        <path d="M44 26V116H264" className="lab-sim-axis" />
        <path d="M44 73H264M44 30H264" className="lab-sim-grid" />
        <text x="4" y="17">
          kW
        </text>
        <text x="4" y="34">
          {number(scale / 1000)}
        </text>
        <text x="22" y="120">
          0
        </text>
        <polyline points={points} className="lab-sim-line" />
        <circle
          cx={44 + (220 * point[axis]) / maximum}
          cy={116 - (86 * calculatePoint(point).mechanical) / scale}
          r="5"
          fill="#fbbf24"
        />
        <text x="44" y="139">
          0
        </text>
        <text x="264" y="139" textAnchor="end">
          {number(displayMaximum)} {axis === "angularSpeed" ? "rpm" : "Nm"}
        </text>
      </svg>
      <p>
        {axis === "angularSpeed"
          ? `${number(point.torque)} Nm fijos`
          : `${number(angularSpeedToRpm(point.angularSpeed))} rpm fijas`}{" "}
        · punto ámbar: escenario activo. Relación calculada, sin curva de límites reales.
      </p>
    </section>
  );
});

export const PowerBalance = memo(function PowerBalance({ point }: { point: OperatingPoint }) {
  const id = useId();
  const result = calculatePoint(point);
  const fraction = result.electrical > 0 ? result.mechanical / result.electrical : 0;
  return (
    <section className="lab-sim-chart" aria-label="Balance de potencia">
      <h4>Entrada = salida + pérdidas</h4>
      <svg viewBox="0 0 290 60" role="img" aria-labelledby={id}>
        <title id={id}>
          Entrada {number(result.electrical / 1000)} kW; salida mecánica{" "}
          {number(result.mechanical / 1000)} kW; pérdidas {number(result.losses / 1000)} kW.
        </title>
        <rect x="4" y="8" width="282" height="16" rx="4" fill="#25343e" />
        {result.electrical > 0 && (
          <>
            <rect x="4" y="8" width={282 * fraction} height="16" fill="#6ee7b7" />
            <rect
              x={4 + 282 * fraction}
              y="8"
              width={282 * (1 - fraction)}
              height="16"
              fill="#fbbf24"
            />
          </>
        )}
        <text x="4" y="47" fill="#6ee7b7">
          Salida {number(result.mechanical / 1000)} kW
        </text>
        <text x="286" y="47" textAnchor="end" fill="#fbbf24">
          Pérdidas {number(result.losses / 1000)} kW
        </text>
      </svg>
      <p>
        {result.electrical === 0
          ? "Balance nulo del modelo: no describe consumo en vacío ni calentamiento a rotor detenido."
          : "Ancho total: potencia eléctrica estimada de entrada al motor. No es energía acumulada."}
      </p>
    </section>
  );
});

export const Comparison = memo(function Comparison({
  points,
}: {
  points: [OperatingPoint, OperatingPoint];
}) {
  const compared = comparePoints(...points);
  const values = [compared.first, compared.second];
  const maximum = Math.max(...values.map((r) => r.mechanical), 1);
  const rows = [
    ["Velocidad · rpm", ...points.map((p) => number(angularSpeedToRpm(p.angularSpeed)))],
    ["Torque · Nm", ...points.map((p) => number(p.torque))],
    ["Eficiencia · %", ...points.map((p) => number(p.efficiency * 100))],
    ["Salida · kW", ...values.map((r) => number(r.mechanical / 1000))],
    ["Salida · hp", ...values.map((r) => number(wattsToHp(r.mechanical)))],
    ["Entrada · kW", ...values.map((r) => number(r.electrical / 1000))],
    ["Pérdidas · kW", ...values.map((r) => number(r.losses / 1000))],
  ];
  return (
    <details className="lab-sim-comparison">
      <summary>Comparar escenarios A y B</summary>
      <p>
        Edita cada escenario con los botones A y B. Ambos usan las mismas ecuaciones y sus propias
        eficiencias supuestas.
      </p>
      <svg
        viewBox="0 0 290 65"
        role="img"
        aria-label={`Potencia mecánica: A ${number(values[0].mechanical / 1000)} kW; B ${number(values[1].mechanical / 1000)} kW`}
      >
        {values.map((r, i) => (
          <g key={i}>
            <text x="0" y={20 + i * 30}>
              {i === 0 ? "A" : "B"}
            </text>
            <rect
              x="22"
              y={8 + i * 30}
              height="16"
              width={(264 * r.mechanical) / maximum}
              fill={i === 0 ? "#6ee7b7" : "#93c5fd"}
            />
          </g>
        ))}
      </svg>
      <table>
        <caption>Comparación de puntos de operación</caption>
        <thead>
          <tr>
            <th>Magnitud</th>
            <th>A</th>
            <th>B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, a, b]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Diferencia B − A: <strong>{number(compared.delta.mechanical / 1000)} kW</strong> de salida
        mecánica.
      </p>
    </details>
  );
});
