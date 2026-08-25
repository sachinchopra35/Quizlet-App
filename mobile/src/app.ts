import { BEAST_MODE_SELECTION, directionFromStyle } from "./config";
import {
  ensureAudioUnlock,
  playButtonClick,
  playChime,
  playConfetti,
  stopSpeech,
  speakText,
  speakWrongThenQuestion,
} from "./audio";
import {
  bindMapEvents,
  mapHtml,
  type CompletionSummary,
  type MapViewModel,
} from "./mapView";
import { bindQuizEvents, promptFor, quizHtml, type QuizPrompt } from "./quizView";
import {
  completeRoundNaturally,
  consumeIdleMessages,
  createInitialState,
  processAnswer,
  startBeastRound,
  startRound,
  stopRoundEarly,
  type QuizState,
} from "./rounds";
import {
  loadAllCsvs,
  loadCombinedFromMap,
  listCsvNames,
  type VocabRow,
} from "./vocab";

export class VocabApp {
  private state: QuizState = createInitialState();
  private csvCache = new Map<string, VocabRow[]>();
  private root: HTMLElement;
  private popupCsv: string | null = null;
  private popupOrigin: { x: number; y: number } | null = null;
  private popupAnimate = false;
  private gearOpen = false;
  private infoOpen = false;
  private completion: CompletionSummary | null = null;
  private scrollToLevelCsv: string | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    ensureAudioUnlock();
  }

  async init(): Promise<void> {
    const names = await listCsvNames();
    this.csvCache = await loadAllCsvs(names);
    this.state = { ...this.state, csvNames: names };
    this.render();
  }

  private setState(next: QuizState): void {
    this.state = next;
    this.render();
  }

  private rowsFor(name: string | null): VocabRow[] {
    if (!name || name === BEAST_MODE_SELECTION) return [];
    return this.csvCache.get(name) ?? [];
  }

  private render(): void {
    if (this.state.screen === "quiz") {
      this.renderQuiz();
    } else {
      this.renderMap();
    }
  }

  private renderMap(): void {
    const consumed = consumeIdleMessages(this.state);
    this.state = consumed.state;
    if (consumed.message && consumed.level === "success") {
      const medals = this.state.roundMedals;
      const last = medals[medals.length - 1];
      this.completion = {
        emoji: last?.emoji ?? "🏅",
        label: last?.label ?? "",
        message: consumed.message,
      };
      if (!this.state.audioMuted) {
        playConfetti();
        playChime("correct");
        if (consumed.announce) {
          speakText(consumed.announce, { lang: "en-GB", rate: 0.88, delayMs: 450 });
        }
      }
    }

    const vm: MapViewModel = {
      csvNames: this.state.csvNames,
      levelMedals: this.state.levelMedals,
      popupCsv: this.popupCsv,
      popupOrigin: this.popupOrigin,
      popupAnimate: this.popupAnimate,
      gearOpen: this.gearOpen,
      questionStyle: this.state.questionStyle,
      audioMuted: this.state.audioMuted,
      popupRows: this.rowsFor(this.popupCsv),
      completion: this.completion,
      infoOpen: this.infoOpen,
    };

    this.root.innerHTML = mapHtml(vm);
    bindMapEvents(this.root, {
      onOpenLevel: (csv, origin) => {
        this.popupCsv = csv;
        this.gearOpen = false;
        this.infoOpen = false;
        this.popupOrigin = origin;
        this.popupAnimate = true;
        this.state = { ...this.state, selectedCsv: csv };
        this.renderMap();
        this.popupAnimate = false;
      },
      onClosePopup: () => {
        this.popupCsv = null;
        this.popupOrigin = null;
        this.render();
      },
      onOpenInfo: () => {
        this.popupCsv = null;
        this.popupOrigin = null;
        this.gearOpen = false;
        this.infoOpen = true;
        this.render();
      },
      onCloseInfo: () => {
        this.infoOpen = false;
        this.render();
      },
      onToggleGear: () => {
        this.gearOpen = !this.gearOpen;
        this.render();
      },
      onSetStyle: (style) => {
        this.setState({
          ...this.state,
          questionStyle: style,
          direction: directionFromStyle(style),
        });
      },
      onToggleMute: (muted) => {
        this.setState({ ...this.state, audioMuted: muted });
      },
      onStart: () => this.startSelectedRound(),
      onDismissCompletion: () => {
        this.completion = null;
        this.render();
      },
      onButtonPress: () => {
        if (!this.state.audioMuted) playButtonClick();
      },
    });

    if (this.scrollToLevelCsv) {
      const csv = this.scrollToLevelCsv;
      this.scrollToLevelCsv = null;
      requestAnimationFrame(() => this.scrollToLevel(csv));
    }
  }

  private scrollToLevel(csv: string): void {
    const node = this.root.querySelector<HTMLElement>(
      `.level-node[data-csv="${CSS.escape(csv)}"]`,
    );
    node?.scrollIntoView({ block: "center", behavior: "auto" });
  }

  private startSelectedRound(): void {
    const name = this.popupCsv;
    if (!name) return;
    this.popupCsv = null;
    this.completion = null;
    this.scrollToLevelCsv = name;
    const direction = this.state.direction;
    if (name === BEAST_MODE_SELECTION) {
      const combined = loadCombinedFromMap(this.csvCache);
      this.setState(startBeastRound(this.state, combined, direction));
    } else {
      this.setState(startRound(this.state, this.rowsFor(name), direction));
    }
  }

  private renderQuiz(): void {
    const prompt = promptFor(this.state);
    if (!prompt) {
      this.setState(completeRoundNaturally(this.state));
      return;
    }

    this.root.innerHTML = quizHtml(this.state, prompt);
    bindQuizEvents(this.root, {
      onQuit: () => this.setState(stopRoundEarly(this.state)),
      onSubmit: (guess) => this.setState(processAnswer(this.state, guess)),
      onToggleMute: (muted) => {
        if (muted) stopSpeech();
        this.setState({ ...this.state, audioMuted: muted });
      },
    });

    requestAnimationFrame(() => {
      this.root.querySelector<HTMLInputElement>("#guess")?.focus();
      this.playPromptAudio(prompt);
    });
  }

  private playPromptAudio(prompt: QuizPrompt): void {
    if (this.state.audioMuted) return;
    const fb = this.state.lastFeedback;
    const gen = this.state.feedbackSoundGen;
    if (fb && gen !== this.state.lastChimedFeedbackGen) {
      playChime(fb[0]);
      this.state = { ...this.state, lastChimedFeedbackGen: gen };
      if (fb[0] === "wrong") {
        speakWrongThenQuestion(fb[2], prompt.text, prompt.ttsLang);
        return;
      }
    }
    if (fb && fb[0] === "correct") {
      speakText(prompt.text, { lang: prompt.ttsLang, rate: 0.92, delayMs: 550 });
    } else if (!fb) {
      speakText(prompt.text, { lang: prompt.ttsLang, rate: 0.92 });
    }
  }
}
