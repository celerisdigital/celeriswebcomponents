'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { userKeys } from '../../query/keys'
import {
  fetchBlockRules,
  fetchContractStatus,
  fetchFinanceLevels,
  fetchPermissionCatalog,
  fetchUser,
  fetchUserChain,
  fetchUserFiles,
  fetchUserTree,
  fetchUsers,
} from './api'
import type { IUsersQuery } from './types'

export function useUsers(query: IUsersQuery) {
  const http = useHttp()

  return useQuery({ queryKey: userKeys.list(query), queryFn: () => fetchUsers(http, query) })
}

export function useUserTree(parentId: number) {
  const http = useHttp()

  return useQuery({ queryKey: userKeys.tree(parentId), queryFn: () => fetchUserTree(http, parentId) })
}

export function useUser(id: number | null) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.detail(id ?? 0),
    queryFn: () => fetchUser(http, id ?? 0),
    enabled: id !== null,
  })
}

export function useUserFiles(id: number | null) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.files(id ?? 0),
    queryFn: () => fetchUserFiles(http, id ?? 0),
    enabled: id !== null,
  })
}

export function useUserChain(id: number, enabled: boolean) {
  const http = useHttp()

  return useQuery({ queryKey: userKeys.chain(id), queryFn: () => fetchUserChain(http, id), enabled })
}

export function useContractStatus(id: number | null, enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.contractStatus(id ?? 0),
    queryFn: () => fetchContractStatus(http, id ?? 0),
    enabled: enabled && id !== null,
  })
}

export function usePermissionCatalog(enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.permissionCatalog,
    queryFn: () => fetchPermissionCatalog(http),
    enabled,
    staleTime: Infinity,
  })
}

export function useFinanceLevels(enabled: boolean) {
  const http = useHttp()

  return useQuery({ queryKey: userKeys.financeLevels, queryFn: () => fetchFinanceLevels(http), enabled })
}

export function useBlockRules() {
  const http = useHttp()

  return useQuery({ queryKey: userKeys.blockRules, queryFn: () => fetchBlockRules(http) })
}
