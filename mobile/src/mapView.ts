import {
  BEAST_MODE_SELECTION,
  parseStagePracticeKey,
  STAGE_PRACTICE_SIZE,
  stagePracticeKey,
  STYLE_FROM_EN,
  STYLE_TO_EN,
} from "./config";
import { courseFooterHtml, escapeAttr, escapeHtml } from "./html";
import { introPanelBodyHtml } from "./introContent";
import {
  BEAST_LEVEL_EMOJI,
  courseGoldProgress,
  levelEmoji,
  levelLandmark,
  levelOffset,
  medalTier,
  stageClass,
  stageDividerLabel,
  stageMastered,
  stageNumber,
  stagePaletteIndex,
} from "./levels";
import type { Medal } from "./rounds";
import type { VocabRow } from "./vocab";

export interface CompletionSummary {
  emoji: string;
  label: string;
  message: string;
}

export interface MapViewModel {
  csvNames: string[];
  levelMedals: Record<string, Medal>;
  popupCsv: string | null;
  popupOrigin: { x: number; y: number } | null;
  popupAnimate: boolean;
  gearOpen: boolean;
  questionStyle: string;
  audioMuted: boolean;
  popupRows: VocabRow[];
  completion: CompletionSummary | null;
  infoOpen: boolean;
  infoAnimate: boolean;
  settingsOpen: boolean;
  settingsAnimate: boolean;
  resetConfirmOpen: boolean;
  resetConfirmAnimate: boolean;
  resetTypeOpen: boolean;
  resetTypeAnimate: boolean;
  trophyMessageStage: number | null;
  trophyMessageOrigin: { x: number; y: number } | null;
  trophyMessageAnimate: boolean;
}

export interface MapHandlers {
  onOpenLevel(csv: string, origin: { x: number; y: number }): void;
  onClosePopup(): void;
  onLockedTrophy(stage: number, origin: { x: number; y: number }): void;
  onCloseTrophyMessage(): void;
  onOpenInfo(): void;
  onCloseInfo(): void;
  onOpenSettings(): void;
  onCloseSettings(): void;
  onRequestResetProgress(): void;
  onCancelResetConfirm(): void;
  onConfirmResetSure(): void;
  onCancelResetType(): void;
  onSubmitResetType(value: string): void;
  onToggleGear(): void;
  onSetStyle(style: string): void;
  onToggleMute(muted: boolean): void;
  onStart(): void;
  onDismissCompletion(): void;
  onButtonPress?(): void;
}

export function levelLabel(name: string): string {
  if (name === BEAST_MODE_SELECTION) return "Beast Mode - 10 Random Questions";
  const stage = parseStagePracticeKey(name);
  if (stage !== null) return `Stage ${stage} Practice`;
  return name.replace(/\.csv$/i, "");
}

function nodeColorClass(index: number, medal: Medal | undefined): string {
  if (medal) return `tier-${medalTier(medal.emoji)}`;
  return stageClass(index);
}

const TROPHY_EMOJI = "🏆";

function landmarkHtml(
  index: number,
  beast: boolean,
  csvNames: string[],
  levelMedals: Record<string, Medal>,
): string {
  if (beast) return "";
  const landmark = levelLandmark(index);
  if (!landmark) return "";
  const emoji = `<span class="level-landmark landmark-${landmark.side}" aria-hidden="true">${landmark.emoji}</span>`;
  return emoji + trophyHtml(index, landmark.side, csvNames, levelMedals);
}

function trophyHtml(
  index: number,
  side: string,
  csvNames: string[],
  levelMedals: Record<string, Medal>,
): string {
  const stage = stageNumber(index);
  const won = stageMastered(csvNames, levelMedals, stage);
  const key = stagePracticeKey(stage);
  const stateClass = won ? "is-won" : "is-locked";
  const label = won ? `Stage ${stage} Trophy` : `Stage ${stage} Trophy, locked`;
  const csvAttr = won ? ` data-csv="${escapeAttr(key)}"` : "";
  const stageClass = won ? `stage-${stagePaletteIndex(index)}` : "";
  return `
    <span class="trophy-slot trophy-${side}">
      <button
        type="button"
        class="level-node level-trophy ${stageClass} ${stateClass}"${csvAttr}
        data-stage="${stage}"
        aria-label="${escapeAttr(label)}"
      ><span class="level-emoji">${TROPHY_EMOJI}</span></button>
    </span>
  `;
}

