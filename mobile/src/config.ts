export const STYLE_FROM_EN = "Translate from English";
export const STYLE_TO_EN = "Translate to English";
export const BEAST_MODE_SELECTION = "__beast_mode__";
export const SPEECH_LEAD_MS = 250;
export const BEAST_MODE_SIZE = 10;
export const DEFAULT_BEAST_STAGE_MIN = 1;
export const STAGE_PRACTICE_PREFIX = "__stage_practice_";
export const STAGE_PRACTICE_SIZE = 10;
export const WIN_CHEAT_CODES = [
  "letmewin100",
  "letmewin90",
  "letmewin80",
] as const;

export const WIN_CHEAT_CODE = WIN_CHEAT_CODES[0];

/** First-try wrong-answer count for a win cheat, or null if not a cheat. */
export function parseWinCheatCode(text: string): number | null {
  switch (text.trim().toLowerCase()) {
    case "letmewin100":
      return 0;
    case "letmewin90":
      return 1;
    case "letmewin80":
      return 2;
    default:
      return null;
  }
}

export function isWinCheatCode(text: string): boolean {
  return parseWinCheatCode(text) !== null;
}

/** Pause on the final quiz frame so the progress bar can finish animating. */
export const ROUND_COMPLETE_HOLD_MS = 400;

export function stagePracticeKey(stage: number): string {
  return `${STAGE_PRACTICE_PREFIX}${stage}__`;
}

/** Stage number for a practice key, or null if the name is a real level. */
export function parseStagePracticeKey(name: string): number | null {
  const match = /^__stage_practice_(\d+)__$/.exec(name);
  if (!match) return null;
  return Number(match[1]);
}

export type Direction = "en_to_lang" | "lang_to_en";

export function directionFromStyle(style: string): Direction {
  return style === STYLE_TO_EN ? "lang_to_en" : "en_to_lang";
}

/** Clamp and order a beast-mode stage range against the current course. */
export function clampBeastStageRange(
  min: number,
  max: number,
  stageCount: number,
): { min: number; max: number } {
  const cap = Math.max(1, stageCount);
  let lo = Math.min(Math.max(1, Math.floor(min) || 1), cap);
  let hi = Math.min(Math.max(1, Math.floor(max) || 1), cap);
  if (lo > hi) hi = lo;
  return { min: lo, max: hi };
}

export function defaultBeastStageRange(stageCount: number): { min: number; max: number } {
  return clampBeastStageRange(DEFAULT_BEAST_STAGE_MIN, stageCount, stageCount);
}

export function styleFromDirection(direction: Direction): string {
  return direction === "lang_to_en" ? STYLE_TO_EN : STYLE_FROM_EN;
}
