import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BEAST_MODE_SELECTION, stagePracticeKey, STYLE_TO_EN } from "../src/config";
import {
  applySaved,
  clearProgress,
  loadProgress,
  pickPersistable,
  pruneMedals,
  saveProgress,
  type SavedProgress,
} from "../src/progress";
import { createInitialState } from "../src/rounds";

function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("progress persistence", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const sample: SavedProgress = {
    version: 4,
    levelMedals: {
      "01 Numbers.csv": { emoji: "🥇", label: "10/10" },
      [BEAST_MODE_SELECTION]: { emoji: "🥈", label: "9/10" },
      "stale.csv": { emoji: "🥉", label: "7/10" },
    },
    audioMuted: true,
    questionStyle: STYLE_TO_EN,
    beastStageMin: 2,
    beastStageMax: 5,
  };

  it("round-trips save and load", () => {
    saveProgress(sample);
    expect(loadProgress()).toEqual(sample);
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem("learn-punjabi-progress", "{not json");
    expect(loadProgress()).toBeNull();
  });

  it("returns null for wrong version", () => {
    localStorage.setItem(
      "learn-punjabi-progress",
      JSON.stringify({ ...sample, version: 99 }),
    );
    expect(loadProgress()).toBeNull();
  });

  it("migrates version 1 saves and remaps medal emojis", () => {
    localStorage.setItem(
      "learn-punjabi-progress",
      JSON.stringify({
        version: 1,
        levelMedals: {
          "01 Numbers.csv": { emoji: "🏅", label: "10/10" },
          [BEAST_MODE_SELECTION]: { emoji: "🥇", label: "9/10" },
        },
        audioMuted: true,
        questionStyle: STYLE_TO_EN,
      }),
    );
    expect(loadProgress()).toEqual({
      version: 4,
      levelMedals: {
        "01 Numbers.csv": { emoji: "🥇", label: "10/10" },
        [BEAST_MODE_SELECTION]: { emoji: "🥈", label: "9/10" },
      },
      audioMuted: true,
      questionStyle: STYLE_TO_EN,
    });
  });

  it("migrates version 3 saves and renames level keys", () => {
    localStorage.setItem(
      "learn-punjabi-progress",
      JSON.stringify({
        version: 3,
        levelMedals: {
          "03 To Be.csv": { emoji: "🥇", label: "10/10" },
          "78 Know and Don't Know.csv": { emoji: "🥈", label: "9/10" },
        },
        audioMuted: false,
        questionStyle: STYLE_TO_EN,
      }),
    );
    expect(loadProgress()).toEqual({
      version: 4,
      levelMedals: {
        "05 To Be.csv": { emoji: "🥇", label: "10/10" },
        "80 Know and Don't Know.csv": { emoji: "🥈", label: "9/10" },
      },
      audioMuted: false,
      questionStyle: STYLE_TO_EN,
    });
  });

  it("migrates version 2 saves and remaps medal emojis", () => {
    localStorage.setItem(
      "learn-punjabi-progress",
      JSON.stringify({
        version: 2,
        levelMedals: {
          "01 Numbers.csv": { emoji: "🏅", label: "10/10" },
          [BEAST_MODE_SELECTION]: { emoji: "🥇", label: "9/10" },
        },
        audioMuted: true,
        questionStyle: STYLE_TO_EN,
        beastStageMin: 2,
        beastStageMax: 5,
      }),
    );
    expect(loadProgress()).toEqual({
      version: 4,
      levelMedals: {
        "01 Numbers.csv": { emoji: "🥇", label: "10/10" },
        [BEAST_MODE_SELECTION]: { emoji: "🥈", label: "9/10" },
      },
      audioMuted: true,
      questionStyle: STYLE_TO_EN,
      beastStageMin: 2,
      beastStageMax: 5,
    });
  });

  it("pruneMedals drops unknown CSV keys but keeps beast mode", () => {
    const pruned = pruneMedals(sample.levelMedals, ["01 Numbers.csv"]);
    expect(pruned).toEqual({
      "01 Numbers.csv": { emoji: "🥇", label: "10/10" },
      [BEAST_MODE_SELECTION]: { emoji: "🥈", label: "9/10" },
    });
  });

  it("pruneMedals keeps stage practice keys", () => {
    const medals = {
      ...sample.levelMedals,
      [stagePracticeKey(2)]: { emoji: "🥈", label: "9/10" },
    };
    const pruned = pruneMedals(medals, ["01 Numbers.csv"]);
    expect(pruned[stagePracticeKey(2)]).toEqual({ emoji: "🥈", label: "9/10" });
  });

  it("applySaved restores direction from question style", () => {
    const csvNames = Array.from({ length: 87 }, (_, i) => `${i}.csv`);
    const base = createInitialState();
    const next = applySaved({ ...base, csvNames }, sample, csvNames);
    expect(next.audioMuted).toBe(true);
    expect(next.questionStyle).toBe(STYLE_TO_EN);
    expect(next.direction).toBe("lang_to_en");
    expect(next.levelMedals["stale.csv"]).toBeUndefined();
    expect(next.beastStageMin).toBe(2);
    expect(next.beastStageMax).toBe(5);
  });

  it("applySaved defaults beast range for migrated v1 saves", () => {
    const base = createInitialState();
    const next = applySaved(
      { ...base, csvNames: Array.from({ length: 87 }, (_, i) => `${i}.csv`) },
      {
        version: 4,
        levelMedals: {},
        audioMuted: false,
        questionStyle: STYLE_TO_EN,
      },
      Array.from({ length: 87 }, (_, i) => `${i}.csv`),
    );
    expect(next.beastStageMin).toBe(1);
    expect(next.beastStageMax).toBe(9);
  });

  it("pickPersistable extracts persisted fields only", () => {
    const state = {
      ...createInitialState(),
      levelMedals: { "01 Numbers.csv": { emoji: "🥈", label: "9/10" } },
      audioMuted: true,
      questionStyle: STYLE_TO_EN,
      screen: "quiz" as const,
    };
    expect(pickPersistable(state)).toEqual({
      version: 4,
      levelMedals: state.levelMedals,
      audioMuted: true,
      questionStyle: STYLE_TO_EN,
      beastStageMin: 1,
      beastStageMax: 1,
    });
  });

  it("clearProgress removes saved data", () => {
    saveProgress(sample);
    clearProgress();
    expect(loadProgress()).toBeNull();
    saveProgress({ ...sample, levelMedals: {} });
    expect(loadProgress()?.levelMedals).toEqual({});
  });
});
