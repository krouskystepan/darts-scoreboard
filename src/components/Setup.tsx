import React from 'react'
import type {
  GameConfig,
  InRule,
  MatchFormat,
  OutRule,
  Player
} from '../lib/engine/types'
import { uid } from '../lib/id'
import {
  DEFAULT_POINTS,
  FORMAT_VALUE,
  LEGS_PER_SET,
  MAX_PLAYERS,
  SETS
} from '../data/settings'

type Props = {
  hasSaved: boolean
  onResume: () => void
  onNew: (config: GameConfig, players: Player[]) => void
  onClearSaved: () => void
}

const Select = ({
  value,
  onChange,
  options
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) => (
  <div className="relative">
    <select
      className="
        w-full appearance-none
        rounded-xl border border-zinc-800
        bg-zinc-950 px-3 py-3 pr-10
        text-zinc-100
      "
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>

    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400 ">
      ⤸
    </div>
  </div>
)

const Input = ({
  value,
  onChange,
  min,
  max
}: {
  value: number
  onChange: (n: number) => void
  min: number
  max: number
}) => (
  <input
    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100"
    type="number"
    value={value}
    min={min}
    max={max}
    onChange={(e) => onChange(Number(e.target.value))}
  />
)

const Checkbox = ({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (b: boolean) => void
  label: string
}) => (
  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="cursor-pointer h-5 w-5"
    />
    <span className="text-sm text-zinc-200">{label}</span>
  </label>
)

const toMatchFormat = (
  type: 'FIRST_TO' | 'BEST_OF',
  value: number
): MatchFormat => ({
  type,
  value: Math.max(1, Math.floor(value))
})

export default function Setup({
  hasSaved,
  onResume,
  onNew,
  onClearSaved
}: Props) {
  const [players, setPlayers] = React.useState<Player[]>([
    { id: uid(), name: 'Hráč 1' },
    { id: uid(), name: 'Hráč 2' }
  ])

  const [mode, setMode] = React.useState<'X01' | 'PRACTICE'>('X01')

  const [startPoints, setStartPoints] = React.useState<301 | 501 | 701>(
    DEFAULT_POINTS
  )
  const [checkOut, setCheckOut] = React.useState<OutRule>('DOUBLE')
  const [checkIn, setCheckIn] = React.useState<InRule>('STRAIGHT')
  const [legsPerSet, setLegsPerSet] = React.useState<number>(LEGS_PER_SET)
  const [sets, setSets] = React.useState<number>(SETS)
  const [formatType, setFormatType] = React.useState<'FIRST_TO' | 'BEST_OF'>(
    'FIRST_TO'
  )
  const [formatValue, setFormatValue] = React.useState<number>(FORMAT_VALUE)
  const [randomOrder, setRandomOrder] = React.useState<boolean>(false)

  const slots: Array<Player | null> = Array.from(
    { length: MAX_PLAYERS },
    (_, i) => players[i] ?? null
  )

  const addPlayer = (): void => {
    setPlayers((p) =>
      p.length >= MAX_PLAYERS
        ? p
        : [...p, { id: uid(), name: `Hráč ${p.length + 1}` }]
    )
  }

  const removePlayer = (id: string): void => {
    setPlayers((p) => (p.length <= 2 ? p : p.filter((x) => x.id !== id)))
  }

  const canStart =
    players.length >= 2 && players.every((p) => p.name.trim().length > 0)

  const buildConfig = (): GameConfig => {
    if (mode === 'PRACTICE') {
      return { mode: 'PRACTICE', practice: { randomOrder } }
    }

    return {
      mode: 'X01',
      x01: {
        startPoints,
        checkIn,
        checkOut,
        legsPerSet: Math.max(1, Math.floor(legsPerSet)),
        sets: Math.max(1, Math.floor(sets)),
        format: toMatchFormat(formatType, formatValue),
        randomOrder
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-400">Darts</div>
            <div className="text-2xl font-bold">Scoreboard</div>
          </div>

          {hasSaved && (
            <div className="flex gap-2">
              <button
                className="cursor-pointer rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-200 text-sm sm:text-base"
                onClick={onResume}
              >
                POKRAČOVAT VE HŘE
              </button>
              <button
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-200 text-sm sm:text-base"
                onClick={onClearSaved}
              >
                VYMAZAT HRU
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="space-y-3 flex flex-col h-full justify-between">
            <div className="space-y-2">
              <div className="text-sm text-zinc-400">Hráči</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((p, index) => {
                  const isPlaceholder = p === null
                  return (
                    <div
                      key={p?.id ?? `slot-${index}`}
                      className={`flex gap-2 ${
                        isPlaceholder ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <input
                        className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-100"
                        value={p?.name ?? 'XXXXX'}
                        readOnly={isPlaceholder}
                        tabIndex={isPlaceholder ? -1 : 0}
                        onChange={(e) =>
                          p &&
                          setPlayers((cur) =>
                            cur.map((x) =>
                              x.id === p.id ? { ...x, name: e.target.value } : x
                            )
                          )
                        }
                      />
                      <button
                        className="rounded-xl border border-red-800 bg-red-900/40 px-4 py-2 text-zinc-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => p && removePlayer(p.id)}
                        disabled={isPlaceholder || players.length <= 2}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <button
                className="cursor-pointer w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-200 disabled:opacity-40"
                onClick={addPlayer}
                disabled={players.length >= MAX_PLAYERS}
              >
                + Přidat Hráče
              </button>

              <Checkbox
                checked={randomOrder}
                onChange={setRandomOrder}
                label="Náhodné pořadí hráčů při startu"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
          <div>
            <div className="text-sm text-zinc-400">Herní mód</div>
            <Select
              value={mode}
              onChange={(v) => setMode(v === 'PRACTICE' ? 'PRACTICE' : 'X01')}
              options={[
                { value: 'X01', label: 'X01' },
                { value: 'PRACTICE', label: 'Practice' }
              ]}
            />
          </div>

          {mode === 'X01' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-zinc-400">Body</div>
                  <Select
                    value={String(startPoints)}
                    onChange={(v) =>
                      setStartPoints(Number(v) as 301 | 501 | 701)
                    }
                    options={[
                      { value: '301', label: '301' },
                      { value: '501', label: '501' },
                      { value: '701', label: '701' }
                    ]}
                  />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Sety</div>
                  <Input value={sets} onChange={setSets} min={1} max={99} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-zinc-400">Legy na sety</div>
                  <Input
                    value={legsPerSet}
                    onChange={setLegsPerSet}
                    min={1}
                    max={99}
                  />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">
                    První do / Nejlepší z
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={formatType}
                      onChange={(v) =>
                        setFormatType(v === 'BEST_OF' ? 'BEST_OF' : 'FIRST_TO')
                      }
                      options={[
                        { value: 'FIRST_TO', label: 'PD' },
                        { value: 'BEST_OF', label: 'NZ' }
                      ]}
                    />
                    <Input
                      value={formatValue}
                      onChange={setFormatValue}
                      min={1}
                      max={99}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-zinc-400">Zavření (začátek)</div>
                  <Select
                    value={checkIn}
                    onChange={(v) => setCheckIn(v as InRule)}
                    options={[
                      { value: 'STRAIGHT', label: 'Volný vstup' },
                      { value: 'DOUBLE', label: 'Zavření na D' },
                      { value: 'MASTER', label: 'Zavření na D/T' }
                    ]}
                  />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Zavření (konec)</div>
                  <Select
                    value={checkOut}
                    onChange={(v) => setCheckOut(v as OutRule)}
                    options={[
                      { value: 'STRAIGHT', label: 'Volné zavření' },
                      { value: 'DOUBLE', label: 'Zavření na D' },
                      { value: 'MASTER', label: 'Zavření na D/T' }
                    ]}
                  />
                </div>
              </div>
            </>
          )}

          <button
            className="cursor-pointer w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-lg font-semibold text-emerald-200 disabled:opacity-40"
            disabled={!canStart}
            onClick={() => onNew(buildConfig(), players)}
          >
            SPUSTIT HRU
          </button>
        </div>
      </div>
    </div>
  )
}
