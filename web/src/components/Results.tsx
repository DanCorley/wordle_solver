import { useLayoutEffect, useRef, useState } from 'react'

import { letterCounts } from '../solver'
import type { Guess } from '../solver'
import { OPENERS } from '../words'
import { Pick } from './Pick'

const GAP = 6

type Props = {
  started: boolean
  guesses: Guess[]
  candidates: string[]
  guessMatches: string[]
  onStart: (word: string) => void
  onPick: (word: string) => void
}

export function Results({
  started,
  guesses,
  candidates,
  guessMatches,
  onStart,
  onPick,
}: Props) {
  if (guesses.length === 0) {
    if (!started) {
      return <StartPanel total={candidates.length} onStart={onStart} />
    }

    return (
      <section aria-label="Results">
        <Count total={candidates.length} />
      </section>
    )
  }

  if (candidates.length === 0) {
    if (guessMatches.length > 0) {
      return <GuessFallback matches={guessMatches} onPick={onPick} />
    }

    return (
      <section aria-label="Results">
        <Count total={0} />
        <div className="card warn" role="alert">
          <p className="eyebrow">No match</p>
          <h3>Those marks can't all be true</h3>
          <p>Undo the last guess and re-check each tile. One of them is the wrong color.</p>
        </div>
      </section>
    )
  }

  if (candidates.length === 1) {
    return (
      <section aria-label="Results">
        <Count total={1} />
        <div className="card win">
          <p className="eyebrow">Solved</p>
          <button className="answer" type="button" onClick={() => onPick(candidates[0])}>
            {candidates[0].toUpperCase()}
          </button>
          <p>That's the only word left.</p>
        </div>
      </section>
    )
  }

  return <FullResults candidates={candidates} onPick={onPick} />
}

function FullResults({
  candidates,
  onPick,
}: {
  candidates: string[]
  onPick: (word: string) => void
}) {
  const letters = [...letterCounts(candidates).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)

  return (
    <section aria-label="Results">
      <Count total={candidates.length} />

      {candidates.length > 20 && <p className="note">Best next guesses first.</p>}

      <ChipList words={candidates} onPick={onPick} />

      <h2 className="section">Most useful letters</h2>
      <div className="letters">
        {letters.map(([letter, count]) => {
          const pct = Math.round((count / candidates.length) * 100)
          return (
            <div className="letter" key={letter}>
              <b>{letter.toUpperCase()}</b>
              <span className="bar">
                <i style={{ width: `${pct}%` }} />
              </span>
              <em>{pct}%</em>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function StartPanel({ total, onStart }: { total: number; onStart: (word: string) => void }) {
  const picksRef = useRef<HTMLDivElement>(null)
  const [perRow, setPerRow] = useState(OPENERS.length)

  // Fit as many chips as the column allows (max 8), then split them into equal rows.
  useLayoutEffect(() => {
    const el = picksRef.current
    if (!el) return

    const measure = () => {
      const chip = el.querySelector('.pick') as HTMLElement | null
      if (!chip) return
      const chipWidth = chip.getBoundingClientRect().width
      if (!chipWidth) return

      const style = getComputedStyle(el)
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      // The CSS owns the gap; read it so measurement cannot drift from the layout.
      const gap = parseFloat(style.columnGap) || GAP
      const available = el.clientWidth - padding
      const fit = Math.min(8, Math.max(1, Math.floor((available + gap) / (chipWidth + gap))))
      const rows = Math.ceil(OPENERS.length / fit)
      setPerRow(Math.ceil(OPENERS.length / rows))
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section aria-label="Results">
      <Count total={total} />
      <p className="hint hint-above">Pick a strong opener or type your own to start:</p>
      <div className="picks" ref={picksRef}>
        {chunk(OPENERS, perRow).map((row, index) => (
          <div className="pick-row" key={index}>
            {row.map((word) => (
              <Pick word={word} key={word} onPick={onStart} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

function GuessFallback({
  matches,
  onPick,
}: {
  matches: string[]
  onPick: (word: string) => void
}) {
  return (
    <section aria-label="Results">
      <Count
        total={matches.length}
        caption="matching legal guesses"
        singular="matching legal guess"
      />
      <div className="card warn">
        <p className="eyebrow">Outside the answer list</p>
        <h3>No answer word fits those marks</h3>
        <p>
          These are legal Wordle guesses that match your board, but they were never eligible to be
          answer. Either the answer is a newer addition to Wordle's list, or one tile is marked
          wrong.
        </p>
      </div>

      <ChipList words={matches} guess onPick={onPick} />
    </section>
  )
}

function ChipList({
  words,
  guess = false,
  onPick,
}: {
  words: string[]
  guess?: boolean
  onPick?: (word: string) => void
}) {
  const visible = words.slice(0, 400)
  const hidden = words.length - visible.length

  return (
    <div className="chips">
      {visible.map((word) => {
        const className = guess ? 'chip guess' : 'chip'
        return onPick ? (
          <button className={className} type="button" key={word} onClick={() => onPick(word)}>
            {word.toUpperCase()}
          </button>
        ) : (
          <span className={className} key={word}>
            {word.toUpperCase()}
          </span>
        )
      })}
      {hidden > 0 && <span className="chip more">+{hidden.toLocaleString()} more</span>}
    </div>
  )
}

function Count({
  total,
  caption = 'possible answers',
  singular = 'possible answer',
}: {
  total: number
  caption?: string
  singular?: string
}) {
  const label = total === 1 ? singular : caption

  return (
    <p className="count" role="status" aria-label={`${total} ${label}`}>
      <span className="number">{total.toLocaleString()}</span>
      <span className="caption">{label}</span>
    </p>
  )
}
