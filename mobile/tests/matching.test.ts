import { describe, expect, it } from "vitest";
import {
  answersMatch,
  canonicalizePunjabi,
  normalize,
} from "../src/matching";
import {
  beastSampleSize,
  createInitialState,
  medalForRound,
  processAnswer,
  startRound,
} from "../src/rounds";
import { parseCsv } from "../src/vocab";

describe("normalize", () => {
  it("ignores spaces and punctuation", () => {
    expect(normalize("mainu pani dedo")).toBe(normalize("mainupanidedo"));
  });
});

describe("canonicalizePunjabi", () => {
  it("eh/oh interchange", () => {
    expect(canonicalizePunjabi("ehnu")).toBe(canonicalizePunjabi("ohnu"));
  });

  it("reha/raha interchange", () => {
    expect(
      canonicalizePunjabi("main darwaza band kar reha hun"),
    ).toBe(canonicalizePunjabi("main darwaza band kar raha hun"));
    expect(canonicalizePunjabi("main ja rehi hun")).toBe(
      canonicalizePunjabi("main ja rahi hun"),
    );
    expect(canonicalizePunjabi("main ja rehi hun")).toBe(
      canonicalizePunjabi("main ja raha hun"),
    );
    expect(canonicalizePunjabi("asi kha rehe han")).toBe(
      canonicalizePunjabi("asi kha rahe han"),
    );
    expect(canonicalizePunjabi("main ja rehe hun")).toBe(
      canonicalizePunjabi("main ja raha hun"),
    );
  });

  it("pee and pi drink", () => {
    expect(canonicalizePunjabi("chai peeoge")).toBe(canonicalizePunjabi("cha pioge"));
    expect(canonicalizePunjabi("main peeunga")).toBe(canonicalizePunjabi("main piunga"));
  });

  it("cha and chai tea", () => {
    expect(canonicalizePunjabi("main chai chahnda hun")).toBe(
      canonicalizePunjabi("main cha chahnda hun"),
    );
    expect(canonicalizePunjabi("mainu chai chaidi hai")).toBe(
      canonicalizePunjabi("mainu cha chaidi hai"),
    );
  });

  it("future unga/anga interchange", () => {
    expect(canonicalizePunjabi("main khaanga")).toBe(
      canonicalizePunjabi("main khaunga"),
    );
    expect(canonicalizePunjabi("main thuanu call karanga")).toBe(
      canonicalizePunjabi("main thuanu call karunga"),
    );
    expect(canonicalizePunjabi("tusi kadon aaonge")).toBe(
      canonicalizePunjabi("tusi kadon aaoge"),
    );
    expect(canonicalizePunjabi("tusi ki karonge")).toBe(
      canonicalizePunjabi("tusi ki karoge"),
    );
    expect(canonicalizePunjabi("main jaldi bhej dauga")).toBe(
      canonicalizePunjabi("main jaldi bhej daunga"),
    );
  });

  it("tenu to thuanu", () => {
    expect(canonicalizePunjabi("main tenu call karunga")).toBe(
      canonicalizePunjabi("main thuanu call karunga"),
    );
  });

  it("tuade oblique and kol spellings", () => {
    expect(canonicalizePunjabi("tuhade kol dudh hai")).toBe(
      canonicalizePunjabi("thuadhe kol dudh hai"),
    );
    expect(canonicalizePunjabi("tuhade kol dudh hai")).toBe(
      canonicalizePunjabi("thuadha kol dudh hai"),
    );
    expect(canonicalizePunjabi("thuadha kam karo")).not.toBe(
      canonicalizePunjabi("tuade kam karo"),
    );
  });

  it("nahi and nahin not", () => {
    expect(canonicalizePunjabi("main kade nahin janda")).toBe(
      canonicalizePunjabi("main kade nahi janda"),
    );
    expect(canonicalizePunjabi("main nahin janda")).toBe(
      canonicalizePunjabi("main nahi janda"),
    );
  });

  it("itte/itthe and othe/otte here-there", () => {
    expect(canonicalizePunjabi("itte hai")).toBe(canonicalizePunjabi("itthe hai"));
    expect(canonicalizePunjabi("othe hai")).toBe(canonicalizePunjabi("otte hai"));
    expect(canonicalizePunjabi("othe hai")).toBe(canonicalizePunjabi("otthe hai"));
    expect(canonicalizePunjabi("otte kinvein jaaie")).toBe(
      canonicalizePunjabi("othe kivein jaaie"),
    );
    expect(canonicalizePunjabi("chalo ikathe khaaie")).toBe(
      canonicalizePunjabi("chalo kathe khaaie"),
    );
    expect(canonicalizePunjabi("mere pair dard kar rahe ne")).toBe(
      canonicalizePunjabi("mere paer dard kar rahe ne"),
    );
    expect(canonicalizePunjabi("kitthe hai")).toBe(canonicalizePunjabi("kithe hai"));
  });

  it("ik minute and ik mind", () => {
    expect(canonicalizePunjabi("ik minute rukho")).toBe(
      canonicalizePunjabi("ik mind rukho"),
    );
  });

  it("ik and ek one", () => {
    expect(canonicalizePunjabi("ik")).toBe(canonicalizePunjabi("ek"));
    expect(canonicalizePunjabi("ik minute rukho")).toBe(
      canonicalizePunjabi("ek minute rukho"),
    );
  });

  it("ton and toh from", () => {
    expect(canonicalizePunjabi("main ghar ton kaam kar raha hun")).toBe(
      canonicalizePunjabi("main ghar toh kaam kar raha hun"),
    );
    expect(canonicalizePunjabi("maitoh lelo")).toBe(canonicalizePunjabi("maiton lelo"));
  });

  it("de/to postpositions baad and pehla", () => {
    expect(canonicalizePunjabi("gym to baad main thak gya")).toBe(
      canonicalizePunjabi("gym de baad main thak gya"),
    );
    expect(canonicalizePunjabi("main ghar ton kaam kar raha hun")).toBe(
      canonicalizePunjabi("main ghar to kaam kar raha hun"),
    );
    expect(canonicalizePunjabi("main kaam ton pehla khaunga")).toBe(
      canonicalizePunjabi("main kaam de pehla khaunga"),
    );
  });

  it("agar and je if", () => {
    expect(canonicalizePunjabi("agar tusi aaoge taan asi khaange")).toBe(
      canonicalizePunjabi("je tusi aaoge taan asi khaange"),
    );
    expect(canonicalizePunjabi("ki hove je")).toBe(canonicalizePunjabi("ki hove agar"));
  });

  it("chahde ho and chaho", () => {
    expect(canonicalizePunjabi("je tusi chaho taan aao")).toBe(
      canonicalizePunjabi("je tusi chahde ho taan aao"),
    );
    expect(canonicalizePunjabi("tusi kitthe khana chaho?")).toBe(
      canonicalizePunjabi("tusi kitthe khana chahde ho?"),
    );
  });

  it("ie and iye cohortative", () => {
    expect(canonicalizePunjabi("chalo ikathe khaaie")).toBe(
      canonicalizePunjabi("chalo ikathe khaaiye"),
    );
    expect(canonicalizePunjabi("paidal chaliye")).toBe(
      canonicalizePunjabi("paidal chalie"),
    );
  });

  it("karda and karnda habitual", () => {
    expect(canonicalizePunjabi("main karda hun")).toBe(
      canonicalizePunjabi("main karnda hun"),
    );
    expect(canonicalizePunjabi("main chai chahda hun")).toBe(
      canonicalizePunjabi("main chai chahnda hun"),
    );
    expect(canonicalizePunjabi("main jada hun")).toBe(
      canonicalizePunjabi("main janda hun"),
    );
    expect(canonicalizePunjabi("oh kade masah nahi khadi")).toBe(
      canonicalizePunjabi("oh kade masah nahi khandi"),
    );
    expect(canonicalizePunjabi("oh kabhi kabhi call kardi hai")).toBe(
      canonicalizePunjabi("oh kabhi kabhi call karndi hai"),
    );
    expect(canonicalizePunjabi("main kabhi kabhi turda hun")).toBe(
      canonicalizePunjabi("main kabhi kabhi tureda hun"),
    );
    expect(canonicalizePunjabi("asi kade bahar nahi khande")).toBe(
      canonicalizePunjabi("asi kade bahar nahi khade"),
    );
  });

  it("plural ian and iyan", () => {
    expect(canonicalizePunjabi("meriyan unglian thandian ne")).toBe(
      canonicalizePunjabi("meriyan ungliyan thandiyan ne"),
    );
  });

  it("hu suffix and optional subject pronouns", () => {
    expect(canonicalizePunjabi("main thaka hu")).toBe(
      canonicalizePunjabi("main thaka hun"),
    );
    expect(canonicalizePunjabi("khaunga")).toBe(
      canonicalizePunjabi("main khaunga"),
    );
    expect(canonicalizePunjabi("khaoge")).toBe(
      canonicalizePunjabi("tusi khaoge"),
    );
    expect(canonicalizePunjabi("kadon aaoge")).toBe(
      canonicalizePunjabi("tusi kadon aaoge"),
    );
    expect(canonicalizePunjabi("paani chaida hai")).not.toBe(
      canonicalizePunjabi("mainu paani chaida hai"),
    );
  });

  it("gya gaya gayi gaye forms", () => {
    expect(canonicalizePunjabi("oh bhul gayi")).toBe(
      canonicalizePunjabi("oh bhul gyi"),
    );
    expect(canonicalizePunjabi("oh jaldi chal gaye")).toBe(
      canonicalizePunjabi("oh jaldi chal gye"),
    );
  });

  it("leye plural leya forms", () => {
    expect(canonicalizePunjabi("ohna ne kha leye")).toBe(
      canonicalizePunjabi("ohna ne kha leya"),
    );
  });

  it("karo and kar dena imperatives", () => {
    expect(canonicalizePunjabi("pahunch ke call karo")).toBe(
      canonicalizePunjabi("pahunch ke call kar dena"),
    );
  });

  it("baitho and baith jao imperatives", () => {
    expect(canonicalizePunjabi("sofa te baitho")).toBe(
      canonicalizePunjabi("sofa te baith jao"),
    );
  });

  it("baithya and baith raha sitting", () => {
    expect(canonicalizePunjabi("main sofa te baithya hun")).toBe(
      canonicalizePunjabi("main sofa te baith raha hun"),
    );
  });

  it("let lo/jao and letya/let raha lying", () => {
    expect(canonicalizePunjabi("mere bistar te let lo")).toBe(
      canonicalizePunjabi("mere bistar te let jao"),
    );
    expect(canonicalizePunjabi("main apne bistar te letya hun")).toBe(
      canonicalizePunjabi("main apne bistar te let raha hun"),
    );
  });

  it("so lo/jao and sutta/so raha sleeping", () => {
    expect(canonicalizePunjabi("mere bistar te so lo")).toBe(
      canonicalizePunjabi("mere bistar te so jao"),
    );
    expect(canonicalizePunjabi("main apne bistar te sutta hun")).toBe(
      canonicalizePunjabi("main apne bistar te so raha hun"),
    );
  });

  it("aa jao and ao/aao come imperative", () => {
    expect(canonicalizePunjabi("aa jao")).toBe(canonicalizePunjabi("ao"));
    expect(canonicalizePunjabi("kar ke aa jao")).toBe(
      canonicalizePunjabi("kar ke ao"),
    );
    expect(canonicalizePunjabi("tusi aaoge")).not.toBe(canonicalizePunjabi("tusi ao"));
  });

  it("compound aa future jayegi/jauga and aayegi/aauga", () => {
    expect(canonicalizePunjabi("oh ajj raat aa jayegi")).toBe(
      canonicalizePunjabi("oh ajj raat aayegi"),
    );
    expect(canonicalizePunjabi("oh baad vich aa jauga")).toBe(
      canonicalizePunjabi("oh baad vich aauga"),
    );
    expect(canonicalizePunjabi("main aaungi")).not.toBe(
      canonicalizePunjabi("oh ajj raat aayegi"),
    );
  });

  it("kinne baje han and ne time question", () => {
    expect(canonicalizePunjabi("kinne baje han?")).toBe(
      canonicalizePunjabi("kinne baje ne?"),
    );
    expect(canonicalizePunjabi("kinne baje hain")).toBe(
      canonicalizePunjabi("kinne baje han"),
    );
  });

  it("plural auxiliary han, ne, hain", () => {
    expect(canonicalizePunjabi("oh aa rahe han")).toBe(
      canonicalizePunjabi("oh aa rahe ne"),
    );
    expect(canonicalizePunjabi("asi kha rahe hain")).toBe(
      canonicalizePunjabi("asi kha rahe han"),
    );
    expect(canonicalizePunjabi("asi kha rahe ne")).not.toBe(
      canonicalizePunjabi("asi kha rahe han"),
    );
  });

  it("optional trailing hun", () => {
    expect(canonicalizePunjabi("main so gya")).toBe(
      canonicalizePunjabi("main so gya hun"),
    );
    expect(canonicalizePunjabi("main thaka")).toBe(
      canonicalizePunjabi("main thaka hun"),
    );
  });
});

