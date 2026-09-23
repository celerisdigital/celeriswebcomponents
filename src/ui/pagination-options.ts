export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export const DEFAULT_PAGE_SIZE = 10

export function resolvePageSize(raw: string | number | undefined): number {
  const n = typeof raw === 'string' ? Number(raw) : raw
  if (typeof n !== 'number' || !PAGE_SIZE_OPTIONS.includes(n)) return DEFAULT_PAGE_SIZE
  return n
}
