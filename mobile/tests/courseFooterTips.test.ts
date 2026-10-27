import { describe, expect, it } from "vitest";
import { streakDayArticle } from "../src/courseFooterTips";

describe("streakDayArticle", () => {
  it("uses an before eight, eleven, and eighteen", () => {
    expect(streakDayArticle(8)).toBe("an");
    expect(streakDayArticle(11)).toBe("an");
    expect(streakDayArticle(18)).toBe("an");
    expect(streakDayArticle(28)).toBe("an");
  });

  it("uses a for most other counts", () => {
    expect(streakDayArticle(0)).toBe("a");
    expect(streakDayArticle(1)).toBe("a");
    expect(streakDayArticle(2)).toBe("a");
    expect(streakDayArticle(7)).toBe("a");
    expect(streakDayArticle(21)).toBe("a");
  });
});
