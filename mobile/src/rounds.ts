import {
  BEAST_MODE_SIZE,
  isWinCheatCode,
  type Direction,
  STYLE_FROM_EN,
  styleFromDirection,
} from "./config";
import { answersMatch } from "./matching";
import type { VocabRow } from "./vocab";

export type FeedbackKind = "correct" | "wrong";
export type Feedback = [FeedbackKind, string, string];

export interface Medal {
  emoji: string;
  label: string;
}

export type Screen = "map" | "quiz";

export interface QuizState {
  screen: Screen;
  levelMedals: Record<string, Medal>;
  vocabRows: VocabRow[];
  queue: number[];
  firstAttemptOk: Record<number, boolean | null>;
  direction: Direction;
  questionStyle: string;
  roundActive: boolean;
  lastFeedback: Feedback | null;
  selectedCsv: string | null;
  roundMessage: string | null;
  roundAnnounce: string | null;
  roundMessageLevel: "info" | "success";
  feedbackSoundGen: number;
  lastChimedFeedbackGen: number;
  audioMuted: boolean;
  beastMode: boolean;
  roundMedals: Medal[];
  csvNames: string[];
}

export function createInitialState(): QuizState {
  return {
    screen: "map",
    levelMedals: {},
    vocabRows: [],
    queue: [],
    firstAttemptOk: {},
    direction: "en_to_lang",
    questionStyle: STYLE_FROM_EN,
    roundActive: false,
    lastFeedback: null,
    selectedCsv: null,
    roundMessage: null,
    roundAnnounce: null,
    roundMessageLevel: "info",
    feedbackSoundGen: 0,
    lastChimedFeedbackGen: 0,
    audioMuted: false,
    beastMode: false,
    roundMedals: [],
    csvNames: [],
  };
}

