import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHEAT_SHEET_NUMBERS } from "../src/cheatSheet";

function vocabNumberWords(): string[] {
  const vocabDir = join(import.meta.dirname, "../../vocab");
  const files = readdirSync(vocabDir)
    .filter((f) => /^0[12] Numbers\.csv$/i.test(f))
    .sort();
  const words: string[] = [];
  for (const file of files) {
    const text = readFileSync(join(vocabDir, file), "utf8");
    for (const line of text.split("\n").slice(1)) {
      const lang = line.split(",")[1]?.trim();
      if (lang) words.push(lang);
    }
  }
  return words;
}

describe("cheat sheet numbers", () => {
  it("matches vocab/01 and 02 Numbers.csv spellings in order", () => {
    const vocab = vocabNumberWords();
    expect(vocab).toHaveLength(10);
    expect(CHEAT_SHEET_NUMBERS.map((r) => r.word)).toEqual(vocab);
  });
});
