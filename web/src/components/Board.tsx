import type { Mark } from '../solver'

export type Row = { word: string; marks: (Mark | null)[] }

const SYMBOLS: Record<Mark, string> = { correct: '✓', present: '↔', absent: '×' }
const LABELS: Record<Mark, string> = {
  correct: 'correct position',
  present: 'wrong position',
  absent: 'not in the word',
}

type Props = {
  rows: Row[]
  active: number
  onCycle: (row: number, col: number) => void
  onActivate: (row: number) => void
}

export function Board({ rows, active, onCycle, onActivate }: Props) {
  return (
    <div className="board">
      {rows.map((row, rowIndex) => (
        <div
          className={`row${rowIndex === active ? ' active' : ''}`}
          key={rowIndex}
          role="group"
          aria-label={`Guess ${rowIndex + 1}`}
          onClick={() => onActivate(rowIndex)}
        >
          {Array.from({ length: row.marks.length }, (_, col) => {
            const letter = row.word[col]
            if (!letter) return <span className="tile" key={col} aria-hidden="true" />

            const mark = row.marks[col]
            return (
              <button
                className={`tile filled${mark ? ` ${mark}` : ''}`}
                key={col}
                type="button"
                onClick={() => onCycle(rowIndex, col)}
                aria-label={`Letter ${col + 1} of ${row.marks.length}: ${letter.toUpperCase()}, ${
                  mark ? LABELS[mark] : 'unmarked'
                }`}
              >
                <span className="letter">{letter.toUpperCase()}</span>
                {mark && (
                  <span className="mark" aria-hidden="true">
                    {SYMBOLS[mark]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
