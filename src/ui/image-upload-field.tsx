'use client'

import { useRef, useState, useTransition } from 'react'
import { LuUpload, LuX, LuLoader } from 'react-icons/lu'
import { useShowFile } from '../contexts/file-preview-context'

export interface ImageUploadFieldProps {
  initialUrl?: string | null
  onSelect: (file: File) => Promise<void>
  onRemove?: () => void
  emptyLabel: string
  error?: string
  accept?: string
  disabled?: boolean
}

export function ImageUploadField({
  initialUrl,
  onSelect,
  onRemove,
  emptyLabel,
  error,
  accept = 'image/*',
  disabled = false,
}: ImageUploadFieldProps) {
  const showFile = useShowFile()
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, startUploading] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const previous = preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    startUploading(async () => {
      try {
        await onSelect(file)
      } catch {
        setPreview(previous)
      }
    })
  }

  function handleRemove() {
    setPreview(null)
    onRemove?.()
  }

  if (preview) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={handleChange}
        />
        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl w-fit">
          <button
            type="button"
            title="Clique para visualizar"
            onClick={() =>
              showFile({ url: preview, contentType: 'image/png', filename: 'Imagem', analysis: true })
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pré-visualização da imagem do informativo"
              className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white p-1 hover:opacity-80 transition-opacity cursor-zoom-in"
            />
          </button>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors bg-white disabled:opacity-50"
            >
              {isUploading ? <LuLoader size={14} className="animate-spin" /> : <LuUpload size={14} />}
              {isUploading ? 'Enviando...' : 'Trocar imagem'}
            </button>
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={handleRemove}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-100 text-sm text-red-500 hover:border-red-200 hover:text-red-600 transition-colors bg-white disabled:opacity-50"
            >
              <LuX size={14} />
              Remover imagem
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        className={[
          'flex flex-col items-center justify-center gap-3 w-48 h-32 rounded-xl border-2 border-dashed transition-colors',
          error
            ? 'border-red-400 text-red-400 bg-red-50/40'
            : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 bg-gray-50 hover:bg-gray-100/50',
          disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {isUploading ? <LuLoader size={22} className="animate-spin" /> : <LuUpload size={22} />}
        <span className="text-sm font-medium">{isUploading ? 'Enviando...' : emptyLabel}</span>
      </button>
    </>
  )
}
