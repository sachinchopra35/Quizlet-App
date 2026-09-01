import {
  BEAST_MODE_SELECTION,
  directionFromStyle,
  parseStagePracticeKey,
  STAGE_PRACTICE_SIZE,
} from "./config";
import { stageLevelNames } from "./levels";
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
  applySaved,
  clearProgress,
  loadProgress,
  pickPersistable,
  saveProgress,
} from "./progress";
import {
  completeRoundNaturally,
  consumeIdleMessages,
  createInitialState,
  processAnswer,
  sampleRows,
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
  private infoAnimate = false;
  private settingsOpen = false;
  private settingsAnimate = false;
  private resetConfirmOpen = false;
  private resetConfirmAnimate = false;
  private resetTypeOpen = false;
  private resetTypeAnimate = false;
  private quitConfirmOpen = false;
  private quitConfirmAnimate = false;
  private quitConfirmOrigin: { x: number; y: number } | null = null;
  private trophyMessageStage: number | null = null;
  private trophyMessageOrigin: { x: number; y: number } | null = null;
  private trophyMessageAnimate = false;
  private completion: CompletionSummary | null = null;
  private scrollToLevelCsv: string | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    ensureAudioUnlock();
  }

  async init(): Promise<void> {
    const names = await listCsvNames();
    this.csvCache = await loadAllCsvs(names);
    const saved = loadProgress();
    this.state = saved
      ? applySaved({ ...this.state, csvNames: names }, saved, names)
      : { ...this.state, csvNames: names };
    this.render();
  }

  private setState(next: QuizState): void {
    this.state = next;
    saveProgress(pickPersistable(this.state));
    this.render();
  }

  private rowsFor(name: string | null): VocabRow[] {
    if (!name || name === BEAST_MODE_SELECTION || parseStagePracticeKey(name) !== null) return [];
    return this.csvCache.get(name) ?? [];
  }

  private rowsForStage(stage: number): VocabRow[] {
    const rows: VocabRow[] = [];
    for (const name of stageLevelNames(this.state.csvNames, stage)) {
      rows.push(...(this.csvCache.get(name) ?? []));
    }
    return rows;
  }

  private closeTrophyMessage(): void {
    this.trophyMessageStage = null;
    this.trophyMessageOrigin = null;
  }

  private closeResetFlow(): void {
    this.resetConfirmOpen = false;
    this.resetTypeOpen = false;
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
      infoAnimate: this.infoAnimate,
      settingsOpen: this.settingsOpen,
      settingsAnimate: this.settingsAnimate,
      resetConfirmOpen: this.resetConfirmOpen,
      resetConfirmAnimate: this.resetConfirmAnimate,
      resetTypeOpen: this.resetTypeOpen,
      resetTypeAnimate: this.resetTypeAnimate,
      trophyMessageStage: this.trophyMessageStage,
      trophyMessageOrigin: this.trophyMessageOrigin,
      trophyMessageAnimate: this.trophyMessageAnimate,
    };

    this.root.innerHTML = mapHtml(vm);
    bindMapEvents(this.root, {
      onOpenLevel: (csv, origin) => {
        this.popupCsv = csv;
        this.gearOpen = false;
        this.infoOpen = false;
        this.settingsOpen = false;
        this.closeResetFlow();
        this.closeTrophyMessage();
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
      onLockedTrophy: (stage, origin) => {
        this.trophyMessageStage = stage;
        this.trophyMessageOrigin = origin;
        this.trophyMessageAnimate = true;
        this.render();
        this.trophyMessageAnimate = false;
      },
      onCloseTrophyMessage: () => {
        this.closeTrophyMessage();
        this.render();
      },
      onOpenInfo: () => {
        this.popupCsv = null;
        this.popupOrigin = null;
        this.gearOpen = false;
        this.settingsOpen = false;
        this.closeResetFlow();
        this.closeTrophyMessage();
        this.infoOpen = true;
        this.infoAnimate = true;
        this.render();
        this.infoAnimate = false;
      },
      onCloseInfo: () => {
        this.infoOpen = false;
        this.render();
      },
      onOpenSettings: () => {
        this.popupCsv = null;
        this.popupOrigin = null;
        this.gearOpen = false;
        this.infoOpen = false;
        this.settingsOpen = true;
        this.settingsAnimate = true;
        this.closeResetFlow();
        this.closeTrophyMessage();
        this.render();
        this.settingsAnimate = false;
      },
      onCloseSettings: () => {
        this.settingsOpen = false;
        this.render();
      },
      onRequestResetProgress: () => {
        this.settingsOpen = false;
        this.resetConfirmOpen = true;
        this.resetConfirmAnimate = true;
        this.render();
        this.resetConfirmAnimate = false;
      },
      onCancelResetConfirm: () => {
        this.resetConfirmOpen = false;
        this.settingsOpen = true;
        this.settingsAnimate = true;
        this.render();
        this.settingsAnimate = false;
      },
      onConfirmResetSure: () => {
        this.resetConfirmOpen = false;
        this.resetTypeOpen = true;
        this.resetTypeAnimate = true;
        this.render();
        this.resetTypeAnimate = false;
      },
      onCancelResetType: () => {
        this.resetTypeOpen = false;
        this.settingsOpen = true;
        this.settingsAnimate = true;
        this.render();
        this.settingsAnimate = false;
      },
      onSubmitResetType: (value) => {
        if (value.trim().toLowerCase() !== "reset") return;
        clearProgress();
        this.closeResetFlow();
        this.settingsOpen = false;
        this.setState({ ...this.state, levelMedals: {} });
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
    const practiceStage = parseStagePracticeKey(name);
    if (name === BEAST_MODE_SELECTION) {
      const combined = loadCombinedFromMap(this.csvCache);
      this.setState(startBeastRound(this.state, combined, direction));
    } else if (practiceStage !== null) {
      const pool = this.rowsForStage(practiceStage);
      const sample = sampleRows(pool, STAGE_PRACTICE_SIZE);
      this.setState(startRound(this.state, sample, direction));
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

    this.root.innerHTML = quizHtml(this.state, prompt, {
      quitConfirmOpen: this.quitConfirmOpen,
      quitConfirmAnimate: this.quitConfirmAnimate,
      quitConfirmOrigin: this.quitConfirmOrigin,
    });
    bindQuizEvents(this.root, {
      onRequestQuit: (origin) => {
        this.quitConfirmOrigin = origin;
        this.quitConfirmOpen = true;
        this.quitConfirmAnimate = true;
        this.renderQuiz();
        this.quitConfirmAnimate = false;
      },
      onCancelQuit: () => {
        this.quitConfirmOpen = false;
        this.quitConfirmOrigin = null;
        this.renderQuiz();
      },
      onConfirmQuit: () => {
        this.quitConfirmOpen = false;
        this.quitConfirmOrigin = null;
        stopSpeech();
        this.setState(stopRoundEarly(this.state));
      },
      onSubmit: (guess) => this.setState(processAnswer(this.state, guess)),
      onToggleMute: (muted) => {
        if (muted) stopSpeech();
        this.setState({ ...this.state, audioMuted: muted });
      },
    });

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (!this.quitConfirmOpen) {
        this.root.querySelector<HTMLInputElement>("#guess")?.focus({ preventScroll: true });
      }
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
