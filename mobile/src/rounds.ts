import {
  BEAST_MODE_SIZE,
  parseWinCheatCode,
  type Direction,
  STYLE_FROM_EN,
  styleFromDirection,
} from "./config";
import { answersMatch } from "./matching";
import type { VocabRow } from "./vocab";

export type FeedbackKind = "correct" | "wrong";
export type Feedback = [FeedbackKind, string, string];

export const CORRECT_FEEDBACK_MESSAGES = [
  "Correct — nice.",
  "Correct!",
  "Correct! Well done.",
  "Correct! Good answer.",
] as const;

export function correctFeedbackMessage(turn: number): string {
  return CORRECT_FEEDBACK_MESSAGES[turn % CORRECT_FEEDBACK_MESSAGES.length];
}

const REVEAL_MONKEYS = ["🙈", "🙉", "🙊"] as const;

function randomRevealMonkey(): string {
  return REVEAL_MONKEYS[Math.floor(Math.random() * REVEAL_MONKEYS.length)]!;
}

function answerForRowIndex(state: QuizState, idx: number): string {
  const row = state.vocabRows[idx]!;
  return state.direction === "en_to_lang" ? row.lang : row.en;
}

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
  /** Wrong submissions per card this round (for Reveal Answer eligibility). */
  wrongAttempts: Record<number, number>;
  /** Cards whose answer the user chose to reveal. */
  revealedAnswers: Record<number, string>;
  /** Monkey emoji picked once per card when it first goes wrong. */
  revealMonkeys: Record<number, string>;
  /** Row index that was just answered wrong (suppress reveal on that frame). */
  lastWrongIdx: number | null;
  /** Count of correct answers this round (cycles success feedback copy). */
  correctFeedbackTurn: number;
  audioMuted: boolean;
  beastMode: boolean;
  beastStageMin: number;
  beastStageMax: number;
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
    wrongAttempts: {},
    revealedAnswers: {},
    revealMonkeys: {},
    lastWrongIdx: null,
    correctFeedbackTurn: 0,
    audioMuted: false,
    beastMode: false,
    beastStageMin: 1,
    beastStageMax: 1,
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
    wrongAttempts: {},
    revealedAnswers: {},
    revealMonkeys: {},
    lastWrongIdx: null,
    correctFeedbackTurn: 0,
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

/** True when the user may tap Reveal Answer on the current card. */
export function canRevealAnswer(state: QuizState): boolean {
  const idx = currentRowIndex(state);
  if (idx === null) return false;
  if (state.revealedAnswers[idx]) return false;
  return (state.wrongAttempts[idx] ?? 0) >= 1;
}

export function revealedAnswerForCurrent(state: QuizState): string | null {
  const idx = currentRowIndex(state);
  if (idx === null) return null;
  return state.revealedAnswers[idx] ?? null;
}

export function revealMonkeyForCurrent(state: QuizState): string {
  const idx = currentRowIndex(state);
  if (idx === null) return REVEAL_MONKEYS[0];
  return state.revealMonkeys[idx] ?? REVEAL_MONKEYS[0];
}

export function endRoundStats(state: QuizState): [number, number, number] {
  const flags = state.firstAttemptOk;
  const total = Object.keys(flags).length;
  const correct = Object.values(flags).filter((v) => v === true).length;
  const pct = total ? (100 * correct) / total : 0;
  return [correct, total, pct];
}

/** Build first-try flags for a win cheat (N wrong answers, or all wrong if impossible). */
export function firstAttemptOkForCheatWrongCount(
  total: number,
  wrongCount: number,
): Record<number, boolean> {
  if (total <= 0) return {};
  if (wrongCount >= total) {
    return Object.fromEntries([...Array(total).keys()].map((i) => [i, false]));
  }
  const correctCount = total - wrongCount;
  return Object.fromEntries(
    [...Array(total).keys()].map((i) => [i, i < correctCount]),
  );
}

export function medalForRound(correct: number, total: number): string {
  const wrong = total - correct;
  if (wrong === 0) return "🥇";
  if (wrong === 1) return "🥈";
  return "🥉";
}

function medalRank(emoji: string): number {
  switch (emoji) {
    case "🏅":
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

export function parseMedalLabel(label: string): [number, number] | null {
  const match = /^(\d+)\/(\d+)$/.exec(label);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

/** Recompute emoji from stored label (handles legacy four-tier saves). */
export function migrateMedal(medal: Medal): Medal {
  const parts = parseMedalLabel(medal.label);
  if (!parts) {
    if (medal.emoji === "🏅") return { ...medal, emoji: "🥇" };
    return medal;
  }
  return { emoji: medalForRound(parts[0], parts[1]), label: medal.label };
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

  const cheatWrong = parseWinCheatCode(userText);
  if (cheatWrong !== null) {
    return {
      ...state,
      queue: [],
      firstAttemptOk: firstAttemptOkForCheatWrongCount(state.vocabRows.length, cheatWrong),
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
  let lastWrongIdx = state.lastWrongIdx;
  const wrongAttempts = { ...state.wrongAttempts };
  const revealMonkeys = { ...state.revealMonkeys };
  let correctFeedbackTurn = state.correctFeedbackTurn;
  if (ok) {
    queue.shift();
    lastFeedback = ["correct", promptSide, answer];
    lastWrongIdx = null;
    correctFeedbackTurn += 1;
  } else {
    wrongAttempts[idx] = (wrongAttempts[idx] ?? 0) + 1;
    if (!revealMonkeys[idx]) revealMonkeys[idx] = randomRevealMonkey();
    const wrong = queue.shift()!;
    queue.push(wrong);
    lastFeedback = ["wrong", userText, answer];
    lastWrongIdx = idx;
  }

  return {
    ...state,
    queue,
    firstAttemptOk,
    wrongAttempts,
    revealMonkeys,
    lastWrongIdx,
    correctFeedbackTurn,
    lastFeedback,
    feedbackSoundGen: state.feedbackSoundGen + 1,
  };
}

export function processReveal(state: QuizState): QuizState {
  const idx = currentRowIndex(state);
  if (idx === null) return state;
  if (!canRevealAnswer(state)) return state;

  const answer = answerForRowIndex(state, idx);
  return {
    ...state,
    revealedAnswers: { ...state.revealedAnswers, [idx]: answer },
    lastWrongIdx: null,
    lastFeedback: null,
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
