import streamlit.components.v1 as components


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


def play_confetti() -> None:
    """Lightweight canvas confetti burst when a round completes."""
    components.html(
        """
        <script>
        (function () {
          const doc = window.top && window.top.document ? window.top.document : window.parent.document;
          const body = doc.body;
          if (!body) return;
          const old = doc.getElementById("vq-confetti-canvas");
          if (old) old.remove();
          const canvas = doc.createElement("canvas");
          canvas.id = "vq-confetti-canvas";
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          canvas.style.cssText =
            "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;";
          body.appendChild(canvas);
          const ctx = canvas.getContext("2d");
          const colors = ["#ff6b9d", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ffe66d"];
          const particles = [];
          const n = 72;
          const cx = canvas.width * 0.5;
          const cy = canvas.height * 0.35;
          for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            particles.push({
              x: cx,
              y: cy,
              w: 4 + Math.random() * 6,
              h: 6 + Math.random() * 10,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2,
              rot: Math.random() * Math.PI,
              vr: (Math.random() - 0.5) * 0.2,
              color: colors[(Math.random() * colors) | 0],
              life: 1,
            });
          }
          let frame = 0;
          const maxFrames = 110;
          function tick() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            for (const p of particles) {
              if (p.life <= 0) continue;
              alive = true;
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.12;
              p.vx *= 0.99;
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
              canvas.remove();
            }
          }
          tick();
        })();
        </script>
        """,
        height=0,
    )
