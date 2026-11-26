import answersRaw from '../../data/answers.txt?raw'
import guessesRaw from '../../data/guesses.txt?raw'
import solutionsRaw from '../../data/solutions.txt?raw'

const parse = (raw: string): string[] => (raw.trim() ? raw.trim().split(/\s+/) : [])

// solutions.txt is generated from the per-day cache, so only words ship in the bundle.
const answerSet = new Set([...parse(answersRaw), ...parse(solutionsRaw)])

/** Words that can actually be the answer. */
export const ANSWERS = [...answerSet]

/** Legal guesses that were never eligible to be the answer. */
export const GUESS_ONLY = parse(guessesRaw).filter((word) => !answerSet.has(word))

/** Every word Wordle accepts as a guess, answers included. */
export const ALLOWED = new Set([...ANSWERS, ...GUESS_ONLY])

export const ANSWER_COUNT = ANSWERS.length
export const ALLOWED_COUNT = ALLOWED.size

/** Curated openers from the usual Wordle consensus; clicking one loads it into the board. */
export const OPENERS = [
  'raise',
  'crane',
  'trace',
  'slate',
  'arise',
  'arose',
  'stare',
  'alert',
  'irate',
  'least',
]
