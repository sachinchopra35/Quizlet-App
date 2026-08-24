import type { QuizState } from "./rounds";

export type LevelTier = "blue" | "bronze" | "silver" | "gold" | "goldstar";

/** Keyword to emoji. Longest / most specific keys first — first match wins. */
const EMOJI_RULES: [string, string][] = [
  ["living room", "🛋️"],
  ["fruits and vegetables", "🥕"],
  ["adjective and noun", "🧩"],
  ["continuous present", "⏳"],
  ["body basics", "👤"],
  ["common things", "🏠"],
  ["possessives", "🤲"],
  ["numbers", "🔢"],
  ["colours", "🎨"],
  ["kitchen", "🍳"],
  ["bathroom", "🛁"],
  ["room", "🛏️"],
  ["nature", "🌳"],
  ["animals", "🐾"],
  ["family", "👪"],
  ["gym", "💪"],
  ["exercise", "💪"],
  ["body", "🧍"],
  ["food", "🍽️"],
  ["meals", "🍽️"],
  ["transport", "🚇"],
  ["music", "🎵"],
  ["health", "🩺"],
  ["work", "💻"],
  ["time", "⏰"],
  ["past", "⏪"],
  ["future", "⏩"],
  ["question", "❓"],
  ["door", "🚪"],
  ["thanks", "🙏"],
  ["learning", "📚"],
  ["ago", "⏳"],
  ["know", "🧠"],
  ["think", "💭"],
  ["feelings", "💛"],
  ["adjectives", "🏷️"],
  ["verbs", "🏃"],
  ["location", "📍"],
  ["positions", "🧭"],
  ["giving", "🤝"],
  ["leaving", "👋"],
  ["negatives", "🚫"],
  ["pasand", "👍"],
  ["chalo", "🚶"],
  ["never", "🔁"],
  ["much", "📦"],
  ["because", "🔗"],
  ["must", "❗"],
  ["myself", "🪞"],
];

export const DEFAULT_LEVEL_EMOJI = "⭐";
export const BEAST_LEVEL_EMOJI = "🔥";

/** Pick a topic emoji for a vocab list filename, falling back to a star. */
export function levelEmoji(name: string): string {
  const key = name.replace(/\.csv$/i, "").toLowerCase();
  for (const [needle, emoji] of EMOJI_RULES) {
    if (key.includes(needle)) return emoji;
  }
  return DEFAULT_LEVEL_EMOJI;
}

/** Map a medal emoji from medalForRound onto a button colour tier. */
export function medalTier(medal: string | null | undefined): LevelTier {
  switch (medal) {
    case "🏅":
      return "goldstar";
    case "🥇":
      return "gold";
    case "🥈":
      return "silver";
    case "🥉":
      return "bronze";
    default:
      return "blue";
  }
}

/** Horizontal offsets (px) that make the level column snake down the page. */
const SERPENTINE_OFFSETS = [0, 70, 118, 70, 0, -70, -118, -70];

export function levelOffset(index: number): number {
  const n = SERPENTINE_OFFSETS.length;
  return SERPENTINE_OFFSETS[((index % n) + n) % n]!;
}

const STAGE_SIZE = 10;
const STAGE_PALETTE_COUNT = 6;

/** 1-based stage number for labels (Stage 1, Stage 2, …). */
export function stageNumber(index: number): number {
  return Math.floor(index / STAGE_SIZE) + 1;
}

/** 0-based palette slot, cycling every 6 stages. */
export function stagePaletteIndex(index: number): number {
  return Math.floor(index / STAGE_SIZE) % STAGE_PALETTE_COUNT;
}

/** CSS class for an unplayed level's stage colour. */
export function stageClass(index: number): string {
  return `stage-${stagePaletteIndex(index)}`;
}

export function stageDividerLabel(stageNum: number): string {
  if (stageNum === 1) return "Stage 1: Getting Started";
  return `Stage ${stageNum}`;
}

/** Fraction of the round cleared, 0..1. Wrong cards go back on the queue. */
export function roundProgress(state: QuizState): number {
  const total = state.vocabRows.length;
  if (!total) return 0;
  const cleared = total - state.queue.length;
  return Math.min(1, Math.max(0, cleared / total));
}
