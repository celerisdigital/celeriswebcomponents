'use client'

import { useMemo } from 'react'
import { useRoles } from '../../../entities/roles/queries'
import { useUserTree } from '../queries'
import type { IUser } from '../types'
import type { TreeUser } from './build-tree'
import { TreeEmpty } from './tree-empty'
import type { TreeRole } from './tree-role-filter'
import { TreeSkeleton } from './tree-skeleton'
import { TreeView } from './tree-view'

function toTreeUser(user: IUser): TreeUser {
  return {
    id: user.id!,
    name: user.name,
    role: user.role,
    status: user.status,
    parentId: user.parent?.parentId,
  }
}

export function UserTreeScreen({ parentId }: { parentId: number }) {
  const tree = useUserTree(parentId)
  const { data: roles = [] } = useRoles()

  const graph = useMemo(() => {
    if (!tree.data?.root) return null

    const root = toTreeUser(tree.data.root)
    const rows = tree.data.rows.filter((u) => u.id !== undefined).map(toTreeUser)
    const roleById = new Map(roles.map((r) => [r.id, r]))
    const presentRoles: TreeRole[] = [...new Set([root.role, ...rows.map((u) => u.role)])]
      .flatMap((id) => {
        const role = roleById.get(id)

        return role ? [{ id: role.id, name: role.name, level: role.level }] : []
      })
      .sort((a, b) => b.level - a.level)

    return { root, rows, roles: presentRoles }
  }, [tree.data, roles])

  if (tree.isPending) return <TreeSkeleton />

  if (tree.isError) return <TreeEmpty message="Não foi possível carregar a hierarquia." />

  if (!graph) return <TreeEmpty message="Usuário não encontrado." />

  return <TreeView root={graph.root} rows={graph.rows} roles={graph.roles} />
}
