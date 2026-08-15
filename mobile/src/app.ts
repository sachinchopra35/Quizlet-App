import {
  BEAST_MODE_SELECTION,
  STYLE_FROM_EN,
  STYLE_TO_EN,
  directionFromStyle,
  styleFromDirection,
} from "./config";
import {
  ensureAudioUnlock,
  playChime,
  playConfetti,
  renderMedalShelf,
  speakText,
  speakWrongThenQuestion,
} from "./audio";
import {
  completeRoundNaturally,
  consumeIdleMessages,
  createInitialState,
  currentRowIndex,
  processAnswer,
  startBeastRound,
  startRound,
  stopRoundEarly,
  type QuizState,
} from "./rounds";
import {
  loadAllCsvs,
  loadCombinedFromMap,
  loadCsvByName,
  listCsvNames,
  type VocabRow,
} from "./vocab";

function vocabLabel(name: string): string {
  if (name === BEAST_MODE_SELECTION) return "🔥 Beast Mode - 10 Random Questions";
  return name.replace(/\.csv$/i, "");
}

function adjacentCsv(names: string[], current: string, delta: number): string {
  const idx = names.indexOf(current);
  return names[(idx + delta + names.length) % names.length]!;
}

function randomCsv(names: string[], current: string): string {
  const others = names.filter((n) => n !== current);
  return others.length ? others[Math.floor(Math.random() * others.length)]! : current;
}

export class VocabApp {
  private state: QuizState = createInitialState();
  private csvCache = new Map<string, VocabRow[]>();
  private root: HTMLElement;
  private idleCelebrated = false;

  constructor(root: HTMLElement) {
    this.root = root;
    ensureAudioUnlock();
  }

  async init(): Promise<void> {
    const names = await listCsvNames();
    this.csvCache = await loadAllCsvs(names);
    const options = [...names, BEAST_MODE_SELECTION];
    this.state = {
      ...this.state,
      csvNames: names,
      selectedCsv: names[0] ?? null,
    };
    this.render(options);
  }

  private setState(next: QuizState): void {
    this.state = next;
    const options = [...this.state.csvNames, BEAST_MODE_SELECTION];
    this.render(options);
  }

  private getSelectedRows(): VocabRow[] {
    const name = this.state.selectedCsv;
    if (!name || name === BEAST_MODE_SELECTION) return [];
    return this.csvCache.get(name) ?? [];
  }

  private handleAudioAfterRender(
    fb: QuizState["lastFeedback"],
    prompt: string,
    ttsLang: string | undefined,
    playedWrong: boolean,
  ): void {
    if (this.state.audioMuted) return;
    const gen = this.state.feedbackSoundGen;
    if (fb && gen !== this.state.lastChimedFeedbackGen) {
      playChime(fb[0]);
      if (fb[0] === "wrong") {
        speakWrongThenQuestion(fb[2], prompt, ttsLang);
        this.state = { ...this.state, lastChimedFeedbackGen: gen };
        return;
      }
      this.state = { ...this.state, lastChimedFeedbackGen: gen };
    }
    if (!playedWrong) {
      if (fb && fb[0] === "correct") {
        speakText(prompt, { lang: ttsLang, rate: 0.92, delayMs: 550 });
      } else if (!fb) {
        speakText(prompt, { lang: ttsLang, rate: 0.92 });
      }
    }
  }

