type Props = {
  multiplier: 1 | 2 | 3
  dartsThrown: 0 | 1 | 2
  isGameFinished: boolean
  onDouble: () => void
  onTriple: () => void
  onUndo: () => void
  onEndTurn: () => void
  onBackToSetup: () => void
}

export default function ControlsBar({
  multiplier,
  dartsThrown,
  isGameFinished,
  onDouble,
  onTriple,
  onUndo,
  onEndTurn,
  onBackToSetup
}: Props) {
  const pill = (active: boolean) =>
    active
      ? 'bg-blue-500/20 border-blue-400 text-blue-200'
      : 'bg-zinc-900 border-zinc-800 text-zinc-200 disabled:text-zinc-500'

  return (
    <div className="flex flex-col gap-3">
      <button
        className={[
          'cursor-pointer rounded-2xl border px-4 py-2 text-left disabled:cursor-not-allowed',
          pill(multiplier === 2)
        ].join(' ')}
        onClick={onDouble}
        disabled={isGameFinished}
      >
        <div className="text-xs text-zinc-400">Modifokátor</div>
        <div className="text-lg font-semibold">DOUBLE</div>
      </button>

      <button
        className={[
          'cursor-pointer rounded-2xl border px-4 py-2 text-left',
          pill(multiplier === 3)
        ].join(' ')}
        onClick={onTriple}
        disabled={isGameFinished}
      >
        <div className="text-xs text-zinc-400">Modifokátor</div>
        <div className="text-lg font-semibold">TRIPLE</div>
      </button>

      <button
        className="cursor-pointer rounded-2xl border border-emerald-800 bg-emerald-900/20 px-4 py-2 text-left disabled:text-zinc-500"
        onClick={onEndTurn}
        disabled={isGameFinished}
      >
        <div className="text-xs text-zinc-400">Hod</div>
        <div className="text-lg font-semibold">UKONČIT ({dartsThrown}/3)</div>
      </button>

      <button
        className="cursor-pointer rounded-2xl border border-amber-800 bg-amber-900/20 px-4 py-2 text-left"
        onClick={onUndo}
      >
        <div className="text-xs text-zinc-400">Akce</div>
        <div className="text-lg font-semibold">ZPĚT</div>
      </button>

      <button
        className="cursor-pointer col-span-2 rounded-2xl border border-red-800 bg-red-900/20 px-4 py-2 text-left"
        onClick={onBackToSetup}
      >
        <div className="text-xs text-zinc-400">Hra</div>
        <div className="text-lg font-semibold">ZPÁTKY DO NASTAVENÍ</div>
      </button>
    </div>
  )
}
