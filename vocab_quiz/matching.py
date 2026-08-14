import re
import unicodedata

# Punjabi spelling equivalences — extend these tuples/patterns to accept more variants.
PUNJABI_SUBSTRING_CANONICALS = (
    ("menu", "mainu"),
    ("vich", "ch"),
    ("usnu", "ohnu"),
    ("mez", "table"),
    ("nakaro", "nakar"),
    ("eh", "oh"),
)
PUNJABI_CHAR_CANONICAL = str.maketrans("rR", "dd")
I_AM_SUFFIX_RAW_RE = re.compile(r"(hoon|hoo|hun)\s*$", re.IGNORECASE)
# 3rd-person copula hai — normalize on raw text before doubled-letter collapse eats haan.
COPULA_STEM_HAI_RAW_RE = re.compile(
    r"(lag rahi|lag raha|chaidi|chaida|theek)\s+(?:haan|aa|hai)\s*$",
    re.IGNORECASE,
)
# Formal "your" (tuhada / tuada / tusada …) — masc ends in a, fem ends in i.
TUADA_MASC_RE = re.compile(r"t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?a")
TUADA_FEM_RE = re.compile(r"t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?i")
# intezaar / intezar → udeek before doubled-letter collapse (aa in intezaar).
WAIT_WORD_RE = re.compile(r"intezaa?r")


def _strip_for_compare(s: str) -> str:
    s = (s or "").strip()
    s = "".join(c if unicodedata.category(c)[0] != "P" else " " for c in s)
    s = re.sub(r"\s+", "", s)
    return s.casefold()


def _collapse_doubled_letters(s: str) -> str:
    return re.sub(r"(.)\1+", r"\1", s)


def normalize(s: str) -> str:
    """Loose compare: ignore punctuation and spacing (used for English answers)."""
    return _strip_for_compare(s)


def _normalize_copula_raw(s: str) -> str:
    s = re.sub(r"\bhaan\s*$", "hai", s, flags=re.IGNORECASE)
    return COPULA_STEM_HAI_RAW_RE.sub(r"\1 hai", s)


def canonicalize_punjabi(s: str) -> str:
    """Map common Punjabi romanization variants to one form for answer matching."""
    s = (s or "").strip()
    s = I_AM_SUFFIX_RAW_RE.sub("hun", s)
    s = _normalize_copula_raw(s)
    s = _strip_for_compare(s)
    s = re.sub(r"^mai", "main", s)
    s = WAIT_WORD_RE.sub("udeek", s)
    s = _collapse_doubled_letters(s)
    s = TUADA_MASC_RE.sub("tuadha", s)
    s = TUADA_FEM_RE.sub("tuadhi", s)
    for variant, canonical in PUNJABI_SUBSTRING_CANONICALS:
        s = s.replace(variant, canonical)
    s = s.translate(PUNJABI_CHAR_CANONICAL)
    return s


def answers_match(user_text: str, answer: str, *, punjabi: bool) -> bool:
    if punjabi:
        return canonicalize_punjabi(user_text) == canonicalize_punjabi(str(answer))
    return normalize(user_text) == normalize(str(answer))
