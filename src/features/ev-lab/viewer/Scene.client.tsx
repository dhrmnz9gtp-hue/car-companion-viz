import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Spherical, Vector3 } from "three";
import type {
  CameraCommand,
  ComponentDefinition,
  ModelDefinition,
  PartDefinition,
  Selection,
} from "../model";
import { createGeometry } from "./geometry";

export interface SceneProps {
  model: ModelDefinition;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  enabled: boolean;
  command: CameraCommand;
  onFailure: () => void;
  onReady: () => void;
}

function Controls({ model, enabled, command, selection, onFailure, onReady }: SceneProps) {
  const { camera, gl, invalidate, scene } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const lastCommand = useRef(-1);
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
          return {
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
    const orbit = controls.current;
    if (!orbit || command.sequence === lastCommand.current) return;
    lastCommand.current = command.sequence;
    const offset = camera.position.clone().sub(orbit.target);
    const spherical = new Spherical().setFromVector3(offset);
    const action = command.action;
    if (action === "reset") {
      camera.position.set(...model.camera.position);
      orbit.target.set(...model.camera.target);
    } else if (action === "focus") {
      const component = model.components.find((item) => item.id === selection?.componentId);
      if (component) {
        camera.position.set(...component.focus.position);
        orbit.target.set(...component.focus.target);
      }
    } else {
      if (action === "zoom-in") spherical.radius *= 0.82;
      if (action === "zoom-out") spherical.radius *= 1.22;
      if (action === "left") spherical.theta -= Math.PI / 12;
      if (action === "right") spherical.theta += Math.PI / 12;
      if (action === "up") spherical.phi -= Math.PI / 12;
      if (action === "down") spherical.phi += Math.PI / 12;
      spherical.radius = Math.min(
        model.camera.maxDistance,
        Math.max(model.camera.minDistance, spherical.radius),
      );
      spherical.makeSafe();
      camera.position.copy(orbit.target).add(new Vector3().setFromSpherical(spherical));
    }
    orbit.update();
    invalidate();
  }, [camera, command, invalidate, model, selection]);
  return null;
}

function Part({
  part,
  component,
  selection,
  onSelect,
}: {
  part: PartDefinition;
  component: ComponentDefinition;
  selection: Selection;
  onSelect: SceneProps["onSelect"];
}) {
  const geometry = useMemo(() => createGeometry(part.geometry), [part.geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const selected = selection?.componentId === component.id;
  const exact = selected && selection?.partId === part.id;
  return (
    <mesh
      geometry={geometry}
      position={part.position}
      rotation={part.rotation}
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
        metalness={0.48}
        roughness={0.38}
        emissive={selected ? "#38e6ad" : "#000000"}
        emissiveIntensity={exact ? 0.6 : selected ? 0.3 : 0}
      />
    </mesh>
  );
}

export default function Scene(props: SceneProps) {
  if (props.model.resource.kind !== "procedural")
    throw new Error("No hay adaptador disponible para este recurso.");
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
              component={component}
              selection={props.selection}
              onSelect={props.onSelect}
            />
          ))}
        </group>
      ))}
      <Controls {...props} />
    </Canvas>
  );
}
