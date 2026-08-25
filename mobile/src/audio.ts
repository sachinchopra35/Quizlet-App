import { SPEECH_LEAD_MS } from "./config";

let speakDelayTimer: ReturnType<typeof setTimeout> | null = null;
let audioCtx: AudioContext | null = null;

function unlockAudio(): void {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  try {
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
  } catch {
    /* ignore */
  }
}

export function ensureAudioUnlock(): void {
  document.addEventListener("click", unlockAudio, { capture: true, once: false });
  document.addEventListener("keydown", unlockAudio, { capture: true, once: false });
}

/** Short mechanical pop for map level buttons. */
export function playButtonClick(): void {
  unlockAudio();
  const ctx = audioCtx;
  if (!ctx) return;
  const play = () => {
    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);

    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(540, t0);
    body.frequency.exponentialRampToValueAtTime(300, t0 + 0.045);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, t0);
    bodyGain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.065);
    body.connect(bodyGain);
    bodyGain.connect(master);
    body.start(t0);
    body.stop(t0 + 0.07);

    const click = ctx.createOscillator();
    click.type = "triangle";
    click.frequency.setValueAtTime(1150, t0);
    click.frequency.exponentialRampToValueAtTime(780, t0 + 0.025);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, t0);
    clickGain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.035);
    click.connect(clickGain);
    clickGain.connect(master);
    click.start(t0);
    click.stop(t0 + 0.04);
  };
  if (ctx.state === "suspended") {
    void ctx.resume().then(play);
  } else {
    play();
  }
}

export function playChime(kind: "correct" | "wrong"): void {
  unlockAudio();
  const ctx = audioCtx;
  if (!ctx) return;
  const play = () => {
    const master = ctx.createGain();
    master.connect(ctx.destination);
    const t0 = ctx.currentTime;
    if (kind === "correct") {
      master.gain.value = 0.21;
      [1320, 1760, 2090].forEach((freq, i) => {
        const start = t0 + i * 0.06;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.42, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
        osc.connect(g);
        g.connect(master);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } else {
      master.gain.value = 0.12;
      [210, 175].forEach((freq, i) => {
        const start = t0 + i * 0.09;
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.24, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
        osc.connect(g);
        g.connect(master);
        osc.start(start);
        osc.stop(start + 0.14);
      });
    }
  };
  if (ctx.state === "suspended") {
    void ctx.resume().then(play);
  } else {
    play();
  }
}

export function stopSpeech(): void {
  const synth = window.speechSynthesis;
  if (speakDelayTimer) {
    clearTimeout(speakDelayTimer);
    speakDelayTimer = null;
  }
  synth?.cancel();
}

export function speakText(
  text: string,
  opts?: { lang?: string; rate?: number; delayMs?: number },
): void {
  const synth = window.speechSynthesis;
  if (!synth || !text) return;
  if (speakDelayTimer) {
    clearTimeout(speakDelayTimer);
    speakDelayTimer = null;
  }
  synth.cancel();
  const delay = opts?.delayMs ?? SPEECH_LEAD_MS;
  speakDelayTimer = setTimeout(() => {
    speakDelayTimer = null;
    const u = new SpeechSynthesisUtterance(text);
    if (opts?.lang) u.lang = opts.lang;
    u.rate = opts?.rate ?? 0.92;
    synth.speak(u);
  }, delay);
}

export function speakWrongThenQuestion(
  answer: string,
  question: string,
  questionLang?: string,
): void {
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (speakDelayTimer) {
    clearTimeout(speakDelayTimer);
    speakDelayTimer = null;
  }
  synth.cancel();
  speakDelayTimer = setTimeout(() => {
    speakDelayTimer = null;
    const u1 = new SpeechSynthesisUtterance("Incorrect.");
    u1.lang = "en-GB";
    u1.rate = 0.88;
    u1.onend = () => {
      const u2 = new SpeechSynthesisUtterance(question);
      if (questionLang) u2.lang = questionLang;
      u2.rate = 0.92;
      synth.speak(u2);
    };
    synth.speak(u1);
  }, SPEECH_LEAD_MS);
}

export function playConfetti(): void {
  const body = document.body;
  const old = document.getElementById("vq-confetti-canvas");
  old?.remove();
  const canvas = document.createElement("canvas");
  canvas.id = "vq-confetti-canvas";
  const sizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  sizeCanvas();
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;";
  body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const colors = ["#ff6b9d", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ffe66d"];
  const particles: {
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    color: string;
    life: number;
  }[] = [];
  let cx = canvas.width * 0.5;
  let cy = canvas.height * 0.35;
  for (let i = 0; i < 96; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.8;
    particles.push({
      x: cx,
      y: cy,
      w: 4 + Math.random() * 6,
      h: 6 + Math.random() * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.08,
      color: colors[(Math.random() * colors.length) | 0]!,
      life: 1,
    });
  }
  let frame = 0;
  const maxFrames = 260;
  const onResize = () => {
    const ox = cx / Math.max(canvas.width, 1);
    const oy = cy / Math.max(canvas.height, 1);
    sizeCanvas();
    cx = canvas.width * ox;
    cy = canvas.height * oy;
  };
  window.addEventListener("resize", onResize);
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx *= 0.996;
      p.rot += p.vr;
      p.life = 1 - frame / maxFrames;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive && frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener("resize", onResize);
      canvas.remove();
    }
  };
  tick();
}

export interface Medal {
  emoji: string;
  label: string;
}

export function renderMedalShelf(medals: Medal[]): void {
  const host = document.getElementById("medal-shelf");
  if (!host) return;
  if (!medals.length) {
    host.innerHTML = "";
    host.hidden = true;
    return;
  }
  host.hidden = false;
  host.innerHTML = medals
    .map(
      (m, i) =>
        `<div class="medal-item${i === medals.length - 1 ? " medal-new" : ""}">` +
        `<span class="medal-emoji">${m.emoji}</span>` +
        `<span class="medal-score">${m.label}</span></div>`,
    )
    .join("");
  host.scrollLeft = host.scrollWidth;
}
