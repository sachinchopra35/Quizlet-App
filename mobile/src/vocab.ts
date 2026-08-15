export interface VocabRow {
  en: string;
  lang: string;
}

/** Parse simple two-column CSV (handles quoted fields). */
export function parseCsv(text: string): VocabRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const enIdx = header.indexOf("en");
  const langIdx = header.indexOf("lang");
  if (enIdx < 0 || langIdx < 0) {
    throw new Error("CSV must include columns en and lang");
  }
  const rows: VocabRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCsvLine(line);
    const en = (cols[enIdx] ?? "").trim();
    const lang = (cols[langIdx] ?? "").trim();
    if (en && lang) rows.push({ en, lang });
  }
  if (!rows.length) throw new Error("No vocabulary rows after cleaning");
  return rows;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

export async function loadCsvByName(name: string): Promise<VocabRow[]> {
  const res = await fetch(`./data/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  return parseCsv(await res.text());
}

export async function listCsvNames(): Promise<string[]> {
  const res = await fetch("./data/manifest.json");
  if (!res.ok) throw new Error("Missing data/manifest.json — run npm run copy-vocab");
  const names: string[] = await res.json();
  return names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function loadCombinedFromMap(
  files: Map<string, VocabRow[]>,
): VocabRow[] {
  const combined: VocabRow[] = [];
  for (const rows of files.values()) {
    combined.push(...rows);
  }
  if (!combined.length) throw new Error("No vocabulary in any CSV");
  return combined;
}

export async function loadAllCsvs(
  names: string[],
): Promise<Map<string, VocabRow[]>> {
  const map = new Map<string, VocabRow[]>();
  await Promise.all(
    names.map(async (name) => {
      map.set(name, await loadCsvByName(name));
    }),
  );
  return map;
}
