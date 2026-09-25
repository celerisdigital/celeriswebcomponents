'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { informativeKeys } from '../../query/keys'
import { fetchActiveInformatives, fetchInformatives } from './api'
import type { InformativesQuery } from './types'

export function useInformatives(query: InformativesQuery) {
  const http = useHttp()

  return useQuery({
    queryKey: informativeKeys.list(query),
    queryFn: () => fetchInformatives(http, query),
  })
}

export function useActiveInformatives() {
  const http = useHttp()

  return useQuery({
    queryKey: informativeKeys.active,
    queryFn: () => fetchActiveInformatives(http),
  })
}
