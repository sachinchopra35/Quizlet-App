import unittest
from pathlib import Path
from unittest.mock import patch

from vocab_quiz.rounds import beast_sample_size
from vocab_quiz.vocab import load_combined_vocab


class TestBeastSampleSize(unittest.TestCase):
    def test_caps_at_ten(self) -> None:
        self.assertEqual(beast_sample_size(100), 10)

    def test_uses_all_when_pool_smaller(self) -> None:
        self.assertEqual(beast_sample_size(3), 3)

    def test_exactly_ten(self) -> None:
        self.assertEqual(beast_sample_size(10), 10)


class TestLoadCombinedVocab(unittest.TestCase):
    def test_concatenates_rows_from_multiple_csvs(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "a.csv").write_text("en,lang\nhello,haan ji\n", encoding="utf-8")
            (root / "b.csv").write_text("en,lang\nbye,alvida\n", encoding="utf-8")
            with patch("vocab_quiz.vocab.PUNJABI_VOCAB_DIR", root):
                df = load_combined_vocab()
            self.assertEqual(len(df), 2)
            self.assertEqual(set(df["en"]), {"hello", "bye"})

    def test_raises_when_no_csv_files(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with patch("vocab_quiz.vocab.PUNJABI_VOCAB_DIR", root):
                with self.assertRaises(ValueError):
                    load_combined_vocab()


if __name__ == "__main__":
    unittest.main()
