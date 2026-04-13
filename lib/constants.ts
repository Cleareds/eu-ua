import type { ChapterStatus } from "./types";
import type { SiteDamage } from "./types";

// ── Brand Colors ──────────────────────────────────────────
export const COLORS = {
  euBlue: "#003399",
  uaYellow: "#FFD700",
  appBg: "#F8F9FA",
  appText: "#1A1A2E",
} as const;

// ── Chapter Status ────────────────────────────────────────
export const CHAPTER_STATUS: Record<
  ChapterStatus,
  { label: string; color: string; bg: string }
> = {
  not_started: { label: "Not Started", color: "#6B7280", bg: "#F3F4F6" },
  screening: { label: "Screening", color: "#D97706", bg: "#FEF3C7" },
  negotiation: { label: "Negotiation", color: "#2563EB", bg: "#DBEAFE" },
  completed: { label: "Completed", color: "#059669", bg: "#D1FAE5" },
};

// ── Heritage Damage Levels ────────────────────────────────
export const DAMAGE_CONFIG: Record<
  SiteDamage,
  { label: string; bg: string; color: string; dot: string }
> = {
  destroyed: { label: "Destroyed", bg: "#FEF2F2", color: "#cc0000", dot: "#cc0000" },
  severely_damaged: { label: "Severely Damaged", bg: "#FFF7ED", color: "#c2410c", dot: "#f97316" },
  damaged: { label: "Damaged", bg: "#FFFBEB", color: "#b45309", dot: "#eab308" },
};

// ── Timeline Era Colors ───────────────────────────────────
export const ERA_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  ancient: { bg: "#EFF6FF", text: "#1d4ed8", border: "#93c5fd" },
  medieval: { bg: "#F5F3FF", text: "#6d28d9", border: "#c4b5fd" },
  "early-modern": { bg: "#FFF7ED", text: "#c2410c", border: "#fdba74" },
  "national-awakening": { bg: "#FDF4FF", text: "#7e22ce", border: "#e879f9" },
  independence: { bg: "#F0FDF4", text: "#166534", border: "#86efac" },
  "eu-path": { bg: "#EFF6FF", text: "#003399", border: "#60a5fa" },
  modern: { bg: "#F8F9FA", text: "#374151", border: "#9ca3af" },
};

// ── Chart Colors ──────────────────────────────────────────
export const CHART_COLORS = {
  primary: "#003399",
  primaryLight: "#1a4db8",
  red: "#DC2626",
  redLight: "#EF4444",
} as const;
