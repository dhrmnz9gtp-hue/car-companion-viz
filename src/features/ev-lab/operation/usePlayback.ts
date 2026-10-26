import { useCallback, useEffect, useRef, useState } from "react";
import { advancePlayback, TAU } from "./electromagnetics";

export function usePlayback(
  cyclesPerSecond: number,
  cycleCount: number,
  speedOverride?: number,
  suspended = false,
) {
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const effectiveSpeed = speedOverride ?? speed;
  const current = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    current.current = 0;
    setPhase(0);
  }, []);
  const seek = useCallback(
    (degrees: number) => {
      setRunning(false);
      current.current = Math.min(TAU * cycleCount, Math.max(0, (degrees * Math.PI) / 180));
      setPhase(current.current);
    },
    [cycleCount],
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReducedMotion(preference.matches);
      setRunning(false);
    };
    change();
    preference.addEventListener("change", change);
    const visibility = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    // Keep user intent and phase while offscreen. A fresh timestamp on resume
    // excludes the invisible interval instead of catching up with a large jump.
    if (!running || suspended) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      current.current = advancePlayback(
        current.current,
        (now - previous) / 1000,
        cyclesPerSecond,
        effectiveSpeed,
        cycleCount,
      );
      previous = now;
      setPhase(current.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, suspended, effectiveSpeed, cyclesPerSecond, cycleCount]);
  return {
    phase,
    running,
    suspended,
    speed,
    setSpeed,
    pause,
    reset,
    seek,
    reducedMotion,
    start: () => setRunning(true),
  };
}
