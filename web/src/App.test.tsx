import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('narrows to a single answer when CRANE is marked all green', () => {
    render(<App initialMode="free" />)
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('2397 possible answers')

    for (const letter of 'crane') fireEvent.keyDown(window, { key: letter })

    // First click on a tile marks it green (correct position).
    'CRANE'.split('').forEach((letter, index) => {
      fireEvent.click(
        screen.getByLabelText(`Letter ${index + 1} of 5: ${letter}, unmarked`),
      )
    })

    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('1 possible answer')
    expect(screen.getByText('CRANE', { selector: 'button.answer' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'CRANE' })).toBeTruthy()
  })

  it('falls back to legal guesses when no answer word fits', () => {
    render(<App initialMode="free" />)

    for (const letter of 'zymic') fireEvent.keyDown(window, { key: letter })

    'ZYMIC'.split('').forEach((letter, index) => {
      fireEvent.click(
        screen.getByLabelText(`Letter ${index + 1} of 5: ${letter}, unmarked`),
      )
    })

    expect(screen.getByRole('status').getAttribute('aria-label')).toBe(
      '1 matching legal guess',
    )
    expect(screen.getByRole('button', { name: 'ZYMIC' })).toBeTruthy()
  })

  it('narrows the count as soon as one tile is marked', () => {
    render(<App initialMode="free" />)

    for (const letter of 'crane') fireEvent.keyDown(window, { key: letter })
    fireEvent.click(screen.getByLabelText('Letter 1 of 5: C, unmarked'))

    const label = screen.getByRole('status').getAttribute('aria-label') ?? ''
    const count = Number(label.split(' ')[0])

    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(2397)
  })

  it('loads a picked opener into the board', () => {
    render(<App initialMode="free" />)

    fireEvent.click(screen.getByRole('button', { name: 'RAISE' }))

    expect(screen.getByLabelText('Letter 1 of 5: R, unmarked')).toBeTruthy()
    expect(screen.getByLabelText('Letter 5 of 5: E, unmarked')).toBeTruthy()
  })

  it('does not overwrite a row that is already being marked', () => {
    render(<App initialMode="free" />)

    for (const letter of 'raise') fireEvent.keyDown(window, { key: letter })
    fireEvent.click(screen.getByLabelText('Letter 1 of 5: R, unmarked'))

    const chip = document.querySelector('button.chip')
    expect(chip).toBeTruthy()
    fireEvent.click(chip!)

    expect(screen.getByLabelText('Letter 1 of 5: R, correct position')).toBeTruthy()
  })

  it('accepts typing through the guess input', () => {
    render(<App initialMode="free" />)

    fireEvent.change(screen.getByLabelText('Your guess'), { target: { value: 'slate' } })

    expect(screen.getByLabelText('Letter 1 of 5: S, unmarked')).toBeTruthy()
    expect(screen.getByLabelText('Letter 5 of 5: E, unmarked')).toBeTruthy()
  })

  it('shows the action buttons only after a row is entered', () => {
    render(<App initialMode="free" />)

    expect(screen.queryByRole('button', { name: 'Undo last' })).toBeNull()

    fireEvent.change(screen.getByLabelText('Your guess'), { target: { value: 'slate' } })

    expect(screen.getByRole('button', { name: 'Undo last' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'New game' })).toBeTruthy()
  })

  it('focuses the hidden guess input when the board is tapped', () => {
    render(<App initialMode="free" />)

    const input = screen.getByLabelText('Your guess')
    fireEvent.click(screen.getByRole('group', { name: 'Guess 1' }))

    expect(document.activeElement).toBe(input)
  })

  it('advances to the next row on Enter from the guess input', () => {
    render(<App initialMode="free" />)

    const input = screen.getByLabelText('Your guess') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'slate' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(input.value).toBe('')
    expect(screen.getByLabelText('Letter 1 of 5: S, unmarked')).toBeTruthy()
  })

  it('clears marks when the word is edited', () => {
    render(<App initialMode="free" />)

    const input = screen.getByLabelText('Your guess') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'crane' } })
    fireEvent.click(screen.getByLabelText('Letter 1 of 5: C, unmarked'))
    fireEvent.keyDown(input, { key: 'Backspace' })

    expect(input.value).toBe('cran')
    expect(screen.getByLabelText('Letter 1 of 5: C, unmarked')).toBeTruthy()
  })

  it('offers the list jump only once a tile is marked', () => {
    render(<App initialMode="free" />)

    fireEvent.click(screen.getByRole('button', { name: 'RAISE' }))
    expect(screen.queryByRole('button', { name: /View all/ })).toBeNull()

    fireEvent.click(screen.getByLabelText('Letter 1 of 5: R, unmarked'))
    expect(screen.getByRole('button', { name: /View all/ })).toBeTruthy()
  })

  it('marks daily guesses automatically from the fetched answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ solution: 'crane' }),
      })),
    )

    render(<App />)
    expect(screen.getByRole('button', { name: 'Daily' }).getAttribute('aria-pressed')).toBe(
      'true',
    )

    await waitFor(() => expect(screen.getByText(/fills in the colors/)).toBeTruthy())

    for (const letter of 'slate') fireEvent.keyDown(window, { key: letter })

    await waitFor(() => {
      expect(screen.getByLabelText('Letter 3 of 5: A, correct position')).toBeTruthy()
    })
    expect(screen.getByLabelText('Letter 1 of 5: S, not in the word')).toBeTruthy()
    expect(screen.getByLabelText('Letter 5 of 5: E, correct position')).toBeTruthy()
  })

  it('shows a retry path when the daily answer cannot be loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })),
    )

    render(<App />)

    await waitFor(() => expect(screen.getByText(/Couldn't load today's Wordle/)).toBeTruthy())
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  })
})
