import { describe, expect, it } from "vitest";
import { compareLevelCsvNames } from "../src/levelOrder";
import { levelLabel, levelQuizParts } from "../src/levelLabels";
import { isStoryLevel } from "../src/storyLevels";

describe("compareLevelCsvNames", () => {
  it("sorts numeric prefixes, not lexicographically", () => {
    const names = [
      "101 Story - Morning 02.csv",
      "100 Story - Morning 01.csv",
      "11 Adjective and Noun.csv",
      "99 Vocab - Things That Happen 2.csv",
      "09 Fruits and Vegetables.csv",
    ];
    names.sort(compareLevelCsvNames);
    expect(names).toEqual([
      "09 Fruits and Vegetables.csv",
      "11 Adjective and Noun.csv",
      "99 Vocab - Things That Happen 2.csv",
      "100 Story - Morning 01.csv",
      "101 Story - Morning 02.csv",
    ]);
  });
});

describe("levelLabel", () => {
  it("uses colon and drops leading zero for levels 1-9", () => {
    expect(levelLabel("05 To Be.csv")).toBe("5: To Be");
    expect(levelLabel("09 Fruits and Vegetables.csv")).toBe("9: Fruits and Vegetables");
    expect(levelLabel("10 More Adjectives.csv")).toBe("10: More Adjectives");
    expect(levelLabel("100 Story - Morning 01.csv")).toBe("100: Story - Morning 01");
    expect(levelLabel("101 Story - Morning 02.csv")).toBe("101: Story - Morning 02");
    expect(levelLabel("119 Lots of Nouns 6.csv")).toBe("119: Lots of Nouns - Work & school");
    expect(levelLabel("129 Lots of Adjectives 8.csv")).toBe("129: Lots of Adjectives 8");
  });

  it("levelQuizParts uses display number", () => {
    expect(levelQuizParts("05 To Be.csv")).toEqual({ number: "5", name: "To Be" });
  });
});

describe("isStoryLevel", () => {
  it("detects story filenames", () => {
    expect(isStoryLevel("100 Story - Morning 01.csv")).toBe(true);
    expect(isStoryLevel("101 Story - Morning 02.csv")).toBe(true);
    expect(isStoryLevel("90 Vocab - Everyday Verbs.csv")).toBe(false);
  });
});