  private render(options: string[]): void {
    const s = this.state;
    const navDisabled = s.roundActive;
    const selected = s.selectedCsv ?? options[0] ?? "";

    let idleHtml = "";
    if (!s.roundActive) {
      const consumed = consumeIdleMessages(s);
      this.state = consumed.state;
      if (consumed.message) {
        const cls = consumed.level === "success" ? "success" : "info";
        idleHtml = `<div class="feedback ${cls}">${escapeHtml(consumed.message)}</div>`;
        if (consumed.level === "success" && !this.idleCelebrated) {
          this.idleCelebrated = true;
          if (!s.audioMuted) {
            playConfetti();
            playChime("correct");
          }
          if (consumed.announce && !s.audioMuted) {
            speakText(consumed.announce, { lang: "en-GB", rate: 0.88, delayMs: 450 });
          }
        }
      } else {
        this.idleCelebrated = false;
        idleHtml = `<p class="caption">Start a round to begin.</p>`;
        if (consumed.announce && !s.audioMuted) {
          speakText(consumed.announce, { lang: "en-GB", rate: 0.88 });
        }
      }
    } else {
      this.idleCelebrated = false;
    }

    let quizHtml = "";
    if (s.roundActive) {
      const idx = currentRowIndex(s);
      if (idx === null) {
        this.setState(completeRoundNaturally(s));
        return;
      }
      const row = s.vocabRows[idx]!;
      const prompt = s.direction === "en_to_lang" ? row.en : row.lang;
      const ttsLang = s.direction === "en_to_lang" ? "en-GB" : undefined;
      const fb = s.lastFeedback;
      let feedbackHtml = "";
      if (fb) {
        if (fb[0] === "wrong") {
          feedbackHtml = `<div class="feedback warning">Not quite — you wrote <strong>${escapeHtml(fb[1])}</strong>. Correct answer: <strong>${escapeHtml(fb[2])}</strong>.</div>`;
        } else {
          feedbackHtml = `<div class="feedback success">Correct — nice.</div>`;
        }
      }
      const sub = s.beastMode
        ? `Beast Mode · ${s.vocabRows.length} cards · ${styleFromDirection(s.direction)}`
        : styleFromDirection(s.direction);
      quizHtml = `
        <h2>${escapeHtml(sub)}</h2>
        ${feedbackHtml}
        <p class="prompt">${escapeHtml(prompt)}</p>
        <p class="caption">Cards left: ${s.queue.length} (of ${s.vocabRows.length})</p>
        <form class="answer-form" id="answer-form">
          <label for="guess">Your answer</label>
          <input type="text" id="guess" name="guess" autocomplete="off" autocapitalize="off" />
          <button type="submit" class="primary">Check</button>
        </form>
      `;
      requestAnimationFrame(() => {
        const input = document.getElementById("guess") as HTMLInputElement | null;
        input?.focus();
        this.handleAudioAfterRender(fb, prompt, ttsLang, false);
      });
    }

    const rows = this.getSelectedRows();
    const wordListHtml =
      selected === BEAST_MODE_SELECTION
        ? `<details class="expander"><summary>Show words list</summary><p class="caption">Beast Mode draws 10 random cards from all lists.</p></details>`
        : `<details class="expander"><summary>Show words list</summary>
        <table class="word-table">${rows
          .map(
            (r) =>
              `<tr><td>${escapeHtml(r.en)}</td><td>${escapeHtml(r.lang)}</td></tr>`,
          )
          .join("")}</table></details>`;

    const styleDefault = s.roundActive ? styleFromDirection(s.direction) : s.questionStyle;

    this.root.innerHTML = `
      <h1>Vocabulary quiz</h1>
      <div class="nav-row">
        <select id="csv-select" ${navDisabled ? "disabled" : ""}>
          ${options
            .map(
              (o) =>
                `<option value="${escapeAttr(o)}" ${o === selected ? "selected" : ""}>${escapeHtml(vocabLabel(o))}</option>`,
            )
            .join("")}
        </select>
        <button type="button" id="nav-prev" ${navDisabled ? "disabled" : ""} title="Previous">←</button>
        <button type="button" id="nav-next" ${navDisabled ? "disabled" : ""} title="Next">→</button>
        <button type="button" id="nav-shuffle" ${navDisabled ? "disabled" : ""} title="Random">🔀</button>
        <button type="button" id="nav-beast" ${navDisabled ? "disabled" : ""} title="Beast Mode">🔥</button>
      </div>
      ${wordListHtml}
      <div class="style-row">
        <div class="segmented">
          <button type="button" data-style="${STYLE_FROM_EN}" class="${styleDefault === STYLE_FROM_EN ? "active" : ""}" ${navDisabled ? "disabled" : ""}>From English</button>
          <button type="button" data-style="${STYLE_TO_EN}" class="${styleDefault === STYLE_TO_EN ? "active" : ""}" ${navDisabled ? "disabled" : ""}>To English</button>
        </div>
        <label class="mute-row"><input type="checkbox" id="mute" ${s.audioMuted ? "checked" : ""} /> Mute</label>
      </div>
      <div class="actions-row">
        <button type="button" id="start-round" class="primary" ${s.roundActive ? "disabled" : ""}>Start new round</button>
        <button type="button" id="stop-round" ${s.roundActive ? "" : "disabled"}>Stop round</button>
      </div>
      <div class="quiz-panel">${s.roundActive ? quizHtml : idleHtml}</div>
      <div id="medal-shelf" ${s.roundMedals.length ? "" : "hidden"}></div>
    `;

    renderMedalShelf(s.roundMedals);
    this.bindEvents(options);
  }

