import re
import unicodedata

# Punjabi spelling equivalences — extend these tuples/patterns to accept more variants.
PUNJABI_SUBSTRING_CANONICALS = (
    ("menu", "mainu"),
    ("vich", "ch"),
    ("usnu", "ohnu"),
    ("mez", "table"),
    ("garam", "garm"),
    ("nakaro", "nakar"),
    ("liya", "leya"),
    ("liyi", "leya"),
    ("leyi", "leya"),
    ("leye", "leya"),
    ("lya", "leya"),
    ("lyi", "leya"),
    ("eh", "oh"),
)
# Past participle / ho gya family — longest first (gayi before gyi).
GYA_FORM_VARIANTS = ("gayi", "gaye", "gaya", "gyi", "gye")
PROGRESSIVE_PLURAL_AUX_MARKERS = ("rahehan", "rahehain", "rahene", "baithyehan", "baithyene")
PUNJABI_CHAR_CANONICAL = str.maketrans("rR", "dd")
I_AM_SUFFIX_RAW_RE = re.compile(r"(hoon|hoo|hun|hu)\s*$", re.IGNORECASE)
# 3rd-person copula hai — normalize on raw text before doubled-letter collapse eats haan.
COPULA_STEM_HAI_RAW_RE = re.compile(
    r"(lag rahi|lag rehi|lag raha|lag reha|lag rahe|lag rehe|chaidi|chaida|theek)\s+(?:haan|aa|hai)\s*$",
    re.IGNORECASE,
)
# Formal "your" (tuhada / tuada / tusada …) — masc ends in a, fem ends in i.
TUADA_MASC_RE = re.compile(r"t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?a")
TUADA_FEM_RE = re.compile(r"t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?i")
# Oblique/plural "your" (tuhade kol) — also thuadha/thuadhi before kol in speech.
TUADA_BEFORE_KOL_RE = re.compile(r"t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?[aei](?=kol)")
TUADE_OBLIQUE_RE = re.compile(r"t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?e")
# Future tense: gf uses -unga (khaunga); also accept -anga romanization (khaanga).
FUTURE_ANGA_TO_UNGA = (
    ("khaanga", "khaunga"),
    ("khanga", "khaunga"),
    ("peeanga", "peeunga"),
    ("peenga", "peeunga"),
    ("pianga", "peeunga"),
    ("aajanga", "aajaaunga"),
    ("jaanga", "jaaunga"),
    ("janga", "jaaunga"),
    ("jaunga", "jaaunga"),
    ("karanga", "karunga"),
    ("kranga", "karunga"),
    ("daanga", "daunga"),
)
# Future questions (tusi): CSV uses -oge; also accept gf's -onge (aaonge, karonge, …).
FUTURE_ONGE_TO_OGE = (
    ("aaonge", "aaoge"),
    ("karonge", "karoge"),
    ("khaonge", "khaoge"),
    ("kronge", "karoge"),
    ("kroge", "karoge"),
)
# Compound "come" future (aa jauga / aa jayegi) ↔ simple (aauga / aayegi).
FUTURE_COMPOUND_AA = (
    ("aajayegi", "ayegi"),
    ("aajauga", "auga"),
)
WAIT_WORD_RE = re.compile(r"intezaa?r")
OPTIONAL_SUBJECT_PREFIXES = ("tusi", "main", "asi")


def _strip_optional_trailing_hun(s: str) -> str:
  if s.endswith("hun"):
    return s[:-3]
  return s


def _strip_optional_subject_prefix(s: str) -> str:
    for prefix in OPTIONAL_SUBJECT_PREFIXES:
        if s.startswith(prefix):
            if prefix == "main" and (s.startswith("mainu") or s.startswith("menu")):
                continue
            return s[len(prefix) :]
    return s


def _normalize_plural_auxiliary(s: str) -> str:
    """Plural present auxiliaries: asi uses han (also hain); 3rd-person oh uses ne (also han)."""
    if s.startswith("asi"):
        s = s.replace("rahehain", "rahehan")
        s = s.replace("latehain", "latehan")
    elif s.startswith("oh") and not s.startswith("ohn"):
        s = s.replace("rahehan", "rahene")
        s = s.replace("baithyehan", "baithyene")
    return s


