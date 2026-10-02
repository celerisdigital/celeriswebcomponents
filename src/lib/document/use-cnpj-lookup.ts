'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { documentKeys } from '../../query/keys'
import { digitsOnly } from '../format'
import { fetchCnpj, type CnpjResult } from './cnpj'

export function useCnpjLookup() {
  const queryClient = useQueryClient()

  return useCallback(
    (cnpj: string): Promise<CnpjResult | null> => {
      const digits = digitsOnly(cnpj)

      if (digits.length !== 14) return Promise.resolve(null)

      return queryClient
        .fetchQuery({
          queryKey: documentKeys.cnpj(digits),
          queryFn: async () => {
            const found = await fetchCnpj(digits)
            if (!found?.razaoSocial) throw new Error('CNPJ não encontrado')

            return found
          },
          staleTime: Infinity,
        })
        .catch(() => null)
    },
    [queryClient],
  )
}
