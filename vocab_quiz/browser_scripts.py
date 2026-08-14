import json

import streamlit.components.v1 as components

# Injected into top window once; embedded in every chime/confetti call so hub exists before use.
_HUB_INIT_JS = """
if (!win.__vqHub) {
  function unlockAudio() {
    const hub = win.__vqHub;
    if (!hub) return;
    const ctx = hub.getAudioCtx();
    if (!ctx) return;
    try {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) {}
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
  }
  win.__vqHub = {
    audioCtx: null,
    getAudioCtx: function () {
      const AC = win.AudioContext || win.webkitAudioContext;
      if (!AC) return null;
      if (!this.audioCtx) this.audioCtx = new AC();
      return this.audioCtx;
    },
    playChime: function (kind) {
      const ctx = this.getAudioCtx();
      if (!ctx) return;
      const play = function () {
        const master = ctx.createGain();
        master.connect(ctx.destination);
        const t0 = ctx.currentTime;
        if (kind === "correct") {
          master.gain.value = 0.21;
          [1320, 1760, 2090].forEach(function (freq, i) {
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
          [210, 175].forEach(function (freq, i) {
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
        ctx.resume().then(play).catch(function () {});
      } else {
        play();
      }
    },
    playConfetti: function () {
      const body = doc.body;
      if (!body) return;
      const old = doc.getElementById("vq-confetti-canvas");
      if (old) old.remove();
      const canvas = doc.createElement("canvas");
      canvas.id = "vq-confetti-canvas";
      function sizeCanvas() {
        canvas.width = win.innerWidth;
        canvas.height = win.innerHeight;
      }
      sizeCanvas();
      canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;";
      body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const colors = ["#ff6b9d", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ffe66d"];
      const particles = [];
      const n = 96;
      let cx = canvas.width * 0.5;
      let cy = canvas.height * 0.35;
      for (let i = 0; i < n; i++) {
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
          color: colors[(Math.random() * colors.length) | 0],
          life: 1,
        });
      }
      let frame = 0;
      const maxFrames = 260;
      function onResize() {
        const ox = cx / Math.max(canvas.width, 1);
        const oy = cy / Math.max(canvas.height, 1);
        sizeCanvas();
        cx = canvas.width * ox;
        cy = canvas.height * oy;
      }
      win.addEventListener("resize", onResize);
      function tick() {
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
          win.removeEventListener("resize", onResize);
          canvas.remove();
        }
      }
      tick();
    },
  };
  if (!win.__vqAudioUnlock) {
    win.__vqAudioUnlock = function () { unlockAudio(); };
    doc.addEventListener("click", win.__vqAudioUnlock, true);
    doc.addEventListener("keydown", win.__vqAudioUnlock, true);
  }
}
"""


def _top_doc_script(inner_js: str) -> None:
    """Run a short script with window.top document and view."""
    components.html(
        f"""
        <script>
        (function () {{
          const doc = window.top && window.top.document ? window.top.document : window.parent.document;
          const win = doc.defaultView || window.top || window;
          {inner_js}
        }})();
        </script>
        """,
        height=0,
    )


def ensure_browser_hub() -> None:
    """Inject persistent top-window hub for chimes and confetti (survives Streamlit reruns)."""
    _top_doc_script(_HUB_INIT_JS)


def play_chime_via_hub(kind: str) -> None:
    """Bootstrap hub and play chime in one iframe (avoids init/play race)."""
    payload = json.dumps({"kind": kind})
    _top_doc_script(
        f"""
          {_HUB_INIT_JS}
          const hub = win.__vqHub;
          if (hub) hub.playChime({payload}.kind);
        """
    )


def play_confetti() -> None:
    """Lightweight canvas confetti burst when a round completes."""
    _top_doc_script(
        f"""
          {_HUB_INIT_JS}
          const hub = win.__vqHub;
          if (hub) hub.playConfetti();
        """
    )


