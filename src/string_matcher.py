import re

def match_correct(word: str, letter_list: list[str]) -> bool:
    """takes in a list of letters and a word and returns a boolean if the letters match the word in the correct index"""
    match_list = [re.match(char, word[i]) for i, char in enumerate(letter_list)]
    return all(match_list)


def match_incorrect(word: str, letter_list: list[str]) -> bool:
    """
    takes in a list of letters and a word and returns a boolean if
    the letter does not match the word in the index but is included in the word
    """
    index_match_list = [any([y == word[i] for y in char]) if char else False for i, char in enumerate(letter_list)]
    any_match_list = [all([y in word for y in char]) if char else True for char in letter_list]
    
    return not any(index_match_list) and all(any_match_list)


def match_none(word: str, letter_list: list[str]) -> bool:
    """takes in a list of letters and a word and returns a boolean if the letters are not in the word at all"""
    match_list = [c for c in letter_list if c in word]
    return not any(match_list)


def match_all(word: str, correct_list: list[str], incorrect_list: list[str], bad_list: list[str]) -> bool:
    
    is_matched = [
      match_correct(word, correct_list),
      match_incorrect(word, incorrect_list),
      match_none(word, bad_list),
    ]
    
    return all(is_matched)

    # final_list = [
    #     word for word in five_lttrs
    #     # correct letters match in specific index of word
    #     if all([re.match(num, word[i]) for i, num in enumerate(lttrs)])

    #     # incorrect letters don't match in the index of word but are included in the word
    #     # ( accomodating multiple per index )
    #     and (
    #       not any([any([y == word[i] for y in x]) if x else False for i, x in enumerate(not_lttrs)])
    #         and any([any([y in word for y in x]) if x else False for x in not_lttrs])
    #     )

    #     # any bad letters cannot be in the word
    #     and not any([c for c in bad_letters if c in word])
    # ]