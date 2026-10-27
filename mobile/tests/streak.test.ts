import { describe, expect, it } from "vitest";
import {
  calendarDayDiff,
  displayStreakDays,
  expireStreakIfNeeded,
  localCalendarDate,
  recordStreakPractice,
} from "../src/streak";

describe("streak", () => {
  const noon = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);

  it("localCalendarDate uses local midnight boundaries", () => {
    expect(localCalendarDate(noon(2026, 3, 15))).toBe("2026-03-15");
  });

  it("calendarDayDiff counts whole days", () => {
    expect(calendarDayDiff("2026-03-14", "2026-03-15")).toBe(1);
    expect(calendarDayDiff("2026-03-13", "2026-03-15")).toBe(2);
  });

  it("displayStreakDays shows count for today and yesterday", () => {
    const fields = { streakCount: 5, lastStreakDate: "2026-03-14" };
    expect(displayStreakDays(fields, noon(2026, 3, 15))).toBe(5);
    expect(displayStreakDays(fields, noon(2026, 3, 14))).toBe(5);
    expect(displayStreakDays(fields, noon(2026, 3, 16))).toBe(0);
  });

  it("expireStreakIfNeeded clears after a gap", () => {
    const expired = expireStreakIfNeeded(
      { streakCount: 3, lastStreakDate: "2026-03-10" },
      noon(2026, 3, 15),
    );
    expect(expired.changed).toBe(true);
    expect(expired.fields).toEqual({ streakCount: 0, lastStreakDate: null });
  });

  it("recordStreakPractice starts and continues streaks", () => {
    const day1 = recordStreakPractice({ streakCount: 0, lastStreakDate: null }, noon(2026, 3, 10));
    expect(day1).toEqual({ streakCount: 1, lastStreakDate: "2026-03-10" });

    const day2 = recordStreakPractice(day1, noon(2026, 3, 11));
    expect(day2).toEqual({ streakCount: 2, lastStreakDate: "2026-03-11" });

    const same = recordStreakPractice(day2, noon(2026, 3, 11, 18));
    expect(same).toEqual({ streakCount: 2, lastStreakDate: "2026-03-11" });
  });

  it("recordStreakPractice resets after a missed day", () => {
    const broken = recordStreakPractice(
      { streakCount: 4, lastStreakDate: "2026-03-10" },
      noon(2026, 3, 12),
    );
    expect(broken).toEqual({ streakCount: 1, lastStreakDate: "2026-03-12" });
  });
});
