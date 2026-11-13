import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Three r186 resolves getRootNode() again on disconnect. R3F can detach the
// canvas before passive cleanup, so remove this instance's handlers from the
// original root as well. Keep this adapter covered when upgrading Three.
export function disposeControls(controls: OrbitControls, eventRoot: Node) {
  controls.dispose();
  const handlers = controls as unknown as {
    _interceptControlDown?: EventListener;
    _interceptControlUp?: EventListener;
  };
  if (typeof handlers._interceptControlDown === "function")
    eventRoot.removeEventListener("keydown", handlers._interceptControlDown, true);
  if (typeof handlers._interceptControlUp === "function")
    eventRoot.removeEventListener("keyup", handlers._interceptControlUp, true);
}
