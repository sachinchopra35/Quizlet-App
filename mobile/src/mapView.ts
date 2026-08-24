import { BEAST_MODE_SELECTION, STYLE_FROM_EN, STYLE_TO_EN } from "./config";
import { escapeAttr, escapeHtml } from "./html";
import { BEAST_LEVEL_EMOJI, levelEmoji, levelOffset, medalTier } from "./levels";
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
  gearOpen: boolean;
  questionStyle: string;
  audioMuted: boolean;
  popupRows: VocabRow[];
  completion: CompletionSummary | null;
}

export interface MapHandlers {
  onOpenLevel(csv: string): void;
  onClosePopup(): void;
  onToggleGear(): void;
  onSetStyle(style: string): void;
  onToggleMute(muted: boolean): void;
  onStart(): void;
  onDismissCompletion(): void;
}

export function levelLabel(name: string): string {
  if (name === BEAST_MODE_SELECTION) return "Beast Mode - 10 Random Questions";
  return name.replace(/\.csv$/i, "");
}

function nodeHtml(csv: string, index: number, medal: Medal | undefined, beast: boolean): string {
  const tier = medalTier(medal?.emoji);
  const emoji = beast ? BEAST_LEVEL_EMOJI : levelEmoji(csv);
  const offset = beast ? 0 : levelOffset(index);
  const label = levelLabel(csv);
  const badge = medal ? `<span class="level-score">${escapeHtml(medal.label)}</span>` : "";
  return `
    <div class="level-slot" style="transform: translateX(${offset}px)">
      <button
        type="button"
        class="level-node tier-${tier}${beast ? " level-beast" : ""}"
        data-csv="${escapeAttr(csv)}"
        aria-label="${escapeAttr(label)}"
      ><span class="level-emoji">${emoji}</span></button>
      ${badge}
    </div>
  `;
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

function popupHtml(vm: MapViewModel): string {
  if (!vm.popupCsv) return "";
  return `
    <div class="popup-backdrop" id="popup-backdrop">
      <div class="popup" role="dialog" aria-modal="true">
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

export function mapHtml(vm: MapViewModel): string {
  const levels = vm.csvNames
    .map((csv, i) => nodeHtml(csv, i, vm.levelMedals[csv], false))
    .join("");
  const beast = nodeHtml(BEAST_MODE_SELECTION, 0, vm.levelMedals[BEAST_MODE_SELECTION], true);
  return `
    <header class="map-header"><h1>Punjabi Vocab</h1></header>
    <div class="level-map">
      ${levels}
      <div class="map-divider"></div>
      ${beast}
    </div>
    ${popupHtml(vm)}
    ${completionHtml(vm)}
  `;
}

/** iOS WebView fires :active unreliably, so track the press explicitly. */
function bindPressFeedback(node: HTMLElement): void {
  const press = () => node.classList.add("is-pressed");
  const release = () => node.classList.remove("is-pressed");
  node.addEventListener("pointerdown", press);
  node.addEventListener("pointerup", release);
  node.addEventListener("pointercancel", release);
  node.addEventListener("pointerleave", release);
}

export function bindMapEvents(root: HTMLElement, handlers: MapHandlers): void {
  root.querySelectorAll<HTMLElement>(".level-node").forEach((node) => {
    bindPressFeedback(node);
    node.addEventListener("click", () => {
      handlers.onOpenLevel(node.dataset.csv!);
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
    bindPressFeedback(start);
    start.addEventListener("click", () => handlers.onStart());
  }

  root.querySelector("#completion-close")?.addEventListener("click", () => {
    handlers.onDismissCompletion();
  });
}
