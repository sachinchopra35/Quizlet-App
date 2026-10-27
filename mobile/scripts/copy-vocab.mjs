import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function compareLevelCsvNames(a, b) {
  const na = /^(\d+)/.exec(a)?.[1];
  const nb = /^(\d+)/.exec(b)?.[1];
  if (na !== undefined && nb !== undefined) {
    const diff = Number(na) - Number(nb);
    if (diff !== 0) return diff;
  }
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(root, "vocab");
const dest = join(dirname(fileURLToPath(import.meta.url)), "../public/data");

mkdirSync(dest, { recursive: true });
for (const name of readdirSync(dest)) {
  if (name.endsWith(".csv")) {
    rmSync(join(dest, name));
  }
}
const names = [];
for (const name of readdirSync(src)) {
  if (name.endsWith(".csv")) {
    cpSync(join(src, name), join(dest, name));
    names.push(name);
  }
}
names.sort(compareLevelCsvNames);
writeFileSync(join(dest, "manifest.json"), JSON.stringify(names, null, 2) + "\n");
console.log(`Copied ${names.length} CSVs to mobile/public/data/`);
