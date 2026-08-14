import random
from pathlib import Path

import streamlit as st

from vocab_quiz.browser_audio import (
    play_feedback_chime,
    speak_question,
    speak_text,
    speak_wrong_then_question,
)
from vocab_quiz.browser_scripts import (
    ensure_browser_hub,
    focus_answer_input,
    focus_idle_start_submit_button,
    inject_nav_button_styles,
    play_confetti,
    register_enter_to_start_round,
    render_medal_shelf,
)
from vocab_quiz.config import (
    BEAST_MODE_SELECTION,
    STYLE_FROM_EN,
    STYLE_TO_EN,
    PUNJABI_VOCAB_DIR,
    direction_from_style,
    style_from_direction,
)
from vocab_quiz.rounds import (
    current_row_index,
    end_round_stats,
    init_session_keys,
    process_answer,
    record_round_medal,
    start_beast_round,
    start_round,
)
from vocab_quiz.vocab import list_csv_files, load_vocab


def _adjacent_csv(names: list[str], current: str, delta: int) -> str:
    idx = names.index(current)
    return names[(idx + delta) % len(names)]


def _random_csv(names: list[str], current: str) -> str:
    if len(names) <= 1:
        return current
    others = [n for n in names if n != current]
    return random.choice(others)


def _vocab_file_label(filename: str) -> str:
    if filename == BEAST_MODE_SELECTION:
        return "🔥 Beast Mode - 10 Random Questions"
    return Path(filename).stem


def _is_beast_mode_selected() -> bool:
    return st.session_state.selected_csv == BEAST_MODE_SELECTION


def _nav_prev_csv() -> None:
    names = st.session_state.csv_names
    current = st.session_state.selected_csv
    if current not in names:
        current = names[0]
    st.session_state.selected_csv = _adjacent_csv(names, current, -1)


def _nav_next_csv() -> None:
    names = st.session_state.csv_names
    current = st.session_state.selected_csv
    if current not in names:
        current = names[0]
    st.session_state.selected_csv = _adjacent_csv(names, current, 1)


def _nav_shuffle_csv() -> None:
    names = st.session_state.csv_names
    current = st.session_state.selected_csv
    if current not in names:
        current = names[0]
    st.session_state.selected_csv = _random_csv(names, current)


def _start_beast_mode() -> None:
    st.session_state.selected_csv = BEAST_MODE_SELECTION
    direction = direction_from_style(st.session_state.question_style)
    start_beast_round(direction)


def _render_idle_panel() -> None:
    msg = st.session_state.pop("round_message", None)
    announce = st.session_state.pop("round_announce", None)
    level = st.session_state.pop("round_message_level", "info")
    if msg:
        if level == "success":
            st.success(msg)
            if not st.session_state.audio_muted:
                play_confetti()
                play_feedback_chime("correct")
            focus_idle_start_submit_button()
        else:
            st.info(msg)
    else:
        st.caption("Start a round to begin.")
    if announce and not st.session_state.audio_muted:
        announce_delay = 450 if level == "success" else None
        speak_text(str(announce), lang="en-GB", rate=0.88, delay_ms=announce_delay)
    register_enter_to_start_round()


def _render_active_quiz() -> None:
    idx = current_row_index()
    if idx is None:
        st.session_state.round_active = False
        st.session_state.beast_mode = False
        c, t, pct = end_round_stats()
        st.session_state.round_message = (
            f"Round complete. First-try accuracy: **{c} / {t}** ({pct:.1f}%)."
        )
        st.session_state.round_announce = f"Quiz complete. You scored {c} out of {t}."
        st.session_state.round_message_level = "success"
        record_round_medal(c, t)
        st.session_state.last_feedback = None
        st.rerun()
        return

    df = st.session_state.vocab_df
    row = df.iloc[idx]
    if st.session_state.beast_mode:
        st.subheader("Beast Mode")
        st.caption(
            f"**{len(df)}** random cards from all lists · "
            f"{style_from_direction(st.session_state.direction)}"
        )
    else:
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
            st.warning(f"Not quite — you wrote **{shown}**. Correct answer: **{ans}**.")
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
        if fb and fb[0] == "correct":
            # Queue already advanced; speak the new prompt after the chime lands.
            speak_text(str(prompt), lang=tts_lang, rate=0.92, delay_ms=550)
        else:
            speak_question(str(prompt), tts_lang)

    if submitted:
        process_answer(guess)
        st.rerun()

    focus_answer_input()