function nodeHtml(
  csv: string,
  index: number,
  medal: Medal | undefined,
  beast: boolean,
  csvNames: string[] = [],
  levelMedals: Record<string, Medal> = {},
): string {
  const colorClass = beast ? "" : nodeColorClass(index, medal);
  const emoji = beast ? BEAST_LEVEL_EMOJI : levelEmoji(csv);
  const offset = beast ? 0 : levelOffset(index);
  const label = levelLabel(csv);
  const badge = medal ? `<span class="level-score">${escapeHtml(medal.label)}</span>` : "";
  const beastClass = beast ? " level-beast" : "";
  return `
    <div class="level-slot" style="transform: translateX(${offset}px)">
      ${landmarkHtml(index, beast, csvNames, levelMedals)}
      <button
        type="button"
        class="level-node ${colorClass}${beastClass}"
        data-csv="${escapeAttr(csv)}"
        aria-label="${escapeAttr(label)}"
      ><span class="level-emoji">${emoji}</span></button>
      ${badge}
    </div>
  `;
}

function stageDividerHtml(stageNum: number): string {
  const label = stageDividerLabel(stageNum);
  return `
    <div class="stage-divider" role="separator">
      <span class="stage-divider-line"></span>
      <span class="stage-divider-label">${escapeHtml(label)}</span>
      <span class="stage-divider-line"></span>
    </div>
  `;
}

function levelsHtml(csvNames: string[], levelMedals: Record<string, Medal>): string {
  const parts: string[] = [];
  for (let i = 0; i < csvNames.length; i++) {
    if (i % 10 === 0) parts.push(stageDividerHtml(stageNumber(i)));
    parts.push(nodeHtml(csvNames[i]!, i, levelMedals[csvNames[i]!], false, csvNames, levelMedals));
  }
  return parts.join("");
}

function settingsHtml(vm: MapViewModel): string {
  if (!vm.gearOpen) return "";
  return `
    <div class="popup-settings">
      <div class="segmented">
        <button type="button" data-style="${escapeAttr(STYLE_FROM_EN)}" class="${vm.questionStyle === STYLE_FROM_EN ? "active" : ""}">From English</button>
        <button type="button" data-style="${escapeAttr(STYLE_TO_EN)}" class="${vm.questionStyle === STYLE_TO_EN ? "active" : ""}">To English</button>
      </div>
      <label class="mute-row"><input type="checkbox" id="popup-mute" ${vm.audioMuted ? "checked" : ""} /> Mute</label>
    </div>
  `;
}

function wordListExpanderHtml(body: string): string {
  return `<details class="expander"><summary>Show words list</summary><div class="expander-panel"><div class="expander-panel-inner">${body}</div></div></details>`;
}

function wordListHtml(vm: MapViewModel): string {
  if (vm.popupCsv === BEAST_MODE_SELECTION) {
    return wordListExpanderHtml(
      `<p class="caption">Beast Mode draws 10 random cards from all lists.</p>`,
    );
  }
  const practiceStage = vm.popupCsv ? parseStagePracticeKey(vm.popupCsv) : null;
  if (practiceStage !== null) {
    return `<p class="caption">Draws ${STAGE_PRACTICE_SIZE} random cards from every level in Stage ${practiceStage}.</p>`;
  }
  const rows = vm.popupRows
    .map((r) => `<tr><td>${escapeHtml(r.en)}</td><td>${escapeHtml(r.lang)}</td></tr>`)
    .join("");
  return wordListExpanderHtml(
    `<div class="word-scroll"><table class="word-table">${rows}</table></div>`,
  );
}