def _normalize_baje_time_auxiliary(s: str) -> str:
    """Time questions: kinne baje han / kinne baje ne."""
    s = re.sub(r"bajohain$", "bajohan", s)
    s = re.sub(r"bajene$", "bajohan", s)
    return s


def _normalize_imperative_kar(s: str) -> str:
    # kar lo -> karo via lo$ rule; kar dena (…call kar dena) -> karo for the same imperative family.
    s = s.replace("kardena", "karo")
    s = s.replace("baithjao", "baitho")
    # let lo -> leto via lo$ rule; let jao matches the same imperative.
    s = s.replace("letjao", "leto")
    # so lo -> soo via lo$ rule; so jao matches the same imperative.
    s = s.replace("sojao", "so")
    # aa jao / aao / ao — same "come" imperative (after other …jao rules).
    s = s.replace("aajao", "ao")
    return s


def _normalize_baith_sitting(s: str) -> str:
    """Stative participles ↔ progressive (baithya/let ya/sutta ↔ … raha)."""
    s = s.replace("baithya", "baithraha")
    s = s.replace("letya", "letraha")
    s = s.replace("leta", "letraha")
    s = s.replace("sutta", "soraha")
    return s


def _normalize_gya_forms(s: str) -> str:
    for variant in GYA_FORM_VARIANTS:
        s = s.replace(variant, "gya")
    return s


def _normalize_progressive_participle(s: str) -> str:
    s = s.replace("rehi", "rahi")
    s = s.replace("rehe", "rahe")
    s = s.replace("reha", "raha")
    s = s.replace("rahi", "raha")
    if not any(marker in s for marker in PROGRESSIVE_PLURAL_AUX_MARKERS):
        s = s.replace("rahe", "raha")
    return s


def _normalize_future_romanization(s: str) -> str:
    for variant, canonical in FUTURE_ANGA_TO_UNGA:
        s = s.replace(variant, canonical)
    for variant, canonical in FUTURE_ONGE_TO_OGE:
        s = s.replace(variant, canonical)
    for variant, canonical in FUTURE_COMPOUND_AA:
        s = s.replace(variant, canonical)
    return s


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
    s = _normalize_imperative_kar(s)
    s = _normalize_baith_sitting(s)
    s = _normalize_gya_forms(s)
    s = _normalize_progressive_participle(s)
    s = s.replace("tenu", "thuanu")
    s = s.replace("tainu", "thuanu")
    # Future-tense romanization shortcuts (before doubled-letter collapse).
    s = _normalize_future_romanization(s)
    s = re.sub(r"^mai", "main", s)
    s = WAIT_WORD_RE.sub("udeek", s)
    s = s.replace("taiyaar", "tyaar")
    s = _normalize_plural_auxiliary(s)
    s = _collapse_doubled_letters(s)
    s = TUADA_BEFORE_KOL_RE.sub("tuade", s)
    s = TUADE_OBLIQUE_RE.sub("tuade", s)
    s = TUADA_MASC_RE.sub("tuadha", s)
    s = TUADA_FEM_RE.sub("tuadhi", s)
    for variant, canonical in PUNJABI_SUBSTRING_CANONICALS:
        s = s.replace(variant, canonical)
    s = s.translate(PUNJABI_CHAR_CANONICAL)
    s = _normalize_baje_time_auxiliary(s)
    s = re.sub(r"lo$", "o", s)
    s = re.sub(r"soo$", "so", s)
    s = s.replace("dakhdo", "dakho")
    s = s.replace("nakaro", "nakar")
    if s.startswith("oh") and not s.startswith("ohn"):
        s = s[2:]
    s = _strip_optional_subject_prefix(s)
    s = _strip_optional_trailing_hun(s)
    return s


def answers_match(user_text: str, answer: str, *, punjabi: bool) -> bool:
    if punjabi:
        return canonicalize_punjabi(user_text) == canonicalize_punjabi(str(answer))
    return normalize(user_text) == normalize(str(answer))
