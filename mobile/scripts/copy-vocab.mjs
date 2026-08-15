import { cpSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(root, "punjabi_vocab");
const dest = join(dirname(fileURLToPath(import.meta.url)), "../public/data");

mkdirSync(dest, { recursive: true });
const names = [];
for (const name of readdirSync(src)) {
  if (name.endsWith(".csv")) {
    cpSync(join(src, name), join(dest, name));
    names.push(name);
  }
}
names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
writeFileSync(join(dest, "manifest.json"), JSON.stringify(names, null, 2) + "\n");
console.log(`Copied ${names.length} CSVs to mobile/public/data/`);
