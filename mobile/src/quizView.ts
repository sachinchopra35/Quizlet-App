import { escapeHtml } from "./html";
import { roundProgress } from "./levels";
import { currentRowIndex, type QuizState } from "./rounds";

export interface QuizHandlers {
  onQuit(): void;
  onSubmit(guess: string): void;
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

export function quizHtml(state: QuizState, prompt: QuizPrompt): string {
  const pct = Math.round(roundProgress(state) * 100);
  const fb = state.lastFeedback;
  const feedbackHtml =
    fb && fb[0] === "wrong"
      ? `<div class="feedback warning">Not quite — you wrote <strong>${escapeHtml(fb[1])}</strong>. Correct answer: <strong>${escapeHtml(fb[2])}</strong>.</div>`
      : fb
        ? `<div class="feedback success">Correct — nice.</div>`
        : "";

  return `
    <div class="quiz-screen">
      <div class="quiz-top">
        <button type="button" class="icon-button" id="quiz-quit" aria-label="Quit round">←</button>
        <div class="progress-track"><div class="progress-fill" style="width: ${pct}%"></div></div>
      </div>
      <div class="quiz-body">
        ${feedbackHtml}
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
            placeholder="Your answer"
          />
          <button type="submit" class="primary">Check</button>
        </form>
      </div>
    </div>
  `;
}

export function bindQuizEvents(root: HTMLElement, handlers: QuizHandlers): void {
  root.querySelector("#quiz-quit")?.addEventListener("click", () => handlers.onQuit());

  root.querySelector("#answer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = root.querySelector<HTMLInputElement>("#guess");
    if (!input) return;
    handlers.onSubmit(input.value);
  });
}
