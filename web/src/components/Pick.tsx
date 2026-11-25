type Props = {
  word: string
  onPick: (word: string) => void
}

export function Pick({ word, onPick }: Props) {
  return (
    <button className="pick" type="button" onClick={() => onPick(word)}>
      {word.toUpperCase()}
    </button>
  )
}