function popupPanelAttrs(vm: MapViewModel, extraClass?: string): string {
  const classes = ["popup"];
  if (extraClass) classes.push(extraClass);
  if (vm.popupAnimate) classes.push("popup-open");
  if (!vm.popupOrigin) return `class="${classes.join(" ")}"`;
  const dx = Math.round(vm.popupOrigin.x - window.innerWidth / 2);
  const dy = Math.round(vm.popupOrigin.y - window.innerHeight / 2);
  return `class="${classes.join(" ")}" style="--pop-dx: ${dx}px; --pop-dy: ${dy}px"`;
}

function trophyPracticePopupHtml(vm: MapViewModel, stage: number, backdropClass: string): string {
  return `
    <div class="${backdropClass}" id="popup-backdrop">
      <div ${popupPanelAttrs(vm, "popup-trophy-earned")} role="dialog" aria-modal="true" aria-label="Stage ${stage} Trophy">
        <div class="popup-trophy-top">
          <button type="button" class="icon-button" id="popup-gear" aria-label="Settings">⚙️</button>
        </div>
        <div class="trophy-hero-earned" aria-hidden="true">${TROPHY_EMOJI}</div>
        <h2 class="popup-trophy-title">Stage ${stage} Trophy</h2>
        ${settingsHtml(vm)}
        <p class="caption popup-trophy-body">You mastered every level in Stage ${stage}. Replay your vocab here — ${STAGE_PRACTICE_SIZE} random questions from across the stage.</p>
        <button type="button" class="primary popup-start" id="popup-start">Start Quiz</button>
      </div>
    </div>
  `;
}

function popupHtml(vm: MapViewModel): string {
  if (!vm.popupCsv) return "";
  const backdropClass = vm.popupAnimate ? "popup-backdrop backdrop-open" : "popup-backdrop";
  const practiceStage = parseStagePracticeKey(vm.popupCsv);
  if (practiceStage !== null) {
    return trophyPracticePopupHtml(vm, practiceStage, backdropClass);
  }
  return `
    <div class="${backdropClass}" id="popup-backdrop">
      <div ${popupPanelAttrs(vm)} role="dialog" aria-modal="true">
        <div class="popup-head">
          <h2>${escapeHtml(levelLabel(vm.popupCsv))}</h2>
          <button type="button" class="icon-button" id="popup-gear" aria-label="Settings">⚙️</button>
        </div>
        ${settingsHtml(vm)}
        ${wordListHtml(vm)}
        <button type="button" class="primary popup-start" id="popup-start">Start Quiz</button>
      </div>
    </div>
  `;
}

function trophyMessageHtml(vm: MapViewModel): string {
  const stage = vm.trophyMessageStage;
  if (stage === null) return "";
  const backdropClass = vm.trophyMessageAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  const classes = ["popup", "popup-trophy"];
  if (vm.trophyMessageAnimate) classes.push("popup-open");
  let style = "";
  if (vm.trophyMessageOrigin) {
    const dx = Math.round(vm.trophyMessageOrigin.x - window.innerWidth / 2);
    const dy = Math.round(vm.trophyMessageOrigin.y - window.innerHeight / 2);
    style = ` style="--pop-dx: ${dx}px; --pop-dy: ${dy}px"`;
  }
  return `
    <div class="${backdropClass}" id="trophy-message-backdrop">
      <div class="${classes.join(" ")}"${style} role="dialog" aria-modal="true">
        <span class="trophy-hero" aria-hidden="true">${TROPHY_EMOJI}</span>
        <p class="trophy-message">Master all levels in Stage ${stage} to win the Stage ${stage} Trophy</p>
        <button type="button" class="primary" id="trophy-message-close">Got it</button>
      </div>
    </div>
  `;
}

function completionHtml(vm: MapViewModel): string {
  if (!vm.completion) return "";
  const c = vm.completion;
  return `
    <div class="popup-backdrop" id="completion-backdrop">
      <div class="popup popup-complete" role="dialog" aria-modal="true">
        <span class="complete-medal">${c.emoji}</span>
        <p class="complete-score">${escapeHtml(c.label)}</p>
        <p class="caption">${escapeHtml(c.message)}</p>
        <button type="button" class="primary" id="completion-close">Continue</button>
      </div>
    </div>
  `;
}