describe("language tweak canonicals", () => {
  it("doggy and kutta", () => {
    expect(canonicalizePunjabi("mera kutta")).toBe(canonicalizePunjabi("mera doggy"));
  });

  it("cow ga gan gay gaye", () => {
    expect(canonicalizePunjabi("ik gan")).toBe(canonicalizePunjabi("ik ga"));
    expect(canonicalizePunjabi("ik gay")).toBe(canonicalizePunjabi("ik ga"));
    expect(canonicalizePunjabi("ohdi gaye")).toBe(canonicalizePunjabi("ohdi ga"));
    expect(canonicalizePunjabi("meriyan akhhan thak gayan")).not.toBe(
      canonicalizePunjabi("ik ga"),
    );
  });

  it("nose nak nakh nakk", () => {
    expect(canonicalizePunjabi("mera nak")).toBe(canonicalizePunjabi("mera nakk"));
    expect(canonicalizePunjabi("mera nakh")).toBe(canonicalizePunjabi("mera nakk"));
  });

  it("rice chawal chawl chaul", () => {
    expect(canonicalizePunjabi("chawal")).toBe(canonicalizePunjabi("chawl"));
    expect(canonicalizePunjabi("chaul")).toBe(canonicalizePunjabi("chawl"));
  });

  it("past copula si sige siga san", () => {
    expect(canonicalizePunjabi("main thaka siga")).toBe(
      canonicalizePunjabi("main thaka si"),
    );
    expect(canonicalizePunjabi("main thaka san")).toBe(
      canonicalizePunjabi("main thaka si"),
    );
    expect(canonicalizePunjabi("oh darwaze te sige")).not.toBe(
      canonicalizePunjabi("oh darwaze te san"),
    );
    expect(answersMatch("oh darwaze te san", "oh darwaze te sige", true)).toBe(false);
  });

  it("houga hoga and kharidlya", () => {
    expect(canonicalizePunjabi("eh aukha hoga")).toBe(
      canonicalizePunjabi("eh aukha houga"),
    );
    expect(canonicalizePunjabi("ohne apne aap kharidlya")).toBe(
      canonicalizePunjabi("ohne apne aap kharidya"),
    );
  });

  it("optional leading ki on questions", () => {
    expect(canonicalizePunjabi("ki oh othe si")).toBe(
      canonicalizePunjabi("oh othe si"),
    );
    expect(canonicalizePunjabi("ki kar leya")).toBe(canonicalizePunjabi("kar leya"));
    expect(canonicalizePunjabi("kithe hai")).toBe(canonicalizePunjabi("kithe hai"));
  });

  it("gai in ho gya family", () => {
    expect(canonicalizePunjabi("der ho gai")).toBe(
      canonicalizePunjabi("der ho gayi"),
    );
    expect(canonicalizePunjabi("kyunki der ho gai")).toBe(
      canonicalizePunjabi("kyunki der ho gayi"),
    );
  });
});

