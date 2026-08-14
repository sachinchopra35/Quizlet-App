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

    def test_tuada_possessive_spellings(self) -> None:
        masc_variants = ("thuadha", "tuadha", "tuhada", "tuada", "thuada", "tusadha", "tusada")
        for variant in masc_variants:
            self.assertEqual(canonicalize_punjabi(variant), canonicalize_punjabi("tuadha"))
        fem_variants = ("thuadi", "tuadi", "tuhadi", "tuadhi", "thuadhi", "tusadi", "tusadhi")
        for variant in fem_variants:
            self.assertEqual(canonicalize_punjabi(variant), canonicalize_punjabi("tuadhi"))


class TestAnswersMatch(unittest.TestCase):
    def test_punjabi_mode_uses_canonical_rules(self) -> None:
        self.assertTrue(answers_match("ohnu dekho", "ehnu dekho", punjabi=True))
        self.assertTrue(answers_match("usnu dedo", "ohnu dedo", punjabi=True))
        self.assertTrue(answers_match("khidki band kar raha hun", "khirki band kar raha hun", punjabi=True))
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

    def test_mez_table_in_phrase(self) -> None:
        self.assertTrue(
            answers_match("kitab mez te hai", "kitab table te hai", punjabi=True),
        )
        self.assertTrue(
            answers_match("sofa mez de samne hai", "sofa table de samne hai", punjabi=True),
        )


if __name__ == "__main__":
    unittest.main()
