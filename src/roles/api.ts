import type { QueryClient } from '@tanstack/react-query'
import type { AxiosInstance } from 'axios'
import { roleKeys } from '../query/keys'
import type { RoleOption } from '../types'

export async function fetchRoleOptions(http: AxiosInstance): Promise<RoleOption[]> {
  const { data } = await http.get<RoleOption[]>('/users/roles/full')

  return data.map(({ id, name }) => ({ id, name }))
}

export function prefetchRoleOptions(queryClient: QueryClient, http: AxiosInstance): Promise<void> {
  return queryClient.prefetchQuery({ queryKey: roleKeys.options, queryFn: () => fetchRoleOptions(http) })
}
