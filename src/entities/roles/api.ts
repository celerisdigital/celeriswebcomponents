import type { QueryClient } from '@tanstack/react-query'
import type { AxiosInstance } from 'axios'
import { roleKeys } from '../../query/keys'
import type { RoleFull } from './types'

export async function fetchRoles(http: AxiosInstance): Promise<RoleFull[]> {
  const { data } = await http.get<RoleFull[]>('/users/roles/full')

  return data
}

export function prefetchRoles(queryClient: QueryClient, http: AxiosInstance): Promise<void> {
  return queryClient.prefetchQuery({ queryKey: roleKeys.full, queryFn: () => fetchRoles(http) })
}
