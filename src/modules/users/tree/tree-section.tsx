'use client'

import { useSearchParams } from 'next/navigation'
import { TreeEmpty } from './tree-empty'
import { UserTreeScreen } from './tree-screen'

export function UsersTreeSection() {
  const rawParentId = useSearchParams().get('parentId')

  if (!rawParentId) return null

  const parentId = Number(rawParentId)

  if (Number.isNaN(parentId)) return <TreeEmpty message="Hierarquia inválida." />

  return <UserTreeScreen key={parentId} parentId={parentId} />
}