def render_medal_shelf(medals: list[dict]) -> None:
    """Horizontal scrolling medal row below the quiz; stays in the centered column."""
    if not medals:
        return
    # Remove legacy shelf injected into section.main (broke centered layout).
    _top_doc_script(
        """
          const legacy = doc.getElementById("vq-medal-shelf-host");
          if (legacy) legacy.remove();
          const legacyStyle = doc.getElementById("vq-medal-shelf-styles");
          if (legacyStyle) legacyStyle.remove();
        """
    )
    items: list[str] = []
    for i, m in enumerate(medals):
        new_cls = " vq-medal-new" if i == len(medals) - 1 else ""
        emoji = m.get("emoji", "")
        label = m.get("label", "")
        items.append(
            f'<div class="vq-medal-item{new_cls}">'
            f'<div class="vq-medal-emoji">{emoji}</div>'
            f'<div class="vq-medal-score">{label}</div>'
            f"</div>"
        )
    row_html = "".join(items)
    components.html(
        f"""
        <style>
        html, body {{
          margin: 0;
          padding: 0;
          background: transparent;
          overflow: hidden;
          color: #fafafa;
          font-family: "Source Sans Pro", sans-serif;
        }}
        #vq-medal-shelf {{
          display: flex;
          flex-direction: row;
          gap: 1.25rem;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.35rem 0.25rem 0.5rem;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          justify-content: flex-start;
        }}
        .vq-medal-item {{
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 3.5rem;
        }}
        .vq-medal-emoji {{
          font-size: 2rem;
          line-height: 1.1;
        }}
        .vq-medal-score {{
          font-size: 0.8rem;
          color: rgba(250, 250, 250, 0.85);
          margin-top: 0.15rem;
          font-variant-numeric: tabular-nums;
          font-weight: 400;
          line-height: 1.4;
        }}
        .vq-medal-item.vq-medal-new .vq-medal-emoji {{
          animation: vq-medal-pop 0.55s ease-out;
        }}
        @keyframes vq-medal-pop {{
          0% {{ transform: scale(0.2); opacity: 0; }}
          70% {{ transform: scale(1.15); opacity: 1; }}
          100% {{ transform: scale(1); opacity: 1; }}
        }}
        </style>
        <div id="vq-medal-shelf">{row_html}</div>
        <script>
        (function () {{
          const row = document.getElementById("vq-medal-shelf");
          if (!row) return;
          row.scrollLeft = row.scrollWidth;
          try {{
            const parentDoc = window.parent && window.parent.document;
            const appText =
              parentDoc &&
              parentDoc.querySelector('[data-testid="stAppViewContainer"]');
            const color = appText
              ? window.parent.getComputedStyle(appText).color
              : (parentDoc && parentDoc.body
                  ? window.parent.getComputedStyle(parentDoc.body).color
                  : "");
            if (color) {{
              document.body.style.color = color;
              row.querySelectorAll(".vq-medal-score").forEach(function (el) {{
                el.style.color = color;
              }});
            }}
          }} catch (e) {{}}
        }})();
        </script>
        """,
        height=84,
    )


def register_enter_to_start_round() -> None:
    """On idle screens, Enter triggers the Start new round form submit (Streamlit uses type=submit)."""
    components.html(
        """
        <script>
        (function () {
          const doc = window.top && window.top.document ? window.top.document : window.parent.document;
          const win = doc.defaultView || window;
          const prev = win.__vqEnterRestart;
          if (prev) doc.removeEventListener("keydown", prev, true);
          function findStartSubmit(root) {
            if (!root) return null;
            // Streamlit form submit uses stFormSubmitButton + onClick (often NOT type="submit").
            const wraps = root.querySelectorAll('[data-testid="stFormSubmitButton"]');
            for (const wrap of wraps) {
              const txt = (wrap.textContent || "")
                .replace(/\\s+/g, " ")
                .trim();
              if (!txt.includes("Start new round")) continue;
              const b = wrap.querySelector("button:not([disabled])");
              if (b && !b.disabled) return b;
            }
            const forms = root.querySelectorAll('[data-testid="stForm"]');
            for (const form of forms) {
              const subs = form.querySelectorAll('button[type="submit"]');
              for (const s of subs) {
                const label = (s.innerText || s.textContent || "")
                  .replace(/\\s+/g, " ")
                  .trim();
                if (label.includes("Start new round") && !s.disabled) return s;
              }
            }
            for (const wrap of root.querySelectorAll('[data-testid="stButton"]')) {
              const txt = (wrap.textContent || "").replace(/\\s+/g, " ").trim();
              if (!txt.includes("Start new round")) continue;
              const b = wrap.querySelector("button:not([disabled])");
              if (b && !b.disabled) return b;
            }
            return null;
          }
          const h = function (ev) {
            if ((ev.key !== "Enter" && ev.key !== "NumpadEnter") || ev.defaultPrevented)
              return;
            const t = ev.target;
            if (
              t &&
              (t.tagName === "INPUT" ||
                t.tagName === "TEXTAREA" ||
                t.tagName === "SELECT")
            )
              return;
            if (t && t.tagName === "BUTTON") {
              const btxt = (t.innerText || "").replace(/\\s+/g, " ").trim();
              if (btxt.includes("Start new round")) return;
            }
            const main =
              doc.querySelector("section.main") ||
              doc.querySelector('[data-testid="stAppViewContainer"]') ||
              doc.body;
            const go = () => {
              let btn = findStartSubmit(main);
              if (!btn) btn = findStartSubmit(doc.body);
              if (btn) {
                ev.preventDefault();
                btn.click();
              }
            };
            go();
            setTimeout(go, 0);
            setTimeout(go, 80);
            setTimeout(go, 200);
          };
          win.__vqEnterRestart = h;
          doc.addEventListener("keydown", h, true);
        })();
        </script>
        """,
        height=0,
    )


