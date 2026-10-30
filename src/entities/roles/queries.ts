'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { roleKeys } from '../../query/keys'
import { STALE_TIME } from '../../query/stale-time'
import type { RoleOption } from '../../types'
import { fetchRoles } from './api'
import type { RoleFull } from './types'

function toOptions(roles: RoleFull[]): RoleOption[] {
  return roles.map(({ id, name }) => ({ id, name }))
}

export function useRoles() {
  const http = useHttp()

  return useQuery({ queryKey: roleKeys.full, queryFn: () => fetchRoles(http), staleTime: STALE_TIME.reference })
}

export function useRoleOptions() {
  const http = useHttp()

  return useQuery({
    queryKey: roleKeys.full,
    queryFn: () => fetchRoles(http),
    select: toOptions,
    staleTime: STALE_TIME.reference,
  })
}
