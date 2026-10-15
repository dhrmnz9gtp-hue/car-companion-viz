import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Euler, Mesh, Quaternion, Spherical, Vector3 } from "three";
import type {
  CameraCommand,
  ComponentDefinition,
  ModelDefinition,
  PartDefinition,
  Selection,
} from "../model";
import { partAppearance, selectionOffset, separationOffsets } from "../exploration";
import { movingAssembly, rotateAround, synchronousState } from "../operation/electromagnetics";
import { OperationOverlay } from "./OperationOverlay.client";
import { createGeometry } from "./geometry";

export interface SceneProps {
  model: ModelDefinition;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  enabled: boolean;
  separation: number;
  transparency: number;
  isolatedId: string | null;
  operationPhase: number;
  fieldVisible: boolean;
  command: CameraCommand;
  onFailure: () => void;
  onReady: () => void;
}

function Controls({
  model,
  enabled,
  command,
  selection,
  separation,
  onFailure,
  onReady,
}: SceneProps) {
  const { camera, gl, invalidate, scene } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const lastCommand = useRef(command.sequence);
  const previousScale = useRef(1);
  const focused = useRef<Selection>(null);
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.target.set(...model.camera.target);
    orbit.minDistance = model.camera.minDistance;
    orbit.maxDistance = model.camera.maxDistance;
    orbit.enablePan = false;
    orbit.enableDamping = false;
    orbit.zoomSpeed = 0.7;
    orbit.rotateSpeed = 0.65;
    const changed = () => invalidate();
    orbit.addEventListener("change", changed);
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    controls.current = orbit;
    orbit.update();
    // Development-only observability for geometry, camera and idle-render checks.
    if (import.meta.env.DEV) {
      Object.assign(gl.domElement, {
        labDiagnostics: () => {
          let triangles = 0,
            meshes = 0;
          scene.traverse((object) => {
            const mesh = object as import("three").Mesh;
            if (mesh.isMesh && mesh.geometry) {
              meshes++;
              triangles +=
                (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
            }
          });
          const parts: Record<string, unknown> = {};
          scene.updateMatrixWorld(true);
          scene.traverse((object) => {
            const mesh = object as Mesh;
            if (!mesh.isMesh) return;
            const material = mesh.material as import("three").MeshStandardMaterial;
            const world = mesh.getWorldPosition(new Vector3());
            mesh.geometry.computeBoundingBox();
            const pickPoint = mesh.geometry
              .boundingBox!.getCenter(new Vector3())
              .applyMatrix4(mesh.matrixWorld)
              .project(camera);
            parts[mesh.name] = {
              pickPoint: pickPoint.toArray(),
              quaternion: mesh.getWorldQuaternion(new Quaternion()).toArray(),
              matrix: mesh.matrixWorld.toArray(),
              position: world.toArray(),
              screen: world.clone().project(camera).toArray(),
              visible: mesh.visible,
              opacity: material.opacity,
              depthWrite: material.depthWrite,
              transparent: material.transparent,
            };
          });
          return {
            parts,
            triangles,
            meshes,
            frame: gl.info.render.frame,
            calls: gl.info.render.calls,
            camera: camera.position.toArray(),
            target: orbit.target.toArray(),
            distance: orbit.getDistance(),
            geometries: gl.info.memory.geometries,
            textures: gl.info.memory.textures,
          };
        },
      });
    }
    onReady();
    return () => {
      orbit.removeEventListener("change", changed);
      gl.domElement.removeEventListener("webglcontextlost", lost);
      orbit.dispose();
      controls.current = null;
      delete (gl.domElement as HTMLCanvasElement & { labDiagnostics?: unknown }).labDiagnostics;
    };
  }, [camera, gl, invalidate, model, onFailure, onReady, scene]);

  useEffect(() => {
    if (controls.current) controls.current.enabled = enabled;
    gl.domElement.style.touchAction = enabled ? "none" : "pan-y";
  }, [enabled, gl]);

  useEffect(() => {
    if (focused.current?.componentId !== selection?.componentId) focused.current = null;
  }, [selection]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const factor = 1 + (model.disassembly?.cameraExpansion ?? 0) * separation;
    camera.position
      .sub(orbit.target)
      .multiplyScalar(factor / previousScale.current)
      .add(orbit.target);
    previousScale.current = factor;
    orbit.maxDistance = model.camera.maxDistance * factor;
    if (focused.current) {
      const component = model.components.find((c) => c.id === focused.current?.componentId);
      if (component) {
        const offset = selectionOffset(
          model,
          focused.current,
          separationOffsets(model, separation),
        );
        const target = new Vector3(...component.focus.target).add(new Vector3(...offset));
        camera.position.add(target.clone().sub(orbit.target));
        orbit.target.copy(target);
      }
    }
    orbit.update();
    invalidate();
  }, [camera, invalidate, model, separation]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit || command.sequence === lastCommand.current) return;
    lastCommand.current = command.sequence;
    const offset = camera.position.clone().sub(orbit.target);
    const spherical = new Spherical().setFromVector3(offset);
    const action = command.action;
    if (action === "reset") {
      focused.current = null;
      camera.position.set(...model.camera.position);
      orbit.target.set(...model.camera.target);
    } else if (action === "focus") {
      const component = model.components.find((item) => item.id === selection?.componentId);
      if (component) {
        focused.current = selection;
        const offset = new Vector3(
          ...selectionOffset(model, selection, separationOffsets(model, separation)),
        );
        camera.position.set(...component.focus.position).add(offset);
        orbit.target.set(...component.focus.target).add(offset);
      }
    } else {
      if (action === "zoom-in") spherical.radius *= 0.82;
      if (action === "zoom-out") spherical.radius *= 1.22;
      if (action === "left") spherical.theta -= Math.PI / 12;
      if (action === "right") spherical.theta += Math.PI / 12;
      if (action === "up") spherical.phi -= Math.PI / 12;
      if (action === "down") spherical.phi += Math.PI / 12;
      spherical.radius = Math.min(
        orbit.maxDistance,
        Math.max(model.camera.minDistance, spherical.radius),
      );
      spherical.makeSafe();
      camera.position.copy(orbit.target).add(new Vector3().setFromSpherical(spherical));
    }
    orbit.update();
    invalidate();
  }, [camera, command, invalidate, model, selection, separation]);
  return null;
}

