import { describe, expect, it } from 'vitest'

import { filterCandidates, letterCounts, rankGuesses, scoreGuess } from './solver'
import type { Mark } from './solver'

describe('scoreGuess', () => {
  it('marks repeated letters the way Wordle does', () => {
    expect(scoreGuess('eerie', 'geese')).toEqual([
      'present',
      'correct',
      'absent',
      'absent',
      'correct',
    ])
  })

  it('lets one letter be grey and yellow at the same time', () => {
    expect(scoreGuess('tepee', 'eagle')).toEqual([
      'absent',
      'present',
      'absent',
      'absent',
      'correct',
    ])
  })
})

describe('filterCandidates', () => {
  it('keeps a word that has one E fixed and another ruled out', () => {
    // The old solver dropped "eagle" here because E was also marked grey.
    const marks = scoreGuess('tepee', 'eagle')
    expect(filterCandidates(['eagle', 'eerie', 'crane'], [{ word: 'tepee', marks }])).toEqual([
      'eagle',
    ])
  })

  it('ignores tiles that are not marked yet', () => {
    const marks: (Mark | null)[] = [null, null, null, null, 'correct']
    expect(filterCandidates(['eagle', 'piano'], [{ word: 'tepee', marks }])).toEqual(['eagle'])
  })

  it('returns nothing when two guesses contradict each other', () => {
    const green: Mark[] = Array<Mark>(5).fill('correct')
    const guesses = [
      { word: 'crane', marks: green },
      { word: 'slate', marks: green },
    ]
    expect(filterCandidates(['crane'], guesses)).toEqual([])
  })
})

describe('letterCounts', () => {
  it('counts a repeated letter once per word', () => {
    expect(Object.fromEntries(letterCounts(['eerie']))).toEqual({ e: 1, r: 1, i: 1 })
  })
})

describe('rankGuesses', () => {
  it('puts the guess covering the most candidate letters first', () => {
    expect(rankGuesses(['crane', 'aahed', 'zzzzz'], 2)).toEqual(['crane', 'aahed'])
  })
})
