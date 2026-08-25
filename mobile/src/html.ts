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

/** Persistent footer bar — share of levels with a perfect gold medal. */
export function courseFooterHtml(progress: number): string {
  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)));
  const tier = courseProgressTier(progress);
  return `
    <footer class="course-footer" aria-label="Course progress: ${pct}% perfect">
      <div class="course-footer-inner">
        <span class="course-footer-icon" aria-hidden="true">🌱</span>
        <div class="course-footer-track">
          <div class="course-footer-fill course-footer-fill-${tier}" style="width: ${pct}%"></div>
        </div>
        <span class="course-footer-icon" aria-hidden="true">🌳</span>
      </div>
    </footer>
  `;
}
