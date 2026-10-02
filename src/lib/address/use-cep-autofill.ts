'use client'

import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addressKeys } from '../../query/keys'
import { digitsOnly } from '../format'
import { fetchCep } from './cep'
import { canonicalCityName } from './city-lookup'

interface Options {
  setValue: (name: string, value: unknown) => void
  clearErrors: (name: string) => void
  prefix?: string
}

export function useCepAutofill({ setValue, clearErrors, prefix = 'address' }: Options) {
  const queryClient = useQueryClient()
  const latest = useRef<string | null>(null)
  const [loading, setLoading] = useState(false)

  const lookup = useCallback(
    async (value: string) => {
      const digits = digitsOnly(value)
      latest.current = digits.length === 8 ? digits : null

      if (!latest.current) {
        setLoading(false)

        return
      }

      setLoading(true)

      const result = await queryClient
        .fetchQuery({
          queryKey: addressKeys.cep(digits),
          queryFn: async ({ signal }) => {
            const found = await fetchCep(digits, signal)
            if (!found) throw new Error('CEP não encontrado')

            return found
          },
          staleTime: Infinity,
        })
        .catch(() => null)

      if (latest.current !== digits) return

      setLoading(false)

      if (!result) return

      const field = (name: string) => (prefix ? `${prefix}.${name}` : name)
      const apply = (name: string, next: string) => {
        setValue(field(name), next)

        if (next) clearErrors(field(name))
      }

      apply('uf', result.uf)
      apply('city', canonicalCityName(result.city, result.uf))
      apply('street', result.street)
      apply('district', result.district)
    },
    [queryClient, setValue, clearErrors, prefix],
  )

  return { loading, lookup }
}
