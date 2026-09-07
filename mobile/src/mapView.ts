import {
  BEAST_MODE_SELECTION,
  BEAST_MODE_SIZE,
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
  levelTrophySlot,
  medalTier,
  stageClass,
  stageDividerLabel,
  stageMastered,
  stageNumber,
  stagePaletteIndex,
} from "./levels";
import type { Medal } from "./rounds";
import { roundHintBodyHtml, roundHintFor } from "./roundHints";
import { burstSparkles, PEACOCK_BURST_COLORS } from "./sparkleBurst";
import { bindPopupPrimaryEnter } from "./popupEnterKey";
import type { VocabRow } from "./vocab";

export interface CompletionSummary {
  emoji: string;
  label: string;
  quizNumber: string | null;
  quizName: string;
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
  steppingStoneIndex: number | null;
  steppingStoneOrigin: { x: number; y: number } | null;
  steppingStoneAnimate: boolean;
  levelHintOpen: boolean;
  levelHintAnimate: boolean;
  beastStageMin: number;
  beastStageMax: number;
  beastStageCount: number;
  beastCustomizeOpen: boolean;
}

export interface MapHandlers {
  onOpenLevel(csv: string, origin: { x: number; y: number }): void;
  onClosePopup(): void;
  onLockedTrophy(stage: number, origin: { x: number; y: number }): void;
  onCloseTrophyMessage(): void;
  onSteppingStone(index: number, origin: { x: number; y: number }): void;
  onCloseSteppingStoneMessage(): void;
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
  onOpenLevelHint(): void;
  onCloseLevelHint(): void;
  onSetStyle(style: string): void;
  onToggleMute(muted: boolean): void;
  onStart(): void;
  onDismissCompletion(): void;
  onAdjustBeastStageMin(delta: number): void;
  onAdjustBeastStageMax(delta: number): void;
  onBeastCustomizeToggle(open: boolean): void;
  onButtonPress?(): void;
}

export function levelLabel(name: string): string {
  if (name === BEAST_MODE_SELECTION) return "Beast Mode";
  const stage = parseStagePracticeKey(name);
  if (stage !== null) return `Stage ${stage} Practice`;
  return name.replace(/\.csv$/i, "");
}

/** Split a level filename into quiz number and topic name for display. */
export function levelQuizParts(name: string): { number: string | null; name: string } {
  if (name === BEAST_MODE_SELECTION) return { number: null, name: "Beast Mode" };
  const stage = parseStagePracticeKey(name);
  if (stage !== null) return { number: null, name: `Stage ${stage} Practice` };
  const base = name.replace(/\.csv$/i, "");
  const match = base.match(/^(\d+)\s+(.+)$/);
  if (match) return { number: match[1]!, name: match[2]! };
  return { number: null, name: base };
}

function beastRangeSummary(min: number, max: number): string {
  const stageLabel = min === max ? `Stage ${min}` : `Stages ${min}–${max}`;
  return `${stageLabel} · ${BEAST_MODE_SIZE} random questions`;
}

