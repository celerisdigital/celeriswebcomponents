'use client'

import { LuFile, LuFileImage, LuFileText, LuExternalLink, LuX, LuLoader, LuMaximize2 } from 'react-icons/lu'
import { useShowFile } from '../contexts/file-preview-context'

export interface AttachmentFile {
  id: number
  url: string
  contentType: string
  size: number
  filename: string
}

interface Props {
  files: AttachmentFile[]
  onDelete?: (id: number) => void
  deletingIds?: Set<number>
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith('image/')) return <LuFileImage size={15} className="text-blue-500 shrink-0" />
  if (contentType === 'application/pdf') return <LuFileText size={15} className="text-red-500 shrink-0" />
  return <LuFile size={15} className="text-gray-400 shrink-0" />
}

export function AttachmentList({ files, onDelete, deletingIds }: Props) {
  const showFile = useShowFile()

  if (files.length === 0) return null

  const images = files.filter((f) => f.contentType.startsWith('image/'))
  const docs = files.filter((f) => !f.contentType.startsWith('image/'))

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((file) => {
            const isDeleting = deletingIds?.has(file.id)
            return (
              <div
                key={file.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => showFile(file)}
                    className="text-white hover:text-blue-300 transition-colors"
                    title="Visualizar"
                  >
                    <LuMaximize2 size={16} />
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors"
                    title="Abrir em nova aba"
                  >
                    <LuExternalLink size={16} />
                  </a>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(file.id)}
                      disabled={isDeleting}
                      className="text-white hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Remover"
                    >
                      {isDeleting ? <LuLoader size={16} className="animate-spin" /> : <LuX size={16} />}
                    </button>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{file.filename}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {docs.length > 0 && (
        <div className="flex flex-col gap-2">
          {docs.map((file) => {
            const isDeleting = deletingIds?.has(file.id)
            const canPreview = file.contentType === 'application/pdf'
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <FileTypeIcon contentType={file.contentType} />
                <span className="flex-1 text-sm text-gray-700 truncate">{file.filename}</span>
                <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
                {canPreview && (
                  <button
                    type="button"
                    onClick={() => showFile(file)}
                    className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                    title="Visualizar PDF"
                  >
                    <LuMaximize2 size={13} />
                  </button>
                )}
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                  title="Abrir em nova aba"
                >
                  <LuExternalLink size={13} />
                </a>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(file.id)}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
                    title="Remover"
                  >
                    {isDeleting ? <LuLoader size={14} className="animate-spin" /> : <LuX size={14} />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
