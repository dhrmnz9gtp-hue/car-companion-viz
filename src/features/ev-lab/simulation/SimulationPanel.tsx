import type { SimulationDefinition } from "./definition";
import type { useSimulation } from "./useSimulation";
import type { usePlayback } from "../operation/usePlayback";
import { angularSpeedToRpm, calculatePoint, rpmToAngularSpeed, wattsToHp } from "./physics";
import { ParameterControl } from "./ParameterControl";
import { Comparison, PowerBalance, PowerCurve } from "./Charts";

const formatter = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const format = (value: number) => formatter.format(value);

export function SimulationPanel({
  definition,
  simulation,
  playback,
  blocked,
  is2d,
}: {
  definition: SimulationDefinition;
  simulation: ReturnType<typeof useSimulation>;
  playback: ReturnType<typeof usePlayback>;
  blocked: string | null;
  is2d: boolean;
}) {
  const { point, active, points, timeScale, update } = simulation;
  const rpm = angularSpeedToRpm(point.angularSpeed);
  const result = calculatePoint(point);
  const stopped =
    blocked ??
    (is2d
      ? "El esquema 2D es estático. Los cálculos siguen disponibles."
      : rpm === 0
        ? "0 rpm: el rotor permanece detenido."
        : null);
  return (
    <section className="lab-simulation" aria-label="Simulador educativo de potencia">
      <span className="lab-small-label">DE UN GIRO A LA POTENCIA</span>
      <h3>Simular para entender.</h3>
      <p className="lab-operation-notice">
        Punto estable e ilustrativo. La eficiencia es un supuesto; estos valores no predicen
        prestaciones de un motor comercial.
      </p>
      <div className="lab-sim-scenarios" role="group" aria-label="Escenario que estás editando">
        {([0, 1] as const).map((i) => (
          <button key={i} aria-pressed={active === i} onClick={() => simulation.setActive(i)}>
            Escenario {i === 0 ? "A" : "B"}
          </button>
        ))}
      </div>
      <div key={active}>
        <ParameterControl
          label="Velocidad mecánica · rpm"
          value={rpm}
          min={0}
          max={Math.round(angularSpeedToRpm(definition.bounds.angularSpeed[1]))}
          step={50}
          onChange={(v) => update("angularSpeed", rpmToAngularSpeed(v))}
        />
        <ParameterControl
          label="Torque · Nm"
          value={point.torque}
          min={definition.bounds.torque[0]}
          max={definition.bounds.torque[1]}
          step={5}
          onChange={(v) => update("torque", v)}
        />
        <ParameterControl
          label="Eficiencia supuesta · %"
          value={point.efficiency * 100}
          min={definition.bounds.efficiency[0] * 100}
          max={definition.bounds.efficiency[1] * 100}
          step={1}
          onChange={(v) => update("efficiency", v / 100)}
        />
      </div>
      <div className="lab-sim-output" role="status" aria-live="polite" aria-atomic="true">
        <span>Potencia mecánica de salida</span>
        <strong data-testid="sim-mechanical">
          {format(result.mechanical / 1000)} <small>kW</small>
        </strong>
        <b data-testid="sim-hp">≈ {format(wattsToHp(result.mechanical))} hp</b>
        <span>hp mecánicos · potencia del eje</span>
      </div>
      <dl className="lab-sim-results">
        <div>
          <dt>Velocidad angular</dt>
          <dd data-testid="sim-omega">{format(point.angularSpeed)} rad/s</dd>
        </div>
        <div>
          <dt>Entrada eléctrica estimada</dt>
          <dd data-testid="sim-electrical">{format(result.electrical / 1000)} kW</dd>
        </div>
        <div>
          <dt>Pérdidas estimadas</dt>
          <dd data-testid="sim-losses">{format(result.losses / 1000)} kW</dd>
        </div>
      </dl>
      <details className="lab-sim-animation" open>
        <summary>Ver el giro a cámara lenta</summary>
        <div className="lab-playback-buttons">
          <button onClick={playback.start} disabled={!!stopped || playback.running}>
            Iniciar
          </button>
          <button onClick={playback.pause} disabled={!playback.running}>
            Pausar
          </button>
          <button onClick={playback.reset}>Reiniciar giro</button>
        </div>
        <label className="lab-speed-label">
          Escala temporal visual
          <select
            value={timeScale}
            onChange={(e) => simulation.setTimeScale(Number(e.target.value))}
          >
            {definition.timeScales.map((scale) => (
              <option key={scale} value={scale}>
                1:{Math.round(1 / scale)} · {Math.round(1 / scale)} veces más lento
              </option>
            ))}
          </select>
        </label>
        <p data-testid="sim-visual-speed">
          {format(rpm)} rpm del cálculo → {format(rpm * timeScale)} rpm visuales.
        </p>
        <p className="lab-playback-status" role="status">
          {stopped ??
            (playback.running
              ? playback.suspended
                ? "En pausa por visibilidad; vuelve al visor para continuar."
                : "Reproduciendo"
              : "En pausa")}
        </p>
        <p>
          El torque no acelera el rotor. Cambiar de modo o desmontar pausa el giro; ensambla al 0%
          para reanudar.
        </p>
        {playback.reducedMotion && (
          <p>Movimiento reducido: el giro solo empieza al pulsar Iniciar.</p>
        )}
      </details>
      <PowerCurve
        point={point}
        definition={definition}
        axis={simulation.axis}
        setAxis={simulation.setAxis}
      />
      <PowerBalance point={point} />
      <Comparison points={points} />
      <button
        className="lab-sim-reset"
        onClick={() => {
          playback.reset();
          simulation.reset();
        }}
      >
        Restablecer escenarios
      </button>
      <p className="lab-sim-unit-note">
        kW y hp miden potencia. kWh mide energía: 100 kW durante media hora equivalen a 50 kWh.
      </p>
    </section>
  );
}
