import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { ModelDefinition } from "../model";
import { synchronousState } from "../operation/electromagnetics";
const noPicking = () => {};
/** Angular annotations only: no flux lines, density map or inferred field strengths. */
export function OperationOverlay({ model, phase }: { model: ModelDefinition; phase: number }) {
  const lesson = model.operation!;
  const assembly = model.assemblies.find((a) => a.id === lesson.rotatingAssemblyId)!;
  const plane = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1),
        new Vector3(...assembly.axis!).normalize(),
      ),
    [assembly],
  );
  const state = synchronousState(phase, lesson);
  const marker = lesson.fieldMarker;
  return (
    <group name="operation.annotations" position={assembly.pivot} quaternion={plane}>
      <group position={[0, 0, marker.axialPosition]}>
        <mesh raycast={noPicking}>
          <torusGeometry args={[marker.radius, 0.012, 4, 80]} />
          <meshBasicMaterial color="#345760" />
        </mesh>
        <group rotation={[0, 0, state.fieldMechanical + marker.referenceAngle]}>
          <mesh position={[marker.radius, 0, 0]} raycast={noPicking}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshBasicMaterial color="#6ee7b7" />
          </mesh>
          <mesh position={[marker.radius, 0.23, 0]} raycast={noPicking}>
            <coneGeometry args={[0.085, 0.22, 12]} />
            <meshBasicMaterial color="#6ee7b7" />
          </mesh>
        </group>
        <group rotation={[0, 0, state.mechanical + marker.referenceAngle]}>
          <mesh position={[marker.rotorRadius, 0, 0]} raycast={noPicking}>
            <sphereGeometry args={[0.065, 12, 8]} />
            <meshBasicMaterial color="#ffbb72" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
