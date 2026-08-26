import type { Medal, QuizState } from "./rounds";

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

/** Peak horizontal displacement (px) — unchanged from the prior map. */
const MAP_WAVE_AMPLITUDE = 118;
/** Levels per full left-right-left cycle (was 8; 1.5× longer = gentler curve). */
const MAP_WAVE_LENGTH = 12;

/** Horizontal offset for level index — smooth sine path down the map. */
export function levelOffset(index: number): number {
  const angle = (2 * Math.PI * index) / MAP_WAVE_LENGTH;
  const offset = Math.round(MAP_WAVE_AMPLITUDE * Math.sin(angle));
  return offset === 0 ? 0 : offset;
}

export const STAGE_SIZE = 10;

const LANDMARKS = ["🌳", "🏔️", "🌲", "🦚", "🌴", "🗻", "🌵", "🏕️"];

export type LandmarkSide = "left" | "right";

/** Decorative emoji opposite the curve peak at sine extrema. */
export function levelLandmark(index: number): { emoji: string; side: LandmarkSide } | null {
  const phase = index % MAP_WAVE_LENGTH;
  if (phase !== 3 && phase !== 9) return null;
  if (index % STAGE_SIZE === 0) return null;
  const cycle = Math.floor(index / MAP_WAVE_LENGTH);
  const pick = phase === 3 ? cycle * 2 : cycle * 2 + 1;
  return {
    emoji: LANDMARKS[pick % LANDMARKS.length]!,
    side: phase === 3 ? "left" : "right",
  };
}
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

export function stageLevelNames(csvNames: string[], stage: number): string[] {
  if (stage < 1) return [];
  const start = (stage - 1) * STAGE_SIZE;
  return csvNames.slice(start, start + STAGE_SIZE);
}

export function stageMastered(
  csvNames: string[],
  levelMedals: Record<string, Medal>,
  stage: number,
): boolean {
  const names = stageLevelNames(csvNames, stage);
  return names.length > 0 && names.every((name) => levelMedals[name]?.emoji === PERFECT_MEDAL);
}

/** Medal emoji for a flawless round (0 wrong answers). */
export const PERFECT_MEDAL = "🏅";

/** Share of vocab levels cleared with a perfect (gold star) score, 0..1. */
export function courseGoldProgress(
  csvNames: string[],
  levelMedals: Record<string, Medal>,
): number {
  if (!csvNames.length) return 0;
  const perfect = csvNames.filter((name) => levelMedals[name]?.emoji === PERFECT_MEDAL).length;
  return perfect / csvNames.length;
}

export type CourseProgressTier = "green" | "bronze" | "silver" | "gold" | "goldstar";

export type RoundProgressTier = CourseProgressTier;

/** Footer bar colour tier from overall perfect-level progress. */
export function courseProgressTier(progress: number): CourseProgressTier {
  if (progress >= 0.95) return "goldstar";
  if (progress >= 0.9) return "gold";
  if (progress >= 0.8) return "silver";
  if (progress >= 0.7) return "bronze";
  return "green";
}

/** In-round bar colour from questions still in the queue. */
export function roundProgressTier(remaining: number): RoundProgressTier {
  if (remaining <= 0) return "goldstar";
  if (remaining === 1) return "gold";
  if (remaining === 2) return "silver";
  if (remaining === 3) return "bronze";
  return "green";
}

/** Fraction of the round cleared, 0..1. Wrong cards go back on the queue. */
export function roundProgress(state: QuizState): number {
  const total = state.vocabRows.length;
  if (!total) return 0;
  const cleared = total - state.queue.length;
  return Math.min(1, Math.max(0, cleared / total));
}
