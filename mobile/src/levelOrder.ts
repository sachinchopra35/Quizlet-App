/** Leading number in level CSV filenames (e.g. `100 Story - Morning.csv` → 100). */
export function levelCsvSortKey(name: string): number | null {
  const m = /^(\d+)/.exec(name);
  return m ? Number(m[1]) : null;
}

export function compareLevelCsvNames(a: string, b: string): number {
  const na = levelCsvSortKey(a);
  const nb = levelCsvSortKey(b);
  if (na !== null && nb !== null) {
    const diff = na - nb;
    if (diff !== 0) return diff;
  }
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}
