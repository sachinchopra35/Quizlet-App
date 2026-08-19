import json

import streamlit.components.v1 as components

from vocab_quiz.browser_scripts import play_chime_via_hub
from vocab_quiz.config import SPEECH_LEAD_MS


def speak_text(
    text: str,
    *,
    lang: str | None = None,
    rate: float = 0.92,
    delay_ms: int | None = None,
) -> None:
    """Read text aloud using the browser's speech synthesis (no extra packages)."""
    payload = json.dumps({"text": text, "lang": (lang or "").strip(), "rate": float(rate)})
    delay = int(delay_ms if delay_ms is not None else SPEECH_LEAD_MS)
    components.html(
        f"""
        <script>
        const payload = {payload};
        const leadMs = {delay};
        (function () {{
          const wnd = window.top || window.parent || window;
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
          const wnd = window.top || window.parent || window;
          const synth = wnd.speechSynthesis || window.speechSynthesis;
          if (!synth) return;
          if (wnd.__vqSpeakDelayTimer) {{
            clearTimeout(wnd.__vqSpeakDelayTimer);
            wnd.__vqSpeakDelayTimer = null;
          }}
          synth.cancel();
          wnd.__vqSpeakDelayTimer = setTimeout(() => {{
            wnd.__vqSpeakDelayTimer = null;
            const first = "Incorrect.";
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
    """UI sounds via shared top-window Web Audio hub."""
    play_chime_via_hub(kind)
