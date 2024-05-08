import streamlit as st
from collections import Counter
from english_words import get_english_words_set
from src.string_matcher import match_all

five_lttrs = [
    # taking out 'gcide' because it doesn't seem reliable
    x for x in get_english_words_set(['web2'], lower=True)
    if len(x) == 5
]
five_lttrs.sort()

st.set_page_config(page_title="Wordle Solver", page_icon="📖", layout="centered")

st.title(f'**There are {len(five_lttrs):,} five letter words that you can pick in Wordle. Choose wisely.**')
st.write('---')

st.markdown('Have you guessed characters in the correct spot?', help='These are the green letters in Wordle.')

cols = st.columns(5)
one = cols[0].text_input("first letter", key='1_correct') or '\w' 
two = cols[1].text_input("second letter", key='2_correct') or '\w'
three = cols[2].text_input("third letter", key='3_correct') or '\w'
four = cols[3].text_input("fourth letter", key='4_correct') or '\w'
five = cols[4].text_input("fifth letter", key='5_correct') or '\w'


st.markdown('Have you guessed any letters that are out of place?', help='These are the yellow letters in Wordle.')

not_cols = st.columns(5)
not_one = not_cols[0].text_input("first letter", key='1_incorrect') or False
not_two = not_cols[1].text_input("second letter", key='2_incorrect') or False
not_three = not_cols[2].text_input("third letter", key='3_incorrect') or False
not_four = not_cols[3].text_input("fourth letter", key='4_incorrect') or False
not_five = not_cols[4].text_input("fifth letter", key='5_incorrect') or False


bad_letters = list(st.text_input('Did you guess any incorrectly yet?', key='all_bad', help='These are the grey letters in Wordle.'))

lttrs = [one, two, three, four, five]
not_lttrs = [not_one, not_two, not_three, not_four, not_five]

not_null_lttrs = [x for x in lttrs if x != '\w']
not_letter_list = [x for x in not_lttrs if x]
chosen_letters = set(bad_letters + not_letter_list + not_null_lttrs)

# st.write(match_all('hello', not_null_lttrs, not_lttrs, bad_letters))


if len([x for x in chosen_letters if x not in ('\w', None)]):
    st.write('---')

    final_list = [
        word for word in five_lttrs
        if match_all(
            word = word,
            correct_list = lttrs,
            incorrect_list = not_lttrs,
            bad_list = bad_letters
        )
    ]

    st.success('**Use these to help you make your next choice :)**')

    with st.expander(f'Your word may be any of the following {len(final_list)} choices:'):
        for word in final_list:
            st.write('- ', word.lower())

    with st.expander("If you're going to pick a letter, you should prioritize these:"):
        
        set_counter = {i.lower():0 for j in final_list for i in j}

        letters = Counter(set_counter)

        for word in final_list:
            letters.update(set(word))

        for letter, count in letters.most_common():
            if letter not in chosen_letters:
                st.write(f'**{letter.upper()}** shows in **{count}** of the existing words.')
