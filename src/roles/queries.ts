'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../query/provider'
import { roleKeys } from '../query/keys'
import { fetchRoleOptions } from './api'

export function useRoleOptions() {
  const http = useHttp()

  return useQuery({
    queryKey: roleKeys.options,
    queryFn: () => fetchRoleOptions(http),
  })
}
