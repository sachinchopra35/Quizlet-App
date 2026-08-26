import unittest

from vocab_quiz.matching import answers_match, canonicalize_punjabi, normalize


class TestNormalize(unittest.TestCase):
    def test_ignores_spaces_and_punctuation(self) -> None:
        self.assertEqual(normalize("mainu pani dedo"), normalize("mainupanidedo"))
        self.assertEqual(normalize("ehnu dedo?"), normalize("ehnudedo"))

    def test_does_not_collapse_doubled_letters(self) -> None:
        self.assertNotEqual(normalize("ehhnudedo"), normalize("ehnudedo"))


class TestCanonicalizePunjabi(unittest.TestCase):
    def test_collapses_doubled_letters(self) -> None:
        self.assertEqual(canonicalize_punjabi("ehhnudedo"), canonicalize_punjabi("ehnu dedo"))

    def test_eh_oh_interchange_within_words(self) -> None:
        self.assertEqual(canonicalize_punjabi("ehnu"), canonicalize_punjabi("ohnu"))
        self.assertEqual(canonicalize_punjabi("eh"), canonicalize_punjabi("oh"))

    def test_usnu_ohnu_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("usnu"), canonicalize_punjabi("ohnu"))
        self.assertEqual(
            canonicalize_punjabi("usnu na dekho"),
            canonicalize_punjabi("ohnu na dekho"),
        )

    def test_negative_imperative_kar_karo(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("intezaar na karo"),
            canonicalize_punjabi("intezaar na kar"),
        )
        self.assertEqual(
            canonicalize_punjabi("darwaza band na karo"),
            canonicalize_punjabi("darwaza band na kar"),
        )

    def test_intezaar_udeek_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("mera intezaar karo"),
            canonicalize_punjabi("mera udeek karo"),
        )
        self.assertEqual(
            canonicalize_punjabi("main udeek karda hun"),
            canonicalize_punjabi("main intezaar karda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("intezaar na kar"),
            canonicalize_punjabi("udeek na kar"),
        )

    def test_mez_table_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("kitab mez te hai"),
            canonicalize_punjabi("kitab table te hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("doggy mez de niche hai"),
            canonicalize_punjabi("doggy table de niche hai"),
        )

    def test_vich_ch_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("apniyan akhan vich eyedrop"),
            canonicalize_punjabi("apniyan akhan ch eyedrop"),
        )

    def test_nahi_nahin_not(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main kade nahin janda"),
            canonicalize_punjabi("main kade nahi janda"),
        )
        self.assertEqual(
            canonicalize_punjabi("main nahin janda"),
            canonicalize_punjabi("main nahi janda"),
        )

    def test_itte_itthe_and_othe_otte_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("itte hai"),
            canonicalize_punjabi("itthe hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("otte jaaie"),
            canonicalize_punjabi("othe jaaie"),
        )
        self.assertEqual(
            canonicalize_punjabi("otte kinvein jaaie"),
            canonicalize_punjabi("othe kivein jaaie"),
        )
        self.assertEqual(
            canonicalize_punjabi("main eh kivein karda hun"),
            canonicalize_punjabi("main eh kinvein karda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("chalo ikathe khaaie"),
            canonicalize_punjabi("chalo kathe khaaie"),
        )
        self.assertEqual(
            canonicalize_punjabi("asi ikathe ja rahe han"),
            canonicalize_punjabi("asi katha ja rahe han"),
        )
        self.assertEqual(
            canonicalize_punjabi("asi ikathe chal gye"),
            canonicalize_punjabi("asi ikatha chal gye"),
        )
        self.assertEqual(
            canonicalize_punjabi("mere pair dard kar rahe ne"),
            canonicalize_punjabi("mere paer dard kar rahe ne"),
        )
        self.assertEqual(
            canonicalize_punjabi("kitthe hai"),
            canonicalize_punjabi("kithe hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("kitthe utarna hai"),
            canonicalize_punjabi("kithe utarna hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("itte rakh lo"),
            canonicalize_punjabi("itthe rakh lo"),
        )
        self.assertEqual(
            canonicalize_punjabi("othe hai"),
            canonicalize_punjabi("otthe hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("othe hai"),
            canonicalize_punjabi("otte hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("othe rakh lo"),
            canonicalize_punjabi("otte rakh lo"),
        )

    def test_ik_minute_mind_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("ik minute rukho"),
            canonicalize_punjabi("ik mind rukho"),
        )
        self.assertEqual(
            canonicalize_punjabi("ik minute"),
            canonicalize_punjabi("ik mind"),
        )

    def test_ik_ek_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("ik"), canonicalize_punjabi("ek"))
        self.assertEqual(
            canonicalize_punjabi("ik minute rukho"),
            canonicalize_punjabi("ek minute rukho"),
        )
        self.assertEqual(
            canonicalize_punjabi("tuhade kol ik minute hai"),
            canonicalize_punjabi("tuhade kol ek minute hai"),
        )
        self.assertNotEqual(canonicalize_punjabi("le ke rakh do"), canonicalize_punjabi("lik rakh do"))

    def test_ton_toh_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main ghar ton kaam kar raha hun"),
            canonicalize_punjabi("main ghar toh kaam kar raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("maitoh lelo"),
            canonicalize_punjabi("maiton lelo"),
        )
        self.assertEqual(
            canonicalize_punjabi("eh toh lelo"),
            canonicalize_punjabi("eh ton lelo"),
        )

    def test_postposition_de_to_baad_and_pehla(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("gym to baad main thak gya"),
            canonicalize_punjabi("gym de baad main thak gya"),
        )
        self.assertEqual(
            canonicalize_punjabi("main ghar ton kaam kar raha hun"),
            canonicalize_punjabi("main ghar to kaam kar raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main kaam ton pehla khaunga"),
            canonicalize_punjabi("main kaam de pehla khaunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main kaam ton pehla khaunga"),
            canonicalize_punjabi("main kaam to pehla khaunga"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("doggy table de niche hai"),
            canonicalize_punjabi("doggy table to niche hai"),
        )

    def test_agar_je_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("agar tusi aaoge taan asi khaange"),
            canonicalize_punjabi("je tusi aaoge taan asi khaange"),
        )
        self.assertEqual(
            canonicalize_punjabi("ki hove je?"),
            canonicalize_punjabi("ki hove agar?"),
        )
        self.assertEqual(
            canonicalize_punjabi("je nahi taan koi gal nahi"),
            canonicalize_punjabi("agar nahi taan koi gal nahi"),
        )

    def test_chahde_ho_chaho_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("je tusi chaho taan aao"),
            canonicalize_punjabi("je tusi chahde ho taan aao"),
        )
        self.assertEqual(
            canonicalize_punjabi("tusi kitthe khana chaho?"),
            canonicalize_punjabi("tusi kitthe khana chahde ho?"),
        )
        self.assertEqual(
            canonicalize_punjabi("tusi bahar khana chaho"),
            canonicalize_punjabi("tusi bahar khana chahde ho"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("asi khana chahde han"),
            canonicalize_punjabi("asi khana chaho"),
        )

    def test_ie_iye_cohortative_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("chalo ikathe khaaie"),
            canonicalize_punjabi("chalo ikathe khaaiye"),
        )
        self.assertEqual(
            canonicalize_punjabi("chalo ghoom ke aaiye"),
            canonicalize_punjabi("chalo ghoom ke aaie"),
        )
        self.assertEqual(
            canonicalize_punjabi("paidal chaliye"),
            canonicalize_punjabi("paidal chalie"),
        )
        self.assertEqual(
            canonicalize_punjabi("table book karie"),
            canonicalize_punjabi("table book kariye"),
        )

    def test_karda_karnda_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main karda hun"),
            canonicalize_punjabi("main karnda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main eh bahut pasand karda hun"),
            canonicalize_punjabi("main eh bahut pasand karnda hun"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("paani thanda hai"),
            canonicalize_punjabi("paani thada hai"),
        )

    def test_habitual_nda_da_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main chai chahda hun"),
            canonicalize_punjabi("main chai chahnda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main piano vajada hun"),
            canonicalize_punjabi("main piano vajanda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main jada hun"),
            canonicalize_punjabi("main janda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main eh kivein kehda hun"),
            canonicalize_punjabi("main eh kivein kehnda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("eh kivein kehde ho"),
            canonicalize_punjabi("eh kivein kehnde ho"),
        )
        self.assertEqual(
            canonicalize_punjabi("oh kade masah nahi khandi"),
            canonicalize_punjabi("oh kade masah nahi khadi"),
        )
        self.assertEqual(
            canonicalize_punjabi("oh kabhi kabhi call karndi hai"),
            canonicalize_punjabi("oh kabhi kabhi call kardi hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("main kabhi kabhi tureda hun"),
            canonicalize_punjabi("main kabhi kabhi turda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("asi kade bahar nahi khade"),
            canonicalize_punjabi("asi kade bahar nahi khande"),
        )
        self.assertEqual(
            canonicalize_punjabi("main kade nahi janda"),
            canonicalize_punjabi("main kade nahi jada"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("paani thanda hai"),
            canonicalize_punjabi("andar aa jao"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("main tandarust hun"),
            canonicalize_punjabi("main tadarust hun"),
        )

    def test_plural_ian_iyan_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("meriyan unglian thandian ne"),
            canonicalize_punjabi("meriyan ungliyan thandiyan ne"),
        )
        self.assertEqual(
            canonicalize_punjabi("meriyan akhhan gol ne"),
            canonicalize_punjabi("merian akhhan gol ne"),
        )
        self.assertEqual(
            canonicalize_punjabi("main apniyan akhan vich eyedrop paa lo"),
            canonicalize_punjabi("main apnian akhan vich eyedrop paa lo"),
        )

    def test_vich_ch_does_not_break_ch_prefix_words(self) -> None:
        self.assertEqual(canonicalize_punjabi("chaku"), canonicalize_punjabi("chaku"))
        self.assertNotEqual(canonicalize_punjabi("chaku"), canonicalize_punjabi("vaku"))

    def test_menu_mainu_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("menu paani chaida hai"),
            canonicalize_punjabi("mainu paani chaida hai"),
        )

    def test_mai_main_interchange_at_start_only(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("mai thaka hun"),
            canonicalize_punjabi("main thaka hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("mainu paani chaida hai"),
            canonicalize_punjabi("mainu paani chaida hai"),
        )

    def test_hai_haan_aa_copula_endings(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("mainu bookh lag rahi hai"),
            canonicalize_punjabi("mainu bookh lag rahi haan"),
        )
        self.assertEqual(
            canonicalize_punjabi("mainu bookh lag rahi hai"),
            canonicalize_punjabi("mainu bookh lag rahi aa"),
        )
        self.assertEqual(canonicalize_punjabi("sab theek hai"), canonicalize_punjabi("sab theek aa"))
        self.assertNotEqual(canonicalize_punjabi("mere naal aa"), canonicalize_punjabi("mere naal hai"))

    def test_r_d_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("khirki"), canonicalize_punjabi("khidki"))

    def test_i_am_suffixes(self) -> None:
        base = "main darwaza band kar raha"
        self.assertEqual(
            canonicalize_punjabi(f"{base} hun"),
            canonicalize_punjabi(f"{base} hoon"),
        )
        self.assertEqual(
            canonicalize_punjabi(f"{base} hun"),
            canonicalize_punjabi(f"{base} hoo"),
        )
        self.assertEqual(
            canonicalize_punjabi(f"{base} hun"),
            canonicalize_punjabi(f"{base} hu"),
        )

    def test_leya_lya_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("kha leya"), canonicalize_punjabi("kha lya"))
        self.assertEqual(canonicalize_punjabi("main kha leya"), canonicalize_punjabi("main kha lya"))
        self.assertEqual(canonicalize_punjabi("pee liya"), canonicalize_punjabi("pee leya"))

    def test_leyi_feminine_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("call kar leya"), canonicalize_punjabi("call kar leyi"))
        self.assertEqual(canonicalize_punjabi("kha leyi"), canonicalize_punjabi("kha leya"))
        self.assertEqual(canonicalize_punjabi("call kar lyi"), canonicalize_punjabi("call kar leya"))

    def test_leye_plural_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("kha leye"), canonicalize_punjabi("kha leya"))
        self.assertEqual(
            canonicalize_punjabi("ohna ne kha leye"),
            canonicalize_punjabi("ohna ne kha leya"),
        )

    def test_gyi_gya_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("so gya"), canonicalize_punjabi("so gyi"))
        self.assertEqual(canonicalize_punjabi("bhul gya"), canonicalize_punjabi("bhul gyi"))
        self.assertEqual(canonicalize_punjabi("ho gya?"), canonicalize_punjabi("ho gyi?"))
        self.assertEqual(canonicalize_punjabi("main so gya"), canonicalize_punjabi("main so gyi"))
        self.assertEqual(canonicalize_punjabi("oh bhul gyi"), canonicalize_punjabi("oh bhul gayi"))
        self.assertEqual(canonicalize_punjabi("oh bhul gya"), canonicalize_punjabi("oh bhul gaya"))
        self.assertEqual(
            canonicalize_punjabi("oh jaldi chal gye"),
            canonicalize_punjabi("oh jaldi chal gaye"),
        )
        self.assertEqual(
            canonicalize_punjabi("der kyon ho gayi"),
            canonicalize_punjabi("der kyon ho gyi"),
        )

    def test_garam_garm_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("garam kar lo"),
            canonicalize_punjabi("garm kar lo"),
        )

    def test_reha_raha_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main darwaza band kar reha hun"),
            canonicalize_punjabi("main darwaza band kar raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("mainu bookh lag rehi hai"),
            canonicalize_punjabi("mainu bookh lag rahi hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("oh ki kar reha hai"),
            canonicalize_punjabi("oh ki kar raha hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("main ja rehi hun"),
            canonicalize_punjabi("main ja rahi hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main ja rehi hun"),
            canonicalize_punjabi("main ja raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("asi kha rehe han"),
            canonicalize_punjabi("asi kha rahe han"),
        )
        self.assertEqual(
            canonicalize_punjabi("main ja rehe hun"),
            canonicalize_punjabi("main ja raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("oh aa rehe ne"),
            canonicalize_punjabi("oh aa rahe ne"),
        )

    def test_future_spelling_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main khaanga"),
            canonicalize_punjabi("main khaunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main peeanga"),
            canonicalize_punjabi("main peeunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main jaaunga"),
            canonicalize_punjabi("main jaanga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main thuanu call karanga"),
            canonicalize_punjabi("main thuanu call karunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main thuanu call kranga"),
            canonicalize_punjabi("main thuanu call karunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main udeek karanga"),
            canonicalize_punjabi("main udeek karunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("jaldi aa janga"),
            canonicalize_punjabi("jaldi aa jaaunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main jaldi bhej dauga"),
            canonicalize_punjabi("main jaldi bhej daunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main tenu call karunga"),
            canonicalize_punjabi("main thuanu call karunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("tusi ki kroge"),
            canonicalize_punjabi("tusi ki karoge"),
        )
        self.assertEqual(
            canonicalize_punjabi("tusi kadon aaonge"),
            canonicalize_punjabi("tusi kadon aaoge"),
        )
        self.assertEqual(
            canonicalize_punjabi("tusi ki karonge"),
            canonicalize_punjabi("tusi ki karoge"),
        )
        self.assertEqual(
            canonicalize_punjabi("tusi khaonge"),
            canonicalize_punjabi("tusi khaoge"),
        )
        self.assertTrue(
            answers_match("tusi aaonge", "tusi aaoge", punjabi=True),
        )
        self.assertTrue(
            answers_match("tusi call karonge", "tusi call karoge", punjabi=True),
        )

    def test_pee_pi_drink_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("chai peeoge"),
            canonicalize_punjabi("cha pioge"),
        )
        self.assertEqual(
            canonicalize_punjabi("main peeunga"),
            canonicalize_punjabi("main piunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("main pee leya"),
            canonicalize_punjabi("main pi leya"),
        )
        self.assertEqual(
            canonicalize_punjabi("hor paani pio"),
            canonicalize_punjabi("hor paani pee"),
        )
        self.assertEqual(
            canonicalize_punjabi("chalo chai peeie"),
            canonicalize_punjabi("chalo cha piee"),
        )

    def test_chai_cha_tea_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main chai chahnda hun"),
            canonicalize_punjabi("main cha chahnda hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("mainu chai chaidi hai"),
            canonicalize_punjabi("mainu cha chaidi hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("main chai banaunga"),
            canonicalize_punjabi("main cha banaunga"),
        )

    def test_taiyaar_tyaar_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("khana taiyaar hai"),
            canonicalize_punjabi("khana tyaar hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("main tyaar hun"),
            canonicalize_punjabi("main taiyaar hun"),
        )

    def test_rakh_lo_do_interchange(self) -> None:
        self.assertEqual(canonicalize_punjabi("itte rakh lo"), canonicalize_punjabi("itte rakh do"))
        self.assertEqual(
            canonicalize_punjabi("le ke othe rakh do"),
            canonicalize_punjabi("le ke othe rakh lo"),
        )

    def test_rakh_lo_do_does_not_generalize(self) -> None:
        self.assertNotEqual(canonicalize_punjabi("kar do"), canonicalize_punjabi("kar lo"))

    def test_tuada_possessive_spellings(self) -> None:
        masc_variants = ("thuadha", "tuadha", "tuhada", "tuada", "thuada", "tusadha", "tusada")
        for variant in masc_variants:
            self.assertEqual(canonicalize_punjabi(variant), canonicalize_punjabi("tuadha"))
        fem_variants = ("thuadi", "tuadi", "tuhadi", "tuadhi", "thuadhi", "tusadi", "tusadhi")
        for variant in fem_variants:
            self.assertEqual(canonicalize_punjabi(variant), canonicalize_punjabi("tuadhi"))

    def test_tuade_oblique_and_kol_spellings(self) -> None:
        oblique_variants = ("tuhade", "thuadhe", "tuade", "thuade", "tusade", "tusadhe")
        for variant in oblique_variants:
            self.assertEqual(canonicalize_punjabi(variant), canonicalize_punjabi("tuade"))
        self.assertEqual(
            canonicalize_punjabi("tuhade kol dudh hai"),
            canonicalize_punjabi("thuadhe kol dudh hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("tuhade kol dudh hai"),
            canonicalize_punjabi("thuadha kol dudh hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("tuhade kol dudh hai"),
            canonicalize_punjabi("thuadhi kol dudh hai"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("thuadha kam karo"),
            canonicalize_punjabi("tuade kam karo"),
        )

    def test_optional_leading_eh_oh(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("kitchen vich hai"),
            canonicalize_punjabi("eh kitchen vich hai"),
        )
        self.assertEqual(
            canonicalize_punjabi("kitthe hai"),
            canonicalize_punjabi("oh kitthe hai"),
        )

    def test_optional_leading_eh_oh_preserves_pronouns(self) -> None:
        self.assertNotEqual(
            canonicalize_punjabi("ehnu dedo"),
            canonicalize_punjabi("nu dedo"),
        )
        self.assertEqual(
            canonicalize_punjabi("eh na lo"),
            canonicalize_punjabi("eh na lo"),
        )

    def test_optional_leading_subject_pronouns(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("khaunga"),
            canonicalize_punjabi("main khaunga"),
        )
        self.assertEqual(
            canonicalize_punjabi("khaoge"),
            canonicalize_punjabi("tusi khaoge"),
        )
        self.assertEqual(
            canonicalize_punjabi("kadon aaoge"),
            canonicalize_punjabi("tusi kadon aaoge"),
        )
        self.assertEqual(
            canonicalize_punjabi("thaka hun"),
            canonicalize_punjabi("main thaka hu"),
        )

    def test_optional_leading_subject_pronouns_preserves_mainu(self) -> None:
        self.assertNotEqual(
            canonicalize_punjabi("paani chaida hai"),
            canonicalize_punjabi("mainu paani chaida hai"),
        )

    def test_plural_auxiliary_han_ne_hain(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("oh aa rahe han"),
            canonicalize_punjabi("oh aa rahe ne"),
        )
        self.assertEqual(
            canonicalize_punjabi("oh living room vich baithye han"),
            canonicalize_punjabi("oh living room vich baithye ne"),
        )
        self.assertEqual(
            canonicalize_punjabi("asi kha rahe hain"),
            canonicalize_punjabi("asi kha rahe han"),
        )
        self.assertEqual(
            canonicalize_punjabi("asi late hain"),
            canonicalize_punjabi("asi late han"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("asi kha rahe ne"),
            canonicalize_punjabi("asi kha rahe han"),
        )

    def test_optional_trailing_hun(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main so gya"),
            canonicalize_punjabi("main so gya hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main chala gya"),
            canonicalize_punjabi("main chala gya hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main thaka"),
            canonicalize_punjabi("main thaka hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main darwaza band kar raha"),
            canonicalize_punjabi("main darwaza band kar raha hun"),
        )

    def test_karo_kar_dena_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("pahunch ke call karo"),
            canonicalize_punjabi("pahunch ke call kar dena"),
        )
        self.assertEqual(
            canonicalize_punjabi("ghar pahunch ke message karo"),
            canonicalize_punjabi("ghar pahunch ke message kar dena"),
        )

    def test_baitho_baith_jao_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("sofa te baitho"),
            canonicalize_punjabi("sofa te baith jao"),
        )
        self.assertEqual(
            canonicalize_punjabi("aa ke baith jao"),
            canonicalize_punjabi("aa ke baitho"),
        )

    def test_baithya_baith_raha_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main sofa te baithya hun"),
            canonicalize_punjabi("main sofa te baith raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main kursi te baithya hun"),
            canonicalize_punjabi("main kursi te baith rahi hun"),
        )

    def test_let_lo_jao_and_letya_raha_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("mere bistar te let lo"),
            canonicalize_punjabi("mere bistar te let jao"),
        )
        self.assertEqual(
            canonicalize_punjabi("main apne bistar te letya hun"),
            canonicalize_punjabi("main apne bistar te let raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main apne bistar te leta hun"),
            canonicalize_punjabi("main apne bistar te let rahi hun"),
        )

    def test_so_lo_jao_and_sutta_raha_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("mere bistar te so lo"),
            canonicalize_punjabi("mere bistar te so jao"),
        )
        self.assertEqual(
            canonicalize_punjabi("main apne bistar te sutta hun"),
            canonicalize_punjabi("main apne bistar te so raha hun"),
        )
        self.assertEqual(
            canonicalize_punjabi("main apne bistar te sutta hun"),
            canonicalize_punjabi("main apne bistar te so rahi hun"),
        )

    def test_aa_jao_ao_aao_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("aa jao"),
            canonicalize_punjabi("ao"),
        )
        self.assertEqual(
            canonicalize_punjabi("aa jao"),
            canonicalize_punjabi("aao"),
        )
        self.assertEqual(
            canonicalize_punjabi("kar ke aa jao"),
            canonicalize_punjabi("kar ke ao"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("tusi aaoge"),
            canonicalize_punjabi("tusi ao"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("let jao"),
            canonicalize_punjabi("ao"),
        )

    def test_compound_aa_future_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("oh ajj raat aa jayegi"),
            canonicalize_punjabi("oh ajj raat aayegi"),
        )
        self.assertEqual(
            canonicalize_punjabi("oh baad vich aa jauga"),
            canonicalize_punjabi("oh baad vich aauga"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("main aaungi"),
            canonicalize_punjabi("oh ajj raat aayegi"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("main aaunga"),
            canonicalize_punjabi("oh baad vich aauga"),
        )

    def test_kinne_baje_han_ne_interchange(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("kinne baje han?"),
            canonicalize_punjabi("kinne baje ne?"),
        )
        self.assertEqual(
            canonicalize_punjabi("kinne baje hain"),
            canonicalize_punjabi("kinne baje han"),
        )

    def test_trailing_lo_o_imperatives(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("chaku varto"),
            canonicalize_punjabi("chaku vart lo"),
        )
        self.assertEqual(
            canonicalize_punjabi("meri kursi te baitho"),
            canonicalize_punjabi("meri kursi te baith lo"),
        )
        self.assertEqual(
            canonicalize_punjabi("shower le lo"),
            canonicalize_punjabi("shower lelo"),
        )


class TestAnswersMatch(unittest.TestCase):
    def test_punjabi_mode_uses_canonical_rules(self) -> None:
        self.assertTrue(answers_match("ohnu dekho", "ehnu dekho", punjabi=True))
        self.assertTrue(answers_match("usnu dedo", "ohnu dedo", punjabi=True))
        self.assertTrue(answers_match("khidki band kar raha hun", "khirki band kar raha hun", punjabi=True))
        self.assertTrue(
            answers_match(
                "main darwaza band kar reha hun",
                "main darwaza band kar raha hun",
                punjabi=True,
            )
        )
        self.assertTrue(
            answers_match(
                "mainu bookh lag rehi hai",
                "mainu bookh lag rahi hai",
                punjabi=True,
            )
        )
        self.assertTrue(
            answers_match(
                "main darwaza band kar raha hoon",
                "main darwaza band kar raha hun",
                punjabi=True,
            )
        )
        self.assertTrue(
            answers_match(
                "main darwaza band kar raha hoo",
                "main darwaza band kar raha hun",
                punjabi=True,
            )
        )

    def test_punjabi_mode_keeps_base_normalize(self) -> None:
        self.assertTrue(
            answers_match(
                "main darwaza band kar rahahun",
                "main darwaza band kar raha hun",
                punjabi=True,
            )
        )

    def test_tuada_spellings_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("tuhada kam karo", "thuadha kam karo", punjabi=True),
        )
        self.assertTrue(
            answers_match("tuada kam karo", "thuadha kam karo", punjabi=True),
        )
        self.assertTrue(
            answers_match("tusadha kam karo", "thuadha kam karo", punjabi=True),
        )

    def test_english_mode_does_not_apply_punjabi_rules(self) -> None:
        self.assertTrue(answers_match("look at him", "look at him", punjabi=False))
        self.assertFalse(answers_match("look at hod", "look at him", punjabi=False))

    def test_english_mode_still_uses_base_normalize(self) -> None:
        self.assertTrue(answers_match("Look at him?", "look at him", punjabi=False))

    def test_english_mode_does_not_collapse_doubles(self) -> None:
        self.assertFalse(answers_match("book", "bok", punjabi=False))

    def test_punjabi_mode_collapses_doubles(self) -> None:
        self.assertTrue(answers_match("ehhnudedo", "ehnu dedo", punjabi=True))

    def test_vich_ch_in_phrase(self) -> None:
        self.assertTrue(
            answers_match(
                "apniyan akhan ch eyedrop paa lo",
                "apniyan akhan vich eyedrop paa lo",
                punjabi=True,
            )
        )

    def test_menu_and_hai_variants_in_phrase(self) -> None:
        self.assertTrue(
            answers_match(
                "menu paani chaida hai",
                "mainu paani chaida hai",
                punjabi=True,
            )
        )
        self.assertTrue(
            answers_match(
                "mainu bookh lag rahi haan",
                "mainu bookh lag rahi hai",
                punjabi=True,
            )
        )

    def test_karo_kar_lo_interchangeable(self) -> None:
        self.assertTrue(
            answers_match("mera intezaar karo", "mera intezaar kar lo", punjabi=True),
        )
        self.assertTrue(
            answers_match("darwaza band karo", "darwaza band kar lo", punjabi=True),
        )
        self.assertTrue(
            answers_match(
                "pahunch ke call karo",
                "pahunch ke call kar dena",
                punjabi=True,
            ),
        )
        self.assertTrue(
            answers_match("aa ke baith jao", "aa ke baitho", punjabi=True),
        )

    def test_optional_leading_eh_oh_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("kitchen vich hai", "eh kitchen vich hai", punjabi=True),
        )
        self.assertTrue(
            answers_match("kitthe hai", "oh kitthe hai", punjabi=True),
        )
        self.assertFalse(answers_match("ehnu dedo", "nu dedo", punjabi=True))

    def test_optional_leading_subject_pronouns_in_phrase(self) -> None:
        self.assertTrue(answers_match("khaunga", "main khaunga", punjabi=True))
        self.assertTrue(answers_match("khaoge", "tusi khaoge", punjabi=True))
        self.assertTrue(answers_match("kadon aaoge", "tusi kadon aaoge", punjabi=True))
        self.assertTrue(answers_match("main thaka hu", "main thaka hun", punjabi=True))
        self.assertFalse(
            answers_match("paani chaida hai", "mainu paani chaida hai", punjabi=True),
        )

    def test_asterisk_markers_ignored(self) -> None:
        self.assertTrue(
            answers_match("kadon aa rahe ho", "kadon aa rahe ho***", punjabi=True),
        )
        self.assertTrue(
            answers_match("kadon aa rahe ho***", "kadon aa rahe ho", punjabi=True),
        )

    def test_trailing_lo_o_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("chaku varto", "chaku vart lo", punjabi=True),
        )
        self.assertTrue(
            answers_match("meri kursi te baitho", "meri kursi te baith lo", punjabi=True),
        )
        self.assertTrue(
            answers_match("shower le lo", "shower lelo", punjabi=True),
        )
        self.assertFalse(answers_match("usnu dedo", "usnu de lo", punjabi=True))

    def test_negative_imperative_kar_karo_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("intezaar na karo", "intezaar na kar", punjabi=True),
        )
        # Positive imperatives stay distinct.
        self.assertFalse(answers_match("apna kam karo", "apna kam kar", punjabi=True))

    def test_intezaar_udeek_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("mera udeek karo", "mera intezaar karo", punjabi=True),
        )
        self.assertTrue(
            answers_match("main intezaar karda hun", "main udeek karda hun", punjabi=True),
        )

    def test_leya_lya_in_phrase(self) -> None:
        self.assertTrue(answers_match("main kha lya", "main kha leya", punjabi=True))
        self.assertTrue(answers_match("kha lya?", "kha leya?", punjabi=True))
        self.assertTrue(answers_match("call kar leyi", "call kar leya?", punjabi=True))
        self.assertTrue(answers_match("call kar lyi?", "call kar leya?", punjabi=True))
        self.assertTrue(answers_match("ohna ne kha leye", "ohna ne kha leya?", punjabi=True))

    def test_gyi_gya_in_phrase(self) -> None:
        self.assertTrue(answers_match("so gyi?", "so gya?", punjabi=True))
        self.assertTrue(answers_match("bhul gyi", "bhul gya", punjabi=True))
        self.assertTrue(answers_match("main bhul gyi", "main bhul gya", punjabi=True))
        self.assertTrue(answers_match("oh bhul gayi", "oh bhul gyi?", punjabi=True))
        self.assertTrue(answers_match("oh jaldi chal gaye", "oh jaldi chal gye", punjabi=True))

    def test_garam_garm_in_phrase(self) -> None:
        self.assertTrue(answers_match("garm kar lo", "garam kar lo", punjabi=True))

    def test_taiyaar_tyaar_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("khana taiyaar hai", "khana tyaar hai", punjabi=True),
        )
        self.assertTrue(
            answers_match("main taiyaar hun", "main tyaar hun", punjabi=True),
        )

    def test_rakh_lo_do_in_phrase(self) -> None:
        self.assertTrue(answers_match("itte rakh do", "itte rakh lo", punjabi=True))
        self.assertTrue(
            answers_match("le ke othe rakh lo", "le ke othe rakh do", punjabi=True),
        )
        self.assertFalse(answers_match("kar do", "kar lo", punjabi=True))

    def test_mez_table_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("kitab mez te hai", "kitab table te hai", punjabi=True),
        )
        self.assertTrue(
            answers_match("sofa mez de samne hai", "sofa table de samne hai", punjabi=True),
        )


