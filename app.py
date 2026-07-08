"""Streamlit vocabulary quiz: CSV with columns `en` and `lang`."""

from __future__ import annotations

import json
import random
import re
import unicodedata
from pathlib import Path

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

APP_DIR = Path(__file__).resolve().parent
VOCAB_LISTS_DIR = APP_DIR / "vocab_lists"
SPEECH_LEAD_MS = 250  # brief pause before any TTS so UI/chimes can land first
REQUIRED_COLS = ("en", "lang")
STYLE_FROM_EN = "Translate from English"
STYLE_TO_EN = "Translate to English"


def list_csv_files() -> list[Path]:
    VOCAB_LISTS_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(VOCAB_LISTS_DIR.glob("*.csv"), key=lambda p: p.name.lower())
    return [p for p in files if p.is_file()]


def load_vocab(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"CSV must include columns {REQUIRED_COLS}; missing: {missing}")
    df = df[list(REQUIRED_COLS)].copy()
    df["en"] = df["en"].astype(str).str.strip()
    df["lang"] = df["lang"].astype(str).str.strip()
    df = df[(df["en"] != "") & (df["lang"] != "")]
    df = df.reset_index(drop=True)
    if df.empty:
        raise ValueError("No vocabulary rows after cleaning empty cells.")
    return df


def normalize(s: str) -> str:
    """Compare answers without caring about punctuation (. ? ! etc.) or extra spaces."""
    s = (s or "").strip()
    s = "".join(c if unicodedata.category(c)[0] != "P" else " " for c in s)
    s = re.sub(r"\s+", " ", s).strip()
    return s.casefold()


def direction_from_style(style: str) -> str:
    return "lang_to_en" if style == STYLE_TO_EN else "en_to_lang"


def style_from_direction(direction: str) -> str:
    return STYLE_TO_EN if direction == "lang_to_en" else STYLE_FROM_EN


def speak_text(text: str, *, lang: str | None = None, rate: float = 0.92) -> None:
    """Read text aloud using the browser's speech synthesis (no extra packages)."""
    payload = json.dumps({"text": text, "lang": (lang or "").strip(), "rate": float(rate)})
    delay = int(SPEECH_LEAD_MS)
    components.html(
        f"""
        <script>
        const payload = {payload};
        const leadMs = {delay};
        (function () {{
          const wnd = window.parent || window;
          const synth = wnd.speechSynthesis || window.speechSynthesis;
          if (!synth || !payload.text) return;
          if (wnd.__vqSpeakDelayTimer) {{
            clearTimeout(wnd.__vqSpeakDelayTimer);
            wnd.__vqSpeakDelayTimer = null;
          }}
          synth.cancel();
          wnd.__vqSpeakDelayTimer = setTimeout(() => {{
            wnd.__vqSpeakDelayTimer = null;
            const u = new SpeechSynthesisUtterance(payload.text);
            if (payload.lang) u.lang = payload.lang;
            u.rate = payload.rate;
            synth.speak(u);
          }}, leadMs);
        }})();
        </script>
        """,
        height=0,
    )


def speak_question(text: str, bcp47: str | None) -> None:
    speak_text(text, lang=bcp47, rate=0.92)


def speak_wrong_then_question(answer: str, question: str, question_lang: str | None) -> None:
    """Speak correction in en-GB, then the next prompt (so the second line is not cancelled)."""
    payload = json.dumps(
        {
            "answer": str(answer),
            "question": str(question),
            "questionLang": (question_lang or "").strip(),
        }
    )
    delay = int(SPEECH_LEAD_MS)
    components.html(
        f"""
        <script>
        const p = {payload};
        const leadMs = {delay};
        (function () {{
          const wnd = window.parent || window;
          const synth = wnd.speechSynthesis || window.speechSynthesis;
          if (!synth) return;
          if (wnd.__vqSpeakDelayTimer) {{
            clearTimeout(wnd.__vqSpeakDelayTimer);
            wnd.__vqSpeakDelayTimer = null;
          }}
          synth.cancel();
          wnd.__vqSpeakDelayTimer = setTimeout(() => {{
            wnd.__vqSpeakDelayTimer = null;
            const first = "The correct answer was " + p.answer + ".";
            const u1 = new SpeechSynthesisUtterance(first);
            u1.lang = "en-GB";
            u1.rate = 0.88;
            u1.onend = () => {{
              const u2 = new SpeechSynthesisUtterance(p.question);
              if (p.questionLang) u2.lang = p.questionLang;
              u2.rate = 0.92;
              synth.speak(u2);
            }};
            synth.speak(u1);
          }}, leadMs);
        }})();
        </script>
        """,
        height=0,
    )


