import { courseProgressTier } from "./levels";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

/** Persistent footer bar — share of levels with a perfect score, plus daily streak. */
export function courseFooterHtml(progress: number, streakDays: number): string {
  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)));
  const tier = courseProgressTier(progress);
  const streakLabel =
    streakDays === 1 ? "1 day streak" : `${streakDays} day streak`;
  const streakIconClass =
    streakDays === 0 ? "course-footer-streak-icon is-cold" : "course-footer-streak-icon";
  return `
    <footer class="course-footer" aria-label="Course progress: ${pct}% perfect. ${streakLabel}.">
      <div class="course-footer-inner">
        <button type="button" class="course-footer-progress" id="course-footer-progress" aria-label="About course progress">
          <span class="course-footer-icon" aria-hidden="true">🌱</span>
          <div class="course-footer-track">
            <div class="course-footer-fill course-footer-fill-${tier}" style="width: ${pct}%"></div>
          </div>
          <span class="course-footer-icon" aria-hidden="true">🌳</span>
        </button>
        <button type="button" class="course-footer-streak" id="course-footer-streak" aria-label="About daily streak">
          <span class="${streakIconClass}" aria-hidden="true">🔥</span>
          <span class="course-footer-streak-count">${streakDays}</span>
        </button>
      </div>
    </footer>
  `;
}
