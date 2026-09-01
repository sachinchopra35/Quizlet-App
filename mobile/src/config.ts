export const STYLE_FROM_EN = "Translate from English";
export const STYLE_TO_EN = "Translate to English";
export const BEAST_MODE_SELECTION = "__beast_mode__";
export const SPEECH_LEAD_MS = 250;
export const BEAST_MODE_SIZE = 10;
export const STAGE_PRACTICE_PREFIX = "__stage_practice_";
export const STAGE_PRACTICE_SIZE = 10;
export const WIN_CHEAT_CODE = "letmewin100";

export function isWinCheatCode(text: string): boolean {
  return text.trim().toLowerCase() === WIN_CHEAT_CODE;
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

export function styleFromDirection(direction: Direction): string {
  return direction === "lang_to_en" ? STYLE_TO_EN : STYLE_FROM_EN;
}
