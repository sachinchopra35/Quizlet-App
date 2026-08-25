const PUNJABI_SUBSTRING_CANONICALS: [string, string][] = [
  ["menu", "mainu"],
  ["vich", "ch"],
  ["usnu", "ohnu"],
  ["mez", "table"],
  ["garam", "garm"],
  ["nakaro", "nakar"],
  ["kharidlya", "kharidya"],
  ["chawal", "chawl"],
  ["chaul", "chawl"],
  ["kutta", "doggy"],
  ["hoga", "houga"],
  ["liya", "leya"],
  ["liyi", "leya"],
  ["leyi", "leya"],
  ["leye", "leya"],
  ["lya", "leya"],
  ["lyi", "leya"],
  ["eh", "oh"],
];

const GYA_FORM_VARIANTS = ["gayi", "gaye", "gaya", "gai", "gyi", "gye"] as const;
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
  ["dauga", "daunga"],
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

const DRINK_PEE_PI: [string, string][] = [
  ["pionge", "peeoge"],
  ["piunge", "peeunge"],
  ["pioge", "peeoge"],
  ["piunga", "peeunga"],
  ["pienga", "peeunga"],
  ["peeleya", "peelaya"],
  ["pileya", "peelaya"],
  ["pilea", "peelaya"],
  ["piee", "peeie"],
  ["pio", "pee"],
];

const I_AM_SUFFIX_RAW_RE = /(hoon|hoo|hun|hu)\s*$/i;
const COPULA_STEM_HAI_RAW_RE =
  /(lag rahi|lag rehi|lag raha|lag reha|lag rahe|lag rehe|chaidi|chaida|theek)\s+(?:haan|aa|hai)\s*$/i;
const TUADA_MASC_RE = /t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?a/g;
const TUADA_FEM_RE = /t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?i/g;
const TUADA_BEFORE_KOL_RE = /t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?[aei](?=kol)/g;
const TUADE_OBLIQUE_RE = /t(?:h)?u(?:h|s(?:i)?)?a(?:d)?h?e/g;
const WAIT_WORD_RE = /intezaa?r/g;
const OPTIONAL_SUBJECT_PREFIXES = ["tusi", "main", "asi"] as const;
const KI_QUESTION_BLOCKLIST = ["kithe", "kitthe", "kivein", "kinvein", "kinne"] as const;
const COW_GAN_GAY_RE = /\b(?:gan|gay)\b/gi;
const COW_GAYE_POSSESSIVE_RE = /\b(ik|ohdi|meri|ohda|mera|ohde) gaye\b/gi;

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

function stripOptionalQuestionKiRaw(s: string): string {
  const trimmed = s.trim();
  if (!/^ki(\s|$)/i.test(trimmed)) return s;
  const afterKi = trimmed.replace(/^ki\s*/i, "");
  const lower = afterKi.toLowerCase();
  for (const blocked of KI_QUESTION_BLOCKLIST) {
    if (lower.startsWith(blocked)) return s;
  }
  return afterKi;
}

function normalizeCowWordsRaw(s: string): string {
  s = s.replace(COW_GAYE_POSSESSIVE_RE, "$1 ga");
  return s.replace(COW_GAN_GAY_RE, "ga");
}

function normalizeDoggyKutta(s: string): string {
  return s.split("kutta").join("doggy").split("kuta").join("doggy");
}

