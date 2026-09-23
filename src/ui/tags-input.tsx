'use client'

import { useRef, useState } from 'react'
import { LuX } from 'react-icons/lu'

export interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  /** Separadores adicionais (além do Enter). Padrão: `;`, `,` */
  separators?: string[]
  className?: string
  error?: string
}

export function TagsInput({
  value,
  onChange,
  placeholder = 'Digite e dê Enter',
  disabled = false,
  separators = [';', ','],
  className,
  error,
}: TagsInputProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit(raw: string) {
    const parts = raw
      .split(new RegExp(`[${separators.map(escape).join('')}]`))
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = Array.from(new Set([...value, ...parts]))
    onChange(next)
    setDraft('')
  }

  function removeAt(i: number) {
    if (disabled) return
    onChange(value.filter((_, idx) => idx !== i))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (draft) commit(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      e.preventDefault()
      removeAt(value.length - 1)
    } else if (separators.includes(e.key)) {
      e.preventDefault()
      if (draft) commit(draft)
    }
  }

  const borderCls = error
    ? 'border-red-300 focus-within:ring-red-200'
    : 'border-gray-200 focus-within:ring-gray-300'

  return (
    <div
      className={`
        flex flex-wrap items-center gap-1.5 w-full
        bg-white border rounded-lg px-2 py-1.5
        focus-within:outline-none focus-within:ring-2 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
        ${borderCls}
        ${className ?? ''}
      `}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeAt(i) }}
              className="text-gray-400 hover:text-gray-700"
              aria-label={`Remover ${tag}`}
            >
              <LuX size={12} />
            </button>
          )}
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => { if (draft) commit(draft) }}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
        className="flex-1 min-w-[5rem] bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 py-1"
      />
    </div>
  )
}

function escape(c: string): string {
  return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
