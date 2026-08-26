export const STYLE_FROM_EN = "Translate from English";
export const STYLE_TO_EN = "Translate to English";
export const BEAST_MODE_SELECTION = "__beast_mode__";
export const STAGE_PRACTICE_PREFIX = "__stage_practice_";
export const SPEECH_LEAD_MS = 250;
export const BEAST_MODE_SIZE = 10;

export function stagePracticeKey(stage: number): string {
  return `${STAGE_PRACTICE_PREFIX}${stage}__`;
}

export function parseStagePracticeKey(name: string): number | null {
  const match = name.match(/^__stage_practice_(\d+)__$/);
  if (!match) return null;
  const stage = Number(match[1]);
  return stage > 0 ? stage : null;
}

export type Direction = "en_to_lang" | "lang_to_en";

export function directionFromStyle(style: string): Direction {
  return style === STYLE_TO_EN ? "lang_to_en" : "en_to_lang";
}

export function styleFromDirection(direction: Direction): string {
  return direction === "lang_to_en" ? STYLE_TO_EN : STYLE_FROM_EN;
}
