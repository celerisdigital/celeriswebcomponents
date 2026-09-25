'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import { LuBaseline, LuBan } from 'react-icons/lu'
import { cn } from '../lib/cn'
import { ToolbarButton } from './toolbar-button'

const COLORS = [
  { value: '#6b7280', label: 'Cinza' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#f97316', label: 'Laranja' },
  { value: '#eab308', label: 'Amarelo' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#14b8a6', label: 'Turquesa' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Roxo' },
]

export function RichTextColorButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  const current = useEditorState({
    editor,
    selector: ({ editor }) => editor.getAttributes('textStyle').color as string | undefined,
  })

  useEffect(() => {
    if (!open) return

    function onPointer(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) return

      setOpen(false)
    }

    document.addEventListener('mousedown', onPointer)

    return () => {
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  function pick(color: string) {
    editor.chain().focus().setColor(color).run()
    setOpen(false)
  }

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      <ToolbarButton label="Cor do texto" active={open} onClick={() => setOpen((v) => !v)}>
        <span className="flex flex-col items-center leading-none">
          <LuBaseline size={13} />
          <span className="mt-px h-1 w-4 rounded-sm" style={{ background: current ?? '#111827' }} />
        </span>
      </ToolbarButton>

      {open && (
        <div className="absolute left-0 top-9 z-20 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="grid grid-cols-4 gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                title={c.label}
                onClick={() => pick(c.value)}
                className={cn(
                  'h-6 w-6 rounded border transition-transform hover:scale-110',
                  current === c.value ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200',
                )}
                style={{ background: c.value }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetColor().run()
              setOpen(false)
            }}
            className="mt-2 flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            <LuBan size={13} />
            Cor padrão
          </button>
        </div>
      )}
    </span>
  )
}
