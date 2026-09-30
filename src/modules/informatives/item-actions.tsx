'use client'

import { useRouter } from 'next/navigation'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import type { IInformative } from './types'

interface Props {
  item: IInformative
  basePath: string
  canUpdate: boolean
  canDelete: boolean
  onDelete: (item: IInformative) => void
}

export function InformativeItemActions({ item, basePath, canUpdate, canDelete, onDelete }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-end gap-2 shrink-0">
      {canUpdate && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`${basePath}/${item.id}/editar`)
          }}
          className="text-gray-500 hover:text-gray-800 transition-colors"
          aria-label={`Editar ${item.title}`}
        >
          <LuPencil size={16} />
        </button>
      )}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item)
          }}
          className="text-gray-500 hover:text-red-600 transition-colors"
          aria-label={`Excluir ${item.title}`}
        >
          <LuTrash2 size={16} />
        </button>
      )}
    </div>
  )
}
