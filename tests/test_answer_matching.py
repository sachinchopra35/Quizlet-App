import unittest

from app import answers_match, canonicalize_punjabi, normalize


class TestNormalize(unittest.TestCase):
    def test_ignores_spaces_punctuation_and_doubles(self) -> None:
        self.assertEqual(normalize("mainu pani dedo"), normalize("mainupanidedo"))
        self.assertEqual(normalize("ehnu dedo?"), normalize("ehnudedo"))
        self.assertEqual(normalize("ehhnudedo"), normalize("ehnu dedo"))


class TestCanonicalizePunjabi(unittest.TestCase):
    def test_eh_oh_interchange_within_words(self) -> None:
        self.assertEqual(canonicalize_punjabi("ehnu"), canonicalize_punjabi("ohnu"))
        self.assertEqual(canonicalize_punjabi("eh"), canonicalize_punjabi("oh"))

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


if __name__ == "__main__":
    unittest.main()
