import type { Persisted } from './engine/types'

const KEY = 'darts_scoreboard_v1'

export const save = (data: Persisted): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export const load = (): Persisted | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Persisted
    if (!parsed || parsed.schema !== 1) return null
    return parsed
  } catch {
    return null
  }
}

export const clear = (): void => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
