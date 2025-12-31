import type {
  Action,
  GameConfig,
  GameState,
  Multiplier,
  Player,
  PlayerState,
  Snapshot,
  ThrowItem
} from './types'
import { uid, shuffle } from '../id'
import { canCheckIn, canCheckOut, clampX01Value } from '../rules/x01'
import { clampPracticeValue } from '../rules/practice'
import { formatTarget } from './selectors'

const M1: Multiplier = 1

const getPlayer = (players: readonly Player[], index: number): Player => {
  const p = players[index]
  if (!p) throw new Error(`Invalid player index: ${index}`)
  return p
}

const getPS = (ps: Record<string, PlayerState>, id: string): PlayerState => {
  const v = ps[id]
  if (!v) throw new Error(`Missing playerState for: ${id}`)
  return v
}

const makePlayerState = (
  players: readonly Player[],
  startPoints: number,
  straightIn: boolean
): Record<string, PlayerState> => {
  const out: Record<string, PlayerState> = {}
  for (const p of players) {
    out[p.id] = {
      remaining: startPoints,
      legsWon: 0,
      setsWon: 0,
      hasCheckedIn: straightIn
    }
  }
  return out
}

const snapshot = (s: GameState): Snapshot => ({
  currentPlayerIndex: s.currentPlayerIndex,
  startingPlayerIndex: s.startingPlayerIndex,
  dartsThrown: s.dartsThrown,
  multiplier: s.multiplier,
  playerState: { ...s.playerState },
  history: [...s.history],
  isFinished: s.isFinished
})

const pushUndo = (s: GameState): GameState => ({
  ...s,
  undoStack: [snapshot(s), ...s.undoStack].slice(0, 50)
})

const restore = (s: GameState): GameState => {
  const top = s.undoStack[0]
  if (!top) return s
  return {
    ...s,
    currentPlayerIndex: top.currentPlayerIndex,
    startingPlayerIndex: top.startingPlayerIndex,
    dartsThrown: top.dartsThrown,
    multiplier: top.multiplier,
    playerState: top.playerState,
    history: top.history,
    undoStack: s.undoStack.slice(1),
    isFinished: top.isFinished
  }
}

const nextPlayer = (s: GameState): GameState => {
  if (s.players.length === 0) return s
  return {
    ...s,
    currentPlayerIndex: (s.currentPlayerIndex + 1) % s.players.length,
    dartsThrown: 0,
    multiplier: M1
  }
}

const resetLegX01 = (s: GameState, nextStarter: number): GameState => {
  if (s.config.mode !== 'X01') return s
  const cfg = s.config.x01

  const ps: Record<string, PlayerState> = {}
  for (const p of s.players) {
    const prev = s.playerState[p.id] ?? {
      remaining: cfg.startPoints,
      legsWon: 0,
      setsWon: 0,
      hasCheckedIn: cfg.checkIn === 'STRAIGHT'
    }

    ps[p.id] = {
      remaining: cfg.startPoints,
      legsWon: prev.legsWon,
      setsWon: prev.setsWon,
      hasCheckedIn: cfg.checkIn === 'STRAIGHT'
    }
  }

  const safeStarter =
    s.players.length === 0
      ? 0
      : ((nextStarter % s.players.length) + s.players.length) % s.players.length

  return {
    ...s,
    playerState: ps,
    currentPlayerIndex: safeStarter,
    startingPlayerIndex: safeStarter,
    dartsThrown: 0,
    multiplier: M1,
    history: [],
    undoStack: [],
    isFinished: false
  }
}

const endLegX01 = (s: GameState, winnerId: string): GameState => {
  if (s.config.mode !== 'X01') return s
  const cfg = s.config.x01

  const ps: Record<string, PlayerState> = { ...s.playerState }
  const w0 = getPS(ps, winnerId)

  ps[winnerId] = { ...w0, legsWon: w0.legsWon + 1 }

  if (cfg.sets > 1 && ps[winnerId].legsWon >= cfg.legsPerSet) {
    const w1 = getPS(ps, winnerId)
    ps[winnerId] = { ...w1, legsWon: 0, setsWon: w1.setsWon + 1 }

    for (const p of s.players) {
      if (p.id === winnerId) continue
      const st = getPS(ps, p.id)
      ps[p.id] = { ...st, legsWon: 0 }
    }
  }

  const target = formatTarget(cfg.format)
  const w2 = getPS(ps, winnerId)
  const matchFinished =
    cfg.sets > 1 ? w2.setsWon >= target : w2.legsWon >= target

  if (matchFinished) {
    return { ...s, playerState: ps, isFinished: true }
  }

  const nextStarter =
    s.players.length === 0 ? 0 : (s.startingPlayerIndex + 1) % s.players.length
  return resetLegX01({ ...s, playerState: ps }, nextStarter)
}

