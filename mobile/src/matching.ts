const PUNJABI_SUBSTRING_CANONICALS: [string, string][] = [
  ["menu", "mainu"],
  ["vich", "ch"],
  ["usnu", "ohnu"],
  ["mez", "table"],
  ["garam", "garm"],
  ["sekh", "sikh"],
  ["sil", "sir"],
  ["tikka", "tikha"],
  ["tika", "tikha"],
  ["mirchi", "tikha"],
  ["sokha", "saukha"],
  ["okha", "aukha"],
  ["bhokhe", "bhukhe"],
  ["bhookhe", "bhukhe"],
  ["nakaro", "nakar"],
  ["kharidlya", "kharidya"],
  ["chawal", "chawl"],
  ["chaul", "chawl"],
  ["kutta", "doggy"],
  ["hoga", "houga"],
  ["houge", "hoge"],
  ["hougi", "hogi"],
  ["liya", "leya"],
  ["liyi", "leya"],
  ["leyi", "leya"],
  ["leye", "leya"],
  ["lya", "leya"],
  ["lyi", "leya"],
  ["bachcha", "bacha"],
  ["bachche", "bache"],
  ["kharideya", "kharidya"],
  ["dukante", "dukanch"],
  ["jaldijaldi", "jaldi"],
  ["haulihauli", "hauli"],
  ["khayi", "khaya"],
  ["kyun", "kyon"],
  ["kyu", "kyon"],
  ["pher", "phir"],
  ["vekh", "dekh"],
  ["thakeya", "thaka"],
  ["thakya", "thaka"],
  ["dekheya", "dekhaya"],
  ["pucheya", "puchya"],
  ["tuteya", "tuta"],
  ["tutya", "tuta"],
  ["bewkuf", "bewakuf"],
  // jaandi (collapsed jandi) ↔ jandi→jadi from the habitual rule.
  ["jandi", "jadi"],
  ["janda", "jada"],
  ["jande", "jade"],
  ["haseya", "hasya"],
  ["manje", "bistar"],
  ["manja", "bistar"],
  // "doonga" (deep) is already collapsed to "donga" by this point.
  ["dunga", "donga"],
  ["hoshiyar", "hushiyar"],
  ["haule", "hauli"],
  // "toot" has already become "tonot" via the to→ton postposition rule.
  ["tonot", "tut"],
  ["dariya", "nadi"],
  ["kes", "vaal"],
  ["baal", "vaal"],
  // Strong: takra (r→d already made it takda); mazboot still accepted.
  ["mazbut", "takda"],
  ["puranabanda", "budhabanda"],
];

/** Aliases applied after final letter collapse (e.g. ohde baal → debal). */
const POST_COLLAPSE_CANONICALS: [string, string][] = [["debal", "deval"]];

const GYA_FORM_VARIANTS = ["gayi", "gaye", "gayaa", "gaya", "gai", "gyi", "gye", "gyaa"] as const;
const PROGRESSIVE_PLURAL_AUX_MARKERS = [
  "rahehan",
  "rahehain",
  "rahene",
  "baithyehan",
  "baithyene",
] as const;