  private bindEvents(options: string[]): void {
    const csvSelect = document.getElementById("csv-select") as HTMLSelectElement | null;
    csvSelect?.addEventListener("change", () => {
      this.setState({ ...this.state, selectedCsv: csvSelect.value });
    });

    document.getElementById("nav-prev")?.addEventListener("click", () => {
      const names = this.state.csvNames;
      const cur = this.state.selectedCsv;
      const base = !cur || cur === BEAST_MODE_SELECTION ? names[0]! : cur;
      this.setState({
        ...this.state,
        selectedCsv: adjacentCsv(names, base, -1),
      });
    });

    document.getElementById("nav-next")?.addEventListener("click", () => {
      const names = this.state.csvNames;
      const cur = this.state.selectedCsv;
      const base = !cur || cur === BEAST_MODE_SELECTION ? names[0]! : cur;
      this.setState({
        ...this.state,
        selectedCsv: adjacentCsv(names, base, 1),
      });
    });

    document.getElementById("nav-shuffle")?.addEventListener("click", () => {
      const names = this.state.csvNames;
      const cur = this.state.selectedCsv;
      const base = !cur || cur === BEAST_MODE_SELECTION ? names[0]! : cur;
      this.setState({
        ...this.state,
        selectedCsv: randomCsv(names, base),
      });
    });

    document.getElementById("nav-beast")?.addEventListener("click", () => {
      this.setState({ ...this.state, selectedCsv: BEAST_MODE_SELECTION });
    });

    document.querySelectorAll("[data-style]").forEach((el) => {
      el.addEventListener("click", () => {
        const style = (el as HTMLElement).dataset.style!;
        this.setState({
          ...this.state,
          questionStyle: style,
          direction: directionFromStyle(style),
        });
      });
    });

    document.getElementById("mute")?.addEventListener("change", (e) => {
      this.state = {
        ...this.state,
        audioMuted: (e.target as HTMLInputElement).checked,
      };
    });

    document.getElementById("start-round")?.addEventListener("click", async () => {
      const direction = this.state.direction;
      if (this.state.selectedCsv === BEAST_MODE_SELECTION) {
        const combined = loadCombinedFromMap(this.csvCache);
        this.setState(startBeastRound(this.state, combined, direction));
      } else {
        const name = this.state.selectedCsv;
        if (!name) return;
        const rows = await loadCsvByName(name);
        this.setState(startRound(this.state, rows, direction));
      }
    });

    document.getElementById("stop-round")?.addEventListener("click", () => {
      this.setState(stopRoundEarly(this.state));
    });

    document.getElementById("answer-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("guess") as HTMLInputElement;
      const guess = input.value;
      this.setState(processAnswer(this.state, guess));
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
