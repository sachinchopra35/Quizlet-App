import random

import pandas as pd
import streamlit as st

from vocab_quiz.config import STYLE_FROM_EN, style_from_direction
from vocab_quiz.matching import answers_match
from vocab_quiz.vocab import load_combined_vocab

BEAST_MODE_SIZE = 10


def beast_sample_size(pool_size: int) -> int:
    return min(BEAST_MODE_SIZE, pool_size)


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
        "beast_mode": False,
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
    st.session_state.beast_mode = False
    st.session_state.last_feedback = None
    st.session_state.feedback_sound_gen = 0
    st.session_state.last_chimed_feedback_gen = 0


def start_beast_round(direction: str) -> None:
    df = load_combined_vocab()
    n = beast_sample_size(len(df))
    sample = df.sample(n=n).reset_index(drop=True)
    start_round(sample, direction)
    st.session_state.beast_mode = True


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

    punjabi_answer = st.session_state.direction == "en_to_lang"
    ok = answers_match(user_text, answer, punjabi=punjabi_answer)

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