const FUTURE_ANGA_TO_UNGA: [string, string][] = [
  // Before khanga → khaunga, which would otherwise catch likhanga.
  ["likhanga", "likhunga"],
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

/** ho jaa- “will become” ↔ hou- future copula “will be” (same person endings). */
const FUTURE_BE_HO_JAA_TO_HOU: [string, string][] = [
  ["hojaaunge", "houange"],
  ["hojaaunga", "hounga"],
  ["hojaaungi", "houngi"],
  ["hojaaange", "houange"],
  ["hojaaoge", "hoge"],
  ["hojaaogi", "hogi"],
  ["hojayega", "houga"],
  ["hojayegi", "hogi"],
  ["hojayenge", "honge"],
  ["hojayengi", "hongi"],
  ["hojaunga", "hounga"],
  ["hojaungi", "houngi"],
  ["hojaange", "houange"],
  ["hojaoge", "hoge"],
  ["hojaogi", "hogi"],
  ["hojaega", "houga"],
  ["hojaegi", "hogi"],
  ["hojange", "honge"],
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

function normalizeAlsoBhiVi(s: string): string {
  s = s.split("abhi").join("\x00abhi\x00");
  s = s.split("bhi").join("vi");
  return s.split("\x00abhi\x00").join("abhi");
}

/** Vehicle "bus" ↔ "bas" — not bare "bas" (= enough), e.g. bas ho gya. */
function normalizeBusVehicle(s: string): string {
  s = s.split("baste").join("buste");
  s = s.split("baslai").join("buslai");
  s = s.split("basmiss").join("busmiss");
  return s;
}

/** miss kar diti/dita — participle gender after bus (feminine diti vs learner dita). */
function normalizeMissKarPast(s: string): string {
  return s.split("misskardita").join("misskarditi");
}

function normalizeIamCopulaRaw(s: string): string {
  // "main … haan" is "I am" (hun), not the plural / polite haan.
  if (/^\s*main\b/i.test(s)) s = s.replace(/\bhaan\s*$/i, "hun");
  s = s.replace(/\b(hoon|hoo|hu)\s+(?=ke\b)/gi, "hun ");
  return s.replace(I_AM_SUFFIX_RAW_RE, "hun");
}

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

function isMainDativeCompact(s: string): boolean {
  return s.startsWith("menu") || (s.startsWith("mainu") && !s.startsWith("mainuth"));
}

function stripOptionalSubjectPrefix(s: string): string {
  for (const prefix of OPTIONAL_SUBJECT_PREFIXES) {
    if (s.startsWith(prefix)) {
      if (prefix === "main" && isMainDativeCompact(s)) {
        continue;
      }
      if (prefix === "asi" && s.startsWith("asanu")) {
        continue;
      }
      return s.slice(prefix.length);
    }
  }
  return s;
}

/** Subjects that may sit before or after leading time / place / with phrases. Longest first. */
const FLEX_SUBJECT_PREFIXES = [
  "tusi",
  "main",
  "asi",
  "ohne",
  "meradost",
  "oh",
  "tu",
] as const;

/** Leading chunks that may precede or follow the subject (compact roman). */
const FLEX_MOVABLE_RES: RegExp[] = [
  /^phir/,
  /^(?:das|panj|char|chaar|tin|do|dui|ik|doo)(?:minute|min|mind)(?:to|ton)?(?:baad|bad|pehlan)/,
  /^buste/,
  /^apniapp(?:de)?naal/,
  /^bahutjaldi/,
  /^lunchvele/,
  /^kaamton*(?:baad|bad)/,
  /^(?:raat|dupehar|subah)de(?:ik|do|tin|char|chaar|panj|das)baje/,
  /^saturdaynu/,
  /^shukarhai/,
];

function tryPeelFlexSubject(s: string): { subject: string; rest: string } | null {
  for (const prefix of FLEX_SUBJECT_PREFIXES) {
    if (!s.startsWith(prefix)) continue;
    if (prefix === "main" && isMainDativeCompact(s)) continue;
    if (prefix === "asi" && s.startsWith("asanu")) continue;
    if (prefix === "oh" && shouldPreserveLeadingOh(s)) continue;
    return { subject: prefix, rest: s.slice(prefix.length) };
  }
  return null;
}

function tryPeelFlexMovable(s: string): { chunk: string; rest: string } | null {
  for (const re of FLEX_MOVABLE_RES) {
    const m = re.exec(s);
    if (m?.index === 0) {
      return { chunk: m[0], rest: s.slice(m[0].length) };
    }
  }
  return null;
}

/** Canonical order: subject, then sorted movable prefixes, then the rest of the clause. */
function normalizeFlexibleClauseOrder(s: string): string {
  const movables: string[] = [];
  let subject = "";
  let rest = s;
  for (let guard = 0; guard < 12; guard++) {
    const mov = tryPeelFlexMovable(rest);
    if (mov) {
      movables.push(mov.chunk);
      rest = mov.rest;
      continue;
    }
    if (!subject) {
      const sub = tryPeelFlexSubject(rest);
      if (sub) {
        subject = sub.subject;
        rest = sub.rest;
        continue;
      }
    }
    break;
  }
  if (!subject) return s;
  const orderedMovables = [...movables].sort();
  return subject + orderedMovables.join("") + rest;
}

/** Leading apna/apni/apne ("your own") is optional — but not in "apne aap" (yourself). */
function stripOptionalLeadingApna(s: string): string {
  const m = /^apn[aei]/.exec(s);
  if (!m || s.startsWith("aap", 4)) return s;
  return s.slice(4);
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

function stripOptionalQuestionKiCompact(s: string): string {
  if (!s.startsWith("ki")) return s;
  if (
    s.startsWith("kinne") ||
    s.startsWith("kithe") ||
    s.startsWith("kitthe") ||
    /^ki(nne|ne)baj/.test(s)
  ) {
    return s;
  }
  const afterKi = s.slice(2);
  if (afterKi.startsWith("th")) return s;
  for (const blocked of KI_QUESTION_BLOCKLIST) {
    if (afterKi.startsWith(blocked)) return s;
  }
  return afterKi;
}

function shouldPreserveLeadingOh(s: string): boolean {
  return (
    s.startsWith("ohnu") ||
    s.startsWith("ohnadi") ||
    s.startsWith("ohnada") ||
    s.startsWith("ohnade") ||
    s.startsWith("ohnane")
  );
}

/** "aa gya" (came / arrived) ↔ "aaya", per gender/number. Word-bounded so "chala gya" is untouched. */
function normalizeAaGyaRaw(s: string): string {
  s = s.replace(/\baa+\s+ga?ya\b/gi, "aaya");
  s = s.replace(/\baa+\s+(?:ga?yi|gai)\b/gi, "aayi");
  return s.replace(/\baa+\s+ga?ye\b/gi, "aaye");
}

/** Future "pahunch jaa-" (will arrive) ↔ plain "pahunch-" future. */
function normalizePahunchJaaRaw(s: string): string {
  s = s.replace(/\bpahunch\s+ja+nge\b/gi, "pahunchange");
  s = s.replace(/\bpahunch\s+ja+unga\b/gi, "pahunchunga");
  s = s.replace(/\bpahunch\s+ja+ungi\b/gi, "pahunchungi");
  s = s.replace(/\bpahunch\s+(?:jayega|ja+uga)\b/gi, "pahunchega");
  s = s.replace(/\bpahunch\s+(?:jayegi|ja+ugi)\b/gi, "pahunchegi");
  return s.replace(/\bpahunch\s+ja+oge\b/gi, "pahunchoge");
}

/** "new": naya/nayi/naye ↔ nava/navi/nave (whole word, so "banaya" is untouched). */
function normalizeNewNavaRaw(s: string): string {
  return s.replace(/\bnay([aie])\b/gi, "nav$1");
}

function normalizeCowWordsRaw(s: string): string {
  s = s.replace(COW_GAYE_POSSESSIVE_RE, "$1 ga");
  return s.replace(COW_GAN_GAY_RE, "ga");
}

function normalizeDoggyKutta(s: string): string {
  s = s.split("kutte").join("doggy");
  s = s.split("kutta").join("doggy");
  s = s.split("kuta").join("doggy");
  return s.replace(/dog(?!gy)/g, "doggy");
}

function normalizeCarGaddi(s: string): string {
  return s.replace(/car/g, "gaddi");
}

function normalizeRozHarDin(s: string): string {
  s = s.split("hardin").join("roz");
  return s.split("harroz").join("roz");
}

function normalizeNoseNakk(s: string): string {
  return s.replace(/nakh/g, "nakk").replace(/nak(?!k)/g, "nakk");
}

/** Hunger noun bookh — not bukhar (fever). */
function normalizeHungerBookh(s: string): string {
  s = s.split("bhookh").join("bookh");
  s = s.split("bhukh").join("bookh");
  return s.replace(/bukh(?!ar)/g, "bookh");
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
  s = s.replace(/bajehain$/, "bajohan");
  s = s.replace(/bajehan$/, "bajohan");
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
  ["peenda", "pida"],
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

function normalizeWePronouns(s: string): string {
  /** Dative “to us” — canonical asanu (matches mainu / thuanu pattern). */
  const dative: [string, string][] = [
    ["saadenu", "asanu"],
    ["asinu", "asanu"],
    ["saanu", "asanu"],
    ["sanu", "asanu"],
    ["aapanu", "asanu"],
    ["apanu", "asanu"],
  ];
  for (const [variant, canonical] of dative) {
    s = s.split(variant).join(canonical);
  }
  if (
    s.startsWith("apne") ||
    s.startsWith("apni") ||
    s.startsWith("apna") ||
    s.startsWith("aapas")
  ) {
    return s;
  }
  if (s.startsWith("appa")) return `asi${s.slice(4)}`;
  if (s.startsWith("aapni") || s.startsWith("aapna")) return s;
  if (s.startsWith("aap")) return `asi${s.slice(3)}`;
  if (s.startsWith("apa")) return `asi${s.slice(3)}`;
  return s;
}

/** Bare "kar leya" (= I finished / I did it) — not equivalent to "kita" on its own. */
const KAR_LEYA_KITA_STEM_BLOCK = new Set([
  "main",
  "asi",
  "tusi",
  "tu",
  "oh",
  "ohne",
  "eh",
  "ki",
  "hun",
]);

/** "... brush kar leya" ↔ "... brush kita" (and similar compounds). */
function normalizeCompoundKarLeyaToKita(s: string): string {
  if (!s.endsWith("karleya")) return s;
  const stem = s.slice(0, -"karleya".length);
  if (!stem || KAR_LEYA_KITA_STEM_BLOCK.has(stem)) return s;
  return `${stem}kita`;
}

function normalizeSpacedLyaPast(s: string): string {
  /** After spaces are stripped, "kha lya" → khalya; map to compact past stems. */
  const pairs: [string, string][] = [
    ["khalya", "khaya"],
    ["khaleya", "khaya"],
    ["sikhlya", "sikhaya"],
    ["sikhleya", "sikhaya"],
    ["seekhlya", "sikhaya"],
    ["seekhleya", "sikhaya"],
    ["aalya", "aaya"],
    ["galya", "gaya"],
    ["pilya", "piya"],
    ["kilya", "kiya"],
    ["puchlya", "puchya"],
    ["puchleya", "puchya"],
  ];
  for (const [variant, canonical] of pairs) {
    s = s.split(variant).join(canonical);
  }
  return s.split("khya").join("khaya");
}

function normalizeChahnaTusi(s: string): string {
  return s.split("chahdeho").join("chaho");
}

function normalizeCohortativeY(s: string): string {
  return s.split("iye").join("ie");
}

/** jaaie / chaliye cohortatives — English "let's go" is ambiguous between them. */
const COHORTATIVE_GO = "letsgo";

function normalizeJaaieChaliye(s: string): string {
  for (const variant of ["jaaie", "chalie", "jaie", "chaliye"]) {
    s = s.split(variant).join(COHORTATIVE_GO);
  }
  return s;
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

/** “That” after think/say/seem: ke ↔ ki (not kha ke, question ki, kehnda). */
function normalizeComplementizerKeKi(s: string): string {
  const pairs: [string, string][] = [
    ["keoh", "kioh"],
    ["keeh", "kieh"],
    ["kemain", "kimain"],
    ["keasi", "kiasi"],
    ["ketusi", "kitusi"],
    ["keohne", "kiohne"],
  ];
  for (const [variant, canonical] of pairs) {
    s = s.split(variant).join(canonical);
  }
  return s;
}

function normalizePostpositions(s: string): string {
  s = s.split("debaad").join("tobaad");
  s = s.split("depehla").join("tonpehla");
  s = s.split("topehla").join("tonpehla");
  // "with" — de naal ↔ naal (not der naal = late).
  s = s.split("denaal").join("naal");
  s = s.replace(/to(?!baad)/g, "ton");
  return s;
}

/** das minute to/ton baad ↔ das minute baad (to is often inserted before baad). */
function normalizeMinuteToBaad(s: string): string {
  return s.replace(/(minute|min|mind)(?:to|ton)(?:baad|bad)/g, "$1bad");
}

function normalizeLocationAdverbs(s: string): string {
  s = s.split("itthe").join("itte");
  s = s.split("ithe").join("itte");
  s = s.split("otte").join("othe");
  s = s.split("kitthe").join("kithe");
  s = s.split("ikmind").join("ikminute");
  s = s.split("mind").join("minute");
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
  // Generic I-future: likhanga / dasanga → likhunga / dasunga (not changa = good).
  s = s.replace(/(?<!ch)anga(?!u)/g, "unga");
  for (const [variant, canonical] of FUTURE_ONGE_TO_OGE) {
    s = s.split(variant).join(canonical);
  }
  for (const [variant, canonical] of FUTURE_COMPOUND_AA) {
    s = s.split(variant).join(canonical);
  }
  return s;
}

function normalizeFutureBeHoJaa(s: string): string {
  for (const [variant, canonical] of FUTURE_BE_HO_JAA_TO_HOU) {
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

/** Bare infinitive spellings — whole answer only, so e.g. sona (gold) inside a sentence is untouched. */
const WHOLE_INFINITIVE_ALIASES: Record<string, string> = {
  sona: "sauna",
  aana: "aauna",
  ana: "aauna",
  pina: "peena",
  khareedna: "kharidna",
  madatkarna: "madad karna",
  rahna: "rehna",
  samjhna: "samajhna",
  khadahona: "khalona",
  kharahona: "khalona",
  khelna: "khedna",
};

/** Noun spelling variants, applied to the compact string before other rules. */
const NOUN_SPELLING_ALIASES: [string, string][] = [
  // Before ankh → akh, which would otherwise eat into tankha.
  ["tankhaah", "tankha"],
  ["tankhah", "tankha"],
  ["ankh", "akh"],
  ["jindagi", "zindagi"],
  ["haspatal", "hasptaal"],
  ["hospital", "hasptaal"],
  ["gurudwara", "gurdwara"],
  ["kharcha", "kharch"],
  ["shisha", "sheesha"],
  ["takia", "takiya"],
  // Blanket: rajai/razai (quilt) ↔ kambal (Lots of Nouns).
  ["rajayi", "kambal"],
  ["rajai", "kambal"],
  ["razai", "kambal"],
  ["rajay", "kambal"],
  ["tasvir", "tasveer"],
  ["kagaz", "kaghaz"],
  ["vyaah", "vyah"],
  ["viah", "vyah"],
  ["company", "kampani"],
  ["kimat", "keemat"],
  ["behen", "bhain"],
  ["behn", "bhain"],
  ["bhen", "bhain"],
  ["bahin", "bhain"],
  ["bahan", "bhain"],
  // Brother: bhai (below), veer/vir common spellings.
  ["veer", "bhra"],
  ["vir", "bhra"],
  ["bir", "bhra"],
  ["gwandi", "guandi"],
  ["parivaar", "pariwaar"],
  ["parivar", "pariwaar"],
  ["sehet", "sehat"],
  ["sheher", "shehar"],
  ["padai", "padhai"],
  ["usdi", "ohdi"],
  ["usda", "ohda"],
  ["usde", "ohde"],
  ["zaroor", "jaroor"],
  ["zarur", "jaroor"],
  ["mehang", "mehng"],
  ["surakshit", "surakhit"],
  ["muft", "mufat"],
  // Son: puttar ↔ munda (Family vs Lots of Nouns).
  ["puttar", "munda"],
  ["putar", "munda"],
  // Man: aadmi → banda (one-way, so bandar = monkey is untouched).
  ["aadmi", "banda"],
  ["admi", "banda"],
];

function normalizeNounSpellings(s: string): string {
  for (const [variant, canonical] of NOUN_SPELLING_ALIASES) {
    s = s.split(variant).join(canonical);
  }
  // Near: before reha/raha, which would read "nere hai" as "ne + raha".
  s = s.split("nere").join("nede");
  // Burnt: sarh gya ↔ sar gya.
  s = s.replace(/sarh(?=g)/g, "sar");
  // Brother — but not bhain (sister).
  return s.replace(/bhai(?!n)/g, "bhra");
}

export function canonicalizePunjabi(s: string): string {
  let t = (s || "").trim();
  t = WHOLE_INFINITIVE_ALIASES[stripForCompare(t)] ?? t;
  t = normalizeIamCopulaRaw(t);
  t = normalizeCopulaRaw(t);
  t = stripOptionalQuestionKiRaw(t);
  t = normalizeCowWordsRaw(t);
  t = normalizeAaGyaRaw(t);
  t = normalizePahunchJaaRaw(t);
  t = normalizeNewNavaRaw(t);
  t = stripForCompare(t);
  t = normalizeNounSpellings(t);
  t = normalizeComplementizerKeKi(t);
  t = normalizeBusVehicle(t);
  t = normalizeMissKarPast(t);
  t = normalizeWePronouns(t);
  t = normalizeAlsoBhiVi(t);
  t = normalizeSpacedLyaPast(t);
  t = normalizeConditionals(t);
  t = normalizeChahnaTusi(t);
  t = normalizeCohortativeY(t);
  t = normalizeJaaieChaliye(t);
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
  t = t.split("tuhanu").join("thuanu");
  t = normalizeFutureRomanization(t);
  t = normalizeFutureBeHoJaa(t);
  t = t.replace(/^mai(?!n)/, "main");
  t = t.replace(WAIT_WORD_RE, "udeek");
  t = t.split("taiyaar").join("tyaar");
  t = normalizePluralAuxiliary(t);
  t = normalizeDoggyKutta(t);
  t = normalizeCarGaddi(t);
  t = normalizeRozHarDin(t);
  t = normalizeHungerBookh(t);
  // Reorder before collapse so word joins (asi + ice → asice) can't blur the subject boundary.
  t = normalizeMinuteToBaad(t);
  t = t.split("pher").join("phir");
  // Roman vowel length is inconsistent (keemti / kimti, poora / pura, sachchi / sachi).
  t = t.replace(/ee/g, "i").replace(/oo/g, "u").split("chch").join("ch");
  t = t.split("vaje").join("baje");
  // Tree: rukh ↔ perh — but not rukho (wait).
  t = t.replace(/rukh(?!o)/g, "perh");
  t = normalizeFlexibleClauseOrder(t);
  t = collapseDoubledLetters(t);
  t = t.replace(TUADA_BEFORE_KOL_RE, "tuade");
  t = t.replace(TUADE_OBLIQUE_RE, "tuade");
  t = t.replace(TUADA_MASC_RE, "tuadha");
  t = t.replace(TUADA_FEM_RE, "tuadhi");
  for (const [variant, canonical] of PUNJABI_SUBSTRING_CANONICALS) {
    t = t.split(variant).join(canonical);
  }
  // kha leya / kha leye / khaya (after leye→leya in canonicals above).
  t = t.split("khaleye").join("khaya");
  t = t.split("khaleya").join("khaya");
  t = normalizeCompoundKarLeyaToKita(t);
  t = t.split("keeh").join("keoh");
  t = normalizeNoseNakk(t);
  t = translatePunjabiChars(t);
  t = normalizeBajeTimeAuxiliary(t);
  // Imperative -do / -lo (e.g. chala do, chala lo, khol do, kholo) → same ending.
  t = t.replace(/do$/, "o");
  t = t.replace(/lo$/, "o");
  t = t.replace(/soo$/, "so");
  t = t.split("dakhdo").join("dakho");
  t = t.split("nakaro").join("nakar");
  if (t.startsWith("eh")) {
    t = `oh${t.slice(2)}`;
  }
  if (t.startsWith("oh") && !shouldPreserveLeadingOh(t)) {
    t = t.slice(2);
  }
  t = stripOptionalSubjectPrefix(t);
  t = stripOptionalLeadingApna(t);
  t = stripOptionalQuestionKiCompact(t);
  t = stripOptionalTrailingHun(t);
  // Substring canonicals (e.g. okha→aukha) can reintroduce doubled letters after the earlier collapse.
  t = collapseDoubledLetters(t);
  for (const [variant, canonical] of POST_COLLAPSE_CANONICALS) {
    t = t.split(variant).join(canonical);
  }
  // Late pass: collapse / other steps can leave gaya spellings (e.g. toilet gya / gaya).
  t = normalizeGyaForms(t);
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
