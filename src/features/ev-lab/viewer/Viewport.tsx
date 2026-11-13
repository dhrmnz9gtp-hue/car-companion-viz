import { Component, lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { SceneProps } from "./Scene.client";
import { createClientOnlyFn } from "@tanstack/react-start";

// The import is invoked only after hydration and WebGL detection; SSR never
// evaluates Three.js, creates a canvas or loads the procedural geometry adapter.
const loadScene = createClientOnlyFn(() => import("./Scene.client"));
const Scene = lazy(async () => {
  const scene = await loadScene();
  if (!scene) throw new Error("El visor requiere un navegador.");
  return scene;
});

class ViewerBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Viewport({
  fallback,
  onAvailabilityChange,
  ...props
}: Omit<SceneProps, "onReady" | "onFailure"> & {
  fallback: ReactNode;
  onAvailabilityChange: (available: boolean) => void;
}) {
  const [status, setStatus] = useState<"checking" | "supported" | "failed">("checking");
  const [ready, setReady] = useState(false);
  const failed = useCallback(() => {
    setStatus("failed");
    onAvailabilityChange(false);
  }, [onAvailabilityChange]);
  const loaded = useCallback(() => {
    setReady(true);
    onAvailabilityChange(true);
  }, [onAvailabilityChange]);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2");
      if (!context) {
        failed();
        return;
      }
      context.getExtension("WEBGL_lose_context")?.loseContext();
      setStatus("supported");
    } catch {
      failed();
    }
  }, [failed]);
  useEffect(() => () => onAvailabilityChange(false), [onAvailabilityChange]);

  if (status === "failed")
    return (
      <div className="lab-fallback" role="status">
        <p className="lab-fallback-message">
          El visor 3D no está disponible en este momento. Puedes explorar el esquema 2D y leer todas
          las explicaciones.
        </p>
        {fallback}
      </div>
    );
  return (
    <ViewerBoundary
      onError={failed}
      fallback={
        <div className="lab-fallback">
          <p className="lab-fallback-message" role="status">
            No pudimos cargar el modelo. El esquema y las explicaciones siguen disponibles.
          </p>
          {fallback}
        </div>
      }
    >
      <div className="lab-canvas" data-testid="lab-viewport" data-ready={ready}>
        {!ready && (
          <div className="lab-loading" role="status">
            <span className="lab-loader" />
            Preparando el modelo…
          </div>
        )}
        {status === "supported" && (
          <Suspense fallback={null}>
            <Scene {...props} onReady={loaded} onFailure={failed} />
          </Suspense>
        )}
      </div>
    </ViewerBoundary>
  );
}
