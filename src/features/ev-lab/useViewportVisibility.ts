import { useEffect, useRef, useState } from "react";

export function useViewportVisibility() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      // Rapid scrolling can queue enter and leave in one delivery. Use the
      // latest observation so an earlier entry cannot keep an offscreen loop alive.
      const entry = entries[entries.length - 1];
      if (entry) setVisible(entry.isIntersecting && entry.intersectionRatio > 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}
