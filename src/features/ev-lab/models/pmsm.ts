import { motorPowerLesson } from "../simulation/definition";
import type { ComponentDefinition, ModelDefinition, PartDefinition, Vec3 } from "../model";

const PI = Math.PI;
const fixed = "pmsm.fixed";
const rotating = "pmsm.rotating";
const cut = { start: PI / 2, sweep: PI * 1.5 };
const part = (
  id: string,
  label: string,
  geometry: PartDefinition["geometry"],
  position: Vec3 = [0, 0, 0],
  assemblyId = fixed,
): PartDefinition => ({ id, label, geometry, position, assemblyId });
const ring = (
  inner: number,
  outer: number,
  length: number,
  section = false,
): PartDefinition["geometry"] => ({
  kind: "annulus",
  inner,
  outer,
  length,
  ...(section ? cut : {}),
});

const housing: PartDefinition[] = [
  part("housing.shell", "Carcasa seccionada", ring(1.78, 1.91, 2.55, true)),
  ...Array.from({ length: 7 }, (_, i) =>
    part(`housing.fin.${i + 1}`, `Nervadura ${i + 1}`, ring(1.9, 2.02, 0.065, true), [
      0,
      0,
      -1.05 + i * 0.35,
    ]),
  ),
  ...[-1, 1].flatMap((side) => [
    part(`housing.end.${side}`, "Tapa de apoyo seccionada", ring(0.47, 1.79, 0.12, true), [
      0,
      0,
      side * 1.46,
    ]),
    part(`housing.foot.${side}`, "Apoyo de montaje", { kind: "box", size: [2.2, 0.16, 0.46] }, [
      0,
      -1.95,
      side * 0.86,
    ]),
  ]),
];

// Nine of twelve teeth remain in the fixed quarter cutaway. Tooth tips and coils
// are outside the magnet radius, leaving an intentionally exaggerated air gap.
const toothAngles = Array.from({ length: 9 }, (_, i) => ((i + 3) * PI) / 6 + PI / 12);
const stator: PartDefinition[] = [
  part("stator.yoke", "Yugo del estator", ring(1.6, 1.77, 2.3, true)),
];
const coils: PartDefinition[] = [];
toothAngles.forEach((angle, i) => {
  const tooth = part(
    `stator.tooth.${i + 1}`,
    `Diente ${i + 1}`,
    { kind: "box", size: [0.57, 0.21, 2.3] },
    [1.355 * Math.cos(angle), 1.355 * Math.sin(angle), 0],
  );
  tooth.rotation = [0, 0, angle];
  stator.push(tooth);
  // A concentrated winding wraps a radial tooth: axial sides in the slots and
  // end turns beyond both ends of the laminated core. It never crosses the rotor.
  const points: Vec3[] = [];
  const perimeter = [
    [-0.16, -1.16],
    [-0.16, -1.25],
    [-0.11, -1.31],
    [0.11, -1.31],
    [0.16, -1.25],
    [0.16, -1.16],
    [0.16, 1.16],
    [0.16, 1.25],
    [0.11, 1.31],
    [-0.11, 1.31],
    [-0.16, 1.25],
    [-0.16, 1.16],
  ];
  for (let turn = 0; turn < 5; turn++) {
    perimeter.forEach(([tangent, z], index) => {
      const radius = 1.15 + (turn + index / perimeter.length) * 0.087;
      points.push([
        radius * Math.cos(angle) - tangent * Math.sin(angle),
        radius * Math.sin(angle) + tangent * Math.cos(angle),
        z,
      ]);
    });
  }
  const coil = part(`windings.coil.${i + 1}`, `Bobina ${i + 1} · fase ${["A", "B", "C"][i % 3]}`, {
    kind: "tube",
    points,
    radius: 0.029,
    segments: 180,
  });
  coil.color = ["#ed9851", "#edb66c", "#c87d44"][i % 3];
  coils.push(coil);
});

const magnets = Array.from({ length: 8 }, (_, i) => {
  const magnet = part(
    `magnets.pole.${i + 1}`,
    `Imán ${i + 1} · polo ${i % 2 ? "S" : "N"}`,
    {
      kind: "annulus",
      inner: 0.83,
      outer: 0.98,
      length: 2.08,
      start: (i * PI) / 4 + 0.045,
      sweep: PI / 4 - 0.09,
    },
    [0, 0, 0],
    rotating,
  );
  magnet.color = i % 2 ? "#53c9d3" : "#e46b70";
  return magnet;
});

