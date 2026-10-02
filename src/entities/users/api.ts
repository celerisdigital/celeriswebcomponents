import type { AxiosInstance } from 'axios'
import type { DocumentOwner, UserOption } from './types'

interface UserRow {
  id?: number
  name: string
  document: string
}

export async function fetchUserOptions(
  http: AxiosInstance,
  params: { role?: string; search?: string; limit: number },
): Promise<UserOption[]> {
  try {
    const { data } = await http.get<{ rows: UserRow[] }>('/users', {
      params: { limit: params.limit, offset: 0, role: params.role || undefined, search: params.search || undefined },
    })

    return data.rows.flatMap((u) => (u.id === undefined ? [] : [{ id: u.id, name: u.name, document: u.document }]))
  } catch {
    return []
  }
}

export async function fetchCpfOwner(http: AxiosInstance, cpf: string): Promise<DocumentOwner> {
  const { data } = await http.get<{ name?: string; email?: string | null }>(`/users/document/${cpf}`)

  if (!data?.name) throw new Error('CPF não encontrado')

  return { name: data.name, email: data.email || undefined }
}
