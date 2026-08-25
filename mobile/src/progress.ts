import { BEAST_MODE_SELECTION, directionFromStyle } from "./config";
import type { Medal, QuizState } from "./rounds";

const STORAGE_KEY = "learn-punjabi-progress";
const SAVE_VERSION = 1;

export interface SavedProgress {
  version: 1;
  levelMedals: Record<string, Medal>;
  audioMuted: boolean;
  questionStyle: string;
}

export function pickPersistable(state: QuizState): SavedProgress {
  return {
    version: SAVE_VERSION,
    levelMedals: state.levelMedals,
    audioMuted: state.audioMuted,
    questionStyle: state.questionStyle,
  };
}

export function pruneMedals(
  medals: Record<string, Medal>,
  csvNames: string[],
): Record<string, Medal> {
  const allowed = new Set([...csvNames, BEAST_MODE_SELECTION]);
  const pruned: Record<string, Medal> = {};
  for (const [name, medal] of Object.entries(medals)) {
    if (allowed.has(name)) pruned[name] = medal;
  }
  return pruned;
}

export function applySaved(
  state: QuizState,
  saved: SavedProgress,
  csvNames: string[],
): QuizState {
  return {
    ...state,
    levelMedals: pruneMedals(saved.levelMedals, csvNames),
    audioMuted: saved.audioMuted,
    questionStyle: saved.questionStyle,
    direction: directionFromStyle(saved.questionStyle),
  };
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedProgress;
    if (parsed?.version !== SAVE_VERSION) return null;
    if (typeof parsed.audioMuted !== "boolean") return null;
    if (typeof parsed.questionStyle !== "string") return null;
    if (!parsed.levelMedals || typeof parsed.levelMedals !== "object") return null;
    return parsed;
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