const bearings = [-1, 1].flatMap((side) => [
  part(
    `bearings.inner.${side}`,
    "Pista interior del rodamiento",
    ring(0.22, 0.29, 0.22),
    [0, 0, side * 1.46],
    rotating,
  ),
  part(`bearings.outer.${side}`, "Pista exterior del rodamiento", ring(0.42, 0.49, 0.22), [
    0,
    0,
    side * 1.46,
  ]),
  ...Array.from({ length: 10 }, (_, i) =>
    part(
      `bearings.ball.${side}.${i + 1}`,
      `Bola ${i + 1} · rodamiento ${side < 0 ? "trasero" : "delantero"}`,
      { kind: "sphere", radius: 0.071 },
      [0.355 * Math.cos((i * PI) / 5), 0.355 * Math.sin((i * PI) / 5), side * 1.46],
    ),
  ),
]);

function component(
  id: string,
  name: string,
  shortName: string,
  color: string,
  parts: PartDefinition[],
  education: ComponentDefinition["education"],
  target: Vec3,
  explodeDirection: Vec3,
  labelPosition: [number, number],
  anchor: [number, number],
): ComponentDefinition {
  return {
    id,
    name,
    shortName,
    color,
    parts,
    education,
    position: [0, 0, 0],
    explodeDirection,
    focus: { position: [target[0] + 3.2, target[1] + 2.3, target[2] + 4.5], target },
    diagram: { labelPosition, anchor },
  };
}

