import type { SimulationDefinition } from "./simulation/definition";
import { withinLesson } from "./simulation/definition";
import { calculatePoint } from "./simulation/physics";
/** Serializable educational content. No React, Three.js or browser dependencies. */
export type Vec3 = [number, number, number];
export type Technology =
  | "motor.pmsm"
  | "motor.induction"
  | "motor.reluctance"
  | "battery.lfp"
  | "battery.nmc"
  | "battery.cell"
  | "battery.module"
  | "battery.bms"
  | "charger.ac"
  | "charger.dc"
  | "charger.onboard"
  | "connector"
  | "transmission.reducer"
  | "transmission.differential"
  | "electronics.inverter"
  | "electronics.dc-dc"
  | "thermal";

export type GeometryDefinition =
  | { kind: "box"; size: Vec3 }
  | { kind: "cylinder"; radius: number; length: number }
  | { kind: "sphere"; radius: number }
  | {
      kind: "annulus";
      inner: number;
      outer: number;
      length: number;
      start?: number;
      sweep?: number;
    }
  | { kind: "tube"; points: Vec3[]; radius: number; segments: number };

export interface PartDefinition {
  id: string;
  label: string;
  geometry: GeometryDefinition;
  position: Vec3;
  rotation?: Vec3;
  color?: string;
  /** Physical assembly membership; enables later rotor animation without renaming parts. */
  assemblyId: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  education: { function: string; explanation: string; relationship: string };
  position: Vec3;
  explodeDirection: Vec3;
  focus: { position: Vec3; target: Vec3 };
  parts: PartDefinition[];
  diagram: { labelPosition: [number, number]; anchor: [number, number] };
}

/** Parameters of an illustrative synchronous lesson, never a field solver. */
export interface SynchronousLesson {
  kind: "synchronous-illustration";
  rotatingAssemblyId: string;
  polePairs: number;
  electricalLead: number;
  displayCyclesPerSecond: number;
  referenceFrequencyHz: number;
  phaseOffsets: [number, number, number];
  fieldMarker: {
    radius: number;
    rotorRadius: number;
    axialPosition: number;
    referenceAngle: number;
  };
  lessons: { title: string; text: string }[];
  limitations: string[];
}

export interface ModelDefinition {
  id: string;
  name: string;
  technology: Technology;
  description: string;
  lesson: {
    section: string;
    shortName: string;
    headline: [string, string];
    intro: string;
    viewLabel: string;
    overviewTitle: string;
    overviewFunction: string;
    overviewQuestion: string;
    overviewAnswer: string;
  };
  resourceVersion: string;
  representation: { kind: "generic" | "specific"; notice: string; simplifications: string[] };
  resource:
    | { kind: "procedural"; units: "illustrative" }
    | { kind: "gltf"; url: string; nodeMap: Record<string, string>; units: "m" };
  components: ComponentDefinition[];
  assemblies: { id: string; parentId?: string; pivot: Vec3; axis?: Vec3 }[];
  operation?: SynchronousLesson;
  simulation?: SimulationDefinition;
  disassembly?: {
    description: string;
    cameraExpansion: number;
    groups: {
      id: string;
      partIds: string[];
      /** Ordered translation stages, using the resource's existing separation vectors. */
      steps: { directionFrom: string; scale: number; range: [number, number] }[];
    }[];
  };
  transparency?: { componentId: string; shellPartIds: string[]; description: string };
  camera: { position: Vec3; target: Vec3; minDistance: number; maxDistance: number };
  capabilities: {
    orbit: boolean;
    zoom: boolean;
    selection: boolean;
    explode: boolean;
    transparency: boolean;
    isolation: boolean;
    animation: boolean;
    simulation: boolean;
  };
  /** Empty until an animation is implemented and validated. Never inferred from reserved metadata. */
  animations: {
    id: string;
    assemblyId: string;
    kind: "illustrative" | "physical";
    description: string;
    referenceIds: string[];
  }[];
  references: { id: string; title: string; url: string; scope: string }[];
}

