import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BEAST_MODE_SELECTION,
  parseStagePracticeKey,
  stagePracticeKey,
  STYLE_TO_EN,
} from "../src/config";
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
    version: 1,
    levelMedals: {
      "01 Numbers.csv": { emoji: "🏅", label: "10/10" },
      [BEAST_MODE_SELECTION]: { emoji: "🥇", label: "9/10" },
      [stagePracticeKey(1)]: { emoji: "🥈", label: "8/10" },
      "stale.csv": { emoji: "🥉", label: "7/10" },
    },
    audioMuted: true,
    questionStyle: STYLE_TO_EN,
  };

  it("round-trips valid stage practice keys", () => {
    expect(parseStagePracticeKey(stagePracticeKey(3))).toBe(3);
    expect(parseStagePracticeKey("__stage_practice_0__")).toBeNull();
    expect(parseStagePracticeKey("__stage_practice_3_extra__")).toBeNull();
  });

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

  it("pruneMedals drops unknown CSV keys but keeps practice and beast mode", () => {
    const pruned = pruneMedals(sample.levelMedals, ["01 Numbers.csv"]);
    expect(pruned).toEqual({
      "01 Numbers.csv": { emoji: "🏅", label: "10/10" },
      [BEAST_MODE_SELECTION]: { emoji: "🥇", label: "9/10" },
      [stagePracticeKey(1)]: { emoji: "🥈", label: "8/10" },
    });
  });

  it("applySaved restores direction from question style", () => {
    const base = createInitialState();
    const next = applySaved(
      { ...base, csvNames: ["01 Numbers.csv"] },
      sample,
      ["01 Numbers.csv"],
    );
    expect(next.audioMuted).toBe(true);
    expect(next.questionStyle).toBe(STYLE_TO_EN);
    expect(next.direction).toBe("lang_to_en");
    expect(next.levelMedals["stale.csv"]).toBeUndefined();
  });

  it("pickPersistable extracts persisted fields only", () => {
    const state = {
      ...createInitialState(),
      levelMedals: { "01 Numbers.csv": { emoji: "🥇", label: "9/10" } },
      audioMuted: true,
      questionStyle: STYLE_TO_EN,
      screen: "quiz" as const,
    };
    expect(pickPersistable(state)).toEqual({
      version: 1,
      levelMedals: state.levelMedals,
      audioMuted: true,
      questionStyle: STYLE_TO_EN,
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
