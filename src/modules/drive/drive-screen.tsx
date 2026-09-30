'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LuChevronRight, LuFolderPlus, LuUpload } from 'react-icons/lu'
import { Button, FileDropzone } from '../../ui'
import { useShowFile } from '../../contexts/file-preview-context'
import { useConfirm } from '../../contexts/confirm-modal-context'
import { extractErrorMessage } from '../../lib/errors'
import { useRoleOptions } from '../../roles/queries'
import { useDeleteDriveFile, useDeleteDriveFolder } from './mutations'
import { useDriveFiles, useDriveFolders } from './queries'
import type { DriveBreadcrumbItem } from './breadcrumb'
import { buildDrivePath } from './breadcrumb'
import type { IDriveFile, IDriveFolder } from './types'
import { FolderCard } from './folder-card'
import { FileCard } from './file-card'
import { CreateFolderModal } from './create-folder-modal'
import { UploadModal, type DriveUploadEntry } from './upload-modal'
import { ItemDetailsModal, type DriveDetailsTarget } from './item-details-modal'
import { EditItemModal } from './edit-item-modal'

export interface DriveScreenProps {
  basePath: string
  initialBreadcrumb: DriveBreadcrumbItem[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

type SelectedItem = { type: 'folder' | 'file'; id: number } | null

export function DriveScreen({
  basePath,
  initialBreadcrumb: breadcrumb,
  canCreate,
  canUpdate,
  canDelete,
}: DriveScreenProps) {
  const router = useRouter()
  const showFile = useShowFile()
  const confirm = useConfirm()
  const deleteFolder = useDeleteDriveFolder()
  const deleteFile = useDeleteDriveFile()
  const { data: roles = [] } = useRoleOptions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const [selected, setSelected] = useState<SelectedItem>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadEntries, setUploadEntries] = useState<DriveUploadEntry[]>([])
  const [detailsTarget, setDetailsTarget] = useState<DriveDetailsTarget | null>(null)
  const [editTarget, setEditTarget] = useState<DriveDetailsTarget | null>(null)

  const currentFolder = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : undefined
  const currentFolderId = currentFolder?.id
  const anyModalOpen = createFolderOpen || uploadOpen || !!detailsTarget || !!editTarget

  const { data: folders = [] } = useDriveFolders(currentFolderId)
  const { data: files = [] } = useDriveFiles(currentFolderId)

  const selectedFolder = selected?.type === 'folder' ? folders.find((f) => f.id === selected.id) : undefined
  const selectedFile = selected?.type === 'file' ? files.find((f) => f.id === selected.id) : undefined

  function navigateTo(items: DriveBreadcrumbItem[]) {
    setSelected(null)
    const qs = buildDrivePath(items)
    router.push(qs ? `${basePath}?path=${qs}` : basePath)
  }

  function openFolder(folder: IDriveFolder) {
    navigateTo([...breadcrumb, { id: folder.id, name: folder.name, isPublic: folder.isPublic, roles: folder.roles }])
  }

  function previewFile(file: IDriveFile) {
    showFile({ url: file.storage.url, contentType: file.storage.contentType, filename: file.name, analysis: true })
  }

  function handleDeleteFolder(folder: IDriveFolder) {
    confirm({
      title: 'Excluir pasta',
      description: `Tem certeza que deseja excluir "${folder.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await deleteFolder.mutateAsync(folder.id)
        } catch (error) {
          throw new Error(extractErrorMessage(error, 'Erro ao excluir pasta.'))
        }

        setSelected(null)
      },
    })
  }

  function handleDeleteFile(file: IDriveFile) {
    confirm({
      title: 'Excluir arquivo',
      description: `Tem certeza que deseja excluir "${file.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await deleteFile.mutateAsync(file.id)
        } catch (error) {
          throw new Error(extractErrorMessage(error, 'Erro ao excluir arquivo.'))
        }

        setSelected(null)
      },
    })
  }

  function handleDeleteTarget(target: DriveDetailsTarget) {
    if (target.type === 'folder') handleDeleteFolder(target.item)
    else handleDeleteFile(target.item)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (anyModalOpen) return
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return

      if (e.key === 'Enter') {
        if (selectedFolder) { e.preventDefault(); openFolder(selectedFolder) }
        else if (selectedFile) { e.preventDefault(); previewFile(selectedFile) }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFolder && canDelete) { e.preventDefault(); handleDeleteFolder(selectedFolder) }
        else if (selectedFile && canDelete) { e.preventDefault(); handleDeleteFile(selectedFile) }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyModalOpen, selectedFolder, selectedFile, canDelete])

  function addFiles(newFiles: File[]) {
    if (newFiles.length === 0) return
    setUploadEntries((prev) => [
      ...prev,
      ...newFiles.map((file) => ({ id: crypto.randomUUID(), file, name: file.name, status: 'queued' as const })),
    ])
    setUploadOpen(true)
  }

  function onDragEnter(e: React.DragEvent) {
    if (!canCreate || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    dragCounter.current += 1
    setIsDragging(true)
  }
  function onDragOver(e: React.DragEvent) {
    if (!canCreate || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
  }
  function onDragLeave(e: React.DragEvent) {
    if (!canCreate) return
    e.preventDefault()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragging(false)
  }
  function onDrop(e: React.DragEvent) {
    if (!canCreate) return
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) addFiles(Array.from(e.dataTransfer.files))
  }

  function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function afterMutation() {
    setCreateFolderOpen(false)
    setEditTarget(null)
  }

  function afterUploadSuccess() {
    setUploadOpen(false)
    setUploadEntries([])
  }

  const isEmpty = folders.length === 0 && files.length === 0

  return (
    <div
      className="relative flex flex-col gap-5"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap min-w-0" aria-label="Navegação de pastas">
          <button
            type="button"
            onClick={() => navigateTo([])}
            className={`hover:text-gray-800 transition-colors ${breadcrumb.length === 0 ? 'text-gray-800 font-medium' : ''}`}
          >
            Raiz
          </button>
          {breadcrumb.map((item, index) => (
            <span key={item.id} className="flex items-center gap-1 min-w-0">
              <LuChevronRight size={13} className="text-gray-300 shrink-0" />
              <button
                type="button"
                onClick={() => navigateTo(breadcrumb.slice(0, index + 1))}
                className={`hover:text-gray-800 transition-colors truncate max-w-40 ${index === breadcrumb.length - 1 ? 'text-gray-800 font-medium' : ''}`}
              >
                {item.name}
              </button>
            </span>
          ))}
        </nav>

        {canCreate && (
          <div className="flex items-center gap-2 shrink-0">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePickFiles} />
            <Button variant="secondary" size="sm" onClick={() => setCreateFolderOpen(true)}>
              <LuFolderPlus size={14} />
              Nova pasta
            </Button>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <LuUpload size={14} />
              Enviar arquivos
            </Button>
          </div>
        )}
      </div>

      {isEmpty ? (
        canCreate ? (
          <FileDropzone onFiles={addFiles} hint="Arraste arquivos aqui ou clique para selecionar" />
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-sm text-gray-400">
            Nenhum item nesta pasta.
          </div>
        )
      ) : (
        <div className="flex flex-col gap-6">
          {folders.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Pastas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    selected={selected?.type === 'folder' && selected.id === folder.id}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onSelect={() => setSelected({ type: 'folder', id: folder.id })}
                    onOpen={() => openFolder(folder)}
                    onDetails={() => setDetailsTarget({ type: 'folder', item: folder })}
                    onEdit={() => setEditTarget({ type: 'folder', item: folder })}
                    onDelete={() => handleDeleteFolder(folder)}
                  />
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Arquivos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    selected={selected?.type === 'file' && selected.id === file.id}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onSelect={() => setSelected({ type: 'file', id: file.id })}
                    onOpen={() => previewFile(file)}
                    onDetails={() => setDetailsTarget({ type: 'file', item: file })}
                    onEdit={() => setEditTarget({ type: 'file', item: file })}
                    onDelete={() => handleDeleteFile(file)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isDragging && canCreate && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-blue-500/10 backdrop-blur-[1px]">
          <div className="rounded-2xl border-2 border-dashed border-blue-400 bg-white px-8 py-6 shadow-lg flex flex-col items-center gap-2">
            <LuUpload size={28} className="text-blue-500" />
            <p className="text-sm font-medium text-blue-600">Solte os arquivos para enviar</p>
          </div>
        </div>
      )}

      {canCreate && (
        <CreateFolderModal
          open={createFolderOpen}
          onClose={() => setCreateFolderOpen(false)}
          parentFolderId={currentFolderId}
          roles={roles}
          onSuccess={afterMutation}
        />
      )}

      <UploadModal
        open={uploadOpen}
        entries={uploadEntries}
        setEntries={setUploadEntries}
        folderId={currentFolderId}
        parentVisibility={currentFolder ? { isPublic: currentFolder.isPublic, roles: currentFolder.roles } : undefined}
        roles={roles}
        onAddFiles={addFiles}
        onClose={() => { setUploadOpen(false); setUploadEntries([]) }}
        onSuccess={afterUploadSuccess}
      />

      <ItemDetailsModal
        target={detailsTarget}
        onClose={() => setDetailsTarget(null)}
        roles={roles}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onEdit={(target) => { setDetailsTarget(null); setEditTarget(target) }}
        onDelete={handleDeleteTarget}
      />

      {canUpdate && (
        <EditItemModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          roles={roles}
          onSuccess={afterMutation}
        />
      )}
    </div>
  )
}