const applyThrowX01 = (s: GameState, raw: number): GameState => {
  if (s.config.mode !== 'X01' || s.isFinished) return s
  if (s.players.length === 0) return s

  const cfg = s.config.x01
  const value = clampX01Value(raw)

  const p = getPlayer(s.players, s.currentPlayerIndex)
  const ps0 = getPS(s.playerState, p.id)

  const m: Multiplier = s.multiplier
  const counts = ps0.hasCheckedIn || canCheckIn(cfg.checkIn, m)
  const points = counts ? value * m : 0

  const nextRemaining = ps0.remaining - points

  const invalidCheckout =
    counts && nextRemaining === 0 && !canCheckOut(cfg.checkOut, m)

  const impossibleFinish =
    counts && nextRemaining === 1 && cfg.checkOut !== 'STRAIGHT'

  const isBust =
    counts && (nextRemaining < 0 || invalidCheckout || impossibleFinish)

  const isCheckout = counts && nextRemaining === 0 && !isBust

  const withUndo = pushUndo(s)

  const throwItem: ThrowItem = {
    id: uid(),
    playerId: p.id,
    dartIndex: withUndo.dartsThrown,
    value,
    multiplier: m,
    points,
    timestamp: Date.now()
  }

  // CHECKOUT
  if (isCheckout) {
    const checkoutState: GameState = {
      ...withUndo,
      history: [...withUndo.history, throwItem],
      playerState: {
        ...withUndo.playerState,
        [p.id]: {
          remaining: nextRemaining,
          legsWon: ps0.legsWon,
          setsWon: ps0.setsWon,
          hasCheckedIn: ps0.hasCheckedIn || counts
        }
      },
      multiplier: M1
    }

    return endLegX01(checkoutState, p.id)
  }

  // BUST → návrat na ZAČÁTEK KOLA
  if (isBust) {
    const restored = restore(withUndo)
    return nextPlayer(restored)
  }

  // NORMAL THROW
  const ps1: PlayerState = {
    remaining: counts ? nextRemaining : ps0.remaining,
    legsWon: ps0.legsWon,
    setsWon: ps0.setsWon,
    hasCheckedIn: ps0.hasCheckedIn || counts
  }

  const normalState: GameState = {
    ...withUndo,
    history: [...withUndo.history, throwItem],
    playerState: {
      ...withUndo.playerState,
      [p.id]: ps1
    },
    multiplier: M1
  }

  if (withUndo.dartsThrown === 2) {
    return nextPlayer(normalState)
  }

  return {
    ...normalState,
    dartsThrown: (withUndo.dartsThrown + 1) as 0 | 1 | 2
  }
}

const applyThrowPractice = (s: GameState, raw: number): GameState => {
  if (s.config.mode !== 'PRACTICE') return s
  if (s.players.length === 0) return s

  const value = clampPracticeValue(raw)
  const p = getPlayer(s.players, s.currentPlayerIndex)

  const m: Multiplier = s.multiplier
  const withUndo = pushUndo(s)

  const throwItem: ThrowItem = {
    id: uid(),
    playerId: p.id,
    dartIndex: withUndo.dartsThrown,
    value,
    multiplier: m,
    points: value * m,
    timestamp: Date.now()
  }

  const next: GameState = {
    ...withUndo,
    history: [...withUndo.history, throwItem],
    multiplier: M1
  }

  if (withUndo.dartsThrown === 2) return nextPlayer(next)

  return { ...next, dartsThrown: (withUndo.dartsThrown + 1) as 0 | 1 | 2 }
}

const initialFromConfig = (
  config: GameConfig,
  playersIn: Player[]
): GameState => {
  const players =
    (config.mode === 'X01' && config.x01.randomOrder) ||
    (config.mode === 'PRACTICE' && config.practice.randomOrder)
      ? shuffle(playersIn)
      : [...playersIn]

  const straightIn = config.mode === 'X01' && config.x01.checkIn === 'STRAIGHT'
  const startPoints = config.mode === 'X01' ? config.x01.startPoints : 0

  return {
    config,
    players,
    playerState: makePlayerState(players, startPoints, straightIn),
    currentPlayerIndex: 0,
    startingPlayerIndex: 0,
    dartsThrown: 0,
    multiplier: M1,
    history: [],
    undoStack: [],
    isFinished: false
  }
}

export const reducer = (
  state: GameState | null,
  action: Action
): GameState | null => {
  switch (action.type) {
    case 'RESET_TO_SETUP':
      return null

    case 'RESUME':
      return action.state

    case 'NEW_GAME':
      return initialFromConfig(action.config, action.players)

    case 'SET_MULTIPLIER':
      if (!state) return state
      return {
        ...state,
        multiplier: state.multiplier === action.value ? 1 : action.value
      }

    case 'THROW':
      if (!state) return state
      return state.config.mode === 'X01'
        ? applyThrowX01(state, action.value)
        : applyThrowPractice(state, action.value)

    case 'UNDO':
      return state ? restore(state) : state

    case 'NEXT_PLAYER':
      return state ? nextPlayer(state) : state

    case 'CLEAR_STORAGE':
      return state

    default:
      return state
  }
}
