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
  "100 Story - Morning 01.csv": `
    <p>This is a <strong>story level</strong>. Answer the sentences in order — each line continues the same morning.</p>
  `,
  "101 Story - Morning 02.csv": `
    <p><strong>Story part 2</strong> — same morning, pick up where part 1 left off. Answer in order.</p>
  `,
  "102 Story - Lunch 01.csv": `
    <p>A <strong>story level</strong>: lunch with friends in a Delhi park. New words: <strong>perh</strong> (tree &mdash; <strong>rukh</strong> works too), <strong>thalle</strong> (under / down), <strong>bandar</strong> (monkey).</p>
  `,
  "122 Lots of Adjectives 1.csv": `
    <p>Adjectives ending in <strong>-a</strong> change with the noun: <strong>sasta phone</strong> (masculine), <strong>mehngi gaddi</strong> (feminine), <strong>mehnge kapre</strong> (plural <strong>-e</strong>).</p>
    <p>Others never change: <strong>khaas</strong>, <strong>aam</strong>, <strong>mufat</strong>, <strong>faltu</strong>, <strong>keemti</strong>, <strong>rangeen</strong>.</p>
  `,
  "114 Lots of Nouns 1.csv": `
    <p>Every noun comes with a <strong>my / his / our</strong> word or an adjective, so you learn its <strong>gender</strong> too.</p>
    <p>Masculine: <strong>mera</strong>, <strong>ohda</strong>, <strong>sadda</strong>, <strong>vadda</strong>, <strong>changa</strong> (ends in <strong>-a</strong>). Feminine: <strong>meri</strong>, <strong>ohdi</strong>, <strong>saddi</strong>, <strong>vaddi</strong>, <strong>changi</strong> (ends in <strong>-i</strong>).</p>
  `,
  "104 Story - Evening 01.csv": `
    <p>A <strong>story level</strong>: a big Friday night out in Delhi. New words: <strong>shukar hai</strong> (luckily / thank goodness), <strong>raat</strong> (night), <strong>sangeet</strong> (music), <strong>chala gya</strong> (went off / left).</p>
  `,
  "105 Story - Evening 02.csv": `
    <p><strong>Story part 2</strong> — the night keeps going. New words: <strong>baaki</strong> (the rest), <strong>suraj nikalda</strong> (the sun coming up), <strong>dupehar</strong> (afternoon), <strong>sutte</strong> (slept).</p>
  `,
  "103 Story - Lunch 02.csv": `
    <p><strong>Story part 2</strong> — the monkey strikes. New words: <strong>chukk ke</strong> (grabbing / picking up), <strong>hasse</strong> (laughed), <strong>de pichhe</strong> (after / behind), <strong>mazedaar</strong> (fun), <strong>sanu maza aaya</strong> (we enjoyed it &mdash; literally &ldquo;fun came to us&rdquo;).</p>
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
