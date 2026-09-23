export function digitsOnly(value: string): string {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

const currencyFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formata número (em reais) como "R$ 1.234,56". `null`/`undefined`/`NaN` retornam "R$ 0,00". */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00'
  return currencyFmt.format(value)
}

/** Máscara progressiva para input — recebe número em reais e devolve string formatada. */
export function maskCurrency(value: number): string {
  return formatCurrency(value)
}

/** Converte total de meses em "X ano(s) [e Y mes(es)]". Retorna "" para 0/null/undefined. */
export function monthsToYearsLabel(months?: number | null): string {
  if (!months || months <= 0) return ''
  const rest = months % 12
  const years = Math.floor(months / 12)
  let label = ''
  if (years > 0) label += `${years} ano${years > 1 ? 's' : ''}`
  if (rest > 0) label += `${years > 0 ? ' e ' : ''}${rest} ${rest > 1 ? 'meses' : 'mês'}`
  return label
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return '—'
  return dateFmt.format(d)
}

const dateShortFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateOnlyFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Formata uma data "pura" (string "YYYY-MM-DD", sem hora, ex: vinda de um sistema externo) como
 * "dd/mm/yyyy" sem deslocar pro fuso local -- `new Date("YYYY-MM-DD")` sempre parseia como
 * meia-noite UTC, e formatar isso no fuso do Brasil (UTC-3) mostraria o dia anterior.
 */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return dateOnlyFmt.format(d)
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

/** Formata como "dd/mm/yyyy às HH:mm". */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return '—'
  return `${dateShortFmt.format(d)} às ${timeFmt.format(d)}`
}

/** Formata apenas hora "HH:mm". */
export function formatTime(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return '—'
  return timeFmt.format(d)
}

/** Formata data curta "dd/mm/yyyy". */
export function formatDateShort(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return '—'
  return dateShortFmt.format(d)
}

export function formatDocument(doc: string | null | undefined): string {
  if (!doc) return '—'
  const digits = digitsOnly(doc)
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return doc
}

export function formatCep(cep: string | null | undefined): string {
  if (!cep) return '—'
  const digits = digitsOnly(cep)
  if (digits.length === 8) return digits.replace(/(\d{5})(\d{3})/, '$1-$2')
  return cep
}

export function maskCEP(value: string): string {
  const d = digitsOnly(value).slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

export function maskCPF(value: string): string {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function maskCNPJ(value: string): string {
  const d = digitsOnly(value).slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function maskPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskBankAccount(value: string): string {
  const raw = value
    .toUpperCase()
    .replace(/[^0-9X]/g, '')
    .split('')
    .filter((ch, i, arr) => ch !== 'X' || i === arr.length - 1)
    .join('')

  if (raw.length <= 1) return raw

  return `${raw.slice(0, -1)}-${raw.slice(-1)}`
}

export function splitBankAccount(value: string): { accountNumber: string; accountDigit: string } {
  const [accountNumber = '', accountDigit = ''] = value.split('-')

  return { accountNumber, accountDigit }
}

export function joinBankAccount(accountNumber: string, accountDigit: string): string {
  const number = accountNumber.split('-')[0] ?? ''

  if (!number) return ''

  return accountDigit ? `${number}-${accountDigit}` : number
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const digits = digitsOnly(phone)
  // strip country code 55
  const local = digits.length >= 12 ? digits.slice(2) : digits
  if (local.length === 11) {
    return local.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (local.length === 10) {
    return local.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}
