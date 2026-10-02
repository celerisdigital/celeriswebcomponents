import { isCancel } from 'axios'
import { brasilApi } from '../../http/brasil-api'
import { digitsOnly } from '../format'

export interface CepResult {
  street: string
  district: string
  city: string
  uf: string
}

interface BrasilApiCep {
  street?: string
  neighborhood?: string
  city?: string
  state?: string
}

const CEP_VERSIONS = ['v2', 'v1']

export async function fetchCep(cep: string, signal?: AbortSignal): Promise<CepResult | null> {
  const digits = digitsOnly(cep)
  if (digits.length !== 8) return null

  for (const version of CEP_VERSIONS) {
    try {
      const { data } = await brasilApi.get<BrasilApiCep>(`/cep/${version}/${digits}`, { signal })

      return {
        street: data.street ?? '',
        district: data.neighborhood ?? '',
        city: data.city ?? '',
        uf: data.state ?? '',
      }
    } catch (error) {
      if (isCancel(error)) return null
    }
  }

  return null
}
