import type { ModelDefinition, Selection } from "../model";

export function PmsmDiagram({
  model,
  selection,
  onSelect,
}: {
  model: ModelDefinition;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}) {
  const color = (id: string) => model.components.find((component) => component.id === id)!.color;
  const selected = (id: string) => (selection?.componentId === id ? "#6ee7b7" : "#213a4b");
  return (
    <div className="lab-diagram">
      <svg
        viewBox="0 0 600 300"
        role="group"
        aria-label="Sección frontal didáctica del PMSM: carcasa y estator rodean al rotor; los imanes están sobre el rotor y el eje en el centro. El rodamiento se muestra superpuesto en el plano frontal."
      >
        <circle cx="300" cy="145" r="113" fill="none" stroke="#314456" strokeDasharray="3 6" />
        <circle
          cx="300"
          cy="145"
          r="102"
          fill={color("housing")}
          stroke={selected("housing")}
          strokeWidth="3"
        />
        <circle
          cx="300"
          cy="145"
          r="92"
          fill={color("stator")}
          stroke={selected("stator")}
          strokeWidth="3"
        />
        <circle cx="300" cy="145" r="80" fill="#101d2c" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30} 300 145)`}>
            <rect
              x="290"
              y="69"
              width="20"
              height="27"
              rx="4"
              fill={color("windings")}
              stroke={selected("windings")}
              strokeWidth="2"
            />
            <rect x="296" y="68" width="8" height="31" fill={color("stator")} />
          </g>
        ))}
        <circle
          cx="300"
          cy="145"
          r="49"
          fill={color("rotor")}
          stroke={selected("rotor")}
          strokeWidth="3"
        />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45} 300 145)`}>
            <path
              d="M 279 97 A 53 53 0 0 1 321 97 L 318 105 A 45 45 0 0 0 282 105 Z"
              fill={i % 2 ? "#53c9d3" : color("magnets")}
              stroke={selected("magnets")}
            />
            <text x="300" y="106" textAnchor="middle" fill="#fff" fontSize="8">
              {i % 2 ? "S" : "N"}
            </text>
          </g>
        ))}
        <circle
          cx="300"
          cy="145"
          r="25"
          fill="#172638"
          stroke={color("bearings")}
          strokeWidth="5"
        />
        {Array.from({ length: 10 }, (_, i) => (
          <circle
            key={i}
            cx={300 + 19 * Math.cos((i * Math.PI) / 5)}
            cy={145 + 19 * Math.sin((i * Math.PI) / 5)}
            r="3"
            fill={color("bearings")}
          />
        ))}
        <circle
          cx="300"
          cy="145"
          r="12"
          fill={color("shaft")}
          stroke={selected("shaft")}
          strokeWidth="3"
        />
        {model.components.map((component, i) => {
          const [x, y] = component.diagram.labelPosition;
          const [ax, ay] = component.diagram.anchor;
          const active = selection?.componentId === component.id;
          return (
            <g
              key={component.id}
              className="lab-diagram-label"
              role="button"
              tabIndex={0}
              aria-label={`Seleccionar ${component.name} en el esquema`}
              aria-pressed={active}
              onClick={() => onSelect({ componentId: component.id })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect({ componentId: component.id });
                }
              }}
            >
              <path
                d={`M ${x < 300 ? x + 57 : x - 11} ${y + 4} L ${ax} ${ay}`}
                fill="none"
                stroke={active ? "#6ee7b7" : "#61738a"}
              />
              <circle cx={ax} cy={ay} r="3" fill={component.color} />
              <rect
                x={x - 15}
                y={y - 12}
                width="115"
                height="36"
                rx="8"
                fill={active ? "#173a35" : "#142337"}
                stroke={active ? "#6ee7b7" : "#314456"}
              />
              <text x={x - 5} y={y + 10} fill={active ? "#a7f3d0" : "#d7e2ed"} fontSize="11">
                {String(i + 1).padStart(2, "0")} · {component.shortName}
              </text>
            </g>
          );
        })}
        <text x="300" y="277" textAnchor="middle" fill="#9eafc0" fontSize="11">
          Sección frontal esquemática · proporciones ilustrativas
        </text>
      </svg>
      <p>Selecciona una etiqueta o utiliza la lista de componentes para leer su función.</p>
    </div>
  );
}
