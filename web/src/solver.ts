export type Mark = 'correct' | 'present' | 'absent'

/** A played row. Unmarked tiles are null and simply do not constrain anything yet. */
export type Guess = { word: string; marks: (Mark | null)[] }

export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array.from({ length: guess.length }, () => 'absent')
  const leftover = new Map<string, number>()
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      marks[i] = 'correct'
    } else {
      const letter = answer[i]
      leftover.set(letter, (leftover.get(letter) ?? 0) + 1)
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === 'correct') continue
    const count = leftover.get(guess[i]) ?? 0
    if (count > 0) {
      marks[i] = 'present'
      leftover.set(guess[i], count - 1)
    }
  }
  return marks
}

export function filterCandidates(candidates: string[], guesses: Guess[]): string[] {
  return candidates.filter((word) =>
    guesses.every((guess) => {
      const scored = scoreGuess(guess.word, word)
      return scored.every((mark, i) => {
        const known = guess.marks[i] ?? null
        return known === null || mark === known
      })
    }),
  )
}

export function letterCounts(words: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const word of words) {
    for (const letter of new Set(word)) {
      counts.set(letter, (counts.get(letter) ?? 0) + 1)
    }
  }
  return counts
}

export function rankGuesses(words: string[], limit = 5): string[] {
  const weights = letterCounts(words)
  return words
    .map((word) => ({
      word,
      score: [...new Set(word)].reduce((sum, letter) => sum + (weights.get(letter) ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word))
    .slice(0, limit)
    .map(({ word }) => word)
}
