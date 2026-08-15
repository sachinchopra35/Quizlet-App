export const STYLE_FROM_EN = "Translate from English";
export const STYLE_TO_EN = "Translate to English";
export const BEAST_MODE_SELECTION = "__beast_mode__";
export const SPEECH_LEAD_MS = 250;
export const BEAST_MODE_SIZE = 10;

export type Direction = "en_to_lang" | "lang_to_en";

export function directionFromStyle(style: string): Direction {
  return style === STYLE_TO_EN ? "lang_to_en" : "en_to_lang";
}

export function styleFromDirection(direction: Direction): string {
  return direction === "lang_to_en" ? STYLE_TO_EN : STYLE_FROM_EN;
}