def main() -> None:
    st.set_page_config(page_title="Vocab quiz", page_icon="📚", layout="centered")
    init_session_keys()

    st.title("Vocabulary quiz")
    # st.caption("CSV files in `punjabi_vocab/` must have columns `en` and `lang`.")

    csv_paths = list_csv_files()
    if not csv_paths:
        st.error(f"No CSV files found in `{PUNJABI_VOCAB_DIR}`. Add `*.csv` files there.")
        return

    names = [p.name for p in csv_paths]
    dropdown_options = names + [BEAST_MODE_SELECTION]
    # Bind the selectbox to session state (no per-run `index=`) so the widget does not
    # snap back — passing `index` every rerun fights Streamlit's stored value.
    if (
        st.session_state.selected_csv is None
        or st.session_state.selected_csv not in dropdown_options
    ):
        st.session_state.selected_csv = names[0]

    st.session_state.csv_names = names
    ensure_browser_hub()
    inject_nav_button_styles()

    nav_disabled = st.session_state.round_active
    file_col, prev_col, next_col, shuffle_col, beast_col = st.columns(
        [6.0, 0.8, 0.8, 0.8, 0.8],
        vertical_alignment="bottom",
    )
    with file_col:
        st.selectbox(
            "Choose vocabulary file",
            options=dropdown_options,
            format_func=_vocab_file_label,
            key="selected_csv",
            disabled=nav_disabled,
        )
    with prev_col:
        st.button(
            "←",
            help="Previous Vocab List",
            disabled=nav_disabled,
            on_click=_nav_prev_csv,
            use_container_width=True,
            key="nav_prev_csv",
        )
    with next_col:
        st.button(
            "→",
            help="Next Vocab List",
            disabled=nav_disabled,
            on_click=_nav_next_csv,
            use_container_width=True,
            key="nav_next_csv",
        )
    with shuffle_col:
        st.button(
            "🔀",
            help="Pick Random Vocab List",
            disabled=nav_disabled,
            on_click=_nav_shuffle_csv,
            use_container_width=True,
            key="nav_shuffle_csv",
        )
    with beast_col:
        st.button(
            "🔥",
            help="Beast Mode - 10 Random Questions",
            disabled=nav_disabled,
            on_click=_start_beast_mode,
            use_container_width=True,
            key="nav_beast_mode",
        )

    choice = st.session_state.selected_csv

    if _is_beast_mode_selected():
        with st.expander("Show words list", expanded=False):
            st.caption("Beast Mode draws 10 random cards from all lists — no fixed word list.")
    else:
        csv_path = PUNJABI_VOCAB_DIR / choice
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
            st.session_state.beast_mode = False
            st.session_state.queue = []
            st.session_state.last_feedback = None
            c, t, pct = end_round_stats()
            st.session_state.round_message = (
                f"Round stopped early. First-try score so far: **{c} / {t}** ({pct:.1f}%)."
            )
            st.session_state.round_announce = f"Quiz ended. You scored {c} out of {t}."
            st.session_state.round_message_level = "info"
            st.rerun()

    if not st.session_state.round_active and start_new_round_clicked:
        if style is not None:
            st.session_state.question_style = style
            st.session_state.direction = direction_from_style(style)
        if _is_beast_mode_selected():
            start_beast_round(st.session_state.direction)
        else:
            start_round(vocab_df.copy(), st.session_state.direction)
        st.rerun()

    with st.container(border=True):
        if not st.session_state.round_active:
            _render_idle_panel()
        else:
            _render_active_quiz()

    render_medal_shelf(st.session_state.round_medals)

