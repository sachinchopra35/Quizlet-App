import { describe, expect, it } from "vitest";
import {
  canRevealAnswer,
  correctFeedbackMessage,
  createInitialState,
  endRoundStats,
  medalForRound,
  processAnswer,
  processReveal,
  startRound,
} from "../src/rounds";
import type { VocabRow } from "../src/vocab";

const rows: VocabRow[] = [
  { en: "one", lang: "ikk" },
  { en: "two", lang: "do" },
];

function fixedState(queue: number[] = [0, 1]) {
  const state = startRound(createInitialState(), rows, "en_to_lang");
  return { ...state, queue: [...queue] };
}

describe("processReveal", () => {
  it("does not offer reveal before a wrong attempt", () => {
    const state = fixedState();
    expect(canRevealAnswer(state)).toBe(false);
    expect(processReveal(state)).toEqual(state);
  });

  it("does not offer reveal immediately after a wrong answer", () => {
    let state = fixedState();
    state = processAnswer(state, "nope");
    expect(state.lastWrongIdx).toBe(0);
    expect(canRevealAnswer(state)).toBe(false);
  });

  it("offers reveal when a previously wrong card returns", () => {
    let state = fixedState();
    state = processAnswer(state, "nope"); // Q0 wrong → Q1 front
    state = processAnswer(state, "do"); // Q1 correct → Q0 front
    expect(canRevealAnswer(state)).toBe(true);
  });

  it("reveals the answer without clearing the card or changing first-try score", () => {
    let state = fixedState();
    state = processAnswer(state, "nope");
    state = processAnswer(state, "do");
    state = processReveal(state);

    expect(state.revealedAnswers[0]).toBe("ikk");
    expect(state.queue).toEqual([0]);
    expect(state.firstAttemptOk[0]).toBe(false);
    expect(canRevealAnswer(state)).toBe(false);
  });

  it("lets the user clear the card after typing the revealed answer", () => {
    let state = fixedState();
    state = processAnswer(state, "nope");
    state = processAnswer(state, "do");
    state = processReveal(state);
    state = processAnswer(state, "ikk");

    expect(state.queue).toEqual([]);
    expect(state.firstAttemptOk[0]).toBe(false);
    expect(state.firstAttemptOk[1]).toBe(true);
    const [correct, total] = endRoundStats(state);
    expect(correct).toBe(1);
    expect(total).toBe(2);
    expect(medalForRound(correct, total)).toBe("🥈");
  });

  it("assigns a reveal monkey when a card is first answered wrong", () => {
    const state = processAnswer(fixedState(), "nope");
    expect(["🙈", "🙉", "🙊"]).toContain(state.revealMonkeys[0]);
  });
});

describe("correctFeedbackMessage", () => {
  it("cycles through four success messages", () => {
    expect(correctFeedbackMessage(0)).toBe("Correct — nice.");
    expect(correctFeedbackMessage(1)).toBe("Correct!");
    expect(correctFeedbackMessage(2)).toBe("Correct! Well done.");
    expect(correctFeedbackMessage(3)).toBe("Correct! Good answer.");
    expect(correctFeedbackMessage(4)).toBe("Correct — nice.");
  });
});
