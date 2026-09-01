import { escapeHtml } from "./html";
import { roundProgress, roundProgressTier } from "./levels";
import { currentRowIndex, type QuizState } from "./rounds";

export interface QuizHandlers {
  onRequestQuit(origin: { x: number; y: number }): void;
  onCancelQuit(): void;
  onConfirmQuit(): void;
  onSubmit(guess: string): void;
  onToggleMute(muted: boolean): void;
}

export interface QuizOverlay {
  quitConfirmOpen: boolean;
  quitConfirmAnimate: boolean;
  quitConfirmOrigin: { x: number; y: number } | null;
}

function quitConfirmPanelAttrs(overlay: QuizOverlay): string {
  const classes = ["popup", "quiz-quit-popup"];
  if (overlay.quitConfirmAnimate) classes.push("popup-open");
  if (!overlay.quitConfirmOrigin) return `class="${classes.join(" ")}"`;
  const dx = Math.round(overlay.quitConfirmOrigin.x - window.innerWidth / 2);
  const dy = Math.round(overlay.quitConfirmOrigin.y - window.innerHeight / 2);
  return `class="${classes.join(" ")}" style="--pop-dx: ${dx}px; --pop-dy: ${dy}px"`;
}

function quitConfirmHtml(overlay: QuizOverlay): string {
  if (!overlay.quitConfirmOpen) return "";
  const backdropClass = overlay.quitConfirmAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  return `
    <div class="${backdropClass}" id="quiz-quit-backdrop">
      <div ${quitConfirmPanelAttrs(overlay)} role="dialog" aria-modal="true" aria-label="End quiz">
        <h2 class="quiz-quit-title">End Quiz?</h2>
        <p class="caption quiz-quit-message">You'll lose all progress in this round.</p>
        <div class="reset-panel-actions">
          <button type="button" class="settings-cancel" id="quiz-quit-cancel">Keep playing</button>
          <button type="button" class="settings-reset-confirm-btn" id="quiz-quit-confirm">End quiz</button>
        </div>
      </div>
    </div>
  `;
}

export interface QuizPrompt {
  text: string;
  ttsLang: string | undefined;
}

export function promptFor(state: QuizState): QuizPrompt | null {
  const idx = currentRowIndex(state);
  if (idx === null) return null;
  const row = state.vocabRows[idx]!;
  return state.direction === "en_to_lang"
    ? { text: row.en, ttsLang: "en-GB" }
    : { text: row.lang, ttsLang: undefined };
}

/** Prompt to show while holding the final frame after the last correct answer. */
export function finishingPrompt(state: QuizState): QuizPrompt | null {
  const fb = state.lastFeedback;
  if (fb) {
    return state.direction === "en_to_lang"
      ? { text: fb[1], ttsLang: "en-GB" }
      : { text: fb[1], ttsLang: undefined };
  }
  const row = state.vocabRows[0];
  if (!row) return null;
  return state.direction === "en_to_lang"
    ? { text: row.en, ttsLang: "en-GB" }
    : { text: row.lang, ttsLang: undefined };
}

export function quizHtml(
  state: QuizState,
  prompt: QuizPrompt,
  overlay: QuizOverlay = {
    quitConfirmOpen: false,
    quitConfirmAnimate: false,
    quitConfirmOrigin: null,
  },
  finishing = false,
): string {
  const pct = Math.round(roundProgress(state) * 100);
  const tier = roundProgressTier(state.queue.length);
  const fb = state.lastFeedback;
  const feedbackHtml =
    fb && fb[0] === "wrong"
      ? `<div class="feedback warning">Not quite — you wrote <strong>${escapeHtml(fb[1])}</strong>. Correct answer: <strong>${escapeHtml(fb[2])}</strong>.</div>`
      : fb
        ? `<div class="feedback success">Correct — nice.</div>`
        : "";

  return `
    <div class="quiz-screen${finishing ? " quiz-finishing" : ""}">
      <div class="quiz-header">
        <div class="quiz-top">
          <button type="button" class="icon-button quiz-quit" id="quiz-quit" aria-label="Quit round">←</button>
          <div class="progress-track"><div class="progress-fill progress-fill-${tier}" style="width: ${pct}%"></div></div>
        </div>
        <div class="quiz-mute-row">
          <button
            type="button"
            class="icon-button"
            id="quiz-mute"
            aria-label="Mute audio"
            aria-pressed="${state.audioMuted ? "true" : "false"}"
          >${state.audioMuted ? "🔇" : "🔊"}</button>
        </div>
      </div>
      <div class="quiz-body">
        <div class="feedback-slot" aria-live="polite">${feedbackHtml}</div>
        <p class="prompt">${escapeHtml(prompt.text)}</p>
        <form class="answer-form" id="answer-form">
          <input
            type="text"
            id="guess"
            name="guess"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            enterkeyhint="go"
            placeholder="Your answer"
            ${finishing ? "disabled" : ""}
          />
          <button type="submit" class="primary" ${finishing ? "disabled" : ""}>Check</button>
        </form>
      </div>
    </div>
    ${quitConfirmHtml(overlay)}
  `;
}

export function syncQuizProgressBar(
  root: HTMLElement,
  fromPct: number,
  toPct: number,
): void {
  const fill = root.querySelector<HTMLElement>(".progress-fill");
  if (!fill) return;
  if (fromPct === toPct) {
    fill.style.width = `${toPct}%`;
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fill.style.width = `${toPct}%`;
    return;
  }
  fill.style.transition = "none";
  fill.style.width = `${fromPct}%`;
  void fill.offsetWidth;
  fill.style.transition = "";
  fill.style.width = `${toPct}%`;
}

export function bindQuizEvents(root: HTMLElement, handlers: QuizHandlers): void {
  root.querySelector("#quiz-quit")?.addEventListener("click", (e) => {
    const btn = e.currentTarget as HTMLElement;
    const r = btn.getBoundingClientRect();
    handlers.onRequestQuit({
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    });
  });

  const quitBackdrop = root.querySelector<HTMLElement>("#quiz-quit-backdrop");
  quitBackdrop?.addEventListener("click", (ev) => {
    if (ev.target === quitBackdrop) handlers.onCancelQuit();
  });

  root.querySelector("#quiz-quit-cancel")?.addEventListener("click", () => {
    handlers.onCancelQuit();
  });

  root.querySelector("#quiz-quit-confirm")?.addEventListener("click", () => {
    handlers.onConfirmQuit();
  });

  root.querySelector("#quiz-mute")?.addEventListener("click", () => {
    const btn = root.querySelector<HTMLButtonElement>("#quiz-mute");
    if (!btn) return;
    handlers.onToggleMute(btn.getAttribute("aria-pressed") !== "true");
  });

  root.querySelector("#answer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = root.querySelector<HTMLInputElement>("#guess");
    if (!input) return;
    handlers.onSubmit(input.value);
  });
}
