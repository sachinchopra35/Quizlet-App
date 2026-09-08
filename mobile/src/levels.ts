import type { Medal, QuizState } from "./rounds";
import { parseMedalLabel } from "./rounds";

export type LevelTier = "blue" | "bronze" | "silver" | "gold";

/** Keyword to emoji. Longest / most specific keys first — first match wins. */
const EMOJI_RULES: [string, string][] = [
  ["plans and next - mixed 03", "👩‍🏫"],
  ["plans and next - mixed 02", "🧑‍🏫"],
  ["plans and next - mixed 01", "👨🏽‍🏫"],
  ["already and not yet", "😏"],
  ["can and can't", "🥺"],
  ["checking on people", "👍"],
  ["out and about", "🚶"],
  ["people at home", "🏡"],
  ["wants and needs", "🙏"],
  ["wants - chahna", "🙏"],
  ["how and which", "🤷‍♂️"],
  ["agar - if", "🤷‍♂️"],
  ["at the door", "👨‍🔧"],
  ["ke - and then", "👉"],
  ["with and to", "🧑‍🤝‍🧑"],
  ["quick replies", "💥"],
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
  const key = name.replace(/\.csv$/i, "").replace(/^\d+[a-z]?\s+/, "").toLowerCase();
  if (key === "to be") return "🐝";
  for (const [needle, emoji] of EMOJI_RULES) {
    if (key.includes(needle)) return emoji;
  }
  return DEFAULT_LEVEL_EMOJI;
}

/** Map a medal emoji from medalForRound onto a button colour tier. */
export function medalTier(medal: string | null | undefined): LevelTier {
  switch (medal) {
    case "🏅":
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

/** Single stage-trophy slot per stage — the landmark furthest down the map. */
export function levelTrophySlot(
  index: number,
  levelCount: number,
): { side: LandmarkSide } | null {
  const stage = stageNumber(index);
  const start = (stage - 1) * STAGE_SIZE;
  const end = Math.min(start + STAGE_SIZE, levelCount);
  let trophyIndex: number | null = null;
  for (let i = start; i < end; i++) {
    if (i % STAGE_SIZE === 0) continue;
    const phase = i % MAP_WAVE_LENGTH;
    if (phase === 3 || phase === 9) trophyIndex = i;
  }
  if (trophyIndex !== index) return null;
  const phase = index % MAP_WAVE_LENGTH;
  return { side: phase === 3 ? "left" : "right" };
}
const STAGE_CLASSIC_PALETTE_COUNT = 6;
/** Muted slots after classics — no grey tones (plum, teal, mauve, ochre). */
const STAGE_MUTED_PALETTE_OFFSET = 6;
const STAGE_MUTED_PALETTE_COUNT = 4;

/** 0-based palette slot: stages 1–6 classic colours, then muted colours without repeating classics. */
export function stagePaletteIndex(index: number): number {
  const stage = Math.floor(index / STAGE_SIZE);
  if (stage < STAGE_CLASSIC_PALETTE_COUNT) return stage;
  return (
    STAGE_MUTED_PALETTE_OFFSET +
    ((stage - STAGE_CLASSIC_PALETTE_COUNT) % STAGE_MUTED_PALETTE_COUNT)
  );
}

/** CSS class for an unplayed level's stage colour. */
export function stageClass(index: number): string {
  return `stage-${stagePaletteIndex(index)}`;
}

/** 1-based stage number for labels (Stage 1, Stage 2, …). */
export function stageNumber(index: number): number {
  return Math.floor(index / STAGE_SIZE) + 1;
}

/** Total number of stages for a course length (final stage may be short). */
export function stageCount(levelCount: number): number {
  if (levelCount <= 0) return 1;
  return Math.ceil(levelCount / STAGE_SIZE);
}

const STAGE_DIVIDER_DESCRIPTIONS: Record<number, string> = {
  1: "Getting Started",
  2: "Household Punjabi",
  3: "Describing things",
  4: "More Household Phrases",
  5: "Past and Future",
  6: "Plans and Timings",
  7: "Life and Hobbies",
  8: "Complex Phrases",
  9: "Advanced Grammar",
};

export function stageDividerLabel(stageNum: number): string {
  const desc = STAGE_DIVIDER_DESCRIPTIONS[stageNum];
  if (desc) return `Stage ${stageNum}: ${desc}`;
  return `Stage ${stageNum}`;
}

/** Medal emoji for a flawless round (0 wrong answers). */
export const PERFECT_MEDAL = "🥇";

function isPerfectMedal(medal: Medal | undefined): boolean {
  if (!medal) return false;
  const parts = parseMedalLabel(medal.label);
  if (parts) return parts[0] === parts[1];
  return medal.emoji === PERFECT_MEDAL || medal.emoji === "🏅";
}

/** Level names in a 1-based stage. The final stage may be short. */
export function stageLevelNames(csvNames: string[], stage: number): string[] {
  const start = (stage - 1) * STAGE_SIZE;
  if (start < 0) return [];
  return csvNames.slice(start, start + STAGE_SIZE);
}

/** True when every level in the stage has a perfect medal. */
export function stageMastered(
  csvNames: string[],
  levelMedals: Record<string, Medal>,
  stage: number,
): boolean {
  const names = stageLevelNames(csvNames, stage);
  if (!names.length) return false;
  return names.every((name) => isPerfectMedal(levelMedals[name]));
}

/** Share of vocab levels cleared with a perfect score, 0..1. */
export function courseGoldProgress(
  csvNames: string[],
  levelMedals: Record<string, Medal>,
): number {
  if (!csvNames.length) return 0;
  const perfect = csvNames.filter((name) => isPerfectMedal(levelMedals[name])).length;
  return perfect / csvNames.length;
}

export type CourseProgressTier = "green" | "bronze" | "silver" | "gold";

export type RoundProgressTier = CourseProgressTier;

/** Footer bar colour tier from overall perfect-level progress. */
export function courseProgressTier(progress: number): CourseProgressTier {
  if (progress >= 0.9) return "gold";
  if (progress >= 0.8) return "silver";
  if (progress >= 0.7) return "bronze";
  return "green";
}

export function firstTryWrongCount(state: QuizState): number {
  return Object.values(state.firstAttemptOk).filter((v) => v === false).length;
}

/** In-round bar colour from first-try wrong count (matches medal tiers). */
export function roundProgressTier(state: QuizState): RoundProgressTier {
  const wrong = firstTryWrongCount(state);
  const complete = state.queue.length === 0;
  if (complete) {
    if (wrong === 0) return "gold";
    if (wrong === 1) return "silver";
    return "bronze";
  }
  if (wrong >= 2) return "bronze";
  if (wrong === 1) return "silver";
  return "green";
}

/** Fraction of the round cleared, 0..1. Wrong cards go back on the queue. */
export function roundProgress(state: QuizState): number {
  const total = state.vocabRows.length;
  if (!total) return 0;
  const cleared = total - state.queue.length;
  return Math.min(1, Math.max(0, cleared / total));
}
