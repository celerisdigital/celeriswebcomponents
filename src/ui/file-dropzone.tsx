'use client'

import { useRef, useState } from 'react'
import { LuUpload, LuLoader } from 'react-icons/lu'

interface Props {
  onFiles: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  onReject?: (rejected: File[], reason: 'size') => void
  currentCount?: number
  isUploading?: boolean
  disabled?: boolean
  hint?: string
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(0)}MB`
  if (n >= 1024) return `${(n / 1024).toFixed(0)}KB`
  return `${n}B`
}

export function FileDropzone({
  onFiles,
  accept,
  maxFiles,
  maxSize,
  onReject,
  currentCount = 0,
  isUploading = false,
  disabled = false,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canAdd = !disabled && !isUploading && (maxFiles === undefined || currentCount < maxFiles)
  const effectiveHint = hint ?? (maxSize ? `Tamanho máximo por arquivo: ${formatBytes(maxSize)}` : undefined)

  function handleFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming)
    if (list.length === 0) return
    if (maxSize !== undefined) {
      const accepted = list.filter((f) => f.size <= maxSize)
      const rejected = list.filter((f) => f.size > maxSize)
      if (rejected.length > 0) onReject?.(rejected, 'size')
      if (accepted.length > 0) onFiles(accepted)
      return
    }
    onFiles(list)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (canAdd && e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        disabled={!canAdd}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (canAdd) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center gap-3 w-full py-8 rounded-xl border-2 border-dashed transition-colors',
          isDragging
            ? 'border-blue-400 bg-blue-50 text-blue-500'
            : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-100/50',
          !canAdd ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {isUploading
          ? <LuLoader size={20} className="animate-spin" />
          : <LuUpload size={22} />
        }
        <div className="text-center">
          <p className="text-sm font-medium">
            {isUploading ? 'Enviando...' : 'Arraste arquivos ou clique para selecionar'}
          </p>
          {!isUploading && effectiveHint && (
            <p className="text-xs mt-0.5 text-gray-400">{effectiveHint}</p>
          )}
        </div>
      </button>
    </>
  )
}
