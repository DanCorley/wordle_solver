import streamlit as st
from collections import Counter
from english_words import english_words_set
import re

five_lttrs = [x.lower() for x in english_words_set if len(x) == 5]
five_lttrs.sort()

st.set_page_config(page_title="Wordle Solver", page_icon="📖", layout="centered")

st.title(f'**There are {len(five_lttrs):,} five letter words that you can pick in Wordle. Choose wisely.**')
st.write('---')

st.write('Have you guessed the any of following?')


cols = st.columns(5)
one = cols[0].text_input("first letter", key='1_correct') or '\w' 
two = cols[1].text_input("second letter", key='2_correct') or '\w'
three = cols[2].text_input("third letter", key='3_correct') or '\w'
four = cols[3].text_input("fourth letter", key='4_correct') or '\w'
five = cols[4].text_input("fifth letter", key='5_correct') or '\w'


st.write('Did you guess any incorrectly yet?')

not_cols = st.columns(5)
not_one = not_cols[0].text_input("first letter", key='1_incorrect') or False
not_two = not_cols[1].text_input("second letter", key='2_incorrect') or False
not_three = not_cols[2].text_input("third letter", key='3_incorrect') or False
not_four = not_cols[3].text_input("fourth letter", key='4_incorrect') or False
not_five = not_cols[4].text_input("fifth letter", key='5_incorrect') or False


good_letters = st.text_input("Have you guessed any letters that are out of place?", key='all_good')

    
lttrs = [one, two, three, four, five]
not_lttrs = [not_one, not_two, not_three, not_four, not_five]


correct_letters = [x for x in lttrs if x != '\w']
good_letters = list(good_letters) or correct_letters
not_letter_list = [y for x in not_lttrs if x for y in x]
chosen_letters = set(good_letters + not_letter_list + correct_letters)

if len([x for x in chosen_letters if x not in ('\w', None)]):
    
    st.write('---')

    final_list = [
        word for word in five_lttrs
        # correct letters match in the index of word
        if all([re.match(num, word[i]) for i, num in enumerate(lttrs)])
        # incorrect letters match in the index of word ( can accomodate multiple per index )
        and not any([max([y == word[i] for y in lttrs]) if lttrs else False for i, lttrs in enumerate(not_lttrs)])
        # matches any of the incorrect guessed index letters
        and len([c for c in good_letters if c in word]) == len(good_letters)
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
