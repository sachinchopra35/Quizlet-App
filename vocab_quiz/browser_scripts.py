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
