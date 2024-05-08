from src.string_matcher import match_all


def test_answer():
    '''simulates a game of Wordle as in ./simulate_game.png'''

    five_lttrs = {
        'cushy': False,
        'deign': False,
        'fiord': False,
        'slate': False,
        'kiosk': False,
        'pious': True,
    }
    lttrs = ['\w', 'i', 'o', '\w', '\w']
    not_lttrs = ['s', False, 'i', 's', False]
    bad_letters = 'degnflatefrdk'

    for word, assertion in five_lttrs.items():
        assert match_all(
            word = word,
            correct_list = lttrs,
            incorrect_list = not_lttrs,
            bad_list = bad_letters
        ) == assertion
