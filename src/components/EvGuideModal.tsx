import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  guideSection,
  readGuideSnapshot,
  saveGuideSnapshot,
  type GuideSection,
} from "@/lib/ev-guide-context";

export function EvGuideModal({
  src,
  title,
  education,
  section,
  onSection,
  onClose,
  onLab,
}: {
  src: string;
  title: string;
  education: boolean;
  section: GuideSection;
  onSection: (section: GuideSection) => void;
  onClose: () => void;
  onLab: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const close = useRef<HTMLButtonElement>(null);
  const originY = useRef(0);
  const latest = useRef({ section, onSection, onClose, onLab });
  latest.current = { section, onSection, onClose, onLab };
  useEffect(() => {
    if (!mounted) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const y = education ? readGuideSnapshot().pageY : window.scrollY;
    originY.current = y;
    const { overflow, position, top, width } = document.body.style;
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${y}px`,
      width: "100%",
      overflow: "hidden",
    });
    close.current?.focus({ preventScroll: true });
    return () => {
      Object.assign(document.body.style, { overflow, position, top, width });
      window.scrollTo(0, y);
      const target =
        previousFocus?.isConnected && previousFocus !== document.body
          ? previousFocus
          : document.querySelector<HTMLElement>("[data-ev-guide-opener]");
      target?.focus({ preventScroll: true });
    };
  }, [education, src, mounted]);
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow)
        return;
      const data = event.data;
      if (!data || typeof data !== "object" || data.channel !== "pura-ev-guide-v1") return;
      if (data.type === "close") {
        latest.current.onClose();
        return;
      }
      if (data.type === "focus-close") {
        close.current?.focus({ preventScroll: true });
        return;
      }
      if (!education) return;
      if (data.type === "ready") {
        frame.current?.contentWindow?.postMessage(
          {
            channel: "pura-ev-guide-v1",
            type: "restore",
            ...readGuideSnapshot(),
            section: latest.current.section,
          },
          window.location.origin,
        );
        return;
      }
      if (data.type !== "section" && data.type !== "open-lab") return;
      if (guideSection(data.section) !== data.section) return;
      if (data.type === "open-lab" && data.section !== "motor") return;
      saveGuideSnapshot({
        section: data.section,
        frameY: data.frameY,
        pageY: originY.current,
        focus: data.type === "open-lab" ? "motor-link" : "section",
      });
      if (data.type === "open-lab") {
        if (data.section === "motor") latest.current.onLab();
      } else latest.current.onSection(data.section);
    };
    window.addEventListener("message", message);
    return () => window.removeEventListener("message", message);
  }, [education]);
  if (!mounted) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed inset-0 w-screen h-screen bg-slate-950"
      style={{ zIndex: 2147483647 }}
    >
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" />
      <div className="absolute inset-0 flex items-center justify-center">
        <iframe
          ref={frame}
          src={src}
          title={title}
          className="w-full h-full border-0 bg-slate-950"
        />
      </div>
      <button
        ref={close}
        type="button"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Tab" && src.split("?")[0] === "/interactivos/tesla-model-3.html") {
            event.preventDefault();
            frame.current?.contentWindow?.postMessage(
              {
                channel: "pura-ev-guide-v1",
                type: "focus",
                edge: event.shiftKey ? "last" : "first",
              },
              window.location.origin,
            );
          }
        }}
        className="fixed top-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-950/90 text-white ring-1 ring-emerald-400/50 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-emerald-400 hover:text-slate-950 transition shadow-2xl"
        style={{ zIndex: 2147483647 }}
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" /> Cerrar
      </button>
    </div>,
    document.body,
  );
}
