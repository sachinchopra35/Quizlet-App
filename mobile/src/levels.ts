import type { QuizState } from "./rounds";

export type LevelTier = "blue" | "bronze" | "silver" | "gold" | "goldstar";

/** Keyword to emoji. Longest / most specific keys first — first match wins. */
const EMOJI_RULES: [string, string][] = [
  ["living room", "🛋️"],
  ["numbers", "🔢"],
  ["colours", "🎨"],
  ["kitchen", "🍳"],
  ["bathroom", "🛁"],
  ["room", "🛏️"],
  ["nature", "🌳"],
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
const SERPENTINE_OFFSETS = [0, 44, 74, 44, 0, -44, -74, -44];

export function levelOffset(index: number): number {
  const n = SERPENTINE_OFFSETS.length;
  return SERPENTINE_OFFSETS[((index % n) + n) % n]!;
}

/** Fraction of the round cleared, 0..1. Wrong cards go back on the queue. */
export function roundProgress(state: QuizState): number {
  const total = state.vocabRows.length;
  if (!total) return 0;
  const cleared = total - state.queue.length;
  return Math.min(1, Math.max(0, cleared / total));
}
