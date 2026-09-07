const LANDMARK_COLORS = ["#5b9fd4", "#6eb0e0", "#ffd166", "#4a9e38", "#ff6b6b", "#c084fc", "#f472b6"];
export const PEACOCK_BURST_COLORS = ["#0ea5e9", "#22c55e", "#eab308", "#14b8a6", "#a855f7", "#38bdf8"];

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Small confetti burst at viewport coordinates — for decorative map taps. */
export function burstSparkles(x: number, y: number, colors: readonly string[] = LANDMARK_COLORS): void {
  if (prefersReducedMotion()) return;

  const container = document.createElement("div");
  container.className = "sparkle-burst";
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  document.body.appendChild(container);

  const count = 26;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = "sparkle-particle";
    if (Math.random() > 0.45) particle.classList.add("sparkle-particle-round");

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const distance = 36 + Math.random() * 72;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 24;
    particle.style.setProperty("--sx", `${dx}px`);
    particle.style.setProperty("--sy", `${dy}px`);
    particle.style.setProperty("--rot", `${Math.random() * 540 - 270}deg`);
    particle.style.background = colors[i % colors.length] ?? colors[0]!;
    particle.style.animationDelay = `${Math.random() * 0.08}s`;
    container.appendChild(particle);
  }

  window.setTimeout(() => container.remove(), 950);
}
