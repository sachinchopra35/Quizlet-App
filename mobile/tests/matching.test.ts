import { describe, expect, it } from "vitest";
import {
  answersMatch,
  canonicalizePunjabi,
  normalize,
} from "../src/matching";
import {
  beastSampleSize,
  createInitialState,
  medalForRound,
  processAnswer,
  startRound,
} from "../src/rounds";
import { parseCsv } from "../src/vocab";

describe("normalize", () => {
  it("ignores spaces and punctuation", () => {
    expect(normalize("mainu pani dedo")).toBe(normalize("mainupanidedo"));
  });
});

describe("canonicalizePunjabi", () => {
  it("eh/oh interchange", () => {
    expect(canonicalizePunjabi("ehnu")).toBe(canonicalizePunjabi("ohnu"));
  });

  it("reha/raha interchange", () => {
    expect(
      canonicalizePunjabi("main darwaza band kar reha hun"),
    ).toBe(canonicalizePunjabi("main darwaza band kar raha hun"));
  });

  it("future unga/anga interchange", () => {
    expect(canonicalizePunjabi("main khaanga")).toBe(
      canonicalizePunjabi("main khaunga"),
    );
    expect(canonicalizePunjabi("main thuanu call karanga")).toBe(
      canonicalizePunjabi("main thuanu call karunga"),
    );
    expect(canonicalizePunjabi("tusi kadon aaonge")).toBe(
      canonicalizePunjabi("tusi kadon aaoge"),
    );
    expect(canonicalizePunjabi("tusi ki karonge")).toBe(
      canonicalizePunjabi("tusi ki karoge"),
    );
  });

  it("tenu to thuanu", () => {
    expect(canonicalizePunjabi("main tenu call karunga")).toBe(
      canonicalizePunjabi("main thuanu call karunga"),
    );
  });
});

describe("answersMatch", () => {
  it("punjabi canonical rules", () => {
    expect(answersMatch("ohnu dekho", "ehnu dekho", true)).toBe(true);
    expect(
      answersMatch("main darwaza band kar reha hun", "main darwaza band kar raha hun", true),
    ).toBe(true);
    expect(
      answersMatch("main khaanga", "main khaunga", true),
    ).toBe(true);
  });
});

describe("rounds", () => {
  it("beast sample size caps at 10", () => {
    expect(beastSampleSize(100)).toBe(10);
    expect(beastSampleSize(3)).toBe(3);
  });

  it("medal tiers", () => {
    expect(medalForRound(10, 10)).toBe("🏅");
    expect(medalForRound(9, 10)).toBe("🥇");
    expect(medalForRound(8, 10)).toBe("🥈");
    expect(medalForRound(7, 10)).toBe("🥉");
  });

  it("process correct answer advances queue", () => {
    const rows = [
      { en: "a", lang: "b" },
      { en: "c", lang: "d" },
    ];
    let s = startRound(createInitialState(), rows, "en_to_lang");
    const idx = s.queue[0]!;
    s = processAnswer(s, rows[idx]!.lang);
    expect(s.lastFeedback?.[0]).toBe("correct");
    expect(s.queue.length).toBe(1);
  });
});

describe("parseCsv", () => {
  it("parses en,lang header", () => {
    const rows = parseCsv("en,lang\nhello,haan ji\n");
    expect(rows).toEqual([{ en: "hello", lang: "haan ji" }]);
  });

  it("handles quoted commas", () => {
    const rows = parseCsv('en,lang\n"foo, bar",baz\n');
    expect(rows[0]?.en).toBe("foo, bar");
  });
});
