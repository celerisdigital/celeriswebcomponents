'use client'

import { Fragment } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LuChevronRight, LuUsers, LuX } from 'react-icons/lu'
import { readParentChain, type ParentEntry } from './subordinates'

function entryLabel(entry: ParentEntry) {
  return entry.role ? (
    <>
      <strong>{entry.role}</strong> {entry.name}
    </>
  ) : (
    <strong>{entry.name}</strong>
  )
}

export function SubordinatesTrail() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const chain = readParentChain(searchParams)

  if (chain.length === 0) return null

  function goToLevel(index: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('offset')

    if (index < 0) {
      params.delete('parentId')
      params.delete('parentName')
      params.delete('parentRole')
      params.delete('parentHistory')
    } else {
      const target = chain[index]
      const history = chain.slice(0, index)
      params.set('parentId', target.id)
      params.set('parentName', target.name)
      params.set('parentRole', target.role)

      if (history.length > 0) params.set('parentHistory', JSON.stringify(history))
      else params.delete('parentHistory')
    }

    router.push(params.toString() ? `${pathname}?${params}` : pathname)
  }

  return (
    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 self-start flex-wrap">
      <LuUsers size={16} className="text-blue-500 shrink-0" />
      <span className="text-sm text-blue-600 shrink-0">Subordinados</span>
      {chain.map((entry, index) => (
        <Fragment key={entry.id}>
          <LuChevronRight size={12} className="text-blue-400 shrink-0" />
          {index === chain.length - 1 ? (
            <span className="text-sm text-blue-700">{entryLabel(entry)}</span>
          ) : (
            <button
              onClick={() => goToLevel(index)}
              className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              {entryLabel(entry)}
            </button>
          )}
        </Fragment>
      ))}
      <button
        onClick={() => goToLevel(chain.length - 2)}
        className="ml-1 text-blue-400 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
        aria-label="Remover filtro de subordinados"
      >
        <LuX size={14} />
      </button>
    </div>
  )
}
