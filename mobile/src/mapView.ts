import { BEAST_MODE_SELECTION, STYLE_FROM_EN, STYLE_TO_EN } from "./config";
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
  stageNumber,
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
}

export interface MapHandlers {
  onOpenLevel(csv: string, origin: { x: number; y: number }): void;
  onClosePopup(): void;
  onOpenInfo(): void;
  onCloseInfo(): void;
  onToggleGear(): void;
  onSetStyle(style: string): void;
  onToggleMute(muted: boolean): void;
  onStart(): void;
  onDismissCompletion(): void;
  onButtonPress?(): void;
}

export function levelLabel(name: string): string {
  if (name === BEAST_MODE_SELECTION) return "Beast Mode - 10 Random Questions";
  return name.replace(/\.csv$/i, "");
}

function nodeColorClass(index: number, medal: Medal | undefined): string {
  if (medal) return `tier-${medalTier(medal.emoji)}`;
  return stageClass(index);
}

function landmarkHtml(index: number, beast: boolean): string {
  if (beast) return "";
  const landmark = levelLandmark(index);
  if (!landmark) return "";
  return `<span class="level-landmark landmark-${landmark.side}" aria-hidden="true">${landmark.emoji}</span>`;
}

function nodeHtml(csv: string, index: number, medal: Medal | undefined, beast: boolean): string {
  const colorClass = beast ? "" : nodeColorClass(index, medal);
  const emoji = beast ? BEAST_LEVEL_EMOJI : levelEmoji(csv);
  const offset = beast ? 0 : levelOffset(index);
  const label = levelLabel(csv);
  const badge = medal ? `<span class="level-score">${escapeHtml(medal.label)}</span>` : "";
  const beastClass = beast ? " level-beast" : "";
  return `
    <div class="level-slot" style="transform: translateX(${offset}px)">
      ${landmarkHtml(index, beast)}
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
    parts.push(nodeHtml(csvNames[i]!, i, levelMedals[csvNames[i]!], false));
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

function wordListHtml(vm: MapViewModel): string {
  if (vm.popupCsv === BEAST_MODE_SELECTION) {
    return `<details class="expander"><summary>Show words list</summary><p class="caption">Beast Mode draws 10 random cards from all lists.</p></details>`;
  }
  const rows = vm.popupRows
    .map((r) => `<tr><td>${escapeHtml(r.en)}</td><td>${escapeHtml(r.lang)}</td></tr>`)
    .join("");
  return `<details class="expander"><summary>Show words list</summary><div class="word-scroll"><table class="word-table">${rows}</table></div></details>`;
}

function popupPanelAttrs(vm: MapViewModel): string {
  const classes = ["popup"];
  if (vm.popupAnimate) classes.push("popup-open");
  if (!vm.popupOrigin) return `class="${classes.join(" ")}"`;
  const dx = Math.round(vm.popupOrigin.x - window.innerWidth / 2);
  const dy = Math.round(vm.popupOrigin.y - window.innerHeight / 2);
  return `class="${classes.join(" ")}" style="--pop-dx: ${dx}px; --pop-dy: ${dy}px"`;
}

function popupHtml(vm: MapViewModel): string {
  if (!vm.popupCsv) return "";
  const backdropClass = vm.popupAnimate ? "popup-backdrop backdrop-open" : "popup-backdrop";
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
  return `
    <div class="popup-backdrop" id="info-backdrop">
      <div class="info-panel" role="dialog" aria-modal="true" aria-label="About this app">
        <button type="button" class="icon-button info-close" id="info-close" aria-label="Close">×</button>
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

export function mapHtml(vm: MapViewModel): string {
  const levels = levelsHtml(vm.csvNames, vm.levelMedals);
  const beast = nodeHtml(BEAST_MODE_SELECTION, 0, vm.levelMedals[BEAST_MODE_SELECTION], true);
  return `
    <header class="map-header">
      <div class="map-header-row">
        <span class="map-header-spacer" aria-hidden="true"></span>
        <h1>Learn Punjabi</h1>
        <button type="button" class="info-button" id="map-info" aria-label="About this app">i</button>
      </div>
    </header>
    <div class="level-map">
      ${levels}
      <div class="map-divider"></div>
      ${beast}
    </div>
    ${popupHtml(vm)}
    ${completionHtml(vm)}
    ${infoPanelHtml(vm)}
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

export function bindMapEvents(root: HTMLElement, handlers: MapHandlers): void {
  root.querySelectorAll<HTMLElement>(".level-node").forEach((node) => {
    bindPressFeedback(node, handlers.onButtonPress);
    node.addEventListener("click", () => {
      const r = node.getBoundingClientRect();
      handlers.onOpenLevel(node.dataset.csv!, {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      });
    });
  });

  const backdrop = root.querySelector<HTMLElement>("#popup-backdrop");
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) handlers.onClosePopup();
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

  const infoBackdrop = root.querySelector<HTMLElement>("#info-backdrop");
  infoBackdrop?.addEventListener("click", (e) => {
    if (e.target === infoBackdrop) handlers.onCloseInfo();
  });

  root.querySelector("#info-close")?.addEventListener("click", () => {
    handlers.onCloseInfo();
  });
}
