'use client'

import { useState } from 'react'
import { LuX } from 'react-icons/lu'
import { FileDropzone, FileTypeIcon } from '../../../ui'
import { compressImage } from '../../../lib/compress-image'
import { ACCEPTED_EXTENSIONS, ATTACHMENTS_HINT, MAX_FILES, formatSize, validateIncoming } from './attachment-rules'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  error?: string
  disabled?: boolean
}

export function AttachmentsField({ files, onChange, error, disabled }: Props) {
  const [validationError, setValidationError] = useState<string | null>(null)

  async function processFiles(incoming: File[]) {
    const problem = validateIncoming(files.length, incoming)
    setValidationError(problem)

    if (problem) return

    const compressed = await Promise.all(incoming.map(compressImage))
    onChange([...files, ...compressed])
  }

  const displayError = error ?? validationError

  return (
    <div className="flex flex-col gap-3">
      <FileDropzone
        onFiles={processFiles}
        accept={ACCEPTED_EXTENSIONS}
        maxFiles={MAX_FILES}
        currentCount={files.length}
        disabled={disabled}
        hint={ATTACHMENTS_HINT}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <FileTypeIcon contentType={file.type} size={16} />
              <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
              >
                <LuX size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {displayError && <p className="text-xs text-red-500">{displayError}</p>}
    </div>
  )
}