class TestLanguageTweakCanonicals(unittest.TestCase):
    def test_doggy_and_kutta(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("mera kutta"),
            canonicalize_punjabi("mera doggy"),
        )

    def test_cow_ga_gan_gay_gaye(self) -> None:
        self.assertEqual(canonicalize_punjabi("ik gan"), canonicalize_punjabi("ik ga"))
        self.assertEqual(canonicalize_punjabi("ik gay"), canonicalize_punjabi("ik ga"))
        self.assertEqual(canonicalize_punjabi("ohdi gaye"), canonicalize_punjabi("ohdi ga"))
        self.assertNotEqual(
            canonicalize_punjabi("meriyan akhhan thak gayan"),
            canonicalize_punjabi("ik ga"),
        )

    def test_nose_nak_nakh_nakk(self) -> None:
        self.assertEqual(canonicalize_punjabi("mera nak"), canonicalize_punjabi("mera nakk"))
        self.assertEqual(canonicalize_punjabi("mera nakh"), canonicalize_punjabi("mera nakk"))

    def test_rice_chawal_chawl_chaul(self) -> None:
        self.assertEqual(canonicalize_punjabi("chawal"), canonicalize_punjabi("chawl"))
        self.assertEqual(canonicalize_punjabi("chaul"), canonicalize_punjabi("chawl"))

    def test_past_copula_si_sige_siga_san(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("main thaka siga"),
            canonicalize_punjabi("main thaka si"),
        )
        self.assertEqual(
            canonicalize_punjabi("main thaka san"),
            canonicalize_punjabi("main thaka si"),
        )
        self.assertNotEqual(
            canonicalize_punjabi("oh darwaze te sige"),
            canonicalize_punjabi("oh darwaze te san"),
        )
        self.assertFalse(
            answers_match("oh darwaze te san", "oh darwaze te sige", punjabi=True),
        )

    def test_houga_hoga_and_kharidlya(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("eh aukha hoga"),
            canonicalize_punjabi("eh aukha houga"),
        )
        self.assertEqual(
            canonicalize_punjabi("ohne apne aap kharidlya"),
            canonicalize_punjabi("ohne apne aap kharidya"),
        )

    def test_optional_leading_ki_on_questions(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("ki oh othe si"),
            canonicalize_punjabi("oh othe si"),
        )
        self.assertEqual(
            canonicalize_punjabi("ki kar leya"),
            canonicalize_punjabi("kar leya"),
        )
        self.assertEqual(
            canonicalize_punjabi("kithe hai"),
            canonicalize_punjabi("kithe hai"),
        )

    def test_gai_in_ho_gya_family(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("der ho gai"),
            canonicalize_punjabi("der ho gayi"),
        )
        self.assertEqual(
            canonicalize_punjabi("kyunki der ho gai"),
            canonicalize_punjabi("kyunki der ho gayi"),
        )

    def test_car_gaddi_and_gaadi(self) -> None:
        self.assertEqual(
            canonicalize_punjabi("meri gaddi"),
            canonicalize_punjabi("meri car"),
        )
        self.assertEqual(
            canonicalize_punjabi("laal gaadi"),
            canonicalize_punjabi("laal car"),
        )

    def test_roz_and_har_din(self) -> None:
        self.assertEqual(canonicalize_punjabi("roz"), canonicalize_punjabi("har din"))
        self.assertEqual(
            canonicalize_punjabi("main roz janda hun"),
            canonicalize_punjabi("main har din janda hun"),
        )


if __name__ == "__main__":
    unittest.main()
