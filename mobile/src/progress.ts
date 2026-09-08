import {
  BEAST_MODE_SELECTION,
  clampBeastStageRange,
  defaultBeastStageRange,
  directionFromStyle,
  parseStagePracticeKey,
} from "./config";
import { CSV_LEVEL_RENAMES } from "./csvRenames";
import { stageCount } from "./levels";
import { bestMedal, migrateMedal, type Medal, type QuizState } from "./rounds";

const STORAGE_KEY = "learn-punjabi-progress";
const SAVE_VERSION = 4;

export interface SavedProgress {
  version: 4;
  levelMedals: Record<string, Medal>;
  audioMuted: boolean;
  questionStyle: string;
  beastStageMin?: number;
  beastStageMax?: number;
}

interface SavedProgressV1 {
  version: 1;
  levelMedals: Record<string, Medal>;
  audioMuted: boolean;
  questionStyle: string;
}

interface SavedProgressV2 {
  version: 2;
  levelMedals: Record<string, Medal>;
  audioMuted: boolean;
  questionStyle: string;
  beastStageMin?: number;
  beastStageMax?: number;
}

interface SavedProgressV3 {
  version: 3;
  levelMedals: Record<string, Medal>;
  audioMuted: boolean;
  questionStyle: string;
  beastStageMin?: number;
  beastStageMax?: number;
}

export function pickPersistable(state: QuizState): SavedProgress {
  return {
    version: SAVE_VERSION,
    levelMedals: state.levelMedals,
    audioMuted: state.audioMuted,
    questionStyle: state.questionStyle,
    beastStageMin: state.beastStageMin,
    beastStageMax: state.beastStageMax,
  };
}

function migrateMedals(medals: Record<string, Medal>): Record<string, Medal> {
  const out: Record<string, Medal> = {};
  for (const [name, medal] of Object.entries(medals)) {
    out[name] = migrateMedal(medal);
  }
  return out;
}

function renameLevelMedals(medals: Record<string, Medal>): Record<string, Medal> {
  const out: Record<string, Medal> = {};
  for (const [name, medal] of Object.entries(medals)) {
    const renamed = CSV_LEVEL_RENAMES[name] ?? name;
    const migrated = migrateMedal(medal);
    out[renamed] = bestMedal(out[renamed], migrated);
  }
  return out;
}

export function pruneMedals(
  medals: Record<string, Medal>,
  csvNames: string[],
): Record<string, Medal> {
  const allowed = new Set([...csvNames, BEAST_MODE_SELECTION]);
  const pruned: Record<string, Medal> = {};
  for (const [name, medal] of Object.entries(medals)) {
    if (allowed.has(name) || parseStagePracticeKey(name) !== null) pruned[name] = medal;
  }
  return pruned;
}

export function applySaved(
  state: QuizState,
  saved: SavedProgress,
  csvNames: string[],
): QuizState {
  const stages = stageCount(csvNames.length);
  const range = clampBeastStageRange(
    saved.beastStageMin ?? defaultBeastStageRange(stages).min,
    saved.beastStageMax ?? defaultBeastStageRange(stages).max,
    stages,
  );
  return {
    ...state,
    levelMedals: pruneMedals(saved.levelMedals, csvNames),
    audioMuted: saved.audioMuted,
    questionStyle: saved.questionStyle,
    direction: directionFromStyle(saved.questionStyle),
    beastStageMin: range.min,
    beastStageMax: range.max,
  };
}

function migrateV1(raw: SavedProgressV1): SavedProgress {
  return {
    version: SAVE_VERSION,
    levelMedals: renameLevelMedals(migrateMedals(raw.levelMedals)),
    audioMuted: raw.audioMuted,
    questionStyle: raw.questionStyle,
  };
}

function migrateV2(raw: SavedProgressV2): SavedProgress {
  return {
    version: SAVE_VERSION,
    levelMedals: renameLevelMedals(migrateMedals(raw.levelMedals)),
    audioMuted: raw.audioMuted,
    questionStyle: raw.questionStyle,
    beastStageMin: raw.beastStageMin,
    beastStageMax: raw.beastStageMax,
  };
}

function migrateV3(raw: SavedProgressV3): SavedProgress {
  return {
    version: SAVE_VERSION,
    levelMedals: renameLevelMedals(raw.levelMedals),
    audioMuted: raw.audioMuted,
    questionStyle: raw.questionStyle,
    beastStageMin: raw.beastStageMin,
    beastStageMax: raw.beastStageMax,
  };
}

function parseSaved(raw: unknown): SavedProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Record<string, unknown>;
  if (parsed.version === 1) {
    return migrateV1(parsed as unknown as SavedProgressV1);
  }
  if (parsed.version === 2) {
    return migrateV2(parsed as unknown as SavedProgressV2);
  }
  if (parsed.version === 3) {
    return migrateV3(parsed as unknown as SavedProgressV3);
  }
  if (parsed.version !== SAVE_VERSION) return null;
  if (typeof parsed.audioMuted !== "boolean") return null;
  if (typeof parsed.questionStyle !== "string") return null;
  if (!parsed.levelMedals || typeof parsed.levelMedals !== "object") return null;
  return parsed as unknown as SavedProgress;
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSaved(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProgress(data: SavedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
