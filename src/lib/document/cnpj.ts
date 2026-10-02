import { brasilApi } from '../../http/brasil-api'
import { digitsOnly } from '../format'

export interface CnpjResult {
  razaoSocial: string
  nomeFantasia: string
}

interface BrasilApiCnpj {
  razao_social?: string
  nome_fantasia?: string
}

export async function fetchCnpj(cnpj: string): Promise<CnpjResult | null> {
  const digits = digitsOnly(cnpj)
  if (digits.length !== 14) return null

  try {
    const { data } = await brasilApi.get<BrasilApiCnpj>(`/cnpj/v1/${digits}`)

    return {
      razaoSocial: data.razao_social ?? '',
      nomeFantasia: data.nome_fantasia ?? '',
    }
  } catch {
    return null
  }
}
