from pathlib import Path

import pandas as pd

from vocab_quiz.config import PUNJABI_VOCAB_DIR, REQUIRED_COLS


def clean_lang_text(text: str) -> str:
    """Strip review markers (*) from CSV lang cells; ignored in matching too."""
    return str(text).replace("*", "").strip()


def list_csv_files() -> list[Path]:
    PUNJABI_VOCAB_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(PUNJABI_VOCAB_DIR.glob("*.csv"), key=lambda p: p.name.lower())
    return [p for p in files if p.is_file()]


def load_combined_vocab() -> pd.DataFrame:
    """Concatenate all valid rows from every CSV in punjabi_vocab/."""
    paths = list_csv_files()
    if not paths:
        raise ValueError("No CSV files found in punjabi_vocab/.")
    frames = [load_vocab(path) for path in paths]
    combined = pd.concat(frames, ignore_index=True)
    if combined.empty:
        raise ValueError("No vocabulary rows in any CSV.")
    return combined


def load_vocab(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"CSV must include columns {REQUIRED_COLS}; missing: {missing}")
    df = df[list(REQUIRED_COLS)].copy()
    df["en"] = df["en"].astype(str).str.strip()
    df["lang"] = df["lang"].map(clean_lang_text)
    df = df[(df["en"] != "") & (df["lang"] != "")]
    df = df.reset_index(drop=True)
    if df.empty:
        raise ValueError("No vocabulary rows after cleaning empty cells.")
    return df
