import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronDown,
  Crosshair,
  Maximize2,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { CameraCommand, ModelDefinition, Selection } from "./model";
import { useViewportVisibility } from "./useViewportVisibility";
import { useSeparation } from "./useSeparation";
import { AssemblyControls } from "./AssemblyControls";
import { usePlayback } from "./operation/usePlayback";
import { OperationPanel } from "./operation/OperationPanel";
import { OperationLessons } from "./operation/OperationLessons";
import { SimulationPanel } from "./simulation/SimulationPanel";
import { SimulationLessons } from "./simulation/SimulationLessons";
import { useSimulation } from "./simulation/useSimulation";
import { visualCyclesPerSecond } from "./simulation/physics";
import { Viewport } from "./viewer/Viewport";
import "./lab.css";

type DiagramProps = {
  model: ModelDefinition;
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

export function Lab({
  model,
  Diagram,
}: {
  model: ModelDefinition;
  Diagram: ComponentType<DiagramProps>;
}) {
  const separation = useSeparation();
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const viewport = useViewportVisibility();
  const [lessonMode, setLessonMode] = useState<"explore" | "operation" | "simulation">("explore");
  const operationEnabled = lessonMode === "operation";
  const simulationEnabled = lessonMode === "simulation";
  const simulation = useSimulation(model.simulation);
  const playback = usePlayback(
    simulationEnabled
      ? visualCyclesPerSecond(
          simulation.point.angularSpeed,
          simulation.timeScale,
          model.operation?.polePairs ?? 1,
        )
      : (model.operation?.displayCyclesPerSecond ?? 0.5),
    model.operation?.polePairs ?? 1,
    simulationEnabled ? 1 : undefined,
    mode === "3d" && !viewport.visible,
  );
  const [showField, setShowField] = useState(true);
  const { pause } = playback;
  const changeLesson = (next: typeof lessonMode) => {
    pause();
    setLessonMode(next);
  };
  const blockedByAssembly = separation.value > 0 || separation.moving;
  const assemblySeparation = {
    ...separation,
    moveTo: (value: number, duration?: number) => {
      pause();
      separation.moveTo(value, duration);
    },
  };
  const [transparency, setTransparency] = useState(0);
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [lessonControlsReady, setLessonControlsReady] = useState(false);
  const [command, setCommand] = useState<CameraCommand>({ sequence: 0, action: "reset" });
  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
    setLessonControlsReady(true);
  }, []);
  const onSelect = useCallback(
    (value: Selection) => {
      setSelection(value);
      setIsolatedId((previous) => (previous ? (value?.componentId ?? null) : null));
      if (isolatedId && value?.componentId === model.transparency?.componentId) setTransparency(0);
    },
    [isolatedId, model.transparency?.componentId],
  );
  const { stop } = separation;
  useEffect(() => {
    if (mode !== "3d" || !sceneReady) stop();
  }, [mode, sceneReady, stop]);
  useEffect(() => {
    pause();
  }, [mode, lessonMode, pause]);
  useEffect(() => {
    if ((mode === "3d" && !sceneReady) || blockedByAssembly) pause();
  }, [mode, sceneReady, blockedByAssembly, pause]);
  useEffect(() => {
    if (simulationEnabled && simulation.point.angularSpeed === 0) pause();
  }, [simulationEnabled, simulation.point.angularSpeed, pause]);
  const blocked = blockedByAssembly
    ? "Ensambla el motor al 0% para iniciar el funcionamiento."
    : mode === "3d" && !sceneReady
      ? simulationEnabled
        ? "El visor 3D no está disponible. Puedes seguir calculando y usar el esquema 2D."
        : "Elige Esquema 2D para explorar las señales sin WebGL."
      : null;
  const fieldHidden = blockedByAssembly || !!isolatedId;
  const selected = model.components.find((component) => component.id === selection?.componentId);
  const selectedPart = selected?.parts.find((part) => part.id === selection?.partId);
  const issue = (action: CameraCommand["action"]) =>
    setCommand((previous) => ({ sequence: previous.sequence + 1, action }));
  const reset = () => {
    playback.reset();
    separation.reset();
    setTransparency(0);
    setIsolatedId(null);
    setSelection(null);
    issue("reset");
  };
  const fallback = <Diagram model={model} selection={selection} onSelect={onSelect} />;
  return (
    <div className="ev-lab" lang="es">
      <a className="lab-skip" href="#lab-components">
        Ir a componentes y explicaciones
      </a>
      <div className="lab-atmosphere" aria-hidden="true" />
      <nav className="lab-nav" aria-label="Navegación del laboratorio">
        <Link to="/" className="lab-brand">
          <span className="lab-monogram">PC</span>
          <span>
            Pura Academy<span className="lab-brand-sub">by Pura Corriente</span>
          </span>
        </Link>
        <Link to="/guias" className="lab-back">
          <ArrowLeft size={15} /> Volver a guías
        </Link>
      </nav>
      <main className="lab-main">
        <header className="lab-header">
          <div>
            <p className="lab-eyebrow">
              <span /> EV INTERACTIVE LAB <span className="lab-divider">/</span>{" "}
              {model.lesson.section}
            </p>
            <h1>
              {model.lesson.headline[0]} <em>{model.lesson.headline[1]}</em>
            </h1>
            <p className="lab-intro">{model.lesson.intro}</p>
          </div>
          <div className="lab-resource-tag">
            <Box size={20} />
            <div>
              <strong>{model.lesson.shortName}</strong>
              <span>
                Recurso {model.representation.kind === "generic" ? "genérico" : "específico"} · v
                {model.resourceVersion}
              </span>
            </div>
          </div>
        </header>

        <div
          className={`lab-workbench${(operationEnabled && model.operation) || (simulationEnabled && model.simulation) ? " is-operating" : ""}`}
        >
          <section className="lab-viewer-card" aria-label="Exploración del modelo">
            <div className="lab-viewer-head">
              <div>
                <span className="lab-small-label">{model.lesson.shortName.toUpperCase()}</span>
                <h2>{model.name}</h2>
                {model.operation && (
                  <div className="lab-lesson-modes" role="group" aria-label="Modo educativo">
                    <button
                      className="lab-operation-toggle"
                      aria-pressed={lessonMode === "explore"}
                      disabled={!lessonControlsReady}
                      onClick={() => changeLesson("explore")}
                    >
                      Explorar
                    </button>
                    <button
                      className="lab-operation-toggle"
                      aria-pressed={operationEnabled}
                      disabled={!lessonControlsReady}
                      onClick={() => changeLesson("operation")}
                    >
                      Cómo funciona
                    </button>
                    {model.simulation && (
                      <button
                        className="lab-operation-toggle"
                        aria-pressed={simulationEnabled}
                        disabled={!lessonControlsReady}
                        onClick={() => changeLesson("simulation")}
                      >
                        Simular
                      </button>
                    )}
                    {!lessonControlsReady && (
                      <span className="sr-only" role="status">
                        Preparando los modos educativos…
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="lab-mode" role="group" aria-label="Tipo de vista">
                <button
                  aria-pressed={mode === "3d"}
                  onClick={() => {
                    pause();
                    setMode("3d");
                  }}
                >
                  <Box size={14} />
                  3D
                </button>
                <button
                  aria-pressed={mode === "2d"}
                  onClick={() => {
                    pause();
                    setMode("2d");
                  }}
                >
                  Esquema 2D
                </button>
              </div>
            </div>
            <div
              ref={viewport.ref}
              className="lab-stage"
              tabIndex={mode === "3d" && sceneReady ? 0 : -1}
              role="group"
              aria-label="Visor del modelo"
              aria-describedby="lab-camera-help"
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget || mode !== "3d" || !sceneReady) return;
                const actions: Record<string, CameraCommand["action"]> = {
                  ArrowLeft: "left",
                  ArrowRight: "right",
                  ArrowUp: "up",
                  ArrowDown: "down",
                  "+": "zoom-in",
                  "=": "zoom-in",
                  "-": "zoom-out",
                  Home: "reset",
                };
                if (event.key === "Escape") {
                  setEnabled(false);
                  return;
                }
                if (actions[event.key]) {
                  event.preventDefault();
                  if (event.key === "Home") reset();
                  else issue(actions[event.key]);
                }
              }}
            >
              <div className="lab-stage-grid" aria-hidden="true" />
              <span className="lab-section-tag">
                {mode === "3d" && sceneReady ? model.lesson.viewLabel : "ESQUEMA EDUCATIVO"}
              </span>
              {mode === "3d" ? (
                <Viewport
                  key={model.id}
                  model={model}
                  selection={selection}
                  onSelect={onSelect}
                  enabled={enabled}
                  separation={separation.value}
                  transparency={transparency}
                  isolatedId={isolatedId}
                  operationPhase={playback.phase}
                  fieldVisible={operationEnabled && showField && !fieldHidden}
                  command={command}
                  fallback={fallback}
                  onAvailabilityChange={setSceneReady}
                />
              ) : (
                fallback
              )}

              <div className="lab-stage-bottom">
                <span className="lab-axis" aria-hidden="true">
                  <i /> X <i /> Y <i /> Z
                </span>
                {mode === "3d" && sceneReady && (
                  <button
                    className="lab-gesture"
                    aria-pressed={enabled}
                    onClick={() => setEnabled((value) => !value)}
                  >
                    <MousePointer2 size={14} />
                    {enabled ? "Pausar interacción" : "Activar exploración"}
                  </button>
                )}
              </div>
            </div>
            <div className="lab-viewer-footer">
              <p id="lab-camera-help">
                {mode === "3d" && sceneReady
                  ? enabled
                    ? "Arrastra para girar · rueda o pellizco para zoom. Pausa para desplazar la página sobre el visor."
                    : "Activa la exploración para girar con el dedo o el mouse. También puedes usar los botones."
                  : "Explora los componentes sin necesidad de gráficos 3D."}
              </p>
              {mode === "3d" && sceneReady && (
                <div className="lab-camera-tools" role="group" aria-label="Controles de cámara">
                  <button onClick={() => issue("zoom-in")} aria-label="Acercar">
                    <Plus size={18} />
                  </button>
                  <button onClick={() => issue("zoom-out")} aria-label="Alejar">
                    <Minus size={18} />
                  </button>
                  <span />
                  <button onClick={() => issue("left")} aria-label="Girar a la izquierda">
                    <ArrowLeft size={17} />
                  </button>
                  <button onClick={() => issue("right")} aria-label="Girar a la derecha">
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
              <button className="lab-reset" onClick={reset}>
                <RotateCcw size={15} />
                Restablecer vista
              </button>
            </div>
            {mode === "3d" && sceneReady ? (
              <AssemblyControls
                model={model}
                separation={assemblySeparation}
                transparency={transparency}
                setTransparency={setTransparency}
                selectedId={selection?.componentId ?? null}
                isolatedId={isolatedId}
                setIsolatedId={setIsolatedId}
              />
            ) : (
              <p className="lab-2d-note">
                El esquema 2D muestra el modelo ensamblado. Los ajustes de exploración se conservan
                para volver al visor 3D.
              </p>
            )}
          </section>

          {operationEnabled && model.operation && (
            <aside className="lab-electrical" aria-label="Herramientas de funcionamiento eléctrico">
              <OperationPanel
                lesson={model.operation}
                playback={playback}
                blocked={blocked}
                showField={showField}
                setShowField={setShowField}
                fieldHidden={fieldHidden}
                is2d={mode === "2d" || !sceneReady}
              />
            </aside>
          )}

          {simulationEnabled && model.simulation && (
            <aside className="lab-electrical" aria-label="Herramientas de simulación">
              <SimulationPanel
                definition={model.simulation}
                simulation={simulation}
                playback={playback}
                blocked={blocked}
                is2d={mode === "2d" || !sceneReady}
              />
            </aside>
          )}

          <section
            className="lab-components"
            id="lab-components"
            aria-label="Componentes del modelo"
          >
            <div className="lab-components-heading">
              <h2>Explora sus componentes</h2>
              <span>{model.components.length} partes de un mismo sistema</span>
            </div>
            <div className="lab-component-list">
              {model.components.map((component, i) => (
                <button
                  key={component.id}
                  aria-pressed={selected?.id === component.id}
                  aria-label={`Seleccionar ${component.name}`}
                  onClick={() => onSelect({ componentId: component.id })}
                >
                  <span className="lab-component-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="lab-component-dot" style={{ background: component.color }} />
                  <span>{component.shortName}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </section>

          <section className="lab-education" aria-label="Explicación del componente">
            <div>
              <div className="lab-education-top">
                <span className="lab-small-label">ENTIENDE CADA PIEZA</span>
                <span className="lab-number">
                  {selected
                    ? String(model.components.indexOf(selected) + 1).padStart(2, "0")
                    : `01–${String(model.components.length).padStart(2, "0")}`}
                </span>
              </div>
              <div className="lab-component-copy" aria-live="polite" aria-atomic="true">
                <div
                  className="lab-component-symbol"
                  style={{ color: selected?.color ?? "#6ee7b7" }}
                >
                  {selected ? (
                    <Box size={31} strokeWidth={1.25} />
                  ) : (
                    <Zap size={31} strokeWidth={1.25} />
                  )}
                </div>
                <p className="lab-small-label">
                  {selected ? "COMPONENTE SELECCIONADO" : "EL PRINCIPIO"}
                </p>
                <h2>{selected?.name ?? model.lesson.overviewTitle}</h2>
                <p className="lab-function">
                  {selected?.education.function ?? model.lesson.overviewFunction}
                </p>
                {selectedPart && <p className="lab-part-name">Pieza: {selectedPart.label}</p>}
                <div className="lab-explanation">
                  <h3>{selected ? "Cómo funciona" : "Explora a tu ritmo"}</h3>
                  <p>
                    {selected?.education.explanation ??
                      "Selecciona una pieza del modelo o de la lista de componentes. Verás para qué sirve y cómo se relaciona con el resto del sistema."}
                  </p>
                </div>
                <div className="lab-connection">
                  <span className="lab-connection-line" />
                  <h3>{selected ? "Su papel en el sistema" : model.lesson.overviewQuestion}</h3>
                  <p>{selected?.education.relationship ?? model.lesson.overviewAnswer}</p>
                </div>
              </div>
              {selected && mode === "3d" && sceneReady && (
                <button className="lab-focus" onClick={() => issue("focus")}>
                  <Crosshair size={16} />
                  Enfocar componente
                  <Maximize2 size={14} />
                </button>
              )}
              <p className="lab-education-hint">También puedes seleccionar con el teclado.</p>
            </div>
          </section>
          {operationEnabled && model.operation && <OperationLessons lesson={model.operation} />}
          {simulationEnabled && model.simulation && <SimulationLessons />}
        </div>

        <section className="lab-note" aria-label="Alcance del recurso educativo">
          <ShieldCheck size={20} />
          <div>
            <strong>Una tecnología, muchas implementaciones.</strong>
            <p>
              {model.representation.notice} Compartir tecnología no significa compartir diseño,
              materiales o prestaciones.
            </p>
            <details>
              <summary>
                Acerca de esta representación <ChevronDown size={14} />
              </summary>
              <ul>
                {model.representation.simplifications.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <p className="lab-keyboard-note">
                Teclado en el visor: flechas para girar, + y − para zoom, Inicio para restablecer y
                Escape para pausar los gestos.
              </p>
              {model.references.map((reference) => (
                <p key={reference.id}>
                  <a href={reference.url} target="_blank" rel="noopener noreferrer">
                    {reference.title} ↗
                  </a>
                  <span className="lab-reference-scope">{reference.scope}</span>
                </p>
              ))}
            </details>
          </div>
        </section>
      </main>
      <footer className="lab-footer">
        <span>
          PURA CORRIENTE <span> / </span> Aprender para moverse mejor.
        </span>
        <span>EV INTERACTIVE LAB · 01</span>
      </footer>
    </div>
  );
}
