import type { Texture, WebGLRenderer } from "three";

type DisposeHandler = (event: { type: "dispose"; target: Texture }) => void;
type ObservedTexture = Texture & { _listeners?: { dispose?: DisposeHandler[] } };
const managed = new WeakSet<WebGLRenderer>();
const listeners = (texture: ObservedTexture) => texture._listeners?.dispose ?? [];

// Three r186 caches DFG_LUT across renderers, but renderer.dispose() does not
// detach its WebGLTextures callback from that texture. Capture ONLY the callback
// registered during this renderer's synchronous first upload. On disposal it
// releases this renderer's allocation; the shared LUT and other viewers survive.
// Recheck this narrow compatibility adapter when upgrading the pinned Three.
export function manageRendererLifetime(renderer: WebGLRenderer) {
  if (managed.has(renderer)) return;
  managed.add(renderer);
  const get = renderer.properties.get;
  const render = renderer.render;
  const dispose = renderer.dispose;
  let texture: ObservedTexture | undefined;
  let previous = new Set<DisposeHandler>();
  let owned: DisposeHandler[] = [];
  renderer.properties.get = function (object: unknown) {
    const candidate = object as ObservedTexture;
    if (!texture && candidate?.isTexture && candidate.name === "DFG_LUT") {
      texture = candidate;
      previous = new Set(listeners(candidate));
    }
    return get.call(this, object);
  };
  renderer.render = function (...args: Parameters<WebGLRenderer["render"]>) {
    try {
      return render.apply(this, args);
    } finally {
      if (texture) {
        owned = listeners(texture).filter((handler) => !previous.has(handler));
        renderer.properties.get = get;
        renderer.render = render;
        previous.clear();
      }
    }
  };
  renderer.dispose = function () {
    renderer.properties.get = get;
    renderer.render = render;
    if (texture) {
      for (const handler of owned) handler({ type: "dispose", target: texture });
    }
    owned = [];
    dispose.call(this);
    renderer.dispose = dispose;
  };
}
