type Props = {
  name: string
  subtitle: string
  value: string
  active: boolean
}

export default function PlayerCard({ name, subtitle, value, active }: Props) {
  return (
    <div
      className={[
        'rounded-2xl border p-4 shadow-sm',
        active
          ? 'border-emerald-400 bg-zinc-900'
          : 'border-zinc-800 bg-zinc-950'
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-400">{subtitle}</div>
          <div className="text-lg font-semibold leading-tight">{name}</div>
        </div>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
      </div>
    </div>
  )
}
