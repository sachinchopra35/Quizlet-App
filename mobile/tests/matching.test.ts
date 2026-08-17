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
    expect(canonicalizePunjabi("main ja rehi hun")).toBe(
      canonicalizePunjabi("main ja rahi hun"),
    );
    expect(canonicalizePunjabi("main ja rehi hun")).toBe(
      canonicalizePunjabi("main ja raha hun"),
    );
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

  it("hu suffix and optional subject pronouns", () => {
    expect(canonicalizePunjabi("main thaka hu")).toBe(
      canonicalizePunjabi("main thaka hun"),
    );
    expect(canonicalizePunjabi("khaunga")).toBe(
      canonicalizePunjabi("main khaunga"),
    );
    expect(canonicalizePunjabi("khaoge")).toBe(
      canonicalizePunjabi("tusi khaoge"),
    );
    expect(canonicalizePunjabi("kadon aaoge")).toBe(
      canonicalizePunjabi("tusi kadon aaoge"),
    );
    expect(canonicalizePunjabi("paani chaida hai")).not.toBe(
      canonicalizePunjabi("mainu paani chaida hai"),
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
      answersMatch("main ja rehi hun", "main ja raha hun", true),
    ).toBe(true);
    expect(
      answersMatch("main khaanga", "main khaunga", true),
    ).toBe(true);
    expect(answersMatch("khaunga", "main khaunga", true)).toBe(true);
    expect(answersMatch("khaoge", "tusi khaoge", true)).toBe(true);
    expect(answersMatch("main thaka hu", "main thaka hun", true)).toBe(true);
    expect(
      answersMatch("paani chaida hai", "mainu paani chaida hai", true),
    ).toBe(false);
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
