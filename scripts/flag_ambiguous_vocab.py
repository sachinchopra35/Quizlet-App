#!/usr/bin/env python3
"""One-off: fix known translation swaps and append *** to ambiguous vocab rows."""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOCAB = ROOT / "punjabi_vocab"

# English prompt -> optional lang fix (None = keep lang, only flag)
FIXES: dict[str, dict[str, str | None]] = {
    "At Home - Questions.csv": {
        "When are you coming?": "kadon aa rahe ho?",
    },
}

# English prompts to flag with *** (imprecise or easily confusable)
FLAG_EN: dict[str, set[str]] = {
    "At Home - Questions.csv": {
        "Did you eat?",
        "Will you eat?",
        "When are you coming?",
        "When are you coming back?",
        "Are you coming or not?",
        "Did you sleep well?",
    },
    "Checking On People - Mixed.csv": {
        "Has he arrived?",
        "Is she still eating?",
        "Will you be long?",
        "Are they coming?",
    },
    "Completed Actions - Gya.csv": {
        "I fell asleep",
        "I sat down",
        "I got up",
        "I left",
        "I've arrived",
        "I'm back",
    },
    "In My Room - Imperatives.csv": {
        "lie on my bed",
        "sleep in my bed",
        "read a book",
    },
    "In My Living Room - Imperatives.csv": {
        "read a book",
        "sit on the sofa",
    },
    "Location.csv": {
        "where is it?",
    },
    "Door and Errands.csv": {
        "I'll be back soon",
        "I'm going to the shops",
        "I need to pop out",
        "Call me when you arrive",
        "I'm waiting outside",
        "Don't forget",
    },
    "Future - I Will.csv": {
        "I'll come",
        "I'll go",
        "I'll be back soon",
        "I'll do it",
    },
    "Future - Questions.csv": {
        "Will you eat?",
        "What time will you be here?",
    },
    "Giving and Taking.csv": {
        "give him it",
        "take it from him",
        "this guy behind us",
        "the girl in front of us",
        "give me water",
        "take from me",
    },
    "Leaving and Arriving.csv": {
        "I'm leaving",
        "I'm going home",
        "I'm coming back",
        "I'm back",
        "I'm coming",
        "I'm going out",
        "I'm home",
        "I'm at the door",
    },
    "Meals and Table Talk.csv": {
        "What's for food?",
        "I'm full",
    },
    "Out and About - Mixed.csv": {
        "He went to the shops",
        "She came back",
        "He's waiting outside",
    },
    "Past - Questions.csv": {
        "Did you eat?",
        "Did you sleep?",
        "Are you done?",
        "When did you come?",
    },
    "Past - What I Did.csv": {
        "I went out",
        "I came home",
        "I finished",
        "I got ready",
        "I slept",
    },
    "People at Home - Mixed.csv": {
        "He's sleeping",
        "Where is he?",
    },
    "Plans and Next - Mixed 01.csv": {
        "He'll come later",
        "Will you come tonight?",
        "I'm going to sleep",
    },
    "Plans and Next - Mixed 02.csv": {
        "When will they arrive?",
        "He'll go home",
    },
    "Plans and Next - Mixed 03.csv": {
        "When will you be back?",
        "We'll be home soon",
        "She'll come tonight",
    },
    "Questions 01.csv": {
        "Are you hungry?",
        "look at him",
        "look at them",
        "I'm waiting",
        "what are you doing?",
        "where are you going?",
    },
    "Questions 02.csv": {
        "when are you coming?",
    },
    "Quick Replies.csv": {
        "Alright / got it",
        "I understand",
        "That's enough",
        "Never mind / it's fine",
    },
    "States and Feelings.csv": {
        "Are you okay?",
        "I feel fine",
        "I'm tired",
    },
    "Uses of Ho Gya.csv": {
        "It's done",
        "Are you done?",
        "That's enough",
        "Did something happen?",
        "We're late",
    },
    "Wants and Needs.csv": {
        "I want to sleep",
        "I want more",
    },
    "With and To.csv": {
        "give it to him",
        "give it to her",
        "wait for me",
        "come with me",
        "go with me",
    },
    "In My Room - Present.csv": {
        "I'm lying on my bed",
        "I'm sleeping in my bed",
    },
    "In My Living Room - Present.csv": {
        "I'm sitting on the sofa",
    },
    "Ke - And Then.csv": {
        "Finish and come",
        "Come and sit down",
    },
    "Negatives - Imperatives.csv": {
        "don't wait",
        "don't look at him",
    },
}


def strip_markers(lang: str) -> str:
    return lang.replace("*", "").strip()


def ensure_flagged(lang: str) -> str:
    base = strip_markers(lang)
    return f"{base}***"


def process_file(path: Path) -> int:
    name = path.name
    fixes = FIXES.get(name, {})
    flags = FLAG_EN.get(name, set())
    if not fixes and not flags:
        return 0

    rows: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if fieldnames is None:
            return 0
        for row in reader:
            en = row["en"].strip()
            lang = strip_markers(row["lang"].strip())
            if en in fixes and fixes[en] is not None:
                lang = fixes[en]
            if en in flags:
                lang = ensure_flagged(lang)
            row["lang"] = lang
            rows.append(row)

    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    return len(flags)


def main() -> None:
    total = 0
    for path in sorted(VOCAB.glob("*.csv")):
        n = process_file(path)
        if n:
            print(f"{path.name}: flagged {n} rows")
            total += n
    print(f"Done. {total} rows flagged across CSVs.")


if __name__ == "__main__":
    main()
