import { VocabApp } from "./app";

const root = document.getElementById("app");
if (!root) throw new Error("#app not found");

const app = new VocabApp(root);
app.init().catch((err) => {
  root.innerHTML = `<p class="error">Failed to load: ${String(err)}</p>`;
  console.error(err);
});
