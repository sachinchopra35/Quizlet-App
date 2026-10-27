export type BubblePlacement = "above" | "below";

const BUBBLE_EST_HEIGHT = 220;
const GAP = 10;
const MARGIN = 12;

export interface BubbleRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Prefer above the anchor when there is room; otherwise below. */
export function bubblePlacement(
  anchor: BubbleRect,
  viewportHeight: number,
  bubbleHeight = BUBBLE_EST_HEIGHT,
): BubblePlacement {
  const spaceAbove = anchor.top - MARGIN;
  const spaceBelow = viewportHeight - (anchor.top + anchor.height) - MARGIN;
  if (spaceAbove >= bubbleHeight + GAP) return "above";
  if (spaceBelow >= bubbleHeight + GAP) return "below";
  return spaceAbove >= spaceBelow ? "above" : "below";
}

export interface LandmarkBubbleHandlers {
  onOpenCheatSheet(): void;
}

let activeBubble: HTMLElement | null = null;
let teardown: (() => void) | null = null;

function dismissLandmarkBubble(): void {
  teardown?.();
  teardown = null;
  activeBubble?.remove();
  activeBubble = null;
}

export function dismissLandmarkBubbleIfAny(): void {
  dismissLandmarkBubble();
}

export function showLandmarkBubble(anchor: HTMLElement, handlers: LandmarkBubbleHandlers): void {
  dismissLandmarkBubble();

  const el = document.createElement("div");
  el.className = "landmark-bubble popup";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Secret cheat-sheet");
  el.innerHTML = `
    <p class="landmark-bubble-text">Congratulations, you've found the secret cheat-sheet!<br />This will help you understand the course better, and will give you a better idea of how to pronounce everything.</p>
    <button type="button" class="primary landmark-bubble-open" id="landmark-bubble-open">View Cheat-Sheet</button>
    <span class="landmark-bubble-tail" aria-hidden="true"></span>
  `;

  document.body.appendChild(el);
  activeBubble = el;

  const place = () => {
    const r = anchor.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const placement = bubblePlacement(
      { top: r.top, left: r.left, width: r.width, height: r.height },
      window.innerHeight,
      el.offsetHeight || BUBBLE_EST_HEIGHT,
    );
    el.classList.toggle("landmark-bubble-below", placement === "below");
    el.classList.toggle("landmark-bubble-above", placement === "above");

    const maxW = Math.min(300, window.innerWidth - MARGIN * 2);
    el.style.width = `${maxW}px`;
    const w = el.offsetWidth;
    let left = cx - w / 2;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - w - MARGIN));
    el.style.left = `${left}px`;

    const tail = el.querySelector<HTMLElement>(".landmark-bubble-tail");
    if (tail) {
      const tailLeft = Math.max(16, Math.min(cx - left - 8, w - 24));
      tail.style.left = `${tailLeft}px`;
    }

    if (placement === "above") {
      el.style.top = `${Math.max(MARGIN, r.top - el.offsetHeight - GAP)}px`;
    } else {
      el.style.top = `${Math.min(window.innerHeight - el.offsetHeight - MARGIN, r.bottom + GAP)}px`;
    }

    const bubbleRect = el.getBoundingClientRect();
    const bubbleCx = bubbleRect.left + bubbleRect.width / 2;
    const bubbleCy = bubbleRect.top + bubbleRect.height / 2;
    el.style.setProperty("--pop-dx", `${Math.round(cx - bubbleCx)}px`);
    el.style.setProperty("--pop-dy", `${Math.round(r.top + r.height / 2 - bubbleCy)}px`);
  };

  requestAnimationFrame(() => {
    place();
    requestAnimationFrame(() => {
      place();
      el.classList.add("popup-open");
    });
  });

  el.querySelector("#landmark-bubble-open")?.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissLandmarkBubble();
    handlers.onOpenCheatSheet();
  });

  const onDocPointer = (e: Event) => {
    const t = e.target as Node;
    if (el.contains(t) || anchor.contains(t)) return;
    dismissLandmarkBubble();
  };

  const onScroll = () => dismissLandmarkBubble();
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") dismissLandmarkBubble();
  };

  document.addEventListener("pointerdown", onDocPointer, true);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onScroll);
  document.addEventListener("keydown", onKey);

  teardown = () => {
    document.removeEventListener("pointerdown", onDocPointer, true);
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onScroll);
    document.removeEventListener("keydown", onKey);
  };
}
