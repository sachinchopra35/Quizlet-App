import { escapeHtml } from "./html";

/** Roman spellings for 1–10 — keep in sync with vocab/01 and 02 Numbers.csv */
export const CHEAT_SHEET_NUMBERS: readonly { n: number; word: string; sounds: string }[] = [
  { n: 1, word: "ik", sounds: "ick" },
  { n: 2, word: "do", sounds: "door (no r)" },
  { n: 3, word: "tin", sounds: "tinn" },
  { n: 4, word: "char", sounds: "chaar" },
  { n: 5, word: "panj", sounds: "punj" },
  { n: 6, word: "che", sounds: "chay" },
  { n: 7, word: "sat", sounds: "sutt" },
  { n: 8, word: "ath", sounds: "uth" },
  { n: 9, word: "nau", sounds: "nor" },
  { n: 10, word: "das", sounds: "duss" },
];

function cheatSheetBodyHtml(): string {
  const numberRows = CHEAT_SHEET_NUMBERS.map(
    (row) =>
      `<tr><td>${row.n}</td><td><strong>${escapeHtml(row.word)}</strong></td><td>${escapeHtml(row.sounds)}</td></tr>`,
  ).join("");

  return `
    <p class="cheat-sheet-lead">Punjabi in this app is written in English letters so you can focus on speaking. The levels do not really explain how to pronounce them — use this page when you are unsure how a word should sound.</p>

    <h2>How the spelling works</h2>
    <p><strong>a</strong> is usually short, like the “u” in “cup”: <em>das</em> (ten) sounds like “duss”, <em>sat</em> (seven) like “sutt”, <em>garam</em> (warm) like “GUH-rum”.</p>
    <p><strong>aa</strong> is long, like “father”: <em>paani</em>, <em>char</em> (four).</p>
    <p><strong>i</strong> as in “sit”, <strong>ee</strong> as in “see”, <strong>u</strong> as in “put”, <strong>e</strong> as in “say” (<em>mere</em>, <em>che</em>).</p>
    <p><strong>ai</strong> often sounds like “hair”: <em>hai</em> (is), <em>main</em> (I). <strong>au</strong> often sounds like “or”: <em>nau</em> (nine).</p>
    <p>Letters like <strong>kh</strong>, <strong>gh</strong>, <strong>th</strong>, <strong>dh</strong>, <strong>ph</strong>, <strong>bh</strong> mean a breathy puff of air after the consonant. <em>ath</em> (eight) is not the English “bath”.</p>
    <p>Some words are <strong>nasal</strong> (a hint of “n” through the nose), a bit like French “bon”: <em>main</em>, <em>hun</em>, <em>han</em>.</p>

    <h2>Words people often misread</h2>
    <div class="cheat-sheet-callout">These look like English — they are not.</div>
    <table class="cheat-sheet-table cheat-sheet-table-compact">
      <thead><tr><th>Spelt</th><th>Meaning</th><th>Sounds like</th></tr></thead>
      <tbody>
        <tr><td><strong>main</strong></td><td>I</td><td>meh(n)</td></tr>
        <tr><td><strong>hun</strong></td><td>am (I am)</td><td>hoon</td></tr>
        <tr><td><strong>hai</strong></td><td>is</td><td>hair (no “r”)</td></tr>
        <tr><td><strong>han</strong></td><td>are (we)</td><td>nasal hun</td></tr>
        <tr><td><strong>tusi</strong></td><td>you</td><td>TOO-see</td></tr>
        <tr><td><strong>asi</strong></td><td>we</td><td>US-see</td></tr>
        <tr><td><strong>ki</strong></td><td>what</td><td>kee</td></tr>
        <tr><td><strong>nahi</strong></td><td>not</td><td>na-HEE</td></tr>
      </tbody>
    </table>
    <p class="cheat-sheet-note"><em>hune</em> (now) is a different word from <em>hun</em> (am).</p>

    <h2>Numbers 1–10</h2>
    <table class="cheat-sheet-table">
      <thead><tr><th>#</th><th>Spelt</th><th>Sounds like</th></tr></thead>
      <tbody>${numberRows}</tbody>
    </table>

    <h2>Stress (which syllable is louder)</h2>
    <p>Often the syllable with a long vowel (aa, ee, oo, ai, au) gets the stress. If there is no long vowel, stress the first syllable.</p>
    <ul class="cheat-sheet-stress">
      <li><strong>GAR-am</strong> warm — not ga-RAM</li>
      <li><strong>PAA-ni</strong> water</li>
      <li><strong>ki-TAAB</strong> book (feminine noun)</li>
      <li><strong>KHAA-na</strong> food</li>
      <li><strong>ba-HUT</strong> very</li>
      <li><strong>MEH-ra</strong> my (masculine)</li>
    </ul>

    <h2>Masculine and feminine</h2>
    <p>Many nouns ending in <strong>-a</strong> are masculine and many ending in <strong>-i</strong> are feminine — but not always (<em>kitab</em> “book” is feminine).</p>
    <p>Words that go with a noun change to match: <em>mera kela</em> (my banana) but <em>meri kitab</em> (my book).</p>
    <p>Continuous verbs match the speaker too: a man might say <em>main ja raha hun</em>; a woman <em>main ja rahi hun</em> (I am going).</p>

    <h2>Plurals (the basics)</h2>
    <p>Masculine <strong>-a</strong> often becomes <strong>-e</strong>: <em>kela</em> → <em>kele</em>, <em>mera</em> → <em>mere</em>.</p>
    <p>Feminine nouns often add <strong>-an</strong> or <strong>-iyan</strong>: <em>meriyan akhhan</em> (my eyes).</p>
    <p>Many everyday words do not change in the plural — the app will show you the common patterns as you go.</p>

    <h2>Tones</h2>
    <p>Some words, like <em>ghar</em> (home), have a falling pitch that native speakers hear clearly. You do not need to master this on day one — just notice it when you listen to real Punjabi.</p>

    <h2>Listen to real Punjabi</h2>
    <p>Music, films, and podcasts all help your ear. Do not worry if you cannot follow everything: dialects vary, and the app is closest to <strong>Malwai</strong> Punjabi (see About). Little bits of listening, often, go a long way alongside these levels.</p>
  `;
}

