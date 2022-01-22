import streamlit as st
from collections import Counter
from english_words import english_words_set
import re

five_lttrs = [x.lower() for x in english_words_set if len(x) == 5]

st.set_page_config(page_title="Wordle Solver", page_icon="📖", layout="centered")

st.title(f'**There are {len(five_lttrs):,} five letter words that you can pick in Wordle. Choose wisely.**')
st.write('---')

st.write('Have you guessed the any of following?')


cols = st.columns(5)
one = cols[0].text_input("first letter") or '\w' 
two = cols[1].text_input("second letter") or '\w'
three = cols[2].text_input("third letter") or '\w'
four = cols[3].text_input("fourth letter") or '\w'
five = cols[4].text_input("fifth letter") or '\w'

second_cols = st.columns(2)
no_good_letters = second_cols[0].text_input("Have you guessed any letters that aren't used?  ")
good_letters = second_cols[1].text_input("Have you guessed any letters that are out of place?  ")

    
lttrs = [one, two, three, four, five]


good_letters = good_letters or ''.join([x for x in lttrs if x != '\w'])
chosen_letters = set(list(good_letters + no_good_letters) + lttrs)

if len([x for x in chosen_letters if x not in ('\w', None)]):
    
    st.write('---')

    final_list = [
        word for word in five_lttrs
        if all([re.match(num, word[i]) for i, num in enumerate(lttrs)])
        and not any(n for n in no_good_letters if n in word)
        and len([c for c in good_letters if c in word]) == len(good_letters)
    ]

    final_list.sort()

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
    
