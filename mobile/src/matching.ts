const PUNJABI_SUBSTRING_CANONICALS: [string, string][] = [
  ["menu", "mainu"],
  ["vich", "ch"],
  ["usnu", "ohnu"],
  ["mez", "table"],
  ["garam", "garm"],
  ["nakaro", "nakar"],
  ["liya", "leya"],
  ["liyi", "leya"],
  ["leyi", "leya"],
  ["leye", "leya"],
  ["lya", "leya"],
  ["lyi", "leya"],
  ["eh", "oh"],
];

const GYA_FORM_VARIANTS = ["gayi", "gaye", "gaya", "gyi", "gye"] as const;
const PROGRESSIVE_PLURAL_AUX_MARKERS = [
  "rahehan",
  "rahehain",
  "rahene",
  "baithyehan",
  "baithyene",
] as const;

const FUTURE_ANGA_TO_UNGA: [string, string][] = [
  ["khaanga", "khaunga"],
  ["khanga", "khaunga"],
  ["peeanga", "peeunga"],
  ["peenga", "peeunga"],
  ["pianga", "peeunga"],
  ["aajanga", "aajaaunga"],
  ["jaanga", "jaaunga"],
  ["janga", "jaaunga"],
  ["jaunga", "jaaunga"],
  ["karanga", "karunga"],
  ["kranga", "karunga"],
  ["daanga", "daunga"],
];

const FUTURE_ONGE_TO_OGE: [string, string][] = [
  ["aaonge", "aaoge"],
  ["karonge", "karoge"],
  ["khaonge", "khaoge"],
  ["kronge", "karoge"],
  ["kroge", "karoge"],
];

const FUTURE_COMPOUND_AA: [string, string][] = [
  ["aajayegi", "ayegi"],
  ["aajauga", "auga"],
];

const I_AM_SUFFIX_RAW_RE = /(hoon|hoo|hun|hu)\s*$/i;
const COPULA_STEM_HAI_RAW_RE =
  /(lag rahi|lag rehi|lag raha|lag reha|lag rahe|lag rehe|chaidi|chaida|theek)\s+(?:haan|aa|hai)\s*$/i;
const TUADA_MASC_RE = /t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?a/g;
const TUADA_FEM_RE = /t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?i/g;
const WAIT_WORD_RE = /intezaa?r/g;
const OPTIONAL_SUBJECT_PREFIXES = ["tusi", "main", "asi"] as const;

function stripOptionalTrailingHun(s: string): string {
  return s.endsWith("hun") ? s.slice(0, -3) : s;
}

function stripOptionalSubjectPrefix(s: string): string {
  for (const prefix of OPTIONAL_SUBJECT_PREFIXES) {
    if (s.startsWith(prefix)) {
      if (prefix === "main" && (s.startsWith("mainu") || s.startsWith("menu"))) {
        continue;
      }
      return s.slice(prefix.length);
    }
  }
  return s;
}

function normalizePluralAuxiliary(s: string): string {
  if (s.startsWith("asi")) {
    s = s.split("rahehain").join("rahehan");
    s = s.split("latehain").join("latehan");
  } else if (s.startsWith("oh") && !s.startsWith("ohn")) {
    s = s.split("rahehan").join("rahene");
    s = s.split("baithyehan").join("baithyene");
  }
  return s;
}

function normalizeBajeTimeAuxiliary(s: string): string {
  s = s.replace(/bajohain$/, "bajohan");
  return s.replace(/bajene$/, "bajohan");
}

function stripForCompare(s: string): string {
  let out = "";
  for (const c of (s || "").trim()) {
    out += /\p{P}/u.test(c) ? " " : c;
  }
  return out.replace(/\s+/g, "").toLowerCase();
}

function collapseDoubledLetters(s: string): string {
  return s.replace(/(.)\1+/g, "$1");
}

function normalizeCopulaRaw(s: string): string {
  s = s.replace(/\bhaan\s*$/i, "hai");
  return s.replace(COPULA_STEM_HAI_RAW_RE, "$1 hai");
}

function normalizeBaithSitting(s: string): string {
  s = s.split("baithya").join("baithraha");
  s = s.split("letya").join("letraha");
  s = s.split("leta").join("letraha");
  s = s.split("sutta").join("soraha");
  return s;
}

function normalizeImperativeKar(s: string): string {
  s = s.split("kardena").join("karo");
  s = s.split("baithjao").join("baitho");
  s = s.split("letjao").join("leto");
  s = s.split("sojao").join("so");
  s = s.split("aajao").join("ao");
  return s;
}

function normalizeGyaForms(s: string): string {
  for (const variant of GYA_FORM_VARIANTS) {
    s = s.split(variant).join("gya");
  }
  return s;
}

function normalizeProgressiveParticiple(s: string): string {
  s = s.split("rehi").join("rahi");
  s = s.split("rehe").join("rahe");
  s = s.split("reha").join("raha");
  s = s.split("rahi").join("raha");
  if (!PROGRESSIVE_PLURAL_AUX_MARKERS.some((marker) => s.includes(marker))) {
    s = s.split("rahe").join("raha");
  }
  return s;
}

function normalizeFutureRomanization(s: string): string {
  for (const [variant, canonical] of FUTURE_ANGA_TO_UNGA) {
    s = s.split(variant).join(canonical);
  }
  for (const [variant, canonical] of FUTURE_ONGE_TO_OGE) {
    s = s.split(variant).join(canonical);
  }
  for (const [variant, canonical] of FUTURE_COMPOUND_AA) {
    s = s.split(variant).join(canonical);
  }
  return s;
}

function translatePunjabiChars(s: string): string {
  return s.replace(/r/g, "d").replace(/R/g, "d");
}

export function normalize(s: string): string {
  return stripForCompare(s);
}

export function canonicalizePunjabi(s: string): string {
  let t = (s || "").trim();
  t = t.replace(I_AM_SUFFIX_RAW_RE, "hun");
  t = normalizeCopulaRaw(t);
  t = stripForCompare(t);
  t = normalizeImperativeKar(t);
  t = normalizeBaithSitting(t);
  t = normalizeGyaForms(t);
  t = normalizeProgressiveParticiple(t);
  t = t.split("tenu").join("thuanu");
  t = t.split("tainu").join("thuanu");
  t = normalizeFutureRomanization(t);
  t = t.replace(/^mai/, "main");
  t = t.replace(WAIT_WORD_RE, "udeek");
  t = t.split("taiyaar").join("tyaar");
  t = normalizePluralAuxiliary(t);
  t = collapseDoubledLetters(t);
  t = t.replace(TUADA_MASC_RE, "tuadha");
  t = t.replace(TUADA_FEM_RE, "tuadhi");
  for (const [variant, canonical] of PUNJABI_SUBSTRING_CANONICALS) {
    t = t.split(variant).join(canonical);
  }
  t = translatePunjabiChars(t);
  t = normalizeBajeTimeAuxiliary(t);
  t = t.replace(/lo$/, "o");
  t = t.replace(/soo$/, "so");
  t = t.split("dakhdo").join("dakho");
  t = t.split("nakaro").join("nakar");
  if (t.startsWith("oh") && !t.startsWith("ohn")) {
    t = t.slice(2);
  }
  t = stripOptionalSubjectPrefix(t);
  t = stripOptionalTrailingHun(t);
  return t;
}

export function answersMatch(
  userText: string,
  answer: string,
  punjabi: boolean,
): boolean {
  if (punjabi) {
    return canonicalizePunjabi(userText) === canonicalizePunjabi(String(answer));
  }
  return normalize(userText) === normalize(String(answer));
}
