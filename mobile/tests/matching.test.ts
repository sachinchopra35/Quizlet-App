import { describe, expect, it } from "vitest";
import {
  answersMatch,
  canonicalizePunjabi,
  normalize,
} from "../src/matching";
import {
  beastSampleSize,
  bestMedal,
  createInitialState,
  medalForRound,
  processAnswer,
  recordRoundMedal,
  startRound,
  completeRoundNaturally,
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

  it("seekh and sikh learn", () => {
    expect(canonicalizePunjabi("main seekh raha hun")).toBe(
      canonicalizePunjabi("main sikh raha hun"),
    );
    expect(answersMatch("main seekhna chahnda hun", "main sikhna chahnda hun", true)).toBe(
      true,
    );
  });

  it("sir and sil head", () => {
    expect(canonicalizePunjabi("mera sil dard kar raha hai")).toBe(
      canonicalizePunjabi("mera sir dard kar raha hai"),
    );
    expect(answersMatch("eh mera sil hai", "eh mera sir hai", true)).toBe(true);
  });

  it("mirchi tikha and tikka spice", () => {
    expect(canonicalizePunjabi("mainu mirchi pasand nahi")).toBe(
      canonicalizePunjabi("mainu tikha pasand nahi"),
    );
    expect(answersMatch("mainu tikka pasand nahi", "mainu mirchi pasand nahi", true)).toBe(
      true,
    );
    expect(answersMatch("mainu mirchi khana pasand nahi", "mainu tikha khana pasand nahi", true)).toBe(
      true,
    );
  });

  it("spaced lya past tense stems", () => {
    expect(canonicalizePunjabi("main bahut kha lya")).toBe(
      canonicalizePunjabi("main bahut khaya"),
    );
    expect(answersMatch("main bahut kha lya", "main bahut khaya", true)).toBe(true);
    expect(answersMatch("main eh ajj seekhlya", "main eh ajj sikhya", true)).toBe(true);
    expect(answersMatch("main eh ajj sikh leya", "main eh ajj sikhya", true)).toBe(true);
    expect(canonicalizePunjabi("main eh ajj sikh lya")).toBe(
      canonicalizePunjabi("main eh ajj sikhya"),
    );
    expect(canonicalizePunjabi("samajh nahi aa lya")).toBe(
      canonicalizePunjabi("samajh nahi aaya"),
    );
    expect(canonicalizePunjabi("main kha leya")).not.toBe(
      canonicalizePunjabi("main bahut khaya"),
    );
  });

  it("we pronoun apa and dative asanu", () => {
    expect(canonicalizePunjabi("apa sochde han ke oh aa jange")).toBe(
      canonicalizePunjabi("asi sochde han ke oh aa jange"),
    );
    expect(canonicalizePunjabi("appa sochde han ke oh aa jange")).toBe(
      canonicalizePunjabi("asi sochde han ke oh aa jange"),
    );
    expect(canonicalizePunjabi("asanu lagda hai ke oh aa jange")).toBe(
      canonicalizePunjabi("saade nu lagda hai ke oh aa jange"),
    );
    expect(canonicalizePunjabi("aapanu lagda hai ke oh aa jange")).toBe(
      canonicalizePunjabi("asanu lagda hai ke oh aa jange"),
    );
    expect(canonicalizePunjabi("saanu lagda hai ke oh aa jange")).toBe(
      canonicalizePunjabi("asanu lagda hai ke oh aa jange"),
    );
    expect(canonicalizePunjabi("asi nu lagda hai ke oh aa jange")).toBe(
      canonicalizePunjabi("asanu lagda hai ke oh aa jange"),
    );
    expect(answersMatch("asanu udeek karni paini hai", "sanu udeek karni paini hai?", true)).toBe(
      true,
    );
    expect(answersMatch("asanu jana paina hai", "sanu jana paina hai", true)).toBe(true);
    expect(canonicalizePunjabi("asi aapas vich gall karde han")).toBe(
      canonicalizePunjabi("asi aapas vich gall karde han"),
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
    expect(canonicalizePunjabi("tuhanu nahi karna paina")).toBe(
      canonicalizePunjabi("thuanu nahi karna paina"),
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

  it("bhi and vi also", () => {
    expect(answersMatch("thuanu bhi ehhi lagda hai", "thuanu vi ehhi lagda hai?", true)).toBe(
      true,
    );
    expect(canonicalizePunjabi("main abhi tak nahi khaya")).toBe(
      canonicalizePunjabi("main abhi tak nahi khaya"),
    );
  });

  it("bhukhe hungry spelling", () => {
    expect(answersMatch("asi bhookhe si", "asi bhukhe si", true)).toBe(true);
  });

  it("bookh bukh hunger noun, not bukhar fever", () => {
    expect(
      answersMatch(
        "kyunki mainu bukh lag rehi hai",
        "kyunki mainu bookh lag rahi hai",
        true,
      ),
    ).toBe(true);
    expect(answersMatch("mainu bhookh lag rahi hai", "mainu bookh lag rahi hai", true)).toBe(
      true,
    );
    expect(answersMatch("mainu bukhar hai", "mainu bukhar hai", true)).toBe(true);
    expect(answersMatch("mainu bukh hai", "mainu bukhar hai", true)).toBe(false);
  });

  it("itte/itthe/ithe and othe/otte here-there", () => {
    expect(canonicalizePunjabi("itte hai")).toBe(canonicalizePunjabi("itthe hai"));
    expect(canonicalizePunjabi("ithe hai")).toBe(canonicalizePunjabi("itte hai"));
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

  it("subject may come before or after time / place / with phrases", () => {
    expect(
      canonicalizePunjabi("main das mind baad agli bus te chadh gya"),
    ).toBe(canonicalizePunjabi("das minute baad main agli bus te chadh gya"));
    expect(
      answersMatch(
        "main das mind to baad agli bus te chadh gya",
        "das minute baad main agli bus te chadh gya",
        true,
      ),
    ).toBe(true);
    expect(canonicalizePunjabi("main phir toilet gya")).toBe(
      canonicalizePunjabi("phir main toilet gya"),
    );
    expect(canonicalizePunjabi("main bus te apni app naal punjabi sikhya")).toBe(
      canonicalizePunjabi("bus te main apni app naal punjabi sikhya"),
    );
    expect(answersMatch("par bandar rukh te chadh gya", "par bandar perh te chadh gya", true)).toBe(true);
    expect(answersMatch("rukh digg gya", "perh digg gya", true)).toBe(true);
    expect(answersMatch("asi kaam ton baad cinema gaye", "kaam ton baad asi cinema gaye", true)).toBe(
      true,
    );
    expect(
      answersMatch(
        "mera dost thakeya si is karke oh jaldi ghar chala gaya",
        "mera dost thaka si is karke oh jaldi ghar chala gya",
        true,
      ),
    ).toBe(true);
    expect(
      answersMatch("asi raat de tin vaje parathe khaye", "raat de tin baje asi parathe khaye", true),
    ).toBe(true);
    expect(
      answersMatch(
        "asi india gate te suraj nikalda dekhya",
        "asi India Gate te suraj nikalda dekheya",
        true,
      ),
    ).toBe(true);
    expect(
      answersMatch(
        "lunch bahut mazedaar si asanu bahut maza aa gya",
        "lunch bahut mazedaar si, sanu bahut maza aaya",
        true,
      ),
    ).toBe(true);
    expect(answersMatch("perh digg gya", "rukh digg gya", true)).toBe(true);
    expect(answersMatch("ik minute perho", "ik minute rukho", true)).toBe(false);
    expect(answersMatch("asi phir ice cream kharid leyi", "phir asi ice cream kharid leyi", true)).toBe(
      true,
    );
    expect(
      answersMatch(
        "main lunch vele apne dostan naal lodhi garden gya",
        "lunch vele main apne dostan naal Lodhi Garden gya",
        true,
      ),
    ).toBe(true);
    expect(
      answersMatch(
        "mera dost samose te chole bhature le ke aa gya",
        "mera dost samose te chole bhature le ke aaya",
        true,
      ),
    ).toBe(true);
    expect(canonicalizePunjabi("main bahut jaldi uth gya")).toBe(
      canonicalizePunjabi("bahut jaldi main uth gya"),
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
    expect(canonicalizePunjabi("paidal chaliye")).toBe(
      canonicalizePunjabi("paidal letsgo"),
    );
  });

  it("jaaie and chaliye let's-go cohortatives", () => {
    expect(canonicalizePunjabi("chalo ghar chaliye")).toBe(
      canonicalizePunjabi("chalo ghar jaaie"),
    );
    expect(canonicalizePunjabi("chalo baith jaaie")).toBe(
      canonicalizePunjabi("chalo baith chaliye"),
    );
    expect(answersMatch("bas te jaaie", "bas te chaliye", true)).toBe(true);
    expect(answersMatch("othe kinvein jaaie", "othe kinvein chaliye", true)).toBe(true);
    expect(canonicalizePunjabi("chalo ikathe khaaie")).toBe(
      canonicalizePunjabi("chalo ikathe khaaiye"),
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
    expect(canonicalizePunjabi("main hoo")).toBe(canonicalizePunjabi("main hun"));
    expect(canonicalizePunjabi("main kha raha hoo")).toBe(
      canonicalizePunjabi("main kha raha hun"),
    );
    expect(answersMatch("main sochda hoo ke oh janda hai", "main sochda hun ke oh janda hai", true)).toBe(
      true,
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
    expect(
      answersMatch(
        "oh mere naal doggy de baare gall karda hai",
        "oh mere naal kutte de baare gall karda hai",
        true,
      ),
    ).toBe(true);
    expect(
      answersMatch(
        "oh mere naal dog de baare gall karda hai",
        "oh mere naal kutte de baare gall karda hai",
        true,
      ),
    ).toBe(true);
    expect(
      answersMatch(
        "oh mere naal kutta de baare gall karda hai",
        "oh mere naal kutte de baare gall karda hai",
        true,
      ),
    ).toBe(true);
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
    expect(canonicalizePunjabi("eh okha houga")).toBe(
      canonicalizePunjabi("eh aukha houga"),
    );
    expect(canonicalizePunjabi("eh sokha houga")).toBe(
      canonicalizePunjabi("eh saukha houga"),
    );
    expect(answersMatch("sikhna okha hai", "sikhna aukha hai", true)).toBe(true);
    expect(canonicalizePunjabi("ohne apne aap kharidlya")).toBe(
      canonicalizePunjabi("ohne apne aap kharidya"),
    );
  });

  it("vocab round spelling variants", () => {
    expect(answersMatch("bachcha ro raha hai", "bacha ro raha hai", true)).toBe(true);
    expect(answersMatch("oh hoshiyar hai", "oh hushiyar hai", true)).toBe(true);
    expect(answersMatch("haule bolo", "hauli bolo", true)).toBe(true);
    expect(answersMatch("glass tut gya", "glass toot gya", true)).toBe(true);
    expect(answersMatch("eh tut gya", "eh toot gya", true)).toBe(true);
    expect(answersMatch("dariya doonga hai", "nadi doonga hai", true)).toBe(true);
    expect(answersMatch("ohde kes lambe ne", "ohde vaal lambe ne", true)).toBe(true);
    expect(answersMatch("ohde baal lambe ne", "ohde vaal lambe ne", true)).toBe(true);
    expect(answersMatch("apne kes brush kar lo", "apne vaal brush kar lo", true)).toBe(true);
    expect(answersMatch("oh takda hai", "oh takra hai", true)).toBe(true);
    expect(answersMatch("oh mazboot hai", "oh takra hai", true)).toBe(true);
    expect(answersMatch("khana sarh gya", "khana sar gya", true)).toBe(true);
    expect(answersMatch("khana sad gya", "khana sar gya", true)).toBe(true);
    expect(answersMatch("school nede hai", "school nere hai", true)).toBe(true);
    expect(answersMatch("asi kuch saap kharidange", "asi kuch sapp kharidange", true)).toBe(true);
    expect(answersMatch("glass toot gya", "glass tut gya", true)).toBe(true);
    expect(answersMatch("purana banda gusse ch hai", "budha banda gusse ch hai", true)).toBe(true);
    expect(answersMatch("main peenda hun", "main pinda hun", true)).toBe(true);
    expect(answersMatch("main kade kade chai pinda hun", "main kade kade chai peenda hun", true)).toBe(
      true,
    );
    expect(answersMatch("main jaldi jaldi khaya", "main jaldi jaldi kha leya", true)).toBe(true);
    expect(answersMatch("mera dost daal nahi kha leyi", "mera dost daal nahi khayi", true)).toBe(
      true,
    );
    expect(
      answersMatch("main apne dand brush kita", "main apne dand brush kar leye", true),
    ).toBe(true);
    expect(
      answersMatch(
        "main bahut late si is karke main bus miss kar dita",
        "main bahut late si is karke main bus miss kar diti",
        true,
      ),
    ).toBe(true);
    expect(
      answersMatch(
        "das mind baad main agli bus te chadh gya",
        "das minute baad main agli bus te chadh gya",
        true,
      ),
    ).toBe(true);
    expect(answersMatch("main bas lai bhaaj gya", "main bus lai bhaaj gya", true)).toBe(true);
    expect(answersMatch("bas te main apni app naal punjabi sikhya", "bus te main apni app naal punjabi sikhya", true)).toBe(
      true,
    );
    expect(
      answersMatch(
        "bas te main apni app de naal punjabi sikhya",
        "bus te main apni app naal punjabi sikhya",
        true,
      ),
    ).toBe(true);
    expect(answersMatch("oh der naal aaya", "oh der naal aa gya", true)).toBe(true);
    expect(answersMatch("bas ho gya", "bus ho gya", true)).toBe(false);
    expect(answersMatch("pher main toilet gya", "phir main toilet gya", true)).toBe(true);
    expect(answersMatch("phir main toilet gaya", "phir main toilet gya", true)).toBe(true);
    expect(answersMatch("main bahut jaldi uth gaya", "main bahut jaldi uth gya", true)).toBe(true);
    expect(answersMatch("main khaya", "main kha leya", true)).toBe(true);
    expect(answersMatch("bachche chup karke baithe ne", "bache chup karke baithe ne", true)).toBe(
      true,
    );
    expect(answersMatch("main naya phone kharideya", "main naya phone kharidya", true)).toBe(true);
    expect(answersMatch("nadi dunga hai", "nadi doonga hai", true)).toBe(true);
    expect(answersMatch("tusi kyun ro rehe ho", "tusi kyon ro rahe ho?", true)).toBe(true);
    expect(answersMatch("tusi kyu ro rahe ho", "tusi kyon ro rahe ho?", true)).toBe(true);
    expect(answersMatch("dukaan vich bahut bheed hai", "dukaan ch bahut bheed hai", true)).toBe(true);
    expect(answersMatch("dukaan te bahut bheed hai", "dukaan ch bahut bheed hai", true)).toBe(true);
    expect(answersMatch("driver der naal aa gya", "driver der naal aaya", true)).toBe(true);
    expect(answersMatch("oh der naal aa gaya", "oh der naal aaya", true)).toBe(true);
    expect(answersMatch("oh vapas aaya", "oh vapas aa gya", true)).toBe(true);
    expect(answersMatch("oh chala gya", "oh chalaya", true)).toBe(false);
    expect(answersMatch("asi der naal pahunchange", "asi der naal pahunch jaaange", true)).toBe(true);
    expect(answersMatch("asi jaldi pahunch jange", "asi jaldi pahunch jaaange", true)).toBe(true);
    expect(answersMatch("oh jaldi ghar pahunchega", "oh jaldi ghar pahunch jayega", true)).toBe(true);
    expect(answersMatch("oh kadon pahunch jaange?", "oh kadon pahunchange?", true)).toBe(true);
    expect(answersMatch("apne hath dhang naal dholo", "hath dhang naal dho lo", true)).toBe(true);
    expect(answersMatch("dand brush kar lo", "apne dand brush kar lo", true)).toBe(true);
    expect(answersMatch("main kursi te baithya hun", "main apni kursi te baithya hun", true)).toBe(
      true,
    );
    expect(answersMatch("aap naal gall karo", "apne aap naal gall karo", true)).toBe(false);
    expect(answersMatch("ohne jaldi khaya", "ohne jaldi jaldi khaya", true)).toBe(true);
    expect(answersMatch("hauli hauli bolo", "hauli bolo", true)).toBe(true);
    expect(answersMatch("main naya phone kharidya", "main nava phone kharidya", true)).toBe(true);
    expect(answersMatch("naya ghar", "nava ghar", true)).toBe(true);
    expect(answersMatch("kyonki main thaka si", "kyunki main thaka si", true)).toBe(true);
    expect(answersMatch("billi manje te sutti hai", "billi bistar te sutti hai", true)).toBe(
      true,
    );
    expect(answersMatch("main kade kade chai peenda hun", "main kade kade cha peenda hun", true)).toBe(
      true,
    );
  });

  it("conjugated verb level variants", () => {
    expect(answersMatch("main ik bandar vekhya", "main ik bandar dekhya", true)).toBe(true);
    expect(answersMatch("main so raha si", "main sutta si", true)).toBe(true);
    expect(answersMatch("oh kehnda hai ke oh thaka hai", "oh kehnda hai ki oh thaka hai", true)).toBe(
      true,
    );
    expect(answersMatch("main sochda hun ke oh aa jayegi", "main sochda hun ki oh aa jayegi", true)).toBe(
      true,
    );
    for (const [typed, answer] of [
      ["main ohnu tohfa dinda haan", "main ohnu tohfa dinda hun"],
      ["main apna homework kar reha haan", "main apna homework kar raha hun"],
      ["oh roz gym jandi hai", "oh har roz gym jaandi hai"],
      ["main tuhanu kal dasanga", "main tuhanu kal dassunga"],
      ["main ik chitthi likhanga", "main ik chitthi likhunga"],
      ["ohne mainu ik sawal puchya", "ohne mainu ik sawaal puchheya"],
      ["ohne mainu ik sawaal puchlya", "ohne mainu ik sawaal puchheya"],
      ["main bahut hasya", "main bahut hasseya"],
      ["main bhaj reha si", "main bhaj raha si"],
    ] as const) {
      expect(answersMatch(typed, answer, true)).toBe(true);
    }
    expect(answersMatch("khana changa hai", "khana chunga hai", true)).toBe(false);
  });

  it("noun level spelling variants", () => {
    for (const [typed, answer] of [
      ["meri ankh", "meri akh"],
      ["meri jindagi", "meri zindagi"],
      ["nava hospital", "nava hasptaal"],
      ["sadda gurudwara", "sadda gurdwara"],
      ["meri tankha", "meri tankhaah"],
      ["vadda kharch", "vadda kharcha"],
      ["mera bhai", "mera bhra"],
      ["meri behn", "meri bhain"],
      ["meri behen", "meri bhain"],
      ["meri bahin", "meri bhain"],
      ["mera veer", "mera bhra"],
      ["mera vir", "mera bhra"],
      ["vaddi company", "vaddi kampani"],
      ["usdi kudi", "ohdi kudi"],
      ["meri padai", "meri padhai"],
      ["garam rajai", "garam kambal"],
      ["garam razai", "garam kambal"],
      ["vadda sheher", "vadda shehar"],
      ["mashhoor sheher", "mashhoor shehar"],
    ] as const) {
      expect(answersMatch(typed, answer, true)).toBe(true);
    }
    expect(answersMatch("lamba banda", "lamba aadmi", true)).toBe(true);
    expect(answersMatch("budha aadmi gusse ch hai", "budha banda gusse ch hai", true)).toBe(true);
    expect(answersMatch("ik bandar thalle aa gya", "ik aadmi thalle aa gya", true)).toBe(false);
    expect(answersMatch("mera bhra", "meri bhain", true)).toBe(false);
    expect(answersMatch("ohda puttar", "ohda munda", true)).toBe(true);
    expect(answersMatch("ohda putar", "ohda munda", true)).toBe(true);
    expect(answersMatch("ohda munda", "ohdi kudi", true)).toBe(false);
  });

  it("adjective level spelling variants", () => {
    for (const [typed, answer] of [
      ["kimti tohfa", "keemti tohfa"],
      ["zaroori gall", "jaroori gall"],
      ["muft khana", "mufat khana"],
      ["pheeki daal", "phikki daal"],
      ["kachcha kela", "kacha kela"],
      ["tutta phone", "tutteya phone"],
      ["bewkoof banda", "bewakoof banda"],
      ["surakshit ghar", "surakhit ghar"],
      ["pura mahina", "poora mahina"],
      ["mehangi gaddi", "mehngi gaddi"],
    ] as const) {
      expect(answersMatch(typed, answer, true)).toBe(true);
    }
    expect(answersMatch("mehngi gaddi", "sasti gaddi", true)).toBe(false);
  });

  it("bare infinitive spelling variants", () => {
    for (const [typed, answer] of [
      ["sona", "sauna"],
      ["aana", "aauna"],
      ["pina", "peena"],
      ["khelna", "khedna"],
      ["khareedna", "kharidna"],
      ["madat karna", "madad karna"],
      ["rahna", "rehna"],
      ["samjhna", "samajhna"],
      ["khada hona", "khalona"],
      ["hassna", "hasna"],
      ["padhna", "parhna"],
    ] as const) {
      expect(answersMatch(typed, answer, true)).toBe(true);
    }
  });

  it("imperative lo and do endings", () => {
    expect(answersMatch("pakha chala lo", "pakha chala do", true)).toBe(true);
    expect(answersMatch("parde kholo", "parde khol do", true)).toBe(true);
    expect(answersMatch("darwaza kholo", "darwaza khol do", true)).toBe(true);
    expect(answersMatch("mainu paise de lo", "mainu paise de do", true)).toBe(true);
    expect(answersMatch("bottle bhar lo", "bottle bhar do", true)).toBe(true);
    expect(answersMatch("ehnu dedo", "ehnu de do", true)).toBe(true);
  });

  it("future be: ho jaa- and hou- copula are equivalent", () => {
    expect(canonicalizePunjabi("eh theek ho jayega")).toBe(
      canonicalizePunjabi("eh theek houga"),
    );
    expect(canonicalizePunjabi("eh theek hoga")).toBe(
      canonicalizePunjabi("eh theek ho jayega"),
    );
    expect(canonicalizePunjabi("main tyaar ho jaaunga")).toBe(
      canonicalizePunjabi("main tyaar hounga"),
    );
    expect(canonicalizePunjabi("main late ho jaaunga")).toBe(
      canonicalizePunjabi("main late hounga"),
    );
    expect(canonicalizePunjabi("asi theek ho jaaange")).toBe(
      canonicalizePunjabi("asi theek houange"),
    );
    expect(canonicalizePunjabi("tusi othe ho jaaoge")).toBe(
      canonicalizePunjabi("tusi othe hoge"),
    );
    expect(canonicalizePunjabi("tusi othe houge")).toBe(
      canonicalizePunjabi("tusi othe hoge"),
    );
    expect(canonicalizePunjabi("oh tyaar ho jayegi")).toBe(
      canonicalizePunjabi("oh tyaar hogi"),
    );
    expect(canonicalizePunjabi("oh tyaar ho jange")).toBe(
      canonicalizePunjabi("oh tyaar honge"),
    );
    expect(canonicalizePunjabi("eh aukha ho jayega")).toBe(
      canonicalizePunjabi("eh aukha houga"),
    );
  });

  it("future be: does not rewrite motion futures", () => {
    expect(canonicalizePunjabi("oh pahunch jayega")).toBe(
      canonicalizePunjabi("oh pahunch jayega"),
    );
    expect(canonicalizePunjabi("main aa jaaunga")).toBe(
      canonicalizePunjabi("main aa jaaunga"),
    );
    expect(canonicalizePunjabi("oh ajj raat othe pahunch jange")).toBe(
      canonicalizePunjabi("oh ajj raat othe pahunch jange"),
    );
    expect(
      answersMatch("main aa jaaunga", "main tyaar hounga", true),
    ).toBe(false);
  });

  it("optional leading ki on questions", () => {
    expect(canonicalizePunjabi("ki oh othe si")).toBe(
      canonicalizePunjabi("oh othe si"),
    );
    expect(canonicalizePunjabi("ki kar leya")).toBe(canonicalizePunjabi("kar leya"));
    expect(canonicalizePunjabi("ki kar rahe ho")).toBe(
      canonicalizePunjabi("tusi ki kar rahe ho"),
    );
    expect(canonicalizePunjabi("kithe hai")).toBe(canonicalizePunjabi("kithe hai"));
  });

  it("optional leading eh on adjective phrases", () => {
    expect(canonicalizePunjabi("vadda hai")).toBe(canonicalizePunjabi("eh vadda hai"));
    expect(canonicalizePunjabi("nava hai")).toBe(canonicalizePunjabi("eh nava hai"));
    expect(canonicalizePunjabi("changa hai")).toBe(canonicalizePunjabi("oh changa hai"));
  });

  it("gai in ho gya family", () => {
    expect(canonicalizePunjabi("der ho gai")).toBe(
      canonicalizePunjabi("der ho gayi"),
    );
    expect(canonicalizePunjabi("kyunki der ho gai")).toBe(
      canonicalizePunjabi("kyunki der ho gayi"),
    );
  });

  it("car gaddi and gaadi", () => {
    expect(canonicalizePunjabi("meri gaddi")).toBe(canonicalizePunjabi("meri car"));
    expect(canonicalizePunjabi("laal gaadi")).toBe(canonicalizePunjabi("laal car"));
  });

  it("roz and har din", () => {
    expect(canonicalizePunjabi("roz")).toBe(canonicalizePunjabi("har din"));
    expect(canonicalizePunjabi("main roz janda hun")).toBe(
      canonicalizePunjabi("main har din janda hun"),
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
    expect(medalForRound(10, 10)).toBe("🥇");
    expect(medalForRound(9, 10)).toBe("🥈");
    expect(medalForRound(8, 10)).toBe("🥉");
    expect(medalForRound(7, 10)).toBe("🥉");
  });

  it("bestMedal keeps the higher tier", () => {
    expect(
      bestMedal({ emoji: "🥇", label: "10/10" }, { emoji: "🥈", label: "9/10" }),
    ).toEqual({ emoji: "🥇", label: "10/10" });
    expect(
      bestMedal({ emoji: "🥉", label: "7/10" }, { emoji: "🥈", label: "9/10" }),
    ).toEqual({ emoji: "🥈", label: "9/10" });
  });

  it("bestMedal prefers higher accuracy within the same tier", () => {
    expect(
      bestMedal({ emoji: "🥉", label: "7/10" }, { emoji: "🥉", label: "8/10" }),
    ).toEqual({ emoji: "🥉", label: "8/10" });
  });

  it("recordRoundMedal does not downgrade an existing medal", () => {
    const state = {
      ...createInitialState(),
      selectedCsv: "01 Numbers.csv",
      levelMedals: { "01 Numbers.csv": { emoji: "🥇", label: "10/10" } },
    };
    const next = recordRoundMedal(state, 9, 10);
    expect(next.levelMedals["01 Numbers.csv"]).toEqual({ emoji: "🥇", label: "10/10" });
  });

  it("letmewin100 cheat clears the queue with a perfect score", () => {
    const rows = [
      { en: "a", lang: "b" },
      { en: "c", lang: "d" },
    ];
    let s = startRound(createInitialState(), rows, "en_to_lang");
    s = processAnswer(s, "letmewin100");
    expect(s.queue).toEqual([]);
    expect(Object.values(s.firstAttemptOk)).toEqual([true, true]);
    const completed = completeRoundNaturally(s);
    expect(completed.levelMedals).toEqual({});
    expect(completed.roundMessage).toContain("2 / 2");
  });

  it("letmewin90/80 cheats set first-try scores for medal tiers", () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      en: `e${i}`,
      lang: `p${i}`,
    }));
    let s = startRound({ ...createInitialState(), selectedCsv: "01 Numbers.csv" }, rows, "en_to_lang");

    s = processAnswer(s, "letmewin90");
    expect(Object.values(s.firstAttemptOk).filter(Boolean)).toHaveLength(9);
    let done = completeRoundNaturally(s);
    expect(done.levelMedals["01 Numbers.csv"]).toEqual({ emoji: "🥈", label: "9/10" });

    s = startRound({ ...createInitialState(), selectedCsv: "01 Numbers.csv" }, rows, "en_to_lang");
    s = processAnswer(s, "letmewin80");
    expect(Object.values(s.firstAttemptOk).filter(Boolean)).toHaveLength(8);
    done = completeRoundNaturally(s);
    expect(done.levelMedals["01 Numbers.csv"]).toEqual({ emoji: "🥉", label: "8/10" });
  });

  it("letmewin90 on thirteen questions scores 12/13", () => {
    const rows = Array.from({ length: 13 }, (_, i) => ({ en: `e${i}`, lang: `p${i}` }));
    let s = startRound(createInitialState(), rows, "en_to_lang");
    s = processAnswer(s, "letmewin90");
    expect(Object.values(s.firstAttemptOk).filter(Boolean)).toHaveLength(12);
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
