from pathlib import Path

import pandas as pd

from vocab_quiz.config import REQUIRED_COLS, VOCAB_LISTS_DIR


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