def focus_idle_start_submit_button() -> None:
    """Focus the Start new round submit control so Enter activates it like a normal button."""
    components.html(
        """
        <script>
        (function () {
          const doc = window.top && window.top.document ? window.top.document : window.parent.document;
          const main =
            doc.querySelector("section.main") ||
            doc.querySelector('[data-testid="stAppViewContainer"]') ||
            doc.body;
          const wrap = main.querySelector('[data-testid="stFormSubmitButton"]');
          const btn =
            wrap &&
            wrap.querySelector("button:not([disabled])");
          function run() {
            if (btn) btn.focus({ preventScroll: true });
          }
          run();
          requestAnimationFrame(run);
          [50, 150, 400].forEach((ms) => setTimeout(run, ms));
        })();
        </script>
        """,
        height=0,
    )


def focus_answer_input() -> None:
    """Return keyboard focus to the main quiz text field after a rerun (e.g. Enter submit)."""
    components.html(
        """
        <script>
        (function () {
          const doc =
            (window.top && window.top.document) || window.parent.document;
          const main =
            doc.querySelector("section.main") ||
            doc.querySelector('[data-testid="stAppViewContainer"]') ||
            doc.body;
          function pick() {
            const formBox = main.querySelector('[data-testid="stForm"]');
            if (!formBox) return null;
            const block = formBox.querySelector('[data-testid="stTextInput"]');
            if (block) {
              const inp = block.querySelector("input");
              if (inp && !inp.disabled) return inp;
            }
            const nodes = formBox.querySelectorAll(
              'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'
            );
            for (let i = 0; i < nodes.length; i++) {
              const n = nodes[i];
              if (n && !n.disabled) return n;
            }
            return nodes.length ? nodes[0] : null;
          }
          function run() {
            const el = pick();
            if (el) el.focus({ preventScroll: true });
          }
          run();
          requestAnimationFrame(run);
          [50, 120, 280, 400, 600, 900, 1200].forEach((ms) => setTimeout(run, ms));
        })();
        </script>
        """,
        height=0,
    )


def inject_nav_button_styles() -> None:
    """Inject CSS for vocab list nav buttons (st.markdown no longer applies <style> reliably)."""
    components.html(
        """
        <script>
        (function () {
          const doc = window.top && window.top.document ? window.top.document : window.parent.document;
          if (doc.getElementById("vq-nav-btn-styles")) return;
          const style = doc.createElement("style");
          style.id = "vq-nav-btn-styles";
          style.textContent = [
            'button[title="Previous Vocab List"],',
            'button[title="Next Vocab List"],',
            'button[title="Pick Random Vocab List"],',
            'button[title="Beast Mode - 10 Random Questions"] {',
            "  display: inline-flex !important;",
            "  align-items: center !important;",
            "  justify-content: center !important;",
            "  min-height: 2.5rem;",
            "  padding: 0.35rem 0.5rem !important;",
            "}",
            'button[title="Previous Vocab List"] p,',
            'button[title="Next Vocab List"] p,',
            'button[title="Pick Random Vocab List"] p,',
            'button[title="Beast Mode - 10 Random Questions"] p {',
            "  margin: 0 !important;",
            "  line-height: 1 !important;",
            "  text-align: center !important;",
            "  width: 100%;",
            "}",
            'button[title="Pick Random Vocab List"] p {',
            "  font-size: 1.05rem;",
            "}",
            'button[title="Beast Mode - 10 Random Questions"] p {',
            "  font-size: 1.05rem;",
            "}",
          ].join("\\n");
          doc.head.appendChild(style);
        })();
        </script>
        """,
        height=0,
    )