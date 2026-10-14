import type { ModelDefinition } from "./model";
import type { useSeparation } from "./useSeparation";

export function AssemblyControls({
  model,
  separation,
  transparency,
  setTransparency,
  selectedId,
  isolatedId,
  setIsolatedId,
}: {
  model: ModelDefinition;
  separation: ReturnType<typeof useSeparation>;
  transparency: number;
  setTransparency: (value: number) => void;
  selectedId: string | null;
  isolatedId: string | null;
  setIsolatedId: (value: string | null) => void;
}) {
  const selected = model.components.find((c) => c.id === selectedId);
  const shell = model.components.find((c) => c.id === model.transparency?.componentId);
  return (
    <section className="lab-assembly-controls" aria-label="Desmontaje y visibilidad">
      {model.capabilities.explode && (
        <>
          <div className="lab-assembly-heading">
            <div>
              <span className="lab-small-label">EXPLORA POR CONJUNTOS</span>
              <h3>Del conjunto a cada pieza.</h3>
            </div>
            <div className="lab-assembly-actions">
              <button
                onClick={() => separation.moveTo(1)}
                disabled={separation.value === 1 && !separation.moving}
              >
                Desmontar
              </button>
              <button
                onClick={() => separation.moveTo(0)}
                disabled={separation.value === 0 && !separation.moving}
              >
                Ensamblar
              </button>
              <button onClick={separation.stop} disabled={!separation.moving}>
                Detener
              </button>
            </div>
          </div>
          <div className="lab-range-label">
            <label htmlFor="lab-separation">Nivel de separación</label>
            <output htmlFor="lab-separation">{Math.round(separation.target * 100)}%</output>
          </div>
          <input
            id="lab-separation"
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(separation.target * 100)}
            aria-valuetext={`${Math.round(separation.target * 100)} por ciento`}
            onChange={(event) => separation.moveTo(Number(event.target.value) / 100, 180)}
          />
          <div className="lab-range-ends">
            <span>0% · Ensamblado</span>
            <span>
              {separation.moving
                ? `En movimiento · ${Math.round(separation.value * 100)}%`
                : "Posición estable"}
            </span>
            <span>100% · Desmontado</span>
          </div>
          <p className="lab-assembly-description">{model.disassembly?.description}</p>
        </>
      )}
      <div className="lab-visibility-controls">
        {model.capabilities.transparency && (
          <div>
            <div className="lab-range-label">
              <label htmlFor="lab-transparency">Transparencia · {shell?.shortName}</label>
              <output htmlFor="lab-transparency">{Math.round(transparency * 100)}%</output>
            </div>
            <input
              id="lab-transparency"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(transparency * 100)}
              aria-valuetext={`${Math.round(transparency * 100)} por ciento`}
              onChange={(event) => setTransparency(Number(event.target.value) / 100)}
            />
            <p className="lab-assembly-description">{model.transparency?.description}</p>
          </div>
        )}
        {model.capabilities.isolation && (
          <div className="lab-isolation">
            <span className="lab-small-label">
              {isolatedId ? "VISTA AISLADA" : "OBSERVAR UN COMPONENTE"}
            </span>
            <p>{selected ? selected.name : "Selecciona una pieza para aislarla."}</p>
            <div className="lab-assembly-actions">
              <button
                disabled={!selected || isolatedId === selected.id}
                onClick={() => {
                  if (selected) {
                    setIsolatedId(selected.id);
                    if (selected.id === shell?.id) setTransparency(0);
                  }
                }}
              >
                Aislar componente
              </button>
              <button disabled={!isolatedId} onClick={() => setIsolatedId(null)}>
                Mostrar todo
              </button>
            </div>
            {isolatedId && (
              <p className="lab-assembly-description" role="status">
                Solo se muestra {selected?.name.toLowerCase()}. La lista permite cambiar de
                componente.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