/** Separate from the generic resource; adding a binding never asserts identical hardware. */
export interface VehicleModelBinding {
  id: string;
  manufacturer: string;
  vehicle: string;
  modelYear: number;
  variant: string;
  market: string;
  technologyModelId: string;
  resourceVersion: string;
  representation: "generic" | "specific";
  applicability: "unverified" | "verified";
  differences: string[];
  configuration: Record<string, string | number | boolean>;
  specificResource?: ModelDefinition["resource"];
  referenceIds: string[];
}

export type Selection = { componentId: string; partId?: string } | null;
export type CameraCommand = {
  sequence: number;
  action: "reset" | "zoom-in" | "zoom-out" | "left" | "right" | "up" | "down" | "focus";
};

export function validateModel(model: ModelDefinition): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const claim = (id: string) => {
    if (!id || ids.has(id)) errors.push(`Identificador vacío o duplicado: ${id}`);
    ids.add(id);
  };
  const vector = (value: Vec3) => value.length === 3 && value.every(Number.isFinite);
  const assemblies = new Set(model.assemblies.map((assembly) => assembly.id));
  for (const assembly of model.assemblies) {
    claim(assembly.id);
    if (!vector(assembly.pivot) || (assembly.axis && !vector(assembly.axis)))
      errors.push(`Eje inválido: ${assembly.id}`);
    if (assembly.parentId && !assemblies.has(assembly.parentId))
      errors.push(`Ensamblaje padre inexistente: ${assembly.id}`);
  }
  for (const component of model.components) {
    claim(component.id);
    if (!component.parts.length) errors.push(`Componente sin geometría: ${component.id}`);
    if (
      !vector(component.position) ||
      !vector(component.explodeDirection) ||
      !vector(component.focus.target) ||
      !vector(component.focus.position)
    )
      errors.push(`Transformación inválida: ${component.id}`);
    if (Object.values(component.education).some((text) => !text.trim()))
      errors.push(`Contenido incompleto: ${component.id}`);
    for (const part of component.parts) {
      claim(part.id);
      if (!assemblies.has(part.assemblyId)) errors.push(`Ensamblaje inexistente: ${part.id}`);
      if (!vector(part.position) || (part.rotation && !vector(part.rotation)))
        errors.push(`Posición inválida: ${part.id}`);
      const g = part.geometry;
      const positive = (...values: number[]) => values.every((v) => Number.isFinite(v) && v > 0);
      const valid =
        g.kind === "box"
          ? positive(...g.size)
          : g.kind === "annulus"
            ? positive(g.inner, g.outer, g.length) &&
              g.inner < g.outer &&
              (g.sweep === undefined || (g.sweep > 0 && g.sweep <= 2 * Math.PI))
            : g.kind === "cylinder"
              ? positive(g.radius, g.length)
              : g.kind === "sphere"
                ? positive(g.radius)
                : positive(g.radius, g.segments) && g.points.length >= 4 && g.points.every(vector);
      if (!valid) errors.push(`Geometría inválida: ${part.id}`);
    }
  }
  if (!(model.camera.minDistance > 0 && model.camera.maxDistance > model.camera.minDistance))
    errors.push("Límites de cámara inválidos");
  if (model.animations.length > 0 && !model.capabilities.animation)
    errors.push("Animaciones sin capacidad habilitada");
  const allParts = new Set(model.components.flatMap((c) => c.parts.map((p) => p.id)));
  const componentIds = new Set(model.components.map((c) => c.id));
  if (model.capabilities.explode && !model.disassembly) errors.push("Falta plan de separación");
  if (model.disassembly) {
    const assigned = new Set<string>();
    const groups = new Set<string>();
    if (
      !Number.isFinite(model.disassembly.cameraExpansion) ||
      model.disassembly.cameraExpansion < 0
    )
      errors.push("Expansión de cámara inválida");
    for (const group of model.disassembly.groups) {
      if (groups.has(group.id)) errors.push(`Grupo duplicado: ${group.id}`);
      groups.add(group.id);
      for (const id of group.partIds) {
        if (!allParts.has(id) || assigned.has(id))
          errors.push(`Pieza de separación inválida: ${id}`);
        assigned.add(id);
      }
      for (const step of group.steps) {
        if (
          !componentIds.has(step.directionFrom) ||
          !Number.isFinite(step.scale) ||
          !step.range.every(Number.isFinite) ||
          step.range[0] < 0 ||
          step.range[1] > 1 ||
          step.range[0] >= step.range[1]
        )
          errors.push(`Etapa de separación inválida: ${group.id}`);
      }
    }
    if (assigned.size !== allParts.size) errors.push("Plan de separación incompleto");
  }
  if (model.capabilities.transparency && !model.transparency)
    errors.push("Falta envolvente transparente");
  if (model.transparency) {
    const shell = model.components.find((c) => c.id === model.transparency!.componentId);
    if (
      !shell ||
      !model.transparency.shellPartIds.length ||
      model.transparency.shellPartIds.some((id) => !shell.parts.some((p) => p.id === id))
    )
      errors.push("Envolvente transparente inválida");
  }
  if (model.operation) {
    const op = model.operation;
    const assembly = model.assemblies.find((a) => a.id === op.rotatingAssemblyId);
    if (!assembly?.axis || !vector(assembly.axis) || Math.hypot(...assembly.axis) === 0)
      errors.push("Eje de funcionamiento inválido");
    if (
      !Number.isInteger(op.polePairs) ||
      op.polePairs < 1 ||
      !Number.isFinite(op.electricalLead) ||
      Math.abs(op.electricalLead) >= Math.PI / 2 ||
      !Number.isFinite(op.displayCyclesPerSecond) ||
      op.displayCyclesPerSecond <= 0 ||
      !Number.isFinite(op.referenceFrequencyHz) ||
      op.referenceFrequencyHz <= 0
    )
      errors.push("Parámetros de funcionamiento inválidos");
    const phases = op.phaseOffsets;
    const angularDistance = (a: number, b: number) => Math.acos(Math.cos(a - b));
    if (
      phases.length !== 3 ||
      !phases.every(Number.isFinite) ||
      phases.some(
        (p, i) => Math.abs(angularDistance(p, phases[(i + 1) % 3]) - (2 * Math.PI) / 3) > 1e-8,
      )
    )
      errors.push("Desfase trifásico inválido");
    if (
      !model.capabilities.animation ||
      !model.animations.some(
        (a) => a.assemblyId === op.rotatingAssemblyId && a.kind === "illustrative",
      )
    )
      errors.push("Falta animación ilustrativa declarada");
  }
  if (model.capabilities.simulation !== !!model.simulation)
    errors.push("Capacidad de simulación sin definición coherente");
  if (model.simulation) {
    const sim = model.simulation;
    if (
      !model.operation ||
      sim.kind !== "steady-motor" ||
      !Object.values(sim.bounds).every(
        ([min, max]) => Number.isFinite(min) && Number.isFinite(max) && min >= 0 && min < max,
      ) ||
      sim.bounds.efficiency[0] <= 0 ||
      sim.bounds.efficiency[1] > 1 ||
      !sim.timeScales.length ||
      !sim.timeScales.every((v) => Number.isFinite(v) && v > 0 && v <= 1) ||
      !sim.timeScales.includes(sim.defaultTimeScale)
    )
      errors.push("Parámetros de simulación inválidos");
    if (sim.defaults.length !== 2) errors.push("Se requieren dos escenarios iniciales");
    for (const point of sim.defaults) {
      try {
        calculatePoint(point);
        if (!withinLesson(point, sim)) errors.push("Escenario fuera del rango ilustrativo");
      } catch {
        errors.push("Escenario de simulación inválido");
      }
    }
  }
  return errors;
}
