import { escapeAttr, escapeHtml } from "./html";

export type FooterTipKind = "progress" | "streak";

export interface FooterTipState {
  open: FooterTipKind | null;
  origin: { x: number; y: number } | null;
  animate: boolean;
}

export const EMPTY_FOOTER_TIP: FooterTipState = {
  open: null,
  origin: null,
  animate: false,
};

const PROGRESS_TIP = {
  hero: "🌱",
  title: "Course progress",
  body:
    "This bar grows whenever you finish a level with a perfect round: every question right, with no wrong answers. Each perfect level adds a little more. When every level on the map has a perfect score, the bar is full.",
};

/** "a" vs "an" before "<n>-day" (eight, eleven, eighteen, etc.). */
export function streakDayArticle(days: number): "a" | "an" {
  if (days === 0) return "a";
  const mod100 = days % 100;
  if (mod100 >= 11 && mod100 <= 13) return "an";
  const mod10 = days % 10;
  if (mod10 === 8) return "an";
  return "a";
}

function streakTipBody(streakDays: number): string {
  const article = streakDayArticle(streakDays);
  const lead = `You've got ${article} ${streakDays}-day streak. Keep practicing Punjabi to build your streak!`;
  return `
    <p class="footer-tip-lead">${escapeHtml(lead)}</p>
    <ul class="footer-tip-list">
      <li>The streak stays alive if you finish any round</li>
      <li>The timer resets at midnight</li>
    </ul>
  `;
}

export function footerTipPopupHtml(state: FooterTipState, streakDays = 0): string {
  if (!state.open) return "";
  const isStreak = state.open === "streak";
  const title = isStreak ? "Daily streak" : PROGRESS_TIP.title;
  const hero = isStreak ? "🔥" : PROGRESS_TIP.hero;
  const bodyHtml = isStreak ? streakTipBody(streakDays) : `<p class="footer-tip-lead">${escapeHtml(PROGRESS_TIP.body)}</p>`;
  const backdropClass = state.animate
    ? "popup-backdrop backdrop-open footer-tip-backdrop"
    : "popup-backdrop footer-tip-backdrop";
  const classes = ["popup", "popup-footer-tip"];
  if (state.animate) classes.push("popup-open");
  let style = "";
  if (state.origin) {
    const dx = Math.round(state.origin.x - window.innerWidth / 2);
    const dy = Math.round(state.origin.y - window.innerHeight / 2);
    style = ` style="--pop-dx: ${dx}px; --pop-dy: ${dy}px"`;
  }
  return `
    <div class="${backdropClass}" id="footer-tip-backdrop">
      <div class="${classes.join(" ")}"${style} role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
        <span class="footer-tip-hero" aria-hidden="true">${hero}</span>
        <h2 class="popup-trophy-title">${escapeHtml(title)}</h2>
        <div class="popup-trophy-body">${bodyHtml}</div>
        <button type="button" class="primary" id="footer-tip-close">Got it</button>
      </div>
    </div>
  `;
}

export interface FooterTipHandlers {
  onOpenFooterTip(kind: FooterTipKind, origin: { x: number; y: number }): void;
  onCloseFooterTip(): void;
}

export function bindCourseFooterTipEvents(
  root: HTMLElement,
  handlers: FooterTipHandlers,
): void {
  const openFrom = (kind: FooterTipKind, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    handlers.onOpenFooterTip(kind, {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    });
  };

  root.querySelector("#course-footer-progress")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openFrom("progress", e.currentTarget as HTMLElement);
  });

  root.querySelector("#course-footer-streak")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openFrom("streak", e.currentTarget as HTMLElement);
  });

  const backdrop = root.querySelector<HTMLElement>("#footer-tip-backdrop");
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) handlers.onCloseFooterTip();
  });

  root.querySelector("#footer-tip-close")?.addEventListener("click", () => {
    handlers.onCloseFooterTip();
  });
}
