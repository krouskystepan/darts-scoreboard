export type GameMode = 'X01' | 'PRACTICE'

export type InRule = 'STRAIGHT' | 'DOUBLE' | 'MASTER'
export type OutRule = 'STRAIGHT' | 'DOUBLE' | 'MASTER'

export type Multiplier = 1 | 2 | 3

export type MatchFormat =
  | { type: 'FIRST_TO'; value: number }
  | { type: 'BEST_OF'; value: number }

export type Player = {
  id: string
  name: string
}

export type X01Config = {
  startPoints: 301 | 501 | 701
  checkIn: InRule
  checkOut: OutRule
  legsPerSet: number // legs needed to win a set
  sets: number // total sets in match (>=1)
  format: MatchFormat // applies to sets if sets>1, else to legs
  randomOrder: boolean
}

export type PracticeConfig = {
  randomOrder: boolean
}

export type GameConfig =
  | { mode: 'X01'; x01: X01Config }
  | { mode: 'PRACTICE'; practice: PracticeConfig }

export type PlayerState = {
  remaining: number // X01 only
  legsWon: number
  setsWon: number
  hasCheckedIn: boolean // X01 only
}

export type ThrowItem = {
  id: string
  playerId: string
  dartIndex: 0 | 1 | 2
  value: number // 0, 1..20, 25
  multiplier: Multiplier
  points: number // value * multiplier (or 0 if not counted)
  timestamp: number
}

export type Snapshot = {
  currentPlayerIndex: number
  startingPlayerIndex: number
  dartsThrown: 0 | 1 | 2
  multiplier: Multiplier
  playerState: Record<string, PlayerState>
  history: ThrowItem[]
  isFinished: boolean
}

export type GameState = {
  config: GameConfig
  players: Player[]

  // turn
  currentPlayerIndex: number
  startingPlayerIndex: number // who starts current leg
  dartsThrown: 0 | 1 | 2
  multiplier: Multiplier

  // per player
  playerState: Record<string, PlayerState>

  // history
  history: ThrowItem[]
  undoStack: Snapshot[]

  // status
  isFinished: boolean
}

export type Persisted = {
  schema: 1
  state: GameState
}

export type Action =
  | { type: 'NEW_GAME'; config: GameConfig; players: Player[] }
  | { type: 'RESUME'; state: GameState }
  | { type: 'RESET_TO_SETUP' }
  | { type: 'SET_MULTIPLIER'; value: Multiplier }
  | { type: 'THROW'; value: number }
  | { type: 'UNDO' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'CLEAR_STORAGE' }
