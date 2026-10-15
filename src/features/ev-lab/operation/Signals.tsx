import { useId, useMemo } from "react";
import type { SynchronousLesson } from "../model";
import { synchronousState, TAU, wrapAngle } from "./electromagnetics";
const colors = ["#6ee7b7", "#ffbb72", "#86b9ff"];
const names = ["A", "B", "C"];
export function Signals({ lesson, phase }: { lesson: SynchronousLesson; phase: number }) {
  const state = synchronousState(phase, lesson);
  const paths = useMemo(
    () =>
      lesson.phaseOffsets.map((offset) =>
        Array.from(
          { length: 121 },
          (_, i) =>
            `${i ? "L" : "M"}${28 + i * 2.3},${67 - 43 * Math.cos((i * TAU) / 120 + offset)}`,
        ).join(" "),
      ),
    [lesson.phaseOffsets],
  );
  const cursor = 28 + (wrapAngle(state.electrical) / TAU) * 276;
  const marker = useId();
  const endpoint = (a: number, r: number) => [115 + r * Math.cos(a), 100 - r * Math.sin(a)];
  const field = endpoint(state.electrical, 72),
    rotor = endpoint(phase, 55);
  return (
    <div className="lab-signals">
      <h4>Tres fases · 120° eléctricos</h4>
      <svg
        className="lab-waveform"
        viewBox="0 0 330 145"
        role="img"
        aria-label="Tres corrientes sinusoidales normalizadas, desfasadas 120 grados eléctricos; el cursor marca el instante actual."
      >
        {[24, 67, 110].map((y, i) => (
          <g key={y}>
            <line x1="28" x2="304" y1={y} y2={y} stroke="#304759" strokeDasharray="3 5" />
            <text x="4" y={y + 4}>
              {["+1", "0", "−1"][i]}
            </text>
          </g>
        ))}
        {paths.map((d, i) => (
          <path
            key={names[i]}
            d={d}
            fill="none"
            stroke={colors[i]}
            strokeWidth="2"
            strokeDasharray={[undefined, "7 3", "2 3"][i]}
          />
        ))}
        <line x1={cursor} x2={cursor} y1="16" y2="116" stroke="#d6e7ee" opacity="0.65" />
        {state.currents.map((v, i) => (
          <circle key={i} cx={cursor} cy={67 - v * 43} r="3.5" fill={colors[i]} />
        ))}
        <text x="28" y="135">
          0°
        </text>
        <text x="157" y="135">
          180°
        </text>
        <text x="280" y="135">
          360°
        </text>
      </svg>
      <div className="lab-phase-values">
        {names.map((name, i) => (
          <span key={name} style={{ color: colors[i] }}>
            Fase {name}
            <b data-phase={name}>{state.currents[i].toFixed(2)}</b>
          </span>
        ))}
      </div>
      <p>
        Valores relativos, sin unidades de corriente. Positivo y negativo indican sentidos opuestos.
      </p>
      <h4>Dirección equivalente del campo</h4>
      <svg
        className="lab-vector-diagram"
        viewBox="0 0 230 205"
        role="img"
        aria-label="Diagrama angular eléctrico: el vector del campo adelanta al eje del rotor con un ángulo constante; no representa líneas de flujo."
      >
        <defs>
          <marker
            id={`${marker}-field`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0L6 3L0 6" fill="none" stroke="#6ee7b7" />
          </marker>
          <marker
            id={`${marker}-rotor`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0L6 3L0 6" fill="none" stroke="#ffbb72" />
          </marker>
        </defs>
        <circle cx="115" cy="100" r="78" fill="#0a1724" stroke="#355264" />
        <path d="M20 100H210M115 10V190" stroke="#304759" strokeDasharray="3 5" />
        <text x="214" y="105">
          α
        </text>
        <text x="120" y="14">
          β
        </text>
        <line
          x1="115"
          y1="100"
          x2={field[0]}
          y2={field[1]}
          stroke="#6ee7b7"
          strokeWidth="2.5"
          markerEnd={`url(#${marker}-field)`}
        />
        <line
          x1="115"
          y1="100"
          x2={rotor[0]}
          y2={rotor[1]}
          stroke="#ffbb72"
          strokeWidth="2.5"
          markerEnd={`url(#${marker}-rotor)`}
        />
        <circle cx="115" cy="100" r="3" fill="#c9dce7" />
        <text x="115" y="202" textAnchor="middle">
          Ángulo eléctrico · no espacial
        </text>
      </svg>
      <div className="lab-vector-legend">
        <span>● Campo equivalente</span>
        <span>● Eje del rotor</span>
      </div>
      <p>
        El vector combina las tres fases en coordenadas αβ. Con {lesson.polePairs} pares de polos,
        una vuelta en este diagrama corresponde a 1/{lesson.polePairs} de vuelta mecánica.
      </p>
      <div className="lab-angle-values">
        <span>
          Eléctrico del campo
          <b data-testid="electrical-angle">
            {((wrapAngle(state.electrical) * 180) / Math.PI).toFixed(1)}°
          </b>
        </span>
        <span>
          Giro mecánico del rotor
          <b data-testid="mechanical-angle">
            {((wrapAngle(state.mechanical) * 180) / Math.PI).toFixed(1)}°
          </b>
        </span>
      </div>
    </div>
  );
}
