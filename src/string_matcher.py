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
