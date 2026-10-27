import { BEAST_MODE_SELECTION, parseStagePracticeKey } from "./config";

/** UI titles for Lots of * levels (filenames unchanged on disk). */
const LOTS_LEVEL_DISPLAY_NAMES: Record<string, string> = {
  "106 Lots of Verbs 1.csv": "Lots of Verbs - Core",
  "107 Lots of Verbs 2.csv": "Lots of Verbs - Mind & talk",
  "108 Lots of Verbs 3.csv": "Lots of Verbs - Daily life",
  "109 Lots of Verbs 4.csv": "Lots of Verbs - Social",
  "110 Lots of Verbs 5.csv": "Lots of Verbs - Core in sentences",
  "111 Lots of Verbs 6.csv": "Lots of Verbs - Mind & talk in sentences",
  "112 Lots of Verbs 7.csv": "Lots of Verbs - Daily life in sentences",
  "113 Lots of Verbs 8.csv": "Lots of Verbs - Social in sentences",
  "114 Lots of Nouns 1.csv": "Lots of Nouns - Events & occasions",
  "115 Lots of Nouns 2.csv": "Lots of Nouns - Family",
  "116 Lots of Nouns 3.csv": "Lots of Nouns - Health",
  "117 Lots of Nouns 4.csv": "Lots of Nouns - Bedroom",
  "118 Lots of Nouns 5.csv": "Lots of Nouns - Places",
  "119 Lots of Nouns 6.csv": "Lots of Nouns - Work & school",
  "120 Lots of Nouns 7.csv": "Lots of Nouns - Ideas & life",
  "121 Lots of Nouns 8.csv": "Lots of Nouns - Everyday things",
  "122 Lots of Adjectives 1.csv": "Lots of Adjectives - Worth & quality",
  "123 Lots of Adjectives 2.csv": "Lots of Adjectives - Taste & food",
  "124 Lots of Adjectives 3.csv": "Lots of Adjectives - Condition",
  "125 Lots of Adjectives 4.csv": "Lots of Adjectives - Size & colour",
  "126 Lots of Adjectives 5.csv": "Lots of Adjectives - Feelings & health",
  "127 Lots of Adjectives 6.csv": "Lots of Adjectives - Personality",
  "128 Lots of Adjectives 7.csv": "Lots of Adjectives - Easy, true & safe",
};

function displayLevelNumber(numeric: string): string {
  const n = Number(numeric);
  return Number.isFinite(n) ? String(n) : numeric;
}

/** Split a level filename into display number and topic for UI. */
export function levelQuizParts(name: string): { number: string | null; name: string } {
  if (name === BEAST_MODE_SELECTION) return { number: null, name: "Beast Mode" };
  const stage = parseStagePracticeKey(name);
  if (stage !== null) return { number: null, name: `Stage ${stage} Practice` };
  const base = name.replace(/\.csv$/i, "");
  const match = base.match(/^(\d+)\s+(.+)$/);
  if (match) {
    const displayName = LOTS_LEVEL_DISPLAY_NAMES[name] ?? match[2]!;
    return { number: displayLevelNumber(match[1]!), name: displayName };
  }
  return { number: null, name: base };
}

export function levelLabel(name: string): string {
  const parts = levelQuizParts(name);
  if (parts.number !== null) return `${parts.number}: ${parts.name}`;
  return parts.name;
}
