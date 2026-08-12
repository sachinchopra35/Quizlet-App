from pathlib import Path

import streamlit as st

from vocab_quiz.browser_audio import (
    play_feedback_chime,
    speak_question,
    speak_text,
    speak_wrong_then_question,
)
from vocab_quiz.browser_scripts import (
    focus_answer_input,
    focus_idle_start_submit_button,
    register_enter_to_start_round,
)
from vocab_quiz.config import (
    STYLE_FROM_EN,
    STYLE_TO_EN,
    VOCAB_LISTS_DIR,
    direction_from_style,
    style_from_direction,
)
from vocab_quiz.rounds import (
    current_row_index,
    end_round_stats,
    init_session_keys,
    process_answer,
    start_round,
)
from vocab_quiz.vocab import list_csv_files, load_vocab


def main() -> None:
    st.set_page_config(page_title="Vocab quiz", page_icon="📚", layout="centered")
    init_session_keys()

    st.title("Vocabulary quiz")
    st.caption("CSV files in `vocab_lists_new/` must have columns `en` and `lang`.")

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