function infoPanelHtml(vm: MapViewModel): string {
  if (!vm.infoOpen) return "";
  const backdropClass = vm.infoAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  const panelClass = vm.infoAnimate ? "info-panel popup-open" : "info-panel";
  return `
    <div class="${backdropClass}" id="info-backdrop">
      <div class="${panelClass}" role="dialog" aria-modal="true" aria-label="About this app">
        <div class="info-panel-top">
          <button type="button" class="panel-close" id="info-close" aria-label="Close">×</button>
        </div>
        <div class="info-scroll">
          <div class="info-hero" aria-hidden="true">💡</div>
          <div class="info-body">
            ${introPanelBodyHtml()}
          </div>
        </div>
      </div>
    </div>
  `;
}

function settingsPanelHtml(vm: MapViewModel): string {
  if (!vm.settingsOpen) return "";
  const backdropClass = vm.settingsAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  const panelClass = vm.settingsAnimate ? "settings-panel popup-open" : "settings-panel";
  return `
    <div class="${backdropClass}" id="settings-backdrop">
      <div class="${panelClass}" role="dialog" aria-modal="true" aria-label="App settings">
        <div class="popup-head">
          <h2>Settings</h2>
          <button type="button" class="panel-close" id="settings-close" aria-label="Close">×</button>
        </div>
        <div class="popup-settings settings-panel-body">
          <p class="settings-label">Question direction</p>
          <div class="segmented">
            <button type="button" data-style="${escapeAttr(STYLE_FROM_EN)}" class="${vm.questionStyle === STYLE_FROM_EN ? "active" : ""}">From English</button>
            <button type="button" data-style="${escapeAttr(STYLE_TO_EN)}" class="${vm.questionStyle === STYLE_TO_EN ? "active" : ""}">To English</button>
          </div>
          <label class="mute-row"><input type="checkbox" id="settings-mute" ${vm.audioMuted ? "checked" : ""} /> Mute audio</label>
          <button type="button" class="settings-reset" id="settings-reset">Reset all progress</button>
        </div>
      </div>
    </div>
  `;
}

function resetConfirmPanelHtml(vm: MapViewModel): string {
  if (!vm.resetConfirmOpen) return "";
  const backdropClass = vm.resetConfirmAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  const panelClass = vm.resetConfirmAnimate ? "info-panel popup-open" : "info-panel";
  return `
    <div class="${backdropClass}" id="reset-confirm-backdrop">
      <div class="${panelClass}" role="dialog" aria-modal="true" aria-label="Reset progress confirmation">
        <div class="info-panel-top">
          <button type="button" class="panel-close" id="reset-confirm-close" aria-label="Close">×</button>
        </div>
        <div class="info-scroll">
          <div class="info-body reset-confirm-body">
            <h3>Are you sure?</h3>
            <p>All medals and level completion progress will be cleared from this device. Your mute and question-direction settings are kept.</p>
            <p class="caption">You will need one more step after this to confirm.</p>
            <div class="reset-panel-actions">
              <button type="button" class="settings-cancel" id="reset-confirm-cancel">Cancel</button>
              <button type="button" class="primary" id="reset-confirm-yes">Yes, continue</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function resetTypePanelHtml(vm: MapViewModel): string {
  if (!vm.resetTypeOpen) return "";
  const backdropClass = vm.resetTypeAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  const panelClass = vm.resetTypeAnimate ? "info-panel popup-open" : "info-panel";
  return `
    <div class="${backdropClass}" id="reset-type-backdrop">
      <div class="${panelClass}" role="dialog" aria-modal="true" aria-label="Type reset to confirm">
        <div class="info-panel-top">
          <button type="button" class="panel-close" id="reset-type-close" aria-label="Close">×</button>
        </div>
        <div class="info-scroll">
          <div class="info-hero" aria-hidden="true">🤨</div>
          <div class="info-body reset-type-body">
            <p>Type <strong>reset</strong> to reset all level completion progress.</p>
            <form class="reset-type-form" id="reset-type-form">
              <input
                type="text"
                id="reset-type-input"
                name="resetConfirm"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                enterkeyhint="done"
                placeholder="reset"
              />
              <button type="submit" class="settings-reset-confirm-btn" id="reset-type-submit" disabled>Reset all progress</button>
            </form>
            <button type="button" class="settings-cancel reset-type-cancel" id="reset-type-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function mapHtml(vm: MapViewModel): string {
  const levels = levelsHtml(vm.csvNames, vm.levelMedals);
  const beast = nodeHtml(BEAST_MODE_SELECTION, 0, vm.levelMedals[BEAST_MODE_SELECTION], true);
  return `
    <header class="map-header">
      <div class="map-header-row">
        <button type="button" class="settings-button" id="map-settings" aria-label="App settings">⚙️</button>
        <h1>Simple Punjabi</h1>
        <button type="button" class="info-button" id="map-info" aria-label="About this app">i</button>
      </div>
    </header>
    <div class="level-map">
      ${levels}
      <div class="map-divider"></div>
      ${beast}
    </div>
    ${popupHtml(vm)}
    ${trophyMessageHtml(vm)}
    ${completionHtml(vm)}
    ${infoPanelHtml(vm)}
    ${settingsPanelHtml(vm)}
    ${resetConfirmPanelHtml(vm)}
    ${resetTypePanelHtml(vm)}
    ${courseFooterHtml(courseGoldProgress(vm.csvNames, vm.levelMedals))}
  `;
}