def play_feedback_chime(kind: str) -> None:
    """Very quiet UI sounds via Web Audio (correct = soft tings, wrong = gentle low blip)."""
    payload = json.dumps({"kind": kind})
    components.html(
        f"""
        <script>
        const payload = {payload};
        (function () {{
          const AC = window.parent.AudioContext || window.parent.webkitAudioContext;
          if (!AC) return;
          const ctx = new AC();
          const master = ctx.createGain();
          master.connect(ctx.destination);
          const t0 = ctx.currentTime;
          if (payload.kind === "correct") {{
            master.gain.value = 0.055;
            const peaks = [1320, 1760];
            peaks.forEach((freq, i) => {{
              const start = t0 + i * 0.045;
              const osc = ctx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, start);
              const g = ctx.createGain();
              g.gain.setValueAtTime(0.0001, start);
              g.gain.exponentialRampToValueAtTime(0.14, start + 0.012);
              g.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
              osc.connect(g);
              g.connect(master);
              osc.start(start);
              osc.stop(start + 0.13);
            }});
          }} else {{
            master.gain.value = 0.04;
            [210, 175].forEach((freq, i) => {{
              const start = t0 + i * 0.08;
              const osc = ctx.createOscillator();
              osc.type = "triangle";
              osc.frequency.setValueAtTime(freq, start);
              const g = ctx.createGain();
              g.gain.setValueAtTime(0.0001, start);
              g.gain.exponentialRampToValueAtTime(0.11, start + 0.018);
              g.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);
              osc.connect(g);
              g.connect(master);
              osc.start(start);
              osc.stop(start + 0.12);
            }});
          }}
          ctx.resume().catch(() => {{}});
          setTimeout(() => ctx.close(), 600);
        }})();
        </script>
        """,
        height=0,
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


def init_session_keys() -> None:
    defaults = {
        "vocab_df": None,
        "queue": [],
        "first_attempt_ok": {},
        "direction": "en_to_lang",
        "question_style": STYLE_FROM_EN,
        "round_active": False,
        "last_feedback": None,
        "selected_csv": None,
        "round_message": None,
        "round_announce": None,
        "round_message_level": "info",
        "feedback_sound_gen": 0,
        "last_chimed_feedback_gen": 0,
        "audio_muted": False,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def start_round(df: pd.DataFrame, direction: str) -> None:
    n = len(df)
    order = list(range(n))
    random.shuffle(order)
    st.session_state.vocab_df = df
    st.session_state.direction = direction
    st.session_state.question_style = style_from_direction(direction)
    st.session_state.queue = order
    st.session_state.first_attempt_ok = {i: None for i in range(n)}
    st.session_state.round_active = True
    st.session_state.last_feedback = None
    st.session_state.feedback_sound_gen = 0
    st.session_state.last_chimed_feedback_gen = 0


def current_row_index() -> int | None:
    q = st.session_state.queue
    return q[0] if q else None


def end_round_stats() -> tuple[int, int, float]:
    """Return (first_time_correct, total_words, percentage)."""
    flags = st.session_state.first_attempt_ok
    total = len(flags)
    correct = sum(1 for v in flags.values() if v is True)
    pct = (100.0 * correct / total) if total else 0.0
    return correct, total, pct


def process_answer(user_text: str) -> None:
    idx = current_row_index()
    if idx is None:
        return
    df = st.session_state.vocab_df
    row = df.iloc[idx]
    if st.session_state.direction == "en_to_lang":
        prompt_side, answer = row["en"], row["lang"]
    else:
        prompt_side, answer = row["lang"], row["en"]

    ok = normalize(user_text) == normalize(str(answer))

    if st.session_state.first_attempt_ok[idx] is None:
        st.session_state.first_attempt_ok[idx] = ok

    q = st.session_state.queue
    if ok:
        q.pop(0)
        st.session_state.last_feedback = ("correct", prompt_side, answer)
    else:
        wrong = q.pop(0)
        q.append(wrong)
        st.session_state.last_feedback = ("wrong", prompt_side, answer)
    st.session_state.feedback_sound_gen = int(st.session_state.get("feedback_sound_gen", 0)) + 1


def main() -> None:
    st.set_page_config(page_title="Vocab quiz", page_icon="📚", layout="centered")
    init_session_keys()

    st.title("Vocabulary quiz")
    st.caption("CSV files in `vocab_lists/` must have columns `en` and `lang`.")

    csv_paths = list_csv_files()
    if not csv_paths:
        st.error(f"No CSV files found in `{VOCAB_LISTS_DIR}`. Add `*.csv` files there.")
        return

    names = [p.name for p in csv_paths]
    # Bind the selectbox to session state (no per-run `index=`) so the widget does not
    # snap back — passing `index` every rerun fights Streamlit's stored value.
    if (
        st.session_state.selected_csv is None
        or st.session_state.selected_csv not in names
    ):
        st.session_state.selected_csv = names[0]

    def _vocab_file_label(filename: str) -> str:
        return Path(filename).stem

    st.selectbox(
        "Choose vocabulary file",
        options=names,
        format_func=_vocab_file_label,
        key="selected_csv",
        disabled=st.session_state.round_active,
    )
    choice = st.session_state.selected_csv
    csv_path = VOCAB_LISTS_DIR / choice

    try:
        vocab_df = load_vocab(csv_path)
    except Exception as e:
        st.error(str(e))
        return

    with st.expander("Show words list", expanded=False):
        st.dataframe(
            vocab_df,
            use_container_width=True,
            height=min(280, 40 + 28 * len(vocab_df)),
        )

    if st.session_state.round_active:
        seg_default = style_from_direction(st.session_state.direction)
    else:
        seg_default = st.session_state.question_style

    # Relative widths (not pixels): first column must be most of the row for the control + label.
    style_col, mute_col = st.columns([6, 1], vertical_alignment="bottom")
    with style_col:
        style = st.segmented_control(
            "Question style",
            options=[STYLE_FROM_EN, STYLE_TO_EN],
            default=seg_default,
            disabled=st.session_state.round_active,
        )
    with mute_col:
        st.checkbox("Mute all audio", key="audio_muted")

    if style is not None and not st.session_state.round_active:
        st.session_state.question_style = style
        st.session_state.direction = direction_from_style(style)

    start_new_round_clicked = False
    col_a, col_b = st.columns(2)
    with col_a:
        if st.session_state.round_active:
            st.button("Start new round", disabled=True, key="start_new_round_disabled")
        else:
            with st.form(
                "restart_round_form",
                clear_on_submit=True,
                border=False,
                width="content",
            ):
                start_new_round_clicked = st.form_submit_button("Start new round")
    with col_b:
        if st.button("Stop round", disabled=not st.session_state.round_active):
            st.session_state.round_active = False
            st.session_state.queue = []
            st.session_state.last_feedback = None
            c, t, pct = end_round_stats()
            st.session_state.round_message = (
                f"Round stopped early. First-try score so far: **{c} / {t}** ({pct:.1f}%)."
            )
            st.session_state.round_announce = (
                f"The round has ended. Your first-time score is {c} out of {t}."
            )
            st.session_state.round_message_level = "info"
            st.rerun()

    if not st.session_state.round_active and start_new_round_clicked:
        if style is not None:
            st.session_state.question_style = style
            st.session_state.direction = direction_from_style(style)
        start_round(vocab_df.copy(), st.session_state.direction)
        st.rerun()

    if not st.session_state.round_active:
        msg = st.session_state.pop("round_message", None)
        announce = st.session_state.pop("round_announce", None)
        level = st.session_state.pop("round_message_level", "info")
        if announce and not st.session_state.audio_muted:
            speak_text(str(announce), lang="en-GB", rate=0.88)
        if msg:
            if level == "success":
                st.success(msg)
            else:
                st.info(msg)
            if level == "success":
                focus_idle_start_submit_button()
        register_enter_to_start_round()
        return

    idx = current_row_index()
    if idx is None:
        st.session_state.round_active = False
        c, t, pct = end_round_stats()
        st.session_state.round_message = (
            f"Round complete. First-try accuracy: **{c} / {t}** ({pct:.1f}%)."
        )
        st.session_state.round_announce = (
            f"The round is complete. You scored {c} out of {t} on first-time accuracy."
        )
        st.session_state.round_message_level = "success"
        fb = st.session_state.last_feedback
        if not st.session_state.audio_muted and fb and fb[0] == "correct":
            play_feedback_chime("correct")
        st.balloons()
        st.session_state.last_feedback = None
        st.rerun()
        return

    df = st.session_state.vocab_df
    row = df.iloc[idx]
    st.subheader(style_from_direction(st.session_state.direction))
    if st.session_state.direction == "en_to_lang":
        prompt = row["en"]
    else:
        prompt = row["lang"]

    tts_lang = "en-GB" if st.session_state.direction == "en_to_lang" else None

    st.markdown(f"### {prompt}")
    remaining = len(st.session_state.queue)
    total = len(df)
    st.caption(f"Cards left in this round’s queue: **{remaining}** (of **{total}** unique words).")

    played_wrong_voice = False
    fb = st.session_state.last_feedback
    if fb:
        kind, shown, ans = fb
        if kind == "wrong":
            st.warning(f"Not quite — you saw **{shown}**. Correct answer: **{ans}**.")
        elif kind == "correct":
            st.success("Correct — nice.")

    with st.form("answer_form", clear_on_submit=True):
        guess = st.text_input("Your answer", key="guess_input")
        submitted = st.form_submit_button("Check")

    # Run audio after the form is in the DOM so focus/TTS do not race (wrong answers were losing focus).
    if fb:
        gen = int(st.session_state.get("feedback_sound_gen", 0))
        if gen != int(st.session_state.get("last_chimed_feedback_gen", 0)):
            if not st.session_state.audio_muted:
                play_feedback_chime(fb[0])
                if fb[0] == "wrong":
                    speak_wrong_then_question(str(fb[2]), str(prompt), tts_lang)
                    played_wrong_voice = True
            st.session_state.last_chimed_feedback_gen = gen

    if not submitted and not st.session_state.audio_muted and not played_wrong_voice:
        speak_question(str(prompt), tts_lang)

    if submitted:
        process_answer(guess)
        st.rerun()

    focus_answer_input()


if __name__ == "__main__":
    main()
