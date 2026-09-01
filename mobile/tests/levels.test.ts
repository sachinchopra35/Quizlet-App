import { describe, expect, it } from "vitest";
import {
  parseStagePracticeKey,
  stagePracticeKey,
} from "../src/config";
import {
  courseGoldProgress,
  courseProgressTier,
  DEFAULT_LEVEL_EMOJI,
  levelEmoji,
  levelLandmark,
  levelOffset,
  medalTier,
  PERFECT_MEDAL,
  roundProgress,
  roundProgressTier,
  stageClass,
  stageDividerLabel,
  stageLevelNames,
  stageMastered,
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

  it("uses hand-picked emojis for selected levels", () => {
    expect(levelEmoji("03 To Be.csv")).toBe("🐝");
    expect(levelEmoji("18 Quick Replies.csv")).toBe("💥");
    expect(levelEmoji("24 With and To.csv")).toBe("🧑‍🤝‍🧑");
    expect(levelEmoji("27 Wants and Needs.csv")).toBe("🙏");
    expect(levelEmoji("48 Ke - And Then.csv")).toBe("👉");
    expect(levelEmoji("49 People at Home - Mixed.csv")).toBe("🏡");
    expect(levelEmoji("50 Out and About - Mixed.csv")).toBe("🚶");
    expect(levelEmoji("51 Checking On People - Mixed.csv")).toBe("👍");
    expect(levelEmoji("52 Plans and Next - Mixed 01.csv")).toBe("👨🏽‍🏫");
    expect(levelEmoji("53 Plans and Next - Mixed 02.csv")).toBe("🧑‍🏫");
    expect(levelEmoji("54 Plans and Next - Mixed 03.csv")).toBe("👩‍🏫");
    expect(levelEmoji("56 Can and Can't.csv")).toBe("🥺");
    expect(levelEmoji("57 Already and Not Yet.csv")).toBe("😏");
    expect(levelEmoji("58 At the Door.csv")).toBe("👨‍🔧");
    expect(levelEmoji("61 How and Which.csv")).toBe("🤷‍♂️");
    expect(levelEmoji("62 Agar - If.csv")).toBe("🤷‍♂️");
    expect(levelEmoji("63 Wants - Chahna.csv")).toBe("🙏");
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
  it("follows a sine wave with 12-level wavelength and 118px amplitude", () => {
    expect(levelOffset(0)).toBe(0);
    expect(levelOffset(3)).toBe(118);
    expect(levelOffset(9)).toBe(-118);
    expect(levelOffset(12)).toBe(levelOffset(0));
    expect(levelOffset(1)).toBe(59);
    expect(levelOffset(2)).toBe(102);
  });
});

describe("levelLandmark", () => {
  it("places a landmark on the left at the rightmost curve peak", () => {
    expect(levelLandmark(3)).toEqual({ emoji: "🌳", side: "left" });
    expect(levelLandmark(15)).toEqual({ emoji: "🌲", side: "left" });
  });

  it("places a landmark on the right at the leftmost curve peak", () => {
    expect(levelLandmark(9)).toEqual({ emoji: "🏔️", side: "right" });
    expect(levelLandmark(21)).toEqual({ emoji: "🦚", side: "right" });
  });

  it("returns null between curve peaks", () => {
    expect(levelLandmark(5)).toBeNull();
    expect(levelLandmark(0)).toBeNull();
  });

  it("skips stage divider rows", () => {
    expect(levelLandmark(30)).toBeNull();
    expect(levelLandmark(60)).toBeNull();
  });

  it("is deterministic for the same index", () => {
    expect(levelLandmark(3)).toEqual(levelLandmark(3));
    expect(levelLandmark(9)).toEqual(levelLandmark(9));
  });
});

describe("courseGoldProgress", () => {
  const levels = ["01 Numbers.csv", "02 Colours.csv", "03 To Be.csv"];

  it("is zero when no levels have a perfect medal", () => {
    expect(courseGoldProgress(levels, {})).toBe(0);
    expect(
      courseGoldProgress(levels, {
        "01 Numbers.csv": { emoji: "🥇", label: "9/10" },
      }),
    ).toBe(0);
  });

  it("counts only perfect gold-star medals", () => {
    expect(
      courseGoldProgress(levels, {
        "01 Numbers.csv": { emoji: PERFECT_MEDAL, label: "10/10" },
        "02 Colours.csv": { emoji: "🥇", label: "9/10" },
      }),
    ).toBeCloseTo(1 / 3);
    expect(
      courseGoldProgress(levels, {
        "01 Numbers.csv": { emoji: PERFECT_MEDAL, label: "10/10" },
        "02 Colours.csv": { emoji: PERFECT_MEDAL, label: "8/8" },
        "03 To Be.csv": { emoji: PERFECT_MEDAL, label: "10/10" },
      }),
    ).toBe(1);
  });
});

describe("courseProgressTier", () => {
  it("steps through medal colours at 70/80/90/95 percent", () => {
    expect(courseProgressTier(0)).toBe("green");
    expect(courseProgressTier(0.69)).toBe("green");
    expect(courseProgressTier(0.7)).toBe("bronze");
    expect(courseProgressTier(0.79)).toBe("bronze");
    expect(courseProgressTier(0.8)).toBe("silver");
    expect(courseProgressTier(0.89)).toBe("silver");
    expect(courseProgressTier(0.9)).toBe("gold");
    expect(courseProgressTier(0.94)).toBe("gold");
    expect(courseProgressTier(0.95)).toBe("goldstar");
    expect(courseProgressTier(1)).toBe("goldstar");
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

describe("stageLevelNames", () => {
  const names = Array.from({ length: 27 }, (_, i) => `${String(i + 1).padStart(2, "0")}.csv`);

  it("returns ten levels for a full stage", () => {
    expect(stageLevelNames(names, 1)).toEqual(names.slice(0, 10));
    expect(stageLevelNames(names, 2)).toEqual(names.slice(10, 20));
  });

  it("handles a short final stage", () => {
    expect(stageLevelNames(names, 3)).toEqual(names.slice(20));
    expect(stageLevelNames(names, 3)).toHaveLength(7);
  });
});

describe("stageMastered", () => {
  const names = Array.from({ length: 12 }, (_, i) => `level-${i + 1}.csv`);

  it("is false when any level lacks a perfect medal", () => {
    const medals = Object.fromEntries(
      names.slice(0, 10).map((name, i) => [
        name,
        { emoji: i < 9 ? PERFECT_MEDAL : "🥇", label: "9/10" },
      ]),
    );
    expect(stageMastered(names, medals, 1)).toBe(false);
  });

  it("is true when every level in the stage is perfect", () => {
    const medals = Object.fromEntries(
      names.slice(0, 10).map((name) => [name, { emoji: PERFECT_MEDAL, label: "10/10" }]),
    );
    expect(stageMastered(names, medals, 1)).toBe(true);
  });
});

describe("stagePracticeKey", () => {
  it("round-trips through parseStagePracticeKey", () => {
    expect(stagePracticeKey(3)).toBe("__stage_practice_3__");
    expect(parseStagePracticeKey("__stage_practice_3__")).toBe(3);
    expect(parseStagePracticeKey("01 Numbers.csv")).toBeNull();
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

describe("roundProgressTier", () => {
  it("maps remaining queue length to medal colours", () => {
    expect(roundProgressTier(10)).toBe("green");
    expect(roundProgressTier(4)).toBe("green");
    expect(roundProgressTier(3)).toBe("bronze");
    expect(roundProgressTier(2)).toBe("silver");
    expect(roundProgressTier(1)).toBe("gold");
    expect(roundProgressTier(0)).toBe("goldstar");
  });
});
