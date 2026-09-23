'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { LuX } from 'react-icons/lu'
import { ImageAnalyzer } from '../ui/image-analyzer'

export interface PreviewFile {
  url: string
  contentType: string
  filename: string
  /** Quando true, abre imagem em modo análise (zoom, rotação, lupa, pan). */
  analysis?: boolean
}

const OPEN_IN_NEW_TAB_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
])

type ShowFileFn = (file: PreviewFile) => void

const FilePreviewContext = createContext<ShowFileFn | null>(null)

export function FilePreviewProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<PreviewFile | null>(null)

  const show = useCallback<ShowFileFn>((f) => {
    if (OPEN_IN_NEW_TAB_TYPES.has(f.contentType)) {
      window.open(f.url, '_blank', 'noopener,noreferrer')
      return
    }
    setFile(f)
  }, [])
  const close = useCallback(() => setFile(null), [])

  useEffect(() => {
    if (!file) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); close() }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [file, close])

  const isPdf = file?.contentType === 'application/pdf'
  const isImage = file?.contentType.startsWith('image/')
  const isDocsViewable = file
    ? !isPdf && !isImage && !OPEN_IN_NEW_TAB_TYPES.has(file.contentType)
    : false

  const iframeUrl = isPdf
    ? `${file!.url}#toolbar=1&navpanes=0`
    : isDocsViewable
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(file!.url)}&embedded=true`
      : null

  return (
    <FilePreviewContext.Provider value={show}>
      {children}

      {file && (isPdf || isImage || isDocsViewable) && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999] p-6"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
          >
            <LuX size={15} />
          </button>

          {iframeUrl && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[85%] h-[90%] rounded-xl overflow-hidden bg-white"
            >
              <iframe
                src={iframeUrl}
                className="w-full h-full border-none"
                title={file.filename}
              />
            </div>
          )}

          {isImage && (
            file.analysis ? (
              <ImageAnalyzer src={file.url} alt={file.filename} />
            ) : (
              <img
                src={file.url}
                alt={file.filename}
                onClick={(e) => e.stopPropagation()}
                className="max-w-lg max-h-[85vh] min-w-50 min-h-50 object-contain rounded-lg shadow-2xl bg-white"
              />
            )
          )}
        </div>
      )}
    </FilePreviewContext.Provider>
  )
}

export function useShowFile(): ShowFileFn {
  const ctx = useContext(FilePreviewContext)
  if (!ctx) throw new Error('useShowFile must be used inside FilePreviewProvider')
  return ctx
}
