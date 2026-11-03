'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { profileKeys } from '../../query/keys'
import { STALE_TIME } from '../../query/stale-time'
import { fetchMe } from './api'

export function useMe() {
  const http = useHttp()

  return useQuery({
    queryKey: profileKeys.me,
    queryFn: () => fetchMe(http),
    staleTime: STALE_TIME.administrative,
    // Formulário de edição: não editar em cima de cache
    refetchOnMount: 'always',
  })
}
