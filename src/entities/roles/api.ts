import type { AxiosInstance } from 'axios'
import type { RoleFull } from './types'

export async function fetchRoles(http: AxiosInstance): Promise<RoleFull[]> {
  const { data } = await http.get<RoleFull[]>('/users/roles/full')

  return data
}
