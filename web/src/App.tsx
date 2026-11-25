import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Board } from './components/Board'
import type { Row } from './components/Board'
import { Footer } from './components/Footer'
import { Results } from './components/Results'
import { filterCandidates, rankGuesses } from './solver'
import type { Guess, Mark } from './solver'
import { ALLOWED, ANSWERS, GUESS_ONLY } from './words'

const ROWS = 6
const COLS = 5

type Theme = 'light' | 'dark'

const blankRow = (): Row => ({ word: '', marks: Array<Mark | null>(COLS).fill(null) })

/** Editing a word invalidates every color; duplicate-letter scoring depends on the whole guess. */
const replaceWord = (word: string): Row => ({ ...blankRow(), word })

const nextMark = (mark: Mark | null): Mark | null => {
  if (mark === null) return 'correct'
  if (mark === 'correct') return 'present'
  if (mark === 'present') return 'absent'
  return null
}

const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

export default function App() {
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: ROWS }, blankRow))
  const [active, setActive] = useState(0)
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLElement>(null)

  const activeWord = rows[active].word
  const started = rows.some((row) => row.word)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#121213' : '#f6f6f4')
    try {
      localStorage.setItem('wordle-theme', theme)
    } catch {
      // storage can be unavailable (private mode); the toggle still works this session
    }
  }, [theme])

  const backspace = useCallback(() => {
    if (!rows[active].word && active === 0) return
    const target = rows[active].word ? active : active - 1
    setRows((prev) => {
      const row = prev[target]
      if (!row.word) return prev
      return prev.map((current, i) =>
        i === target ? replaceWord(current.word.slice(0, -1)) : current,
      )
    })
    setActive(target)
  }, [active, rows])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      // A focused input owns its own typing and deletion.
      if (event.target instanceof HTMLInputElement) return

      if (/^[a-zA-Z]$/.test(event.key)) {
        const letter = event.key.toLowerCase()
        setRows((prev) => {
          const row = prev[active]
          if (row.word.length >= COLS) return prev
          const next = [...prev]
          next[active] = { ...row, word: row.word + letter }
          return next
        })
        return
      }

      if (event.key === 'Backspace') {
        backspace()
        return
      }

      if (event.key === 'Enter') {
        if ((event.target as HTMLElement | null)?.tagName === 'BUTTON') return
        if (rows[active].word.length === COLS) setActive(Math.min(active + 1, ROWS - 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, backspace, rows])

  // Marks can arrive in one batched render (quick taps), so advance after the row settles.
  useEffect(() => {
    const row = rows[active]
    if (row.word.length === COLS && row.marks.every(Boolean) && active < ROWS - 1) {
      // oxlint-disable-next-line react/set-state-in-effect
      setActive(active + 1)
    }
  }, [rows, active])

  function typeWord(value: string) {
    const word = value.toLowerCase().replace(/[^a-z]/g, '').slice(0, COLS)
    setRows((prev) => prev.map((row, i) => (i === active ? replaceWord(word) : row)))
  }

  function cycleMark(rowIndex: number, col: number) {
    setRows((prev) => {
      const row = prev[rowIndex]
      if (row.word.length < COLS || !row.word[col]) return prev
      const mark = nextMark(row.marks[col])
      const marks = row.marks.map((current, i) => (i === col ? mark : current))
      return prev.map((current, i) => (i === rowIndex ? { ...current, marks } : current))
    })
  }

  // Focus is created inside the tap so mobile browsers raise the keyboard.
  function activateBoard(rowIndex: number) {
    if (rows[rowIndex].word.length === COLS) return
    inputRef.current?.focus()
  }

  function fillRow(word: string): boolean {
    if (rows[active].marks.some(Boolean)) return false
    setRows((prev) => {
      const next = [...prev]
      next[active] = { ...blankRow(), word }
      return next
    })
    return true
  }

  // An opener sits next to the board, so loading it should not move the page.
  function pickOpener(word: string) {
    fillRow(word)
  }

  function pickWord(word: string) {
    if (!fillRow(word)) return
    playRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  function undo() {
    const last = rows.findLastIndex((row) => row.word.length > 0)
    if (last === -1) return
    setRows((prev) => prev.map((row, i) => (i === last ? blankRow() : row)))
    setActive(last)
  }

  function reset() {
    setRows(Array.from({ length: ROWS }, blankRow))
    setActive(0)
  }

  function scrollToResults() {
    resultsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  const guesses = useMemo(() => {
    const played: Guess[] = []
    for (const row of rows) {
      // Marked tiles narrow the list immediately; unmarked ones are ignored.
      if (row.word.length === COLS && row.marks.some(Boolean)) {
        played.push({ word: row.word, marks: row.marks })
      }
    }
    return played
  }, [rows])

  const candidates = useMemo(() => {
    const matches = filterCandidates(ANSWERS, guesses)
    // Usefulness ordering only matters once the board is in play.
    if (guesses.length === 0 || matches.length <= 1) return matches
    return rankGuesses(matches, matches.length)
  }, [guesses])
  // Only reach for the guess-only dictionary when no answer word fits at all.
  const guessMatches = useMemo(() => {
    if (guesses.length === 0 || candidates.length > 0) return []
    const matches = filterCandidates(GUESS_ONLY, guesses)
    return rankGuesses(matches, matches.length)
  }, [guesses, candidates])

  const fallback = candidates.length === 0 && guessMatches.length > 0
  const shownCount = fallback ? guessMatches.length : candidates.length
  const shownLabel = fallback
    ? shownCount === 1
      ? 'matching legal guess'
      : 'matching legal guesses'
    : shownCount === 1
      ? 'possible answer'
      : 'possible answers'
  const showBoardNote = started && (activeWord.length === COLS || guesses.length > 0)

  return (
    <div className="app">
      <header className="header">
        <div className="brand" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div>
          <h1>Wordle Solver</h1>
          <p className="sub">Track your guesses. Narrow the answer.</p>
        </div>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className="mobile-bar" aria-live="polite">
        {started && guesses.length > 0 ? (
          <button
            className="mobile-count"
            type="button"
            onClick={scrollToResults}
            aria-label={`View all ${shownCount} ${shownLabel}`}
          >
            <strong>{shownCount.toLocaleString()}</strong> {shownLabel}
            <span className="chevron" aria-hidden="true">
              ↓
            </span>
          </button>
        ) : (
          <span className="mobile-count">
            <strong>{shownCount.toLocaleString()}</strong> {shownLabel}
          </span>
        )}
      </div>

      <main className={`layout${started ? '' : ' empty'}`}>
        <section className="play" aria-label="Your board" ref={playRef}>
          {showBoardNote && (
            <p className="hint hint-above">
              {guesses.length > 0
                ? 'Mark the tiles on your guess to narrow the list, or pick any word from the list.'
                : 'Mark the tiles on your guess to narrow the list.'}
            </p>
          )}

          <Board rows={rows} active={active} onCycle={cycleMark} onActivate={activateBoard} />

          <input
            ref={inputRef}
            className="guess-input-hidden"
            type="text"
            value={activeWord}
            onChange={(event) => typeWord(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace') {
                event.preventDefault()
                backspace()
                return
              }
              if (event.key === 'Enter' && activeWord.length === COLS) {
                setActive(Math.min(active + 1, ROWS - 1))
              }
            }}
            maxLength={COLS}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="done"
            tabIndex={-1}
            aria-label="Your guess"
          />

          {!showBoardNote && (
            <p className="hint">
              {activeWord.length === COLS
                ? 'Click each tile to set its color.'
                : 'Click the board to type, then mark each tile.'}
            </p>
          )}

          {activeWord.length === COLS && !ALLOWED.has(activeWord) && (
            <p className="hint warn-text">
              {activeWord.toUpperCase()} isn't in Wordle's guess list — double-check it.
            </p>
          )}

          <p className="legend">
            <span>
              <i className="swatch correct" />✓ right spot
            </span>
            <span>
              <i className="swatch present" />↔ wrong spot
            </span>
            <span>
              <i className="swatch absent" />× not in word
            </span>
          </p>

          {rows.some((row) => row.word) && (
            <div className="actions">
              <button className="action" type="button" onClick={undo}>
                Undo last
              </button>
              <button className="action" type="button" onClick={reset}>
                New game
              </button>
            </div>
          )}
        </section>

        <div
          className={`results-column${started && guesses.length === 0 ? ' count-only' : ''}`}
          ref={resultsRef}
        >
          <Results
            started={started}
            guesses={guesses}
            candidates={candidates}
            guessMatches={guessMatches}
            onStart={pickOpener}
            onPick={pickWord}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}
