import { digitsOnly, maskCNPJ, maskCPF, maskPhone } from '../../../lib/format'

export interface PixSuggestionSource {
  holderDocument?: string
  email?: string
  phone?: string
}

export function suggestPixKey(kind: string, source: PixSuggestionSource): string {
  const holder = digitsOnly(source.holderDocument ?? '')

  if (kind === 'cpf') return holder.length === 11 ? maskCPF(holder) : ''

  if (kind === 'cnpj') return holder.length === 14 ? maskCNPJ(holder) : ''

  if (kind === 'email') return source.email ?? ''

  if (kind === 'phone') {
    const digits = digitsOnly(source.phone ?? '')
    const local = digits.length >= 12 ? digits.slice(2) : digits

    return local.length === 10 || local.length === 11 ? maskPhone(local) : ''
  }

  return ''
}
