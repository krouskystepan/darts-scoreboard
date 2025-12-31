import type { GameState, PlayerState } from '../lib/engine/types'
import PlayerCard from './PlayerCard'
import ControlsBar from './ControlsBar'
import Keypad from './Keypad'
import { formatTarget } from '../lib/engine/selectors'

type Props = {
  state: GameState
  dispatch: (a: import('../lib/engine/types').Action) => void
}

const isX01 = (
  state: GameState
): state is GameState & {
  config: {
    mode: 'X01'
    x01: NonNullable<GameState['config'] extends infer C ? C : never>
  }
} => state.config.mode === 'X01'

const getPS = (map: Record<string, PlayerState>, id: string): PlayerState => {
  const ps = map[id]
  if (!ps) throw new Error(`Missing PlayerState for ${id}`)
  return ps
}

export default function Game({ state, dispatch }: Props) {
  const x01 = isX01(state) ? state.config.x01 : null

  const header = (() => {
    if (!x01) return 'PRACTICE'
    const target = formatTarget(x01.format)
    const domain = x01.sets > 1 ? `Sety (do ${target})` : `Legy (do ${target})`
    return `X01 • ${x01.startPoints} • ${domain} • Legy/Set ${x01.legsPerSet}`
  })()

  const turnLabel = `Šipky: ${state.dartsThrown}/3`

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-400">Hra</div>
            <div className="text-lg font-semibold">{header}</div>
          </div>
          <div className="text-sm sm:text-base text-zinc-400">{turnLabel}</div>
        </div>

        {state.isFinished && (
          <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">
            ZÁPAS UKONČEN
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {state.players.map((p, idx) => {
          const ps = getPS(state.playerState, p.id)
          const active = idx === state.currentPlayerIndex

          const subtitle = x01
            ? `Sety ${ps.setsWon} • Legy ${ps.legsWon} • Ve ${
                ps.hasCheckedIn ? 'ANO' : 'NE'
              }`
            : `Hody ${state.history.filter((h) => h.playerId === p.id).length}`

          const value = x01 ? String(ps.remaining) : '—'

          return (
            <PlayerCard
              key={p.id}
              name={p.name}
              subtitle={subtitle}
              value={value}
              active={active}
            />
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400">Vstup</div>
              <div className="text-lg font-semibold">Klávesnice</div>
            </div>
            <div className="text-sm text-zinc-400">
              Multiplikátor:{' '}
              {state.multiplier === 1
                ? '—'
                : state.multiplier === 2
                ? 'D'
                : 'T'}
            </div>
          </div>

          <Keypad onHit={(v) => dispatch({ type: 'THROW', value: v })} />
        </div>

        <div className="h-full rounded-2xl border border-zinc-800 p-4">
          <div className="mb-3">
            <div className="text-xs text-zinc-400">Ovládací prvky</div>
            <div className="text-lg font-semibold">Akce</div>
          </div>

          <ControlsBar
            multiplier={state.multiplier}
            dartsThrown={state.dartsThrown}
            isGameFinished={state.isFinished}
            onDouble={() => dispatch({ type: 'SET_MULTIPLIER', value: 2 })}
            onTriple={() => dispatch({ type: 'SET_MULTIPLIER', value: 3 })}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onEndTurn={() => dispatch({ type: 'NEXT_PLAYER' })}
            onBackToSetup={() => dispatch({ type: 'RESET_TO_SETUP' })}
          />
        </div>
      </div>
    </div>
  )
}
