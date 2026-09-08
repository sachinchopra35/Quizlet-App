/** CSV filenames that have a round hint panel (popup ℹ️ button). */
const NUMBERS_HINT = `
    <p><strong>Top tip:</strong> start a chat with any AI to ask how to pronounce the different words you&rsquo;ll come across in this course.</p>
  `;

const ROUND_HINTS: Record<string, string> = {
  "01 Numbers.csv": NUMBERS_HINT,
  "02 Numbers.csv": NUMBERS_HINT,
  "05 To Be.csv": `
    <p>This level looks at how to say &ldquo;To Be&rdquo; for different people &mdash; for example, &ldquo;I am&rdquo;, &ldquo;You are&rdquo;, &ldquo;He is&rdquo;. This is the most important verb in Punjabi because, even when using other verbs, the &ldquo;To Be&rdquo; word will always still pop up. You&rsquo;ll see what I mean when you do Round 12: &ldquo;Basic Verbs.&rdquo;</p>
    <p>The Punjabi word <strong>main</strong> means &ldquo;I&rdquo;. It isn&rsquo;t pronounced like the English word &ldquo;main,&rdquo; instead it&rsquo;s more the English word &ldquo;man&rdquo; but with a nasal finish.</p>
  `,
  "10 More Adjectives.csv": `
    <p><strong>eh</strong> means &ldquo;it&rdquo; (or &ldquo;this&rdquo;). You&rsquo;ll often hear it at the start of a sentence like <strong>eh vadda hai</strong> &mdash; &ldquo;it&rsquo;s big.&rdquo;</p>
    <p>You don&rsquo;t always need to say <strong>eh</strong>; <strong>vadda hai</strong> (&ldquo;is big&rdquo;) is fine too. This app accepts either.</p>
  `,
  "12 Basic Verbs.csv": `
    <p>Most sentences here follow a simple pattern: <strong>who</strong> + <strong>the verb</strong> + <strong>the &ldquo;to be&rdquo; word</strong> from Round 5.</p>
    <p>The verb in the middle changes shape for masculine, feminine, or plural (&ldquo;I go&rdquo; is <strong>janda</strong> if you&rsquo;re male, and would be different for a woman). The word at the end (<strong>hun</strong>, <strong>ho</strong>, <strong>hai</strong>, and so on) is still &ldquo;to be&rdquo; &mdash; so <strong>main janda hun</strong> is literally &ldquo;I go am.&rdquo;</p>
  `,
  "13 Continuous Present 01.csv": `
    <p>This is the &ldquo;right now&rdquo; tense. The pattern is: <strong>who</strong> + <strong>the verb</strong> + <strong>raha</strong> (or <strong>rahi</strong> for a woman) + <strong>hun</strong> (or another &ldquo;to be&rdquo; word).</p>
    <p>So <strong>main kha raha hun</strong> is literally &ldquo;I eat am&rdquo; &mdash; meaning &ldquo;I am eating.&rdquo; Same idea as Round 12, but <strong>raha</strong> in the middle tells you the action is happening now.</p>
  `,
  "80 Know and Don't Know.csv": `
    <p>Listen for the <strong>n</strong> in <strong>janda</strong> (&ldquo;I know&rdquo;). It isn&rsquo;t a plain English <strong>n</strong> like in &ldquo;never&rdquo; &mdash; curl your tongue tip back so it touches the roof of your mouth, a little further back than usual. That &ldquo;deep&rdquo; <strong>n</strong> is the same sound you hear in <strong>pani</strong> (water).</p>
    <p>Roman spellings vary: you&rsquo;ll see a single <strong>n</strong> (<strong>janda</strong>, <strong>pani</strong>) or a double <strong>n</strong> (<strong>jannda</strong>) to mark that sound. Same word either way &mdash; this app accepts common spellings.</p>
  `,
};

export function roundHintFor(csv: string | null): string | null {
  if (!csv) return null;
  return ROUND_HINTS[csv] ?? null;
}

export function roundHintBodyHtml(csv: string): string {
  return ROUND_HINTS[csv] ?? "";
}
