'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LuInfo, LuPalette, LuPencil, LuUsers } from 'react-icons/lu'
import { Badge, EdgeScroll, Pagination, Table, type Column } from '../../../ui'
import { cn } from '../../../lib/cn'
import { formatDate, formatDocument, formatPhone } from '../../../lib/format'
import { useQueryModal } from '../../../lib/use-query-modal'
import { useRoles } from '../../../entities/roles/queries'
import { useUsersList } from '../context'
import { ChainButton } from '../detail/chain-modal'
import { UserDetailModal } from '../detail/detail-modal'
import { AssumeIdentityButton } from '../impersonation/assume-identity-button'
import { useUsers } from '../queries'
import { STATUS_MAP } from '../status'
import type { IUser, IUsersQuery } from '../types'
import { ChangeStatusButton, DeleteButton, MoveSubusersButton } from './row-actions'
import { readParentChain, subordinatesSearch } from './subordinates'

const iconLink = 'p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'

export function UsersTable({ query }: { query: IUsersQuery }) {
  const { permissions, viewer, basePath, whiteLabelPath } = useUsersList()
  const users = useUsers(query)
  const { data: roles = [] } = useRoles()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { id: selectedUserId, open: openUser, close: closeUser } = useQueryModal('userId')

  const rows = (users.data?.rows ?? []).filter((u) => u.id !== viewer.id)
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]))
  const roleLevelMap = Object.fromEntries(roles.map((r) => [r.id, r.level]))
  const alreadyImpersonating = viewer.inPlaceId != null
  const selectedUser = selectedUserId ? (rows.find((u) => String(u.id) === selectedUserId) ?? null) : null

  function openSubordinates(user: IUser) {
    if (searchParams.get('parentId') === String(user.id)) return

    const target = { id: String(user.id), name: user.name, role: roleMap[user.role] ?? '' }

    router.push(`${pathname}?${subordinatesSearch(readParentChain(searchParams), target)}`)
  }

  function whiteLabelHref(user: IUser) {
    if (!whiteLabelPath) return null

    if (user.wlMasterId != null) return permissions.canUpdateWhiteLabel ? `${whiteLabelPath}/${user.wlMasterId}/editar` : null

    return permissions.canCreateWhiteLabel ? `${whiteLabelPath}/novo` : null
  }

  const columns: Column<IUser>[] = [
    { header: 'ID', cell: (u) => <span className="text-gray-400">{u.id}</span> },
    { header: 'Nome', cell: (u) => <span className="font-semibold text-gray-800">{u.name}</span>, className: 'whitespace-nowrap' },
    { header: 'Perfil', cell: (u) => <span className="text-gray-600">{roleMap[u.role] ?? u.role}</span>, className: 'whitespace-nowrap' },
    { header: 'CPF/CNPJ', cell: (u) => <span className="text-gray-600">{formatDocument(u.document)}</span> },
    { header: 'Telefone', cell: (u) => <span className="text-gray-600">{formatPhone(u.data?.phone)}</span> },
    { header: 'Data de cadastro', cell: (u) => <span className="text-gray-600">{formatDate(u.createdAt)}</span>, className: 'whitespace-nowrap' },
    {
      header: 'Status',
      cell: (u) => {
        const status = STATUS_MAP[u.status]

        return status ? <Badge variant={status.variant}>{status.label}</Badge> : <span className="text-gray-500">{u.status}</span>
      },
    },
    { header: 'Último acesso', cell: (u) => <span className="text-gray-600">{formatDate(u.lastLogin)}</span>, className: 'whitespace-nowrap' },
    {
      header: '',
      cell: (u) => {
        const wlHref = whiteLabelHref(u)

        return (
          <div className="flex items-center gap-1">
            {permissions.canViewDetail && (
              <button title="Detalhes" onClick={() => openUser(String(u.id))} className={iconLink}>
                <LuInfo size={16} />
              </button>
            )}
            {u.id !== undefined && <ChainButton userId={u.id} userName={u.name} />}
            {permissions.canUpdate && (
              <Link href={`${basePath}/${u.id}/editar`} title="Editar usuário" className={iconLink}>
                <LuPencil size={16} />
              </Link>
            )}
            {wlHref && (
              <Link
                href={wlHref}
                title={u.wlMasterId != null ? 'Editar white label' : 'Criar white label'}
                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <LuPalette size={16} />
              </Link>
            )}
            <button onClick={() => openSubordinates(u)} title={`Ver subordinados de ${u.name}`} className={cn(iconLink, 'cursor-pointer')}>
              <LuUsers size={16} />
            </button>
            {permissions.canAssume && !alreadyImpersonating && viewer.level > (roleLevelMap[u.role] ?? Infinity) && (
              <AssumeIdentityButton userId={u.id!} userName={u.name} roleName={roleMap[u.role] ?? u.role} />
            )}
            {permissions.canUpdate && <ChangeStatusButton userId={u.id!} userName={u.name} currentStatus={u.status} />}
            {permissions.canMigrate && <MoveSubusersButton userId={u.id!} userName={u.name} roleId={u.role} />}
            {permissions.canDelete && (
              <DeleteButton userId={u.id!} userName={u.name} roleId={u.role} canMigrate={permissions.canMigrate} />
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      {users.isError && <p className="text-sm text-red-500">Não foi possível carregar os usuários.</p>}
      <EdgeScroll>
        <Table columns={columns} rows={rows} keyExtractor={(u) => u.id!} empty="Nenhum usuário encontrado." />
      </EdgeScroll>
      <Pagination total={users.data?.total ?? 0} limit={query.limit} offset={query.offset} />
      <UserDetailModal key={selectedUser?.id ?? 'closed'} user={selectedUser} onClose={closeUser} roleMap={roleMap} />
    </>
  )
}