function normalizeNoseNakk(s: string): string {
  return s.replace(/nakh/g, "nakk").replace(/nak(?!k)/g, "nakk");
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

function normalizeConditionals(s: string): string {
  return s.split("agar").join("je");
}

const HABITUAL_NDA_TO_DA: [string, string][] = [
  ["chahnda", "chahda"],
  ["vajanda", "vajada"],
  ["tureda", "turda"],
  ["karnda", "karda"],
  ["kehnda", "kehda"],
  ["khanda", "khada"],
  ["aunda", "auda"],
  ["janda", "jada"],
  ["pinda", "pida"],
  ["sunda", "suda"],
];

const HABITUAL_NDE_TO_DE: [string, string][] = [
  ["chahnde", "chahde"],
  ["khande", "khade"],
  ["karnde", "karde"],
  ["kehnde", "kehde"],
  ["jande", "jade"],
  ["aunde", "aude"],
];

const HABITUAL_NDI_TO_DI: [string, string][] = [
  ["chahndi", "chahdi"],
  ["karndi", "kardi"],
  ["kehndi", "kehdi"],
  ["khandi", "khadi"],
  ["jandi", "jadi"],
  ["pindi", "pidi"],
  ["sundi", "sudi"],
  ["aundi", "audi"],
];

function normalizeChahnaTusi(s: string): string {
  return s.split("chahdeho").join("chaho");
}

function normalizeCohortativeY(s: string): string {
  return s.split("iye").join("ie");
}

function normalizeDrinkPeePi(s: string): string {
  for (const [variant, canonical] of DRINK_PEE_PI) {
    s = s.split(variant).join(canonical);
  }
  return s;
}

function normalizeChaiTea(s: string): string {
  return s.replace(/chai(?!d)/g, "cha");
}

function normalizeHabitualDa(s: string): string {
  for (const [variant, canonical] of HABITUAL_NDA_TO_DA) {
    s = s.split(variant).join(canonical);
  }
  for (const [variant, canonical] of HABITUAL_NDE_TO_DE) {
    s = s.split(variant).join(canonical);
  }
  for (const [variant, canonical] of HABITUAL_NDI_TO_DI) {
    s = s.split(variant).join(canonical);
  }
  return s;
}

function normalizePluralIyan(s: string): string {
  return s.split("iyan").join("ian");
}

function normalizeIkEk(s: string): string {
  s = s.replace(/^ek/, "ik");
  s = s.split("ekmin").join("ikmin");
  s = s.split("toh").join("ton");
  s = s.split("nahin").join("nahi");
  return s;
}

function normalizePostpositions(s: string): string {
  s = s.split("debaad").join("tobaad");
  s = s.split("depehla").join("tonpehla");
  s = s.split("topehla").join("tonpehla");
  s = s.replace(/to(?!baad)/g, "ton");
  return s;
}

function normalizeLocationAdverbs(s: string): string {
  s = s.split("kitthe").join("kithe");
  s = s.split("itthe").join("itte");
  s = s.split("otte").join("othe");
  s = s.split("ikmind").join("ikminute");
  s = s.split("kinvein").join("kivein");
  s = s.split("ikatha").join("ikathe");
  s = s.split("kathe").join("ikathe");
  s = s.split("katha").join("ikathe");
  s = s.split("paer").join("pair");
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

function normalizePastCopula(s: string): string {
  if (s.endsWith("sige")) return s;
  if (s.endsWith("siga")) return `${s.slice(0, -4)}si`;
  if (s.endsWith("san")) return `${s.slice(0, -3)}si`;
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
  t = stripOptionalQuestionKiRaw(t);
  t = normalizeCowWordsRaw(t);
  t = stripForCompare(t);
  t = normalizeConditionals(t);
  t = normalizeChahnaTusi(t);
  t = normalizeCohortativeY(t);
  t = normalizeDrinkPeePi(t);
  t = normalizeChaiTea(t);
  t = normalizeHabitualDa(t);
  t = normalizePluralIyan(t);
  t = normalizeIkEk(t);
  t = normalizePostpositions(t);
  t = normalizeLocationAdverbs(t);
  t = normalizeImperativeKar(t);
  t = normalizeBaithSitting(t);
  t = normalizeGyaForms(t);
  t = normalizePastCopula(t);
  t = normalizeProgressiveParticiple(t);
  t = t.split("tenu").join("thuanu");
  t = t.split("tainu").join("thuanu");
  t = normalizeFutureRomanization(t);
  t = t.replace(/^mai/, "main");
  t = t.replace(WAIT_WORD_RE, "udeek");
  t = t.split("taiyaar").join("tyaar");
  t = normalizePluralAuxiliary(t);
  t = normalizeDoggyKutta(t);
  t = collapseDoubledLetters(t);
  t = t.replace(TUADA_BEFORE_KOL_RE, "tuade");
  t = t.replace(TUADE_OBLIQUE_RE, "tuade");
  t = t.replace(TUADA_MASC_RE, "tuadha");
  t = t.replace(TUADA_FEM_RE, "tuadhi");
  for (const [variant, canonical] of PUNJABI_SUBSTRING_CANONICALS) {
    t = t.split(variant).join(canonical);
  }
  t = normalizeNoseNakk(t);
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
