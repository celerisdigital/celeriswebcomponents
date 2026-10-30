'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { userKeys } from '../../query/keys'
import { STALE_TIME } from '../../query/stale-time'
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

  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => fetchUsers(http, query),
    staleTime: STALE_TIME.administrative,
    placeholderData: keepPreviousData,
  })
}

export function useUserTree(parentId: number) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.tree(parentId),
    queryFn: () => fetchUserTree(http, parentId),
    staleTime: STALE_TIME.administrative,
  })
}

interface UseUserOptions {
  /** Formulário de edição passa `'always'`: não editar em cima de cache */
  refetchOnMount?: 'always'
}

export function useUser(id: number | null, { refetchOnMount }: UseUserOptions = {}) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.detail(id ?? 0),
    queryFn: () => fetchUser(http, id ?? 0),
    enabled: id !== null,
    staleTime: STALE_TIME.administrative,
    refetchOnMount: refetchOnMount ?? true,
  })
}

export function useUserFiles(id: number | null) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.files(id ?? 0),
    queryFn: () => fetchUserFiles(http, id ?? 0),
    enabled: id !== null,
    staleTime: STALE_TIME.administrative,
  })
}

export function useUserChain(id: number, enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.chain(id),
    queryFn: () => fetchUserChain(http, id),
    enabled,
    staleTime: STALE_TIME.administrative,
  })
}

export function useContractStatus(id: number | null, enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.contractStatus(id ?? 0),
    queryFn: () => fetchContractStatus(http, id ?? 0),
    enabled: enabled && id !== null,
    // A assinatura acontece fora da tela (fluxo de contrato)
    staleTime: STALE_TIME.operational,
  })
}

export function usePermissionCatalog(enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.permissionCatalog,
    queryFn: () => fetchPermissionCatalog(http),
    enabled,
    staleTime: STALE_TIME.reference,
  })
}

export function useFinanceLevels(enabled: boolean) {
  const http = useHttp()

  return useQuery({
    queryKey: userKeys.financeLevels,
    queryFn: () => fetchFinanceLevels(http),
    enabled,
    staleTime: STALE_TIME.reference,
  })
}

export function useBlockRules() {
  const http = useHttp()

  return useQuery({ queryKey: userKeys.blockRules, queryFn: () => fetchBlockRules(http), staleTime: STALE_TIME.administrative })
}
