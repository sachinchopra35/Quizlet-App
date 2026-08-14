import unittest

from vocab_quiz.rounds import medal_for_round


class TestMedalForRound(unittest.TestCase):
    def test_perfect_round(self) -> None:
        self.assertEqual(medal_for_round(10, 10), "🏅")

    def test_one_wrong(self) -> None:
        self.assertEqual(medal_for_round(9, 10), "🥇")

    def test_two_wrong(self) -> None:
        self.assertEqual(medal_for_round(8, 10), "🥈")

    def test_three_or_more_wrong(self) -> None:
        self.assertEqual(medal_for_round(7, 10), "🥉")
        self.assertEqual(medal_for_round(0, 10), "🥉")


if __name__ == "__main__":
    unittest.main()