describe("answersMatch", () => {
  it("punjabi canonical rules", () => {
    expect(answersMatch("ohnu dekho", "ehnu dekho", true)).toBe(true);
    expect(
      answersMatch("main darwaza band kar reha hun", "main darwaza band kar raha hun", true),
    ).toBe(true);
    expect(
      answersMatch("main ja rehi hun", "main ja raha hun", true),
    ).toBe(true);
    expect(
      answersMatch("main khaanga", "main khaunga", true),
    ).toBe(true);
    expect(answersMatch("khaunga", "main khaunga", true)).toBe(true);
    expect(answersMatch("khaoge", "tusi khaoge", true)).toBe(true);
    expect(answersMatch("main thaka hu", "main thaka hun", true)).toBe(true);
    expect(answersMatch("oh bhul gayi", "oh bhul gyi?", true)).toBe(true);
    expect(
      answersMatch("paani chaida hai", "mainu paani chaida hai", true),
    ).toBe(false);
  });
});

describe("rounds", () => {
  it("beast sample size caps at 10", () => {
    expect(beastSampleSize(100)).toBe(10);
    expect(beastSampleSize(3)).toBe(3);
  });

  it("medal tiers", () => {
    expect(medalForRound(10, 10)).toBe("🏅");
    expect(medalForRound(9, 10)).toBe("🥇");
    expect(medalForRound(8, 10)).toBe("🥈");
    expect(medalForRound(7, 10)).toBe("🥉");
  });

  it("process correct answer advances queue", () => {
    const rows = [
      { en: "a", lang: "b" },
      { en: "c", lang: "d" },
    ];
    let s = startRound(createInitialState(), rows, "en_to_lang");
    const idx = s.queue[0]!;
    s = processAnswer(s, rows[idx]!.lang);
    expect(s.lastFeedback?.[0]).toBe("correct");
    expect(s.queue.length).toBe(1);
  });
});

describe("parseCsv", () => {
  it("parses en,lang header", () => {
    const rows = parseCsv("en,lang\nhello,haan ji\n");
    expect(rows).toEqual([{ en: "hello", lang: "haan ji" }]);
  });

  it("handles quoted commas", () => {
    const rows = parseCsv('en,lang\n"foo, bar",baz\n');
    expect(rows[0]?.en).toBe("foo, bar");
  });
});
