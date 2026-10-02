'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { userKeys } from '../../query/keys'
import { digitsOnly } from '../../lib/format'
import { fetchCpfOwner, fetchUserOptions } from './api'
import type { DocumentOwner } from './types'

export function useUserOptionsByRole(roleId: string | undefined) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.optionsByRole(roleId ?? ''),
    queryFn: () => fetchUserOptions(http, { role: roleId, limit: 100 }),
    enabled: !!roleId,
  })
}

export function useUserOptionsSearch(roleId: string | undefined, search: string, enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.optionsSearch(roleId ?? null, search),
    queryFn: () => fetchUserOptions(http, { role: roleId, search, limit: roleId ? 100 : 20 }),
    enabled: enabled && !!search,
  })
}

export function useCpfLookup() {
  const http = useHttp()
  const queryClient = useQueryClient()

  return useCallback(
    (cpf: string): Promise<DocumentOwner | null> => {
      const digits = digitsOnly(cpf)

      if (digits.length !== 11) return Promise.resolve(null)

      return queryClient
        .fetchQuery({
          queryKey: userKeys.document(digits),
          queryFn: () => fetchCpfOwner(http, digits),
          staleTime: Infinity,
        })
        .catch(() => null)
    },
    [http, queryClient],
  )
}
