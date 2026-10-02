'use client'

import { useEffect, useMemo, useState } from 'react'
import { LuLoader, LuX } from 'react-icons/lu'
import { FileDropzone, FileTypeIcon } from '../../../ui'
import { useShowFile } from '../../../contexts/file-preview-context'
import { compressImage } from '../../../lib/compress-image'
import { userErrorMessage } from '../errors'
import { useDeleteUserFile, useUploadUserFile } from '../mutations'
import { useUserFiles } from '../queries'
import { ACCEPTED_EXTENSIONS, ATTACHMENTS_HINT, MAX_FILES, formatSize, validateIncoming } from './attachment-rules'

interface Props {
  id: number
  onFilesChange?: (fileIds: number[]) => void
  onLoadingChange?: (loading: boolean) => void
}

export function EditAttachmentsField({ id, onFilesChange, onLoadingChange }: Props) {
  const showFile = useShowFile()
  const files = useUserFiles(id)
  const uploadFile = useUploadUserFile()
  const deleteFile = useDeleteUserFile()
  const [isUploading, setIsUploading] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const list = useMemo(() => files.data ?? [], [files.data])

  useEffect(() => {
    onLoadingChange?.(files.isPending)
  }, [files.isPending, onLoadingChange])

  useEffect(() => {
    onFilesChange?.(list.map((f) => f.id))
  }, [list, onFilesChange])

  async function processFiles(incoming: File[]) {
    const problem = validateIncoming(list.length, incoming)
    setValidationError(problem)

    if (problem) return

    setUploadError(null)
    setIsUploading(true)

    try {
      for (const file of incoming) {
        await uploadFile.mutateAsync({ userId: id, file: await compressImage(file) })
      }
    } catch (error) {
      setUploadError(userErrorMessage(error, 'enviar arquivo'))
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(fileId: number) {
    setDeletingIds((prev) => new Set(prev).add(fileId))

    try {
      await deleteFile.mutateAsync({ fileId, userId: id })
    } catch (error) {
      setUploadError(userErrorMessage(error, 'remover arquivo'))
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(fileId)

        return next
      })
    }
  }

  const displayError = uploadError ?? validationError

  return (
    <div className="flex flex-col gap-3">
      <FileDropzone
        onFiles={processFiles}
        accept={ACCEPTED_EXTENSIONS}
        maxFiles={MAX_FILES}
        currentCount={list.length}
        isUploading={isUploading}
        hint={ATTACHMENTS_HINT}
      />

      {files.isError && <p className="text-xs text-red-500">Não foi possível carregar os documentos.</p>}

      {list.length > 0 && (
        <ul className="flex flex-col gap-2">
          {list.map((file) => {
            const isDeleting = deletingIds.has(file.id)

            return (
              <li key={file.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <FileTypeIcon contentType={file.contentType} />
                <button
                  type="button"
                  onClick={() => showFile({ ...file, analysis: true })}
                  title="Clique para visualizar"
                  className="cursor-pointer flex-1 text-sm text-gray-700 truncate text-left hover:text-foreground transition-colors"
                >
                  {file.filename}
                </button>
                <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  title="Remover arquivo"
                  disabled={isDeleting}
                  className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
                >
                  {isDeleting ? <LuLoader size={14} className="animate-spin" /> : <LuX size={14} />}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {displayError && <p className="text-xs text-red-500">{displayError}</p>}
    </div>
  )
}
