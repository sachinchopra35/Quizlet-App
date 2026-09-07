import { describe, expect, it } from "vitest";
import { rowsForStageRange } from "../src/vocab";

describe("rowsForStageRange", () => {
  const csvNames = Array.from({ length: 15 }, (_, i) => `${i + 1}.csv`);
  const files = new Map(
    csvNames.map((name, i) => [name, [{ en: `en-${i + 1}`, lang: `lang-${i + 1}` }]]),
  );

  it("returns rows only from selected stages", () => {
    const rows = rowsForStageRange(files, csvNames, 2, 2);
    expect(rows.map((r) => r.en)).toEqual([
      "en-11",
      "en-12",
      "en-13",
      "en-14",
      "en-15",
    ]);
  });
});
