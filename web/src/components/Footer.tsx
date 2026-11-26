import { ALLOWED_COUNT, ANSWER_COUNT } from '../words'

const ATTRIBUTION = 'https://github.com/cfreshman'

export function Footer() {
  return (
    <footer className="footer">
      <p>
        <strong>{ANSWER_COUNT.toLocaleString()}</strong> can be the answer ·{' '}
        <strong>{ALLOWED_COUNT.toLocaleString()}</strong> can be played
      </p>
      <p>
        Original lists from{' '}
        <a href={ATTRIBUTION} target="_blank" rel="noreferrer">
          @cfreshman
        </a>{' '}
        —{' '}
        <a
          href="https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b"
          target="_blank"
          rel="noreferrer"
        >
          answers
        </a>{' '}
        ·{' '}
        <a
          href="https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c"
          target="_blank"
          rel="noreferrer"
        >
          allowed guesses
        </a>
        . 82 newer answers from the{' '}
        <a href="https://www.nytimes.com/games/wordle/" target="_blank" rel="noreferrer">
          NYT
        </a>
        .
      </p>
    </footer>
  )
}