/** iOS WebView fires :active unreliably, so track the press explicitly. */
function bindPressFeedback(node: HTMLElement, onPress?: () => void): void {
  const release = () => node.classList.remove("is-pressed");
  node.addEventListener("pointerdown", (e) => {
    node.classList.add("is-pressed");
    node.setPointerCapture(e.pointerId);
    onPress?.();
  });
  node.addEventListener("pointerup", release);
  node.addEventListener("pointercancel", release);
  node.addEventListener("lostpointercapture", release);
}

function bindExpanderAnimations(root: HTMLElement): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.querySelectorAll<HTMLDetailsElement>(".expander").forEach((details) => {
    const summary = details.querySelector("summary");
    const panel = details.querySelector<HTMLElement>(".expander-panel");
    if (!summary || !panel) return;

    summary.addEventListener("click", (e) => {
      if (!details.open) return;

      e.preventDefault();
      details.classList.add("is-closing");

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        details.classList.remove("is-closing");
        details.open = false;
      };

      panel.addEventListener(
        "transitionend",
        (ev) => {
          if (ev.propertyName === "grid-template-rows") finish();
        },
        { once: true },
      );
      window.setTimeout(finish, 320);
    });
  });
}

export function bindMapEvents(root: HTMLElement, handlers: MapHandlers): void {
  root.querySelectorAll<HTMLElement>(".level-node").forEach((node) => {
    const locked = node.classList.contains("is-locked");
    if (!locked) bindPressFeedback(node, handlers.onButtonPress);
    node.addEventListener("click", () => {
      const r = node.getBoundingClientRect();
      const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      if (locked) {
        handlers.onLockedTrophy(Number(node.dataset.stage), origin);
        return;
      }
      handlers.onOpenLevel(node.dataset.csv!, origin);
    });
  });

  const backdrop = root.querySelector<HTMLElement>("#popup-backdrop");
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) handlers.onClosePopup();
  });

  const trophyBackdrop = root.querySelector<HTMLElement>("#trophy-message-backdrop");
  trophyBackdrop?.addEventListener("click", (e) => {
    if (e.target === trophyBackdrop) handlers.onCloseTrophyMessage();
  });

  root.querySelector("#trophy-message-close")?.addEventListener("click", () => {
    handlers.onCloseTrophyMessage();
  });

  root.querySelector("#popup-gear")?.addEventListener("click", () => {
    handlers.onToggleGear();
  });

  root.querySelectorAll<HTMLElement>("[data-style]").forEach((el) => {
    el.addEventListener("click", () => handlers.onSetStyle(el.dataset.style!));
  });

  root.querySelector("#popup-mute")?.addEventListener("change", (e) => {
    handlers.onToggleMute((e.target as HTMLInputElement).checked);
  });

  const start = root.querySelector<HTMLElement>("#popup-start");
  if (start) {
    bindPressFeedback(start, handlers.onButtonPress);
    start.addEventListener("click", () => handlers.onStart());
  }

  root.querySelector("#completion-close")?.addEventListener("click", () => {
    handlers.onDismissCompletion();
  });

  root.querySelector("#map-info")?.addEventListener("click", () => {
    handlers.onOpenInfo();
  });

  root.querySelector("#map-settings")?.addEventListener("click", () => {
    handlers.onOpenSettings();
  });

  const infoBackdrop = root.querySelector<HTMLElement>("#info-backdrop");
  infoBackdrop?.addEventListener("click", (e) => {
    if (e.target === infoBackdrop) handlers.onCloseInfo();
  });

  root.querySelector("#info-close")?.addEventListener("click", () => {
    handlers.onCloseInfo();
  });

  const settingsBackdrop = root.querySelector<HTMLElement>("#settings-backdrop");
  settingsBackdrop?.addEventListener("click", (e) => {
    if (e.target === settingsBackdrop) handlers.onCloseSettings();
  });

  root.querySelector("#settings-close")?.addEventListener("click", () => {
    handlers.onCloseSettings();
  });

  root.querySelector("#settings-reset")?.addEventListener("click", () => {
    handlers.onRequestResetProgress();
  });

  const resetConfirmBackdrop = root.querySelector<HTMLElement>("#reset-confirm-backdrop");
  resetConfirmBackdrop?.addEventListener("click", (e) => {
    if (e.target === resetConfirmBackdrop) handlers.onCancelResetConfirm();
  });

  root.querySelector("#reset-confirm-close")?.addEventListener("click", () => {
    handlers.onCancelResetConfirm();
  });

  root.querySelector("#reset-confirm-cancel")?.addEventListener("click", () => {
    handlers.onCancelResetConfirm();
  });

  root.querySelector("#reset-confirm-yes")?.addEventListener("click", () => {
    handlers.onConfirmResetSure();
  });

  const resetTypeBackdrop = root.querySelector<HTMLElement>("#reset-type-backdrop");
  resetTypeBackdrop?.addEventListener("click", (e) => {
    if (e.target === resetTypeBackdrop) handlers.onCancelResetType();
  });

  root.querySelector("#reset-type-close")?.addEventListener("click", () => {
    handlers.onCancelResetType();
  });

  root.querySelector("#reset-type-cancel")?.addEventListener("click", () => {
    handlers.onCancelResetType();
  });

  const resetTypeInput = root.querySelector<HTMLInputElement>("#reset-type-input");
  const resetTypeSubmit = root.querySelector<HTMLButtonElement>("#reset-type-submit");
  resetTypeInput?.addEventListener("input", () => {
    if (!resetTypeSubmit || !resetTypeInput) return;
    resetTypeSubmit.disabled = resetTypeInput.value.trim().toLowerCase() !== "reset";
  });

  root.querySelector("#reset-type-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!resetTypeInput || resetTypeSubmit?.disabled) return;
    handlers.onSubmitResetType(resetTypeInput.value);
  });

  requestAnimationFrame(() => {
    resetTypeInput?.focus({ preventScroll: true });
  });

  root.querySelectorAll<HTMLElement>("#settings-backdrop [data-style]").forEach((el) => {
    el.addEventListener("click", () => handlers.onSetStyle(el.dataset.style!));
  });

  root.querySelector("#settings-mute")?.addEventListener("change", (e) => {
    handlers.onToggleMute((e.target as HTMLInputElement).checked);
  });

  bindExpanderAnimations(root);
}
