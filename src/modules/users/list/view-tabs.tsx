'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs } from '../../../ui'

const VIEW_TABS = [
  { value: 'normal', label: 'Visualização normal' },
  { value: 'arvore', label: 'Visualização em Árvore' },
]

export function UsersViewTabs({ tableSlot, treeSlot }: { tableSlot: ReactNode; treeSlot: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (!searchParams.get('parentId')) return <>{tableSlot}</>

  const active = searchParams.get('view') === 'arvore' ? 'arvore' : 'normal'

  function selectView(value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'arvore') {
      params.set('view', 'arvore')
    } else {
      params.delete('view')
    }

    router.replace(`${pathname}?${params}`, { scroll: false })
  }

  return (
    <Tabs tabs={VIEW_TABS} value={active} onChange={selectView}>
      {(current) => (current === 'arvore' ? treeSlot : tableSlot)}
    </Tabs>
  )
}