const ignoreRaycast = () => {};

function Part({
  part,
  component,
  selection,
  onSelect,
  offset,
  appearance,
  assembly,
  angle,
}: {
  assembly: ModelDefinition["assemblies"][number] | undefined;
  angle: number;
  part: PartDefinition;
  component: ComponentDefinition;
  selection: Selection;
  onSelect: SceneProps["onSelect"];
  offset: import("../model").Vec3;
  appearance: ReturnType<typeof partAppearance>;
}) {
  const geometry = useMemo(() => createGeometry(part.geometry), [part.geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const localPivot = assembly?.pivot.map((value, i) => value - component.position[i]) as
    | import("../model").Vec3
    | undefined;
  const position =
    localPivot && assembly?.axis
      ? rotateAround(part.position, localPivot, assembly.axis, angle)
      : part.position;
  const quaternion = useMemo(() => {
    const base = new Quaternion().setFromEuler(new Euler(...(part.rotation ?? [0, 0, 0])));
    return assembly?.axis
      ? new Quaternion()
          .setFromAxisAngle(new Vector3(...assembly.axis).normalize(), angle)
          .multiply(base)
      : base;
  }, [part.rotation, assembly, angle]);
  const selected = selection?.componentId === component.id;
  const exact = selected && selection?.partId === part.id;
  return (
    <mesh
      geometry={geometry}
      position={[position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]]}
      visible={appearance.visible}
      raycast={appearance.pickable ? Mesh.prototype.raycast : ignoreRaycast}
      renderOrder={appearance.opacity < 1 ? 10 : 0}
      quaternion={quaternion}
      name={part.id}
      userData={{ componentId: component.id, partId: part.id, assemblyId: part.assemblyId }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.delta > 4) return;
        onSelect({ componentId: component.id, partId: part.id });
      }}
    >
      <meshStandardMaterial
        color={part.color ?? component.color}
        transparent={appearance.opacity < 1}
        opacity={appearance.opacity}
        depthWrite={appearance.opacity === 1}
        metalness={0.48}
        roughness={0.38}
        emissive={selected ? "#38e6ad" : "#000000"}
        emissiveIntensity={exact ? 0.6 : selected ? 0.3 : 0}
      />
    </mesh>
  );
}

export default function Scene(props: SceneProps) {
  const offsets = useMemo(
    () => separationOffsets(props.model, props.separation),
    [props.model, props.separation],
  );

  if (props.model.resource.kind !== "procedural")
    throw new Error("No hay adaptador disponible para este recurso.");
  const angle = props.model.operation
    ? synchronousState(props.operationPhase, props.model.operation).mechanical
    : 0;
  const limited =
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency <= 4 || window.matchMedia("(max-width: 767px)").matches);
  return (
    <Canvas
      frameloop="demand"
      dpr={limited ? 1 : [1, 1.5]}
      camera={{ position: props.model.camera.position, fov: 38, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: !limited, powerPreference: "low-power" }}
      style={{ pointerEvents: props.enabled ? "auto" : "none" }}
      fallback={<p>El visor 3D no está disponible.</p>}
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 7, 7]} intensity={3.2} color="#e5f7ff" />
      <directionalLight position={[-5, 1, 3]} intensity={2} color="#9bf1d4" />
      <directionalLight position={[0, -3, -5]} intensity={1.5} color="#87aaff" />
      {props.model.components.map((component) => (
        <group key={component.id} position={component.position} name={component.id}>
          {component.parts.map((part) => (
            <Part
              key={part.id}
              part={part}
              assembly={movingAssembly(props.model, part.assemblyId)}
              angle={angle}
              offset={offsets[part.id] ?? [0, 0, 0]}
              appearance={partAppearance(
                props.model,
                component.id,
                part.id,
                props.transparency,
                props.isolatedId,
              )}
              component={component}
              selection={props.selection}
              onSelect={props.onSelect}
            />
          ))}
        </group>
      ))}
      {props.fieldVisible && props.model.operation && (
        <OperationOverlay model={props.model} phase={props.operationPhase} />
      )}
      <Controls {...props} />
    </Canvas>
  );
}
