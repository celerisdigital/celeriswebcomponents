'use client'

import { LuFolder, LuTrash2 } from 'react-icons/lu'
import { Badge, Button, FileTypeIcon, Modal } from '../../ui'
import { formatDateTime } from '../../lib/format'
import type { RoleOption } from '../../types'
import type { IDriveFile, IDriveFolder } from './types'

export type DriveDetailsTarget =
  | { type: 'folder'; item: IDriveFolder }
  | { type: 'file'; item: IDriveFile }

interface Props {
  target: DriveDetailsTarget | null
  onClose: () => void
  roles: RoleOption[]
  canUpdate: boolean
  canDelete: boolean
  onEdit: (target: DriveDetailsTarget) => void
  onDelete: (target: DriveDetailsTarget) => void
}

export function ItemDetailsModal({ target, onClose, roles, canUpdate, canDelete, onEdit, onDelete }: Props) {
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]))

  function handleDelete() {
    if (!target) return
    onClose()
    onDelete(target)
  }

  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={
        <>
          {target?.type === 'folder' && <LuFolder size={18} className="text-amber-400 shrink-0" />}
          {target?.type === 'file' && <FileTypeIcon contentType={target.item.storage.contentType} size={18} />}
          <h2 className="font-semibold text-gray-800 text-base leading-tight truncate">{target?.item.name}</h2>
        </>
      }
      footer={
        canUpdate || canDelete ? (
          <div className="flex justify-between items-center">
            {canDelete ? (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <LuTrash2 size={14} />
                Excluir
              </Button>
            ) : <span />}
            {canUpdate && target && (
              <button
                type="button"
                onClick={() => onEdit(target)}
                className="text-sm font-medium text-foreground hover:underline"
              >
                Editar →
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      {target && (
        <div className="flex flex-col gap-4">
          <Row label="Visibilidade">
            <Badge variant={target.item.isPublic ? 'success' : 'default'}>
              {target.item.isPublic ? 'Público' : 'Privado'}
            </Badge>
          </Row>

          {!target.item.isPublic && (
            <Row label="Perfis com acesso">
              {target.item.roles && target.item.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {target.item.roles.map((roleId) => (
                    <Badge key={roleId} variant="info">{roleMap[roleId] ?? roleId}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Nenhum perfil vinculado.</span>
              )}
            </Row>
          )}

          {target.type === 'file' && (
            <>
              <Row label="Tipo de arquivo">
                <span className="text-sm text-gray-700">{target.item.storage.contentType}</span>
              </Row>
              <Row label="Arquivo">
                <a
                  href={target.item.storage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Abrir / baixar
                </a>
              </Row>
            </>
          )}

          <Row label="Criado em">{formatDateTime(target.item.createdAt)}</Row>
          {target.item.updatedAt && <Row label="Atualizado em">{formatDateTime(target.item.updatedAt)}</Row>}
        </div>
      )}
    </Modal>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
      {typeof children === 'string' ? <span className="text-sm text-gray-700">{children}</span> : children}
    </div>
  )
}
