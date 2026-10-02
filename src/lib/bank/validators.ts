export function isInvalidNumericSequence(value: string): boolean {
  if (!value || value.length <= 1) return false

  const chars = value.split('').map((n) => Number(n))
  if (chars.some(Number.isNaN)) return false

  if (chars.every((n) => n === chars[0])) return true

  if (chars.every((n, i) => i === 0 || n === chars[i - 1] + 1)) return true

  if (chars.every((n, i) => i === 0 || n === chars[i - 1] - 1)) return true

  return false
}
