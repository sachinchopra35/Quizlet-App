import { describe, expect, it } from "vitest";
import { bubblePlacement } from "../src/landmarkBubble";

describe("bubblePlacement", () => {
  const bubbleH = 220;

  it("prefers above when there is room", () => {
    const anchor = { top: 400, left: 100, width: 40, height: 40 };
    expect(bubblePlacement(anchor, 800, bubbleH)).toBe("above");
  });

  it("places below when anchor is near the top", () => {
    expect(bubblePlacement({ top: 20, left: 100, width: 40, height: 40 }, 800, bubbleH)).toBe(
      "below",
    );
  });

  it("places above when anchor is near the bottom but top has more room", () => {
    expect(bubblePlacement({ top: 700, left: 100, width: 40, height: 40 }, 800, bubbleH)).toBe(
      "above",
    );
  });
});
