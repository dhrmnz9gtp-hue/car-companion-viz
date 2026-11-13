import * as THREE from "three";
import type { GeometryDefinition } from "../model";

/** Geometry adapter. Adding a GLTF adapter later does not change selection or education. */
export function createGeometry(spec: GeometryDefinition): THREE.BufferGeometry {
  switch (spec.kind) {
    case "box":
      return new THREE.BoxGeometry(...spec.size);
    case "sphere":
      return new THREE.SphereGeometry(spec.radius, 12, 8);
    case "cylinder":
      return new THREE.CylinderGeometry(spec.radius, spec.radius, spec.length, 48).rotateX(
        Math.PI / 2,
      );
    case "tube":
      return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          spec.points.map((point) => new THREE.Vector3(...point)),
          false,
          "centripetal",
        ),
        spec.segments,
        spec.radius,
        6,
        false,
      );
    case "annulus": {
      const start = spec.start ?? 0;
      const sweep = spec.sweep ?? Math.PI * 2;
      const segments = Math.max(8, Math.ceil((64 * sweep) / (Math.PI * 2)));
      const vertices: number[] = [];
      const indices: number[] = [];
      for (let i = 0; i <= segments; i++) {
        const a = start + (sweep * i) / segments;
        for (const z of [-spec.length / 2, spec.length / 2]) {
          for (const r of [spec.inner, spec.outer])
            vertices.push(r * Math.cos(a), r * Math.sin(a), z);
        }
      }
      const quad = (a: number, b: number, c: number, d: number) => indices.push(a, b, c, a, c, d);
      for (let i = 0; i < segments; i++) {
        const a = i * 4,
          b = a + 4;
        quad(a, b, b + 1, a + 1);
        quad(a + 2, a + 3, b + 3, b + 2);
        quad(a, a + 2, b + 2, b);
        quad(a + 1, b + 1, b + 3, a + 3);
      }
      if (sweep < Math.PI * 2 - 0.0001) {
        quad(0, 1, 3, 2);
        const last = segments * 4;
        quad(last, last + 2, last + 3, last + 1);
      }
      const indexed = new THREE.BufferGeometry();
      indexed.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      indexed.setIndex(indices);
      const geometry = indexed.toNonIndexed();
      indexed.dispose();
      geometry.computeVertexNormals();
      return geometry;
    }
  }
}
