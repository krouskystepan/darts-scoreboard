export const uid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export const shuffle = <T>(arr: readonly T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j] as T
    a[j] = tmp as T
  }
  return a
}
