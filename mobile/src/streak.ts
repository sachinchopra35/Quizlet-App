/** Local calendar date YYYY-MM-DD (midnight boundary = device timezone). */
export function localCalendarDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseCalendarDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Whole calendar days from `from` to `to` (to − from). */
export function calendarDayDiff(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseCalendarDate(to).getTime() - parseCalendarDate(from).getTime()) / msPerDay);
}

export interface StreakFields {
  streakCount: number;
  lastStreakDate: string | null;
}

/** Streak days to show in the footer (0 after a missed day). */
export function displayStreakDays(
  { streakCount, lastStreakDate }: StreakFields,
  now = new Date(),
): number {
  if (!lastStreakDate || streakCount <= 0) return 0;
  const today = localCalendarDate(now);
  const gap = calendarDayDiff(lastStreakDate, today);
  if (gap > 1) return 0;
  return streakCount;
}

/** Clear stored streak when the user skipped a calendar day. */
export function expireStreakIfNeeded(
  fields: StreakFields,
  now = new Date(),
): { fields: StreakFields; changed: boolean } {
  const today = localCalendarDate(now);
  if (!fields.lastStreakDate || fields.streakCount <= 0) {
    if (fields.streakCount === 0 && fields.lastStreakDate === null) {
      return { fields, changed: false };
    }
    return { fields: { streakCount: 0, lastStreakDate: null }, changed: true };
  }
  const gap = calendarDayDiff(fields.lastStreakDate, today);
  if (gap <= 1) return { fields, changed: false };
  return {
    fields: { streakCount: 0, lastStreakDate: null },
    changed: true,
  };
}

/** Call when the user gets a correct answer (idempotent within the same day). */
export function recordStreakPractice(
  fields: StreakFields,
  now = new Date(),
): StreakFields {
  const today = localCalendarDate(now);
  const active = displayStreakDays(fields, now);
  const baseCount = active > 0 ? fields.streakCount : 0;
  if (fields.lastStreakDate === today) {
    return { streakCount: Math.max(baseCount, fields.streakCount), lastStreakDate: today };
  }
  const yesterday = localCalendarDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const continued = fields.lastStreakDate === yesterday && active > 0;
  return {
    streakCount: continued ? baseCount + 1 : 1,
    lastStreakDate: today,
  };
}