export interface CheatSheetViewModel {
  exitConfirmOpen: boolean;
  exitConfirmAnimate: boolean;
}

export function cheatSheetPageHtml(vm: CheatSheetViewModel): string {
  const backdropClass = vm.exitConfirmOpen
    ? vm.exitConfirmAnimate
      ? "popup-backdrop backdrop-open"
      : "popup-backdrop"
    : "";
  const panelClass = vm.exitConfirmAnimate ? "popup popup-open" : "popup";
  const confirmHtml = vm.exitConfirmOpen
    ? `
    <div class="${backdropClass}" id="cheat-sheet-exit-backdrop">
      <div class="${panelClass}" role="dialog" aria-modal="true" aria-label="Leave cheat sheet">
        <h2 class="cheat-sheet-exit-title">Return to the main Punjabi app?</h2>
        <div class="reset-panel-actions">
          <button type="button" class="settings-cancel" id="cheat-sheet-exit-stay">Keep reading</button>
          <button type="button" class="settings-reset-confirm-btn" id="cheat-sheet-exit-leave">Back to app</button>
        </div>
      </div>
    </div>
  `
    : "";

  return `
    <div class="cheat-sheet-page">
      <header class="cheat-sheet-header">
        <button type="button" class="icon-button cheat-sheet-back" id="cheat-sheet-back" aria-label="Back">←</button>
        <h1 class="cheat-sheet-title">Cheat Sheet and Pronunciation Guide</h1>
      </header>
      <div class="cheat-sheet-scroll">
        <article class="cheat-sheet-body">
          ${cheatSheetBodyHtml()}
        </article>
        <div class="cheat-sheet-done-wrap">
          <button type="button" class="primary cheat-sheet-done" id="cheat-sheet-done">Done</button>
        </div>
      </div>
    </div>
    ${confirmHtml}
  `;
}

export interface CheatSheetHandlers {
  onRequestExit(): void;
  onStayOnSheet(): void;
  onLeaveSheet(): void;
}

export function bindCheatSheetEvents(root: HTMLElement, handlers: CheatSheetHandlers): void {
  root.querySelector("#cheat-sheet-back")?.addEventListener("click", () => handlers.onRequestExit());
  root.querySelector("#cheat-sheet-done")?.addEventListener("click", () => handlers.onRequestExit());

  const backdrop = root.querySelector<HTMLElement>("#cheat-sheet-exit-backdrop");
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) handlers.onStayOnSheet();
  });
  root.querySelector("#cheat-sheet-exit-stay")?.addEventListener("click", () => handlers.onStayOnSheet());
  root.querySelector("#cheat-sheet-exit-leave")?.addEventListener("click", () => handlers.onLeaveSheet());
}
