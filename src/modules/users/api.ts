import type { AxiosInstance } from 'axios'
import type {
  IBlockRule,
  IBlockRulePayload,
  IChainUser,
  IChangeStatusPayload,
  IContractStatus,
  ICreateUserPayload,
  IFinanceLevel,
  IPermissionCatalog,
  IPermissionDef,
  IUpdateUserPayload,
  IUser,
  IUserFile,
  IUserTree,
  IUsersFilters,
  IUsersPage,
  IUsersQuery,
} from './types'

const TREE_LIMIT = 50000

function filterParams(filters: IUsersFilters) {
  return {
    status: filters.status,
    role: filters.role || undefined,
    search: filters.search || undefined,
    parentId: filters.parentId || undefined,
    createdAtStart: filters.createdAtStart || undefined,
    createdAtEnd: filters.createdAtEnd || undefined,
    commissionLevelId: filters.commissionLevelId,
  }
}

export async function fetchUsers(http: AxiosInstance, query: IUsersQuery): Promise<IUsersPage> {
  const { data } = await http.get<IUsersPage>('/users', {
    params: { limit: query.limit, offset: query.offset, ...filterParams(query) },
  })

  return data
}

export async function fetchUser(http: AxiosInstance, id: number): Promise<IUser | null> {
  try {
    const { data } = await http.get<IUser>(`/users/${id}`)

    return data
  } catch {
    return null
  }
}

export async function fetchUserTree(http: AxiosInstance, parentId: number): Promise<IUserTree> {
  const [root, page] = await Promise.all([
    fetchUser(http, parentId),
    fetchUsers(http, { parentId, limit: TREE_LIMIT, offset: 0 }),
  ])

  return { root, rows: page.rows }
}

export async function fetchUserFiles(http: AxiosInstance, id: number): Promise<IUserFile[]> {
  const { data } = await http.get<{ data?: IUserFile[] }>(`/users/files/${id}`)

  return data.data ?? []
}

export async function fetchUserChain(http: AxiosInstance, id: number): Promise<IChainUser[]> {
  const { data } = await http.get<IChainUser[]>(`/users/${id}/chain`)

  return data
}

export async function fetchContractStatus(http: AxiosInstance, userId: number): Promise<IContractStatus | null> {
  try {
    const { data } = await http.get<IContractStatus | { data: IContractStatus | null }>(
      `/contracts/users/${userId}/status`,
    )
    const status = 'data' in data ? data.data : data

    return status?.id ? status : null
  } catch {
    return null
  }
}

export async function sendContractSignature(http: AxiosInstance, userId: number): Promise<void> {
  const { data } = await http.get<{ id?: number } | { data: { id?: number } | null }>(`/contracts/users/${userId}`)
  const flowUser = 'data' in data ? data.data : data

  if (!flowUser?.id) throw new Error('Não há campanha de assinatura ativa para o perfil deste usuário.')

  await http.post(`/contracts/users/resend/${flowUser.id}/${userId}`)
}

interface PermissionNode {
  value: number
  name: string
  subPermissions?: Record<string, PermissionNode>
}

function flattenPermissions(nodes: PermissionNode[]): IPermissionDef[] {
  const result: IPermissionDef[] = []

  function walk(node: PermissionNode) {
    result.push({ id: node.value, name: node.name })

    for (const sub of Object.values(node.subPermissions ?? {})) walk(sub)
  }

  for (const node of nodes) walk(node)

  return result
}

export async function fetchPermissionCatalog(http: AxiosInstance): Promise<IPermissionCatalog> {
  const { data } = await http.get<{ permissions?: PermissionNode[]; effects?: { allow: number } }>(
    '/users/auth/constants',
  )

  return { permissions: flattenPermissions(data.permissions ?? []), allowEffect: data.effects?.allow }
}

export async function fetchFinanceLevels(http: AxiosInstance): Promise<IFinanceLevel[]> {
  const { data } = await http.get<IFinanceLevel[]>('/finance/levels')

  return data
}

export async function fetchBlockRules(http: AxiosInstance): Promise<IBlockRule[]> {
  const { data } = await http.get<{ rows: IBlockRule[] }>('/block-rules', { params: { pageSize: 200 } })

  return data.rows
}

export async function createUser(http: AxiosInstance, body: ICreateUserPayload): Promise<{ id?: number }> {
  const { data } = await http.post<{ id?: number }>('/users', body)

  return data
}

export async function updateUser(http: AxiosInstance, body: IUpdateUserPayload): Promise<void> {
  await http.patch('/users', body)
}

export async function changeUserStatus(http: AxiosInstance, body: IChangeStatusPayload): Promise<void> {
  await http.patch('/users/status', body)
}

export async function deleteUser(http: AxiosInstance, id: number): Promise<void> {
  await http.delete(`/users/${id}`)
}

export async function uploadUserFile(http: AxiosInstance, userId: number, file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)

  await http.post(`/users/files/${userId}`, formData)
}

export async function deleteUserFile(http: AxiosInstance, fileId: number): Promise<void> {
  await http.delete(`/users/files/${fileId}`)
}

export async function moveSubusers(http: AxiosInstance, fromUserId: number, newParentId: number): Promise<void> {
  await http.post(`/users/${fromUserId}/transfer-children`, { newParentId })
}

export async function exportUsers(http: AxiosInstance, filters: IUsersFilters): Promise<number> {
  const { data } = await http.post<{ downloadId?: number }>('/users/export/xlsx', filterParams(filters))

  if (typeof data?.downloadId !== 'number') throw new Error('Resposta inválida do servidor.')

  return data.downloadId
}

export async function createBlockRule(http: AxiosInstance, body: IBlockRulePayload): Promise<void> {
  await http.post('/block-rules', body)
}

export async function updateBlockRule(
  http: AxiosInstance,
  id: number,
  body: Omit<IBlockRulePayload, 'type'>,
): Promise<void> {
  await http.patch('/block-rules', { id, ...body })
}

export async function deleteBlockRule(http: AxiosInstance, id: number): Promise<void> {
  await http.delete(`/block-rules/${id}`)
}
