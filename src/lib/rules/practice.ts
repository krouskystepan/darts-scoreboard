export const clampPracticeValue = (v: number): number => {
  if (v === 25) return 25
  if (v >= 0 && v <= 20) return v
  return 0
}
