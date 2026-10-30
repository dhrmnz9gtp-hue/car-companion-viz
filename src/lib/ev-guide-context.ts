export const GUIDE_SECTIONS = [
  "bateria",
  "motor",
  "carga",
  "cabina",
  "regen",
  "seguridad",
] as const;
export type GuideSection = (typeof GUIDE_SECTIONS)[number];
export const guideSection = (value: unknown): GuideSection =>
  GUIDE_SECTIONS.includes(value as GuideSection) ? (value as GuideSection) : "bateria";

export function educationSearch(search: Record<string, unknown>): {
  guide?: "education";
  section?: GuideSection;
} {
  return search.guide === "education"
    ? { guide: "education", section: guideSection(search.section) }
    : {};
}

export function labOriginSearch(search: Record<string, unknown>): { from?: "ev-guide" } {
  return search.from === "ev-guide" ? { from: "ev-guide" } : {};
}

const coordinate = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100000, value)) : 0;
export function guideSnapshot(value: unknown) {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    section: guideSection(data.section),
    frameY: coordinate(data.frameY),
    pageY: coordinate(data.pageY),
    focus: data.focus === "motor-link" ? "motor-link" : "section",
  };
}
export const GUIDE_STORAGE_KEY = "pura.ev-guide.return.v1";
export function readGuideSnapshot() {
  try {
    return guideSnapshot(JSON.parse(sessionStorage.getItem(GUIDE_STORAGE_KEY) || "null"));
  } catch {
    return guideSnapshot(null);
  }
}
export function saveGuideSnapshot(value: unknown) {
  try {
    sessionStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(guideSnapshot(value)));
  } catch {
    // Navigation and URL-based section restoration also work without storage.
  }
}