function beastCustomizeHtml(vm: MapViewModel): string {
  const { beastStageMin, beastStageMax, beastStageCount } = vm;
  const minDecDisabled = beastStageMin <= 1;
  const minIncDisabled = beastStageMin >= beastStageMax;
  const maxDecDisabled = beastStageMax <= beastStageMin;
  const maxIncDisabled = beastStageMax >= beastStageCount;
  const dec = (disabled: boolean) => (disabled ? " disabled" : "");
  return `
    <details class="expander beast-customize"${vm.beastCustomizeOpen ? " open" : ""}>
      <summary>Customize</summary>
      <div class="expander-panel">
        <div class="expander-panel-inner">
          <p class="caption beast-range-caption">Choose which stages to pull questions from.</p>
          <div class="stage-range-row">
            <span class="stage-range-label">From</span>
            <div class="stage-stepper">
              <button type="button" class="stage-step-btn" id="beast-stage-min-dec" aria-label="Lower earliest stage"${dec(minDecDisabled)}>−</button>
              <span class="stage-step-value" id="beast-stage-min-value">${beastStageMin}</span>
              <button type="button" class="stage-step-btn" id="beast-stage-min-inc" aria-label="Raise earliest stage"${dec(minIncDisabled)}>+</button>
            </div>
          </div>
          <div class="stage-range-row">
            <span class="stage-range-label">To</span>
            <div class="stage-stepper">
              <button type="button" class="stage-step-btn" id="beast-stage-max-dec" aria-label="Lower latest stage"${dec(maxDecDisabled)}>−</button>
              <span class="stage-step-value" id="beast-stage-max-value">${beastStageMax}</span>
              <button type="button" class="stage-step-btn" id="beast-stage-max-inc" aria-label="Raise latest stage"${dec(maxIncDisabled)}>+</button>
            </div>
          </div>
          <p class="caption beast-range-summary">${escapeHtml(beastRangeSummary(beastStageMin, beastStageMax))}</p>
        </div>
      </div>
    </details>
  `;
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
  const trophy = levelTrophySlot(index, csvNames.length);
  const parts: string[] = [];
  if (landmark) {
    const aloneClass = trophy ? "" : " landmark-alone";
    parts.push(
      `<button type="button" class="level-landmark landmark-${landmark.side}${aloneClass}" aria-label="Decorative landmark">${landmark.emoji}</button>`,
    );
  }
  if (trophy) {
    parts.push(trophyHtml(index, trophy.side, csvNames, levelMedals));
  }
  return parts.join("");
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

const STEPPING_ARROW_DEG: Record<"sm" | "md" | "lg", number> = {
  sm: 90,
  md: 80,
  lg: 72.5,
};

function steppingArrowHtml(size: "sm" | "md" | "lg"): string {
  const deg = STEPPING_ARROW_DEG[size];
  return `<svg class="stepping-arrow" style="--arrow-rotate: ${deg}deg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h11M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

const STEPPING_STONE_HEROES = ["🐐", "🐅", "🦅"] as const;
const STEPPING_STONE_TIPS = [
  {
    title: "Top Tip #1",
    body: "Look at the words list to learn the words before starting each level",
  },
  {
    title: "Top Tip #2",
    body: "This course starts from the very basics; you need no prior knowledge. However, I recommend you ask an AI for pronunciation help!",
  },
  {
    title: "Top Tip #3",
    body: "There are no multiple choice questions! You have to type in the answers. Therefore, try learning the words before you start each level",
  },
] as const;

function steppingStonesHtml(): string {
  const stones: { index: number; size: "sm" | "md" | "lg"; heroIndex: number }[] = [
    { index: -3, size: "sm", heroIndex: 0 },
    { index: -2, size: "md", heroIndex: 1 },
    { index: -1, size: "lg", heroIndex: 2 },
  ];
  return stones
    .map(
      ({ index, size, heroIndex }) => `
    <div class="level-slot stepping-slot" style="transform: translateX(${levelOffset(index)}px)">
      <button
        type="button"
        class="level-node stepping-stone stepping-stone-${size}"
        data-stepping="${heroIndex}"
        aria-label="Stepping stone ${heroIndex + 1} of 3"
      >${steppingArrowHtml(size)}</button>
    </div>`,
    )
    .join("");
}

function levelsHtml(csvNames: string[], levelMedals: Record<string, Medal>): string {
  const parts: string[] = [steppingStonesHtml()];
  for (let i = 0; i < csvNames.length; i++) {
    if (i % 10 === 0) parts.push(stageDividerHtml(stageNumber(i)));
    parts.push(nodeHtml(csvNames[i]!, i, levelMedals[csvNames[i]!], false, csvNames, levelMedals));
  }
  return parts.join("");
}

function settingsHtml(vm: MapViewModel): string {
  const openClass = vm.gearOpen ? " is-open" : "";
  return `
    <div class="popup-settings-wrap${openClass}">
      <div class="popup-settings-panel">
        <div class="popup-settings-inner">
          <div class="popup-settings">
            <div class="segmented">
              <button type="button" data-style="${escapeAttr(STYLE_FROM_EN)}" class="${vm.questionStyle === STYLE_FROM_EN ? "active" : ""}">From English</button>
              <button type="button" data-style="${escapeAttr(STYLE_TO_EN)}" class="${vm.questionStyle === STYLE_TO_EN ? "active" : ""}">To English</button>
            </div>
            <label class="mute-row"><input type="checkbox" id="popup-mute" ${vm.audioMuted ? "checked" : ""} /> Mute</label>
          </div>
        </div>
      </div>
    </div>
  `;
}

function wordListExpanderHtml(body: string): string {
  return `<details class="expander"><summary>Show words list</summary><div class="expander-panel"><div class="expander-panel-inner">${body}</div></div></details>`;
}

function wordListHtml(vm: MapViewModel): string {
  if (vm.popupCsv === BEAST_MODE_SELECTION) {
    return `
      <p class="caption beast-intro">${escapeHtml(beastRangeSummary(vm.beastStageMin, vm.beastStageMax))}</p>
      ${beastCustomizeHtml(vm)}
    `;
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

function popupHeadActionsHtml(vm: MapViewModel): string {
  const hint = vm.popupCsv ? roundHintFor(vm.popupCsv) : null;
  const hintBtn = hint
    ? `<button type="button" class="popup-info-button" id="popup-hint" aria-label="Round hints">i</button>`
    : "";
  return `
    <div class="popup-head-actions">
      ${hintBtn}
      <button type="button" class="icon-button" id="popup-gear" aria-label="Settings">⚙️</button>
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
          ${popupHeadActionsHtml(vm)}
        </div>
        ${settingsHtml(vm)}
        ${wordListHtml(vm)}
        <button type="button" class="primary popup-start" id="popup-start">Start Quiz</button>
      </div>
    </div>
  `;
}

function steppingStoneMessageHtml(vm: MapViewModel): string {
  const index = vm.steppingStoneIndex;
  if (index === null) return "";
  const hero = STEPPING_STONE_HEROES[index] ?? STEPPING_STONE_HEROES[0];
  const tip = STEPPING_STONE_TIPS[index] ?? STEPPING_STONE_TIPS[0];
  const backdropClass = vm.steppingStoneAnimate
    ? "popup-backdrop backdrop-open"
    : "popup-backdrop";
  const classes = ["popup", "popup-trophy"];
  if (vm.steppingStoneAnimate) classes.push("popup-open");
  let style = "";
  if (vm.steppingStoneOrigin) {
    const dx = Math.round(vm.steppingStoneOrigin.x - window.innerWidth / 2);
    const dy = Math.round(vm.steppingStoneOrigin.y - window.innerHeight / 2);
    style = ` style="--pop-dx: ${dx}px; --pop-dy: ${dy}px"`;
  }
  return `
    <div class="${backdropClass}" id="stepping-stone-message-backdrop">
      <div class="${classes.join(" ")}"${style} role="dialog" aria-modal="true">
        <span class="trophy-hero stepping-stone-hero" aria-hidden="true">${hero}</span>
        <h2 class="popup-trophy-title">${escapeHtml(tip.title)}</h2>
        <p class="popup-trophy-body">${escapeHtml(tip.body)}</p>
        <button type="button" class="primary" id="stepping-stone-message-close">Got it</button>
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
  const quizLines = c.quizNumber
    ? `<p class="complete-lines">
        <span class="complete-line complete-line-num">Quiz ${escapeHtml(c.quizNumber)}</span>
        <span class="complete-line">${escapeHtml(c.quizName)}</span>
        <span class="complete-line">${escapeHtml(c.label)}</span>
      </p>`
    : `<p class="complete-lines">
        <span class="complete-line">${escapeHtml(c.quizName)}</span>
        <span class="complete-line">${escapeHtml(c.label)}</span>
      </p>`;
  const ariaLabel = c.quizNumber
    ? `Quiz ${c.quizNumber}, ${c.quizName}, ${c.label}`
    : `${c.quizName}, ${c.label}`;
  return `
    <div class="popup-backdrop" id="completion-backdrop">
      <div class="popup popup-complete" role="dialog" aria-modal="true" aria-label="${escapeAttr(ariaLabel)}">
        <span class="complete-medal">${c.emoji}</span>
        ${quizLines}
        <button type="button" class="primary" id="completion-close">Continue</button>
      </div>
    </div>
  `;
}

function levelHintPanelHtml(vm: MapViewModel): string {
  if (!vm.levelHintOpen || !vm.popupCsv) return "";
  const body = roundHintBodyHtml(vm.popupCsv);
  if (!body) return "";
  const backdropClass = vm.levelHintAnimate
    ? "popup-backdrop backdrop-open level-hint-backdrop"
    : "popup-backdrop level-hint-backdrop";
  const panelClass = vm.levelHintAnimate ? "info-panel popup-open" : "info-panel";
  const title = levelLabel(vm.popupCsv);
  return `
    <div class="${backdropClass}" id="level-hint-backdrop">
      <div class="${panelClass}" role="dialog" aria-modal="true" aria-label="Hints for ${escapeAttr(title)}">
        <div class="info-panel-top">
          <button type="button" class="panel-close" id="level-hint-close" aria-label="Close">×</button>
        </div>
        <div class="info-scroll">
          <div class="info-hero" aria-hidden="true">💡</div>
          <div class="info-body">
            <h3>${escapeHtml(title)}</h3>
            ${body}
          </div>
        </div>
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
    <section class="globe-hero" aria-label="Welcome">
      <div class="globe-stage">
        <button type="button" class="hero-peacock" id="hero-peacock" aria-label="Welcome peacock">🦚</button>
      </div>
      <div class="globe-scroll-cue">
        <span>Welcome!<br>Your Punjabi course starts below</span>
        <span class="globe-arrow" aria-hidden="true">&#8595;</span>
      </div>
    </section>
    <div class="level-map">
      ${levels}
      <div class="map-divider"></div>
      ${beast}
    </div>
    ${popupHtml(vm)}
    ${levelHintPanelHtml(vm)}
    ${trophyMessageHtml(vm)}
    ${steppingStoneMessageHtml(vm)}
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
  root.querySelectorAll<HTMLButtonElement>("button.level-node").forEach((node) => {
    const locked = node.classList.contains("is-locked");
    const stepping = node.classList.contains("stepping-stone");
    if (!locked) bindPressFeedback(node, handlers.onButtonPress);
    node.addEventListener("click", () => {
      const r = node.getBoundingClientRect();
      const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      if (stepping) {
        handlers.onSteppingStone(Number(node.dataset.stepping), origin);
        return;
      }
      if (locked) {
        handlers.onLockedTrophy(Number(node.dataset.stage), origin);
        return;
      }
      handlers.onOpenLevel(node.dataset.csv!, origin);
    });
  });

  const steppingBackdrop = root.querySelector<HTMLElement>("#stepping-stone-message-backdrop");
  steppingBackdrop?.addEventListener("click", (e) => {
    if (e.target === steppingBackdrop) handlers.onCloseSteppingStoneMessage();
  });

  root.querySelector("#stepping-stone-message-close")?.addEventListener("click", () => {
    handlers.onCloseSteppingStoneMessage();
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

  root.querySelector("#popup-hint")?.addEventListener("click", () => {
    handlers.onOpenLevelHint();
  });

  const levelHintBackdrop = root.querySelector<HTMLElement>("#level-hint-backdrop");
  levelHintBackdrop?.addEventListener("click", (e) => {
    if (e.target === levelHintBackdrop) handlers.onCloseLevelHint();
  });

  root.querySelector("#level-hint-close")?.addEventListener("click", () => {
    handlers.onCloseLevelHint();
  });

  root.querySelectorAll<HTMLElement>("[data-style]").forEach((el) => {
    el.addEventListener("click", () => handlers.onSetStyle(el.dataset.style!));
  });

  root.querySelector("#popup-mute")?.addEventListener("change", (e) => {
    handlers.onToggleMute((e.target as HTMLInputElement).checked);
  });

  const bindStageStep = (id: string, handler: () => void) => {
    const btn = root.querySelector<HTMLButtonElement>(`#${id}`);
    if (!btn || btn.disabled) return;
    bindPressFeedback(btn, handlers.onButtonPress);
    btn.addEventListener("click", handler);
  };

  bindStageStep("beast-stage-min-dec", () => handlers.onAdjustBeastStageMin(-1));
  bindStageStep("beast-stage-min-inc", () => handlers.onAdjustBeastStageMin(1));
  bindStageStep("beast-stage-max-dec", () => handlers.onAdjustBeastStageMax(-1));
  bindStageStep("beast-stage-max-inc", () => handlers.onAdjustBeastStageMax(1));

  root.querySelector("details.beast-customize")?.addEventListener("toggle", (e) => {
    handlers.onBeastCustomizeToggle((e.currentTarget as HTMLDetailsElement).open);
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

  bindDecorativeBursts(root);
  bindExpanderAnimations(root);
  bindPopupPrimaryEnter(root);
}

function playDecorativePop(el: HTMLElement, x: number, y: number, colors?: readonly string[]): void {
  burstSparkles(x, y, colors);
  el.classList.remove("is-bouncing");
  void el.offsetWidth;
  el.classList.add("is-bouncing");
  el.addEventListener("animationend", () => el.classList.remove("is-bouncing"), { once: true });
}

function bindDecorativeBursts(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>("button.level-landmark").forEach((btn) => {
    bindPressFeedback(btn, undefined);
    btn.addEventListener("click", () => {
      const r = btn.getBoundingClientRect();
      playDecorativePop(btn, r.left + r.width / 2, r.top + r.height / 2);
    });
  });

  const peacock = root.querySelector<HTMLButtonElement>("#hero-peacock");
  if (peacock) {
    bindPressFeedback(peacock, undefined);
    peacock.addEventListener("click", () => {
      const r = peacock.getBoundingClientRect();
      playDecorativePop(peacock, r.left + r.width / 2, r.top + r.height / 2, PEACOCK_BURST_COLORS);
    });
  }
}
