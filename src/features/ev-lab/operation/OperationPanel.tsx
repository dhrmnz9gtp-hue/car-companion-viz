import type { SynchronousLesson } from "../model";
import type { usePlayback } from "./usePlayback";
import { synchronousRpm } from "./electromagnetics";
import { Signals } from "./Signals";
export function OperationPanel({
  lesson,
  playback,
  blocked,
  showField,
  setShowField,
  fieldHidden,
  is2d,
}: {
  lesson: SynchronousLesson;
  playback: ReturnType<typeof usePlayback>;
  blocked: string | null;
  showField: boolean;
  setShowField: (value: boolean) => void;
  fieldHidden: boolean;
  is2d: boolean;
}) {
  return (
    <section className="lab-operation" aria-label="Funcionamiento electromagnético">
      <span className="lab-small-label">DE LAS CORRIENTES AL MOVIMIENTO</span>
      <h3>Un giro coordinado.</h3>
      <p className="lab-operation-notice">
        Representación didáctica. No es un cálculo de campo magnético ni un simulador industrial.
      </p>
      <div className="lab-playback-buttons">
        <button onClick={playback.start} disabled={!!blocked || playback.running}>
          Iniciar
        </button>
        <button onClick={playback.pause} disabled={!playback.running}>
          Pausar
        </button>
        <button onClick={playback.reset}>Restablecer funcionamiento</button>
      </div>
      <p className="lab-playback-status" role="status">
        {blocked ?? (playback.running ? "Reproduciendo" : "En pausa")}
      </p>
      <label className="lab-speed-label">
        Velocidad de reproducción
        <select value={playback.speed} onChange={(e) => playback.setSpeed(Number(e.target.value))}>
          <option value="0.25">0,25× · muy lento</option>
          <option value="0.5">0,5× · lento</option>
          <option value="1">1× · didáctico</option>
          <option value="2">2× · rápido</option>
        </select>
      </label>
      <p>
        A 1× se muestran {lesson.displayCyclesPerSecond} ciclos eléctricos por segundo. Es tiempo de
        reproducción, no la velocidad real del motor.
      </p>
      {playback.reducedMotion && (
        <p>
          Movimiento reducido activo: la reproducción solo comienza al pulsar Iniciar. También
          puedes avanzar manualmente.
        </p>
      )}
      <label className="lab-cycle-label" htmlFor="lab-cycle">
        Avanzar manualmente · ciclo eléctrico
      </label>
      <input
        id="lab-cycle"
        type="range"
        min="0"
        max={360 * lesson.polePairs}
        step="1"
        value={(playback.phase * 180) / Math.PI}
        disabled={!!blocked}
        onChange={(e) => playback.seek(Number(e.target.value))}
        aria-valuetext={`${((playback.phase * 180) / Math.PI).toFixed(0)} grados eléctricos acumulados`}
      />
      <p>
        El control manual pausa el giro. Al desmontar también se pausa; ensambla al 0% para
        reanudar.
      </p>
      <label className="lab-field-toggle">
        <input
          type="checkbox"
          checked={showField}
          onChange={(e) => setShowField(e.target.checked)}
        />{" "}
        Mostrar referencia angular en 3D
      </label>
      <p>
        {is2d
          ? "El esquema de piezas 2D es estático. Las señales y el diagrama angular de abajo sí representan el funcionamiento."
          : fieldHidden
            ? "La referencia 3D se oculta al separar o aislar piezas; las explicaciones siguen disponibles."
            : "Verde: avance angular del campo. Ámbar: referencia del rotor. Son marcadores, no líneas de flujo ni polos adicionales."}
      </p>
      <Signals lesson={lesson} phase={playback.phase} />
      <div className="lab-speed-formula">
        <strong>Frecuencia → velocidad síncrona</strong>
        <code>nₛ = 60 fₑ / p</code>
        <span>
          {lesson.referenceFrequencyHz} Hz · {lesson.polePairs} pares de polos →{" "}
          <b>{synchronousRpm(lesson.referenceFrequencyHz, lesson.polePairs)} rpm</b>
        </span>
        <p>Ejemplo ideal calculado. La animación está ralentizada y no reproduce estas rpm.</p>
      </div>
      <div className="lab-operation-lessons">
        {lesson.lessons.map((item) => (
          <details key={item.title}>
            <summary>{item.title}</summary>
            <p>{item.text}</p>
          </details>
        ))}
      </div>
      <details className="lab-operation-limits">
        <summary>Qué representa y qué omite</summary>
        <ul>
          {lesson.limitations.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
