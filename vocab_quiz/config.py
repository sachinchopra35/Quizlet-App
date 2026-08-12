from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent
VOCAB_LISTS_DIR = APP_DIR / "vocab_lists_new"
SPEECH_LEAD_MS = 250  # brief pause before any TTS so UI/chimes can land first
REQUIRED_COLS = ("en", "lang")
STYLE_FROM_EN = "Translate from English"
STYLE_TO_EN = "Translate to English"


def direction_from_style(style: str) -> str:
    return "lang_to_en" if style == STYLE_TO_EN else "en_to_lang"


def style_from_direction(direction: str) -> str:
    return STYLE_TO_EN if direction == "lang_to_en" else STYLE_FROM_EN
