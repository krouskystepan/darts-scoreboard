type Props = {
  onHit: (value: number) => void
}

const Btn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-4 text-lg font-semibold active:scale-[0.99]"
    onClick={onClick}
  >
    {label}
  </button>
)

export default function Keypad({ onHit }: Props) {
  const numbers: number[] = [
    20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {numbers.map((n) => (
        <Btn key={n} label={String(n)} onClick={() => onHit(n)} />
      ))}
      <Btn label="25" onClick={() => onHit(25)} />
      <div className="col-span-4 hidden sm:flex justify-center items-center rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-4 text-center text-sm text-zinc-400">
        Tlačítka jsou velké pro mobilní telefony/tablety.
      </div>
    </div>
  )
}