export const pmsmModel: ModelDefinition = {
  id: "motor-pmsm-generico",
  name: "Motor síncrono de imanes permanentes",
  technology: "motor.pmsm",
  description:
    "Explora cómo la electricidad se transforma en movimiento. Siete componentes, un mismo sistema.",
  resourceVersion: "1.3.0",
  lesson: {
    section: "01 · PROPULSIÓN",
    shortName: "Motor PMSM",
    headline: ["La energía se vuelve", "movimiento."],
    intro:
      "Descubre un motor eléctrico desde adentro. Gira el modelo, elige una pieza y entiende cómo trabaja con las demás.",
    viewLabel: "CORTE DIDÁCTICO",
    overviewTitle: "Un campo que gira. Un rotor que lo sigue.",
    overviewFunction:
      "La corriente crea un campo magnético giratorio. Su interacción con los imanes produce el movimiento del rotor.",
    overviewQuestion: "¿Por qué «síncrono»?",
    overviewAnswer:
      "En funcionamiento síncrono, el rotor y el campo magnético giratorio mantienen la misma velocidad. El inversor controla las corrientes que alimentan al estator.",
  },
  representation: {
    kind: "generic",
    notice:
      "Representación genérica y didáctica. No reproduce un motor de Tesla, BYD ni otro fabricante.",
    simplifications: [
      "Corte fijo de un cuarto de la carcasa y del estator para descubrir el interior. El motor real está cerrado.",
      "Variante con imanes superficiales (SPMSM). También existen PMSM con imanes interiores y otras geometrías.",
      "Entrehierro ampliado, vueltas de cobre reducidas y conexiones entre bobinas omitidas para facilitar la lectura. Los colores de los imanes indican polos, no materiales reales.",
      "Geometría ilustrativa sin escala de fabricación. No calcula torque, potencia, velocidad ni eficiencia.",
    ],
  },
  resource: { kind: "procedural", units: "illustrative" },
  assemblies: [
    { id: fixed, pivot: [0, 0, 0] },
    { id: rotating, parentId: fixed, pivot: [0, 0, 0], axis: [0, 0, 1] },
  ],
  disassembly: {
    description:
      "Las tapas y los rodamientos se retiran primero. Eje, rotor e imanes viajan juntos; estator y bobinas conservan su unión. Es una secuencia didáctica, no un procedimiento de mantenimiento.",
    cameraExpansion: 1.6,
    groups: [
      ...[-1, 1].map((side) => ({
        id: `pmsm.support.${side}`,
        partIds: [
          `housing.end.${side}`,
          ...bearings
            .filter(
              (p) =>
                p.id === `bearings.inner.${side}` ||
                p.id === `bearings.outer.${side}` ||
                p.id.startsWith(`bearings.ball.${side}.`),
            )
            .map((p) => p.id),
        ],
        steps: [
          { directionFrom: "bearings", scale: -side * 1.6, range: [0, 0.25] as [number, number] },
        ],
      })),
      {
        id: "pmsm.rotating-unit",
        partIds: ["rotor.core", "shaft.main", ...magnets.map((p) => p.id)],
        steps: [{ directionFrom: "rotor", scale: 1, range: [0.25, 0.7] }],
      },
      {
        id: "pmsm.wound-stator",
        partIds: [...stator, ...coils].map((p) => p.id),
        steps: [
          { directionFrom: "windings", scale: -1.5, range: [0.25, 0.7] },
          { directionFrom: "stator", scale: -1.7, range: [0.7, 1] },
        ],
      },
      {
        id: "pmsm.outer-shell",
        partIds: housing.filter((p) => !p.id.startsWith("housing.end.")).map((p) => p.id),
        steps: [{ directionFrom: "housing", scale: 1, range: [0.7, 1] }],
      },
    ],
  },
  transparency: {
    componentId: "housing",
    shellPartIds: ["housing.shell"],
    description:
      "Al transparentar la carcasa se ocultan tapas, apoyos y nervaduras para evitar capas superpuestas. Puedes seleccionar el interior a través de ella.",
  },
  camera: { position: [5.6, 3.7, 6.8], target: [0, -0.1, 0], minDistance: 4.8, maxDistance: 14 },
  capabilities: {
    orbit: true,
    zoom: true,
    selection: true,
    explode: true,
    transparency: true,
    isolation: true,
    animation: true,
    simulation: true,
  },
  animations: [
    {
      id: "synchronous-rotation",
      assemblyId: rotating,
      kind: "illustrative",
      description:
        "Giro síncrono ideal con corrientes normalizadas; no resuelve campos ni dinámica de torque.",
      referenceIds: ["mathworks-clarke", "microchip-pmsm"],
    },
  ],
  simulation: motorPowerLesson,
  operation: {
    kind: "synchronous-illustration",
    rotatingAssemblyId: rotating,
    polePairs: 4,
    electricalLead: PI / 6,
    displayCyclesPerSecond: 0.5,
    referenceFrequencyHz: 50,
    phaseOffsets: [0, (-2 * PI) / 3, (2 * PI) / 3],
    fieldMarker: { radius: 2.25, rotorRadius: 1.04, axialPosition: 1.7, referenceAngle: PI / 8 },
    lessons: [
      {
        title: "Un campo que gira",
        text: "Las corrientes de las bobinas varían coordinadamente. En una máquina ideal con devanados distribuidos apropiadamente, su efecto combinado forma un patrón magnético que avanza alrededor del entrehierro. El estator no gira.",
      },
      {
        title: "Tres fases, un mismo ritmo",
        text: "A, B y C tienen la misma frecuencia y se desplazan 120° eléctricos entre sí: un tercio de ciclo. Sus valores positivos y negativos indican sentidos opuestos de corriente. Aquí se normalizan entre −1 y +1; no son amperios medidos.",
      },
      {
        title: "Los imanes del rotor",
        text: "Los ocho polos permanentes aportan el campo del rotor. No necesitan corriente en una bobina del rotor, pero tampoco aportan energía ilimitada: la energía útil procede de la alimentación eléctrica del estator.",
      },
      {
        title: "Por qué aparece el giro",
        text: "La interacción entre el campo del estator y el de los imanes puede producir torque. Aquí imponemos un adelanto constante de 30° eléctricos del campo respecto al rotor para ilustrar el giro motor. No calculamos ese ángulo a partir de una carga ni simulamos el arranque.",
      },
      {
        title: "Qué significa síncrono",
        text: "En régimen síncrono, el rotor y el patrón magnético del estator giran a la misma velocidad mecánica, con un desfase constante. Eso no obliga a que sus ejes magnéticos estén alineados. Cambiar la reproducción solo acelera o ralentiza la explicación.",
      },
      {
        title: "Frecuencia y velocidad",
        text: "La velocidad síncrona es nₛ = 60 fₑ / p, con fₑ en Hz y p en pares de polos. Este recurso tiene ocho polos: cuatro pares. Por eso cuatro ciclos eléctricos equivalen a una vuelta mecánica. La fórmula describe sincronismo ideal; no predice torque ni eficiencia.",
      },
    ],
    limitations: [
      "Esquema angular, no cálculo electromagnético: no mostramos líneas de flujo ni valores de densidad magnética.",
      "La dirección equivalente procede de corrientes trifásicas ideales equilibradas. Se omiten saturación, armónicos, PWM, pérdidas, transitorios y carga mecánica.",
      "Las señales no reconstruyen las conexiones reales de cada bobina de la geometría simplificada. Los colores del cobre no representan corrientes instantáneas.",
      "Se animan rotor, eje, imanes y pistas interiores. La rodadura de las bolas de los rodamientos no se representa.",
    ],
  },
  references: [
    {
      id: "mathworks-clarke",
      title: "MathWorks · Clarke Transform",
      url: "https://www.mathworks.com/help/mcb/ref/clarketransform.html",
      scope:
        "Conversión de corrientes trifásicas equilibradas a un vector equivalente en coordenadas αβ. No determina la distribución espacial del campo de este modelo.",
    },
    {
      id: "microchip-pmsm",
      title: "Microchip · Permanent Magnet Synchronous Motor",
      url: "https://onlinedocs.microchip.com/oxy/GUID-0A4BC4EE-29F5-4736-8125-17139B84E7B5-en-US-2/GUID-C1C929BC-0D12-40FB-B555-F28B23CB457E.html",
      scope:
        "Principio de funcionamiento y distinción entre imanes superficiales e interiores. Las dimensiones del recurso son ilustrativas.",
    },
  ],
  components: [
    component(
      "housing",
      "Carcasa exterior",
      "Carcasa",
      "#8192a8",
      housing,
      {
        function: "Protege y sostiene el conjunto.",
        explanation:
          "Es la estructura exterior del motor. Mantiene el estator en su lugar y sus tapas alojan los apoyos del eje. También ayuda a conducir el calor hacia el exterior.",
        relationship:
          "Permanece fija mientras gira el eje. Aquí tiene un corte para que puedas observar el interior; ese hueco no existe en un motor cerrado.",
      },
      [0.8, -0.8, 0.5],
      [0, 2, 0],
      [62, 40],
      [235, 67],
    ),
    component(
      "stator",
      "Estator",
      "Estator",
      "#94b4ae",
      stator,
      {
        function: "Guía el campo magnético desde la parte fija.",
        explanation:
          "Su núcleo tiene dientes y ranuras donde se alojan las bobinas. En un motor real se fabrica con láminas de acero eléctrico para reducir pérdidas; aquí el núcleo está simplificado.",
        relationship:
          "Rodea al rotor sin tocarlo. El pequeño espacio entre ambos se llama entrehierro y permite el giro.",
      },
      [1.1, 0.2, 0.9],
      [-2, 0, 0],
      [65, 91],
      [217, 120],
    ),
    component(
      "windings",
      "Bobinados",
      "Bobinados",
      "#eda259",
      coils,
      {
        function: "Producen el campo magnético del estator.",
        explanation:
          "Son conductores de cobre aislados, enrollados alrededor de los dientes. El inversor alimenta las fases con corrientes alternas coordinadas para crear un campo magnético giratorio.",
        relationship:
          "El campo de las bobinas interactúa con los imanes del rotor y genera torque. El inversor y las conexiones eléctricas no se muestran en este recurso.",
      },
      [0.4, 1.2, 1.1],
      [0, 0, 2.6],
      [68, 148],
      [238, 151],
    ),
    component(
      "rotor",
      "Rotor",
      "Rotor",
      "#687b93",
      [part("rotor.core", "Núcleo del rotor", ring(0.22, 0.83, 2.18), [0, 0, 0], rotating)],
      {
        function: "Es la parte magnética que gira.",
        explanation:
          "El rotor está dentro del estator y lleva los imanes permanentes. En funcionamiento síncrono, gira a la misma velocidad que el campo magnético giratorio, manteniendo un ángulo relativo que depende de la carga.",
        relationship:
          "Su núcleo está unido al eje para transmitir el torque. No roza el estator: ambos están separados por el entrehierro.",
      },
      [0.4, 0.35, 0.6],
      [0, 0, 3.8],
      [466, 91],
      [331, 171],
    ),
    component(
      "magnets",
      "Imanes permanentes",
      "Imanes",
      "#e46b70",
      magnets,
      {
        function: "Aportan el campo magnético del rotor.",
        explanation:
          "Conservan su magnetización sin alimentar una bobina en el rotor. Los polos norte y sur alternan alrededor de su superficie en esta variante didáctica.",
        relationship:
          "Interactúan con el campo del estator para generar torque. Los imanes no son una fuente de energía: el movimiento útil necesita energía eléctrica y control.",
      },
      [0.65, 0.65, 0.7],
      [2, 0, 0],
      [467, 40],
      [340, 111],
    ),
    component(
      "shaft",
      "Eje",
      "Eje",
      "#c7d3de",
      [
        part(
          "shaft.main",
          "Eje de salida",
          { kind: "cylinder", radius: 0.22, length: 4.25 },
          [0, 0, 0],
          rotating,
        ),
      ],
      {
        function: "Entrega el movimiento mecánico.",
        explanation:
          "Esta pieza atraviesa el centro del rotor y gira solidaria con él. Su extremo permite acoplar el motor al siguiente elemento del sistema de propulsión.",
        relationship:
          "Transmite el torque hacia un reductor u otra transmisión. Los rodamientos lo mantienen centrado y permiten su giro.",
      },
      [0, 0, 1.85],
      [0, 0, 5],
      [468, 208],
      [300, 145],
    ),
    component(
      "bearings",
      "Rodamientos",
      "Rodamientos",
      "#b2ad8c",
      bearings,
      {
        function: "Apoyan el eje y reducen la fricción.",
        explanation:
          "Sus pistas y elementos rodantes permiten que el eje gire respecto a las tapas fijas. La pista interior acompaña al eje y la exterior se apoya en la carcasa.",
        relationship:
          "Ayudan a conservar la alineación entre rotor y estator. Aquí se muestran abiertos para reconocer sus bolas y pistas.",
      },
      [0, 0, 1.46],
      [0, 0, -3.4],
      [67, 208],
      [279, 160],
    ),
  ],
};
