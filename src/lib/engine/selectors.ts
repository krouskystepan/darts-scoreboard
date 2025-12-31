import type { GameState, MatchFormat } from './types'

export const formatTarget = (format: MatchFormat): number => {
  if (format.type === 'FIRST_TO') return Math.max(1, Math.floor(format.value))
  const n = Math.max(1, Math.floor(format.value))
  return Math.floor(n / 2) + 1
}

export const currentPlayer = (s: GameState) => s.players[s.currentPlayerIndex]

export const isX01 = (s: GameState): boolean => s.config.mode === 'X01'

export const x01Config = (s: GameState) => {
  if (s.config.mode !== 'X01') throw new Error('not X01')
  return s.config.x01
}

export const matchWinTarget = (s: GameState): number => {
  if (s.config.mode !== 'X01') return 0
  const cfg = s.config.x01
  return formatTarget(cfg.format)
}
