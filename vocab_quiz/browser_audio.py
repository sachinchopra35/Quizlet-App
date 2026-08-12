import json

import streamlit.components.v1 as components

from vocab_quiz.config import SPEECH_LEAD_MS


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
