# Wordle Solver

Narrow down today's Wordle answer from the colors of your guesses. Type a guess, mark its five
tiles the way Wordle did, and the candidates narrow as you go.

**[wordle.watermancorley.com](https://wordle.watermancorley.com/)**

<p align="center">
  <img src="images/wordle-desktop.png" alt="Wordle Solver on desktop with the board, live count, and opener choices" width="820">
  <br><br>
  <img src="images/wordle-mobile.png" alt="Wordle Solver on a phone with a marked guess and 11 possible answers" width="330">
</p>

## How it works

- Type a five-letter guess, or tap the board on a phone to raise the keyboard. `Enter` moves to the
  next row.
- Click each tile to cycle its color: green ✓ right spot, yellow ↔ wrong spot, grey × not in the word.
- The count and word list narrow as soon as you mark a tile. Unmarked tiles are ignored, so a
  half-filled row never hides the answer.
- Click a suggested opener or any candidate word to load it into the active row.
- `Undo last` clears the most recent guess. `New game` resets the board.
- The theme button switches light/dark and remembers your choice.
- On phones, a sticky bar keeps the live count in view.

It is a static React + TypeScript bundle. No backend: the word lists ship with the bundle and
filtering happens in the browser, so the count updates instantly.

## Word lists

- `data/answers.txt` — 2,397 answers: the original 2,315 from @cfreshman's list plus 82
  words the NYT has used since 2022.
- `data/guesses.txt` — 10,575 additional words Wordle accepts as a guess.

The original lists come from [@cfreshman's Wordle gists](https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b):
the [answer list](https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b) and the
[guess-only list](https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c). The 82
newer answers were verified against the NYT daily solution endpoint and removed from the
guess-only file, so the two lists do not overlap. Last refreshed 2026-11-25.

Possible answers are filtered from the 2,397-word answer list only. If a board matches none of
them, the app falls back to the 10,575 guess-only words, labels them as outside the answer list,
and keeps them separate from the main results.

## Local development

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # solver and UI tests
npm run build    # typecheck plus static bundle in web/dist
```

With Docker:

```bash
make build
make up          # http://localhost:8501
```

## Tests

`web/src/solver.test.ts` covers the marking rules (including repeated letters) and filtering.
`web/src/App.test.tsx` types a guess, marks all five tiles, and checks the count collapses to one.
