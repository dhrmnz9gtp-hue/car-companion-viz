import { useCallback, useEffect, useRef, useState } from "react";
import { clampUnit, ease } from "./exploration";

/** One interruptible timeline shared by buttons and range input. No idle RAF loop. */
export function useSeparation() {
  const [value, setValue] = useState(0);
  const [target, setTarget] = useState(0);
  const [moving, setMoving] = useState(false);
  const current = useRef(0);
  const frame = useRef<number | null>(null);
  const cancel = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  const stop = useCallback(() => {
    cancel();
    setMoving(false);
    setTarget(current.current);
  }, [cancel]);
  const reset = useCallback(() => {
    cancel();
    current.current = 0;
    setValue(0);
    setTarget(0);
    setMoving(false);
  }, [cancel]);
  const moveTo = useCallback(
    (requested: number, duration = 1600) => {
      cancel();
      const destination = clampUnit(requested);
      const start = current.current;
      setTarget(destination);
      if (
        Math.abs(start - destination) < 0.00001 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        current.current = destination;
        setValue(destination);
        setMoving(false);
        return;
      }
      setMoving(true);
      const started = performance.now();
      const tick = (now: number) => {
        const elapsed = clampUnit((now - started) / duration);
        current.current = start + (destination - start) * ease(elapsed);
        setValue(current.current);
        if (elapsed < 1) frame.current = requestAnimationFrame(tick);
        else {
          frame.current = null;
          setMoving(false);
        }
      };
      frame.current = requestAnimationFrame(tick);
    },
    [cancel],
  );
  useEffect(() => cancel, [cancel]);
  return { value, target, moving, moveTo, stop, reset };
}