export function beastSampleSize(poolSize: number): number {
  return Math.min(BEAST_MODE_SIZE, poolSize);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Up to n random rows, without replacement. */
export function sampleRows(rows: VocabRow[], n: number): VocabRow[] {
  return shuffle(rows).slice(0, Math.min(n, rows.length));
}

export function startRound(
  state: QuizState,
  rows: VocabRow[],
  direction: Direction,
): QuizState {
  const n = rows.length;
  const order = shuffle([...Array(n).keys()]);
  return {
    ...state,
    vocabRows: rows,
    direction,
    questionStyle: styleFromDirection(direction),
    queue: order,
    firstAttemptOk: Object.fromEntries(
      [...Array(n).keys()].map((i) => [i, null as boolean | null]),
    ),
    roundActive: true,
    screen: "quiz",
    beastMode: false,
    lastFeedback: null,
    feedbackSoundGen: 0,
    lastChimedFeedbackGen: 0,
  };
}

export function startBeastRound(
  state: QuizState,
  combined: VocabRow[],
  direction: Direction,
): QuizState {
  const sample = sampleRows(combined, beastSampleSize(combined.length));
  const next = startRound(state, sample, direction);
  return { ...next, beastMode: true };
}

export function currentRowIndex(state: QuizState): number | null {
  return state.queue.length ? state.queue[0] : null;
}

export function endRoundStats(state: QuizState): [number, number, number] {
  const flags = state.firstAttemptOk;
  const total = Object.keys(flags).length;
  const correct = Object.values(flags).filter((v) => v === true).length;
  const pct = total ? (100 * correct) / total : 0;
  return [correct, total, pct];
}

export function medalForRound(correct: number, total: number): string {
  const wrong = total - correct;
  if (wrong === 0) return "🏅";
  if (wrong === 1) return "🥇";
  if (wrong === 2) return "🥈";
  return "🥉";
}

function medalRank(emoji: string): number {
  switch (emoji) {
    case "🏅":
      return 4;
    case "🥇":
      return 3;
    case "🥈":
      return 2;
    case "🥉":
      return 1;
    default:
      return 0;
  }
}

function parseMedalLabel(label: string): [number, number] | null {
  const match = /^(\d+)\/(\d+)$/.exec(label);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

/** Keep whichever medal is the better result. */
export function bestMedal(existing: Medal | undefined, incoming: Medal): Medal {
  if (!existing) return incoming;
  const existingRank = medalRank(existing.emoji);
  const incomingRank = medalRank(incoming.emoji);
  if (incomingRank > existingRank) return incoming;
  if (incomingRank < existingRank) return existing;
  const existingParts = parseMedalLabel(existing.label);
  const incomingParts = parseMedalLabel(incoming.label);
  if (!existingParts || !incomingParts) return incoming;
  const existingPct = existingParts[0] / existingParts[1];
  const incomingPct = incomingParts[0] / incomingParts[1];
  return incomingPct > existingPct ? incoming : existing;
}

export function recordRoundMedal(state: QuizState, correct: number, total: number): QuizState {
  const medal: Medal = {
    emoji: medalForRound(correct, total),
    label: `${correct}/${total}`,
  };
  const levelMedals = { ...state.levelMedals };
  if (state.selectedCsv) {
    levelMedals[state.selectedCsv] = bestMedal(levelMedals[state.selectedCsv], medal);
  }
  return { ...state, roundMedals: [...state.roundMedals, medal], levelMedals };
}

export function processAnswer(state: QuizState, userText: string): QuizState {
  const idx = currentRowIndex(state);
  if (idx === null) return state;

  if (isWinCheatCode(userText)) {
    const firstAttemptOk = Object.fromEntries(
      state.vocabRows.map((_, i) => [i, true as const]),
    );
    return {
      ...state,
      queue: [],
      firstAttemptOk,
      lastFeedback: null,
    };
  }

  const row = state.vocabRows[idx];
  const promptSide =
    state.direction === "en_to_lang" ? row.en : row.lang;
  const answer = state.direction === "en_to_lang" ? row.lang : row.en;
  const punjabi = state.direction === "en_to_lang";
  const ok = answersMatch(userText, answer, punjabi);

  const firstAttemptOk = { ...state.firstAttemptOk };
  if (firstAttemptOk[idx] === null || firstAttemptOk[idx] === undefined) {
    firstAttemptOk[idx] = ok;
  }

  const queue = [...state.queue];
  let lastFeedback: Feedback;
  if (ok) {
    queue.shift();
    lastFeedback = ["correct", promptSide, answer];
  } else {
    const wrong = queue.shift()!;
    queue.push(wrong);
    lastFeedback = ["wrong", userText, answer];
  }

  return {
    ...state,
    queue,
    firstAttemptOk,
    lastFeedback,
    feedbackSoundGen: state.feedbackSoundGen + 1,
  };
}

export function completeRoundNaturally(state: QuizState): QuizState {
  const [c, t, pct] = endRoundStats(state);
  const withMedal = recordRoundMedal(state, c, t);
  return {
    ...withMedal,
    roundActive: false,
    screen: "map",
    beastMode: false,
    lastFeedback: null,
    roundMessage: `Quiz complete. You scored ${c} / ${t} (${pct.toFixed(0)}%).`,
    roundAnnounce: `Quiz complete. You scored ${c} out of ${t}.`,
    roundMessageLevel: "success",
  };
}

export function stopRoundEarly(state: QuizState): QuizState {
  const [c, t, pct] = endRoundStats(state);
  return {
    ...state,
    roundActive: false,
    screen: "map",
    beastMode: false,
    queue: [],
    lastFeedback: null,
    roundMessage: `Round stopped early. First-try score so far: ${c} / ${t} (${pct.toFixed(1)}%).`,
    roundAnnounce: `Quiz ended. You scored ${c} out of ${t}.`,
    roundMessageLevel: "info",
  };
}

export function consumeIdleMessages(state: QuizState): {
  state: QuizState;
  message: string | null;
  announce: string | null;
  level: "info" | "success";
} {
  const message = state.roundMessage;
  const announce = state.roundAnnounce;
  const level = state.roundMessageLevel;
  return {
    state: {
      ...state,
      roundMessage: null,
      roundAnnounce: null,
      roundMessageLevel: "info",
    },
    message,
    announce,
    level,
  };
}
