type PopupLayer = {
  backdropId: string;
  buttonId: string;
  /** Backdrop is active when present in the DOM (not gated on backdrop-open). */
  alwaysOpenWhenPresent?: boolean;
};

/** Topmost-first: matches modal stacking on the map screen. */
const MAP_POPUP_LAYERS: PopupLayer[] = [
  { backdropId: "reset-type-backdrop", buttonId: "reset-type-submit" },
  { backdropId: "reset-confirm-backdrop", buttonId: "reset-confirm-yes" },
  { backdropId: "level-hint-backdrop", buttonId: "level-hint-close" },
  { backdropId: "completion-backdrop", buttonId: "completion-close", alwaysOpenWhenPresent: true },
  { backdropId: "stepping-stone-message-backdrop", buttonId: "stepping-stone-message-close" },
  { backdropId: "trophy-message-backdrop", buttonId: "trophy-message-close" },
  { backdropId: "popup-backdrop", buttonId: "popup-start" },
];

function isBackdropActive(root: HTMLElement, layer: PopupLayer): boolean {
  const backdrop = root.querySelector<HTMLElement>(`#${CSS.escape(layer.backdropId)}`);
  if (!backdrop) return false;
  if (layer.alwaysOpenWhenPresent) return true;
  return backdrop.classList.contains("backdrop-open");
}

function shouldIgnoreEnterTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "TEXTAREA") return true;
  if (target.tagName === "SELECT") return true;
  if (target.tagName !== "INPUT") return false;
  const input = target as HTMLInputElement;
  return input.type !== "checkbox" && input.type !== "radio";
}

/** Press Enter to activate the top popup's main action (desktop / keyboard use). */
export function bindPopupPrimaryEnter(root: HTMLElement): void {
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing) return;
    if (shouldIgnoreEnterTarget(e.target)) return;

    for (const layer of MAP_POPUP_LAYERS) {
      if (!isBackdropActive(root, layer)) continue;
      const btn = root.querySelector<HTMLButtonElement>(`#${CSS.escape(layer.buttonId)}`);
      if (!btn || btn.disabled) return;
      e.preventDefault();
      btn.click();
      return;
    }
  });
}
