import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEVEL_EMOJI,
  levelEmoji,
  levelOffset,
  medalTier,
  roundProgress,
  stageClass,
  stageDividerLabel,
  stageNumber,
  stagePaletteIndex,
} from "../src/levels";
import {
  createInitialState,
  processAnswer,
  startRound,
  type QuizState,
} from "../src/rounds";
import type { VocabRow } from "../src/vocab";

describe("levelEmoji", () => {
  it("matches topic keywords", () => {
    expect(levelEmoji("01 Numbers.csv")).toBe("🔢");
    expect(levelEmoji("72 Gym and Exercise.csv")).toBe("💪");
    expect(levelEmoji("64 Nature - Landscape.csv")).toBe("🌳");
    expect(levelEmoji("86 Learning.csv")).toBe("📚");
  });

  it("prefers the more specific living room over room", () => {
    expect(levelEmoji("30 In My Living Room - Present.csv")).toBe("🛋️");
    expect(levelEmoji("28 In My Room - Present.csv")).toBe("🛏️");
  });

  it("falls back to a star", () => {
    expect(levelEmoji("60 Mere Kol.csv")).toBe(DEFAULT_LEVEL_EMOJI);
  });

  it("matches early beginner list topics", () => {
    expect(levelEmoji("04 Possessives - My.csv")).toBe("🤲");
    expect(levelEmoji("07 Fruits and Vegetables.csv")).toBe("🥕");
    expect(levelEmoji("11 Continuous Present 01.csv")).toBe("⏳");
    expect(levelEmoji("13 Animals.csv")).toBe("🐾");
    expect(levelEmoji("15 Family.csv")).toBe("👪");
  });
});

describe("medalTier", () => {
  it("maps each medal to a colour tier", () => {
    expect(medalTier("🏅")).toBe("goldstar");
    expect(medalTier("🥇")).toBe("gold");
    expect(medalTier("🥈")).toBe("silver");
    expect(medalTier("🥉")).toBe("bronze");
  });

  it("defaults to blue when the level has no medal", () => {
    expect(medalTier(undefined)).toBe("blue");
    expect(medalTier(null)).toBe("blue");
  });
});

describe("levelOffset", () => {
  it("snakes and repeats every eight levels", () => {
    expect(levelOffset(0)).toBe(0);
    expect(levelOffset(2)).toBe(118);
    expect(levelOffset(6)).toBe(-118);
    expect(levelOffset(8)).toBe(levelOffset(0));
  });
});

describe("stage helpers", () => {
  it("groups levels into stages of ten", () => {
    expect(stageNumber(0)).toBe(1);
    expect(stageNumber(9)).toBe(1);
    expect(stageNumber(10)).toBe(2);
    expect(stageNumber(59)).toBe(6);
  });

  it("cycles palette every six stages", () => {
    expect(stagePaletteIndex(0)).toBe(0);
    expect(stagePaletteIndex(59)).toBe(5);
    expect(stagePaletteIndex(60)).toBe(0);
    expect(stageClass(60)).toBe("stage-0");
  });

  it("labels stage dividers", () => {
    expect(stageDividerLabel(1)).toBe("Stage 1: Getting Started");
    expect(stageDividerLabel(2)).toBe("Stage 2");
    expect(stageDividerLabel(8)).toBe("Stage 8");
  });
});

describe("roundProgress", () => {
  const rows: VocabRow[] = [
    { en: "one", lang: "ik" },
    { en: "two", lang: "do" },
  ];

  function newRound(): QuizState {
    return startRound(createInitialState(), rows, "en_to_lang");
  }

  it("is zero before any card is cleared", () => {
    expect(roundProgress(newRound())).toBe(0);
    expect(roundProgress(createInitialState())).toBe(0);
  });

  it("advances only when a card leaves the queue", () => {
    const state = newRound();
    const wrong = processAnswer(state, "definitely wrong");
    expect(wrong.queue.length).toBe(2);
    expect(roundProgress(wrong)).toBe(0);

    const idx = state.queue[0]!;
    const right = processAnswer(state, rows[idx]!.lang);
    expect(roundProgress(right)).toBe(0.5);
  });

  it("reaches one when the queue is empty", () => {
    let state = newRound();
    while (state.queue.length) {
      const idx = state.queue[0]!;
      state = processAnswer(state, rows[idx]!.lang);
    }
    expect(roundProgress(state)).toBe(1);
  });
});
