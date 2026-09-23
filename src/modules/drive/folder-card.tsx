'use client'

import { LuEye, LuFolder, LuPencil, LuTrash2 } from 'react-icons/lu'
import { Badge } from '../../ui'
import { ItemActionButton } from './item-action-button'
import type { IDriveFolder } from './types'

interface Props {
  folder: IDriveFolder
  selected: boolean
  canUpdate: boolean
  canDelete: boolean
  onSelect: () => void
  onOpen: () => void
  onDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

export function FolderCard({ folder, selected, canUpdate, canDelete, onSelect, onOpen, onDetails, onEdit, onDelete }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center cursor-pointer transition-colors select-none ${
        selected ? 'border-brand bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ItemActionButton label="Ver detalhes" onClick={onDetails}>
          <LuEye size={13} />
        </ItemActionButton>
        {canUpdate && (
          <ItemActionButton label="Editar" onClick={onEdit}>
            <LuPencil size={13} />
          </ItemActionButton>
        )}
        {canDelete && (
          <ItemActionButton label="Excluir" onClick={onDelete} danger>
            <LuTrash2 size={13} />
          </ItemActionButton>
        )}
      </div>

      <LuFolder size={34} className="text-amber-400 shrink-0" strokeWidth={1.5} />
      <span className="text-sm font-medium text-gray-700 truncate max-w-full w-full">{folder.name}</span>
      <Badge variant={folder.isPublic ? 'success' : 'default'}>{folder.isPublic ? 'Público' : 'Privado'}</Badge>
    </div>
  )
}
