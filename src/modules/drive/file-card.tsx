'use client'

import { LuDownload, LuEye, LuPencil, LuShare2, LuTrash2 } from 'react-icons/lu'
import { Badge, FileTypeIcon } from '../../ui'
import { useToast } from '../../contexts/toast-context'
import { ItemActionButton } from './item-action-button'
import type { IDriveFile } from './types'

interface Props {
  file: IDriveFile
  selected: boolean
  canUpdate: boolean
  canDelete: boolean
  onSelect: () => void
  onOpen: () => void
  onDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

export function FileCard({ file, selected, canUpdate, canDelete, onSelect, onOpen, onDetails, onEdit, onDelete }: Props) {
  const isImage = file.storage.contentType.startsWith('image/')
  const toast = useToast()

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(file.storage.url)
      toast('Link copiado para a área de transferência!', { variant: 'success' })
    } catch {
      toast('Falha ao copiar o link', { variant: 'error' })
    }
  }

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
        <ItemActionButton label="Compartilhar" onClick={handleShare}>
          <LuShare2 size={13} />
        </ItemActionButton>
        <a
          href={file.storage.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Baixar"
          aria-label="Baixar"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md bg-white/90 backdrop-blur-sm shadow-sm text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
        >
          <LuDownload size={13} />
        </a>
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

      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.storage.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileTypeIcon contentType={file.storage.contentType} size={22} />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 truncate max-w-full w-full">{file.name}</span>
      <Badge variant={file.isPublic ? 'success' : 'default'}>{file.isPublic ? 'Público' : 'Privado'}</Badge>
    </div>
  )
}
