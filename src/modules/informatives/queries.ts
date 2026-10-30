'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { informativeKeys } from '../../query/keys'
import { STALE_TIME } from '../../query/stale-time'
import { fetchActiveInformatives, fetchInformative, fetchInformatives } from './api'
import type { InformativesQuery } from './types'

export function useInformatives(query: InformativesQuery) {
  const http = useHttp()

  return useQuery({
    queryKey: informativeKeys.list(query),
    queryFn: () => fetchInformatives(http, query),
    staleTime: STALE_TIME.administrative,
    placeholderData: keepPreviousData,
  })
}

export function useActiveInformatives() {
  const http = useHttp()

  return useQuery({
    queryKey: informativeKeys.active,
    queryFn: () => fetchActiveInformatives(http),
    staleTime: STALE_TIME.administrative,
    // A fila de modais fica montada no layout: é a volta à aba que traz informativo novo sem F5
    refetchOnWindowFocus: true,
  })
}

export function useInformative(id: number | null) {
  const http = useHttp()

  return useQuery({
    queryKey: informativeKeys.detail(id ?? 0),
    queryFn: () => fetchInformative(http, id ?? 0),
    enabled: !!id,
    staleTime: STALE_TIME.administrative,
    // Formulário de edição: não editar em cima de cache
    refetchOnMount: 'always',
  })
}
