import type { InRule, OutRule, Multiplier } from '../engine/types'

export const canCheckIn = (rule: InRule, m: Multiplier): boolean => {
  if (rule === 'STRAIGHT') return true
  if (rule === 'DOUBLE') return m === 2
  return m === 2 || m === 3
}

export const canCheckOut = (rule: OutRule, m: Multiplier): boolean => {
  if (rule === 'STRAIGHT') return true
  if (rule === 'DOUBLE') return m === 2
  return m === 2 || m === 3
}

export const clampX01Value = (v: number): number => {
  if (v === 25) return 25
  if (v >= 0 && v <= 20) return v
  return 0
}
