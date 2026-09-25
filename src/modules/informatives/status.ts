export type InformativeStatus = 'scheduled' | 'active' | 'expired'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function formatDateOnly(value: Date | null | undefined): string | null {
  if (!value) return null
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}


export function displayDateOnly(value: string | null | undefined): string | null {
  const d = parseDateOnly(value)
  if (!d) return null
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function today(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function deriveStatus(
  initialDate: string | null | undefined,
  finalDate: string | null | undefined,
): InformativeStatus {
  const now = today()
  const start = parseDateOnly(initialDate)
  const end = parseDateOnly(finalDate)

  if (start && start > now) return 'scheduled'
  if (end && end < now) return 'expired'
  return 'active'
}

export const STATUS_LABEL: Record<InformativeStatus, string> = {
  scheduled: 'Agendado',
  active: 'Ativo',
  expired: 'Expirado',
}

export const STATUS_VARIANT: Record<InformativeStatus, 'info' | 'success' | 'default'> = {
  scheduled: 'info',
  active: 'success',
  expired: 'default',
}
