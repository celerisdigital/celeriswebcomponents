'use client'

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { LuCheck, LuX, LuChevronDown } from 'react-icons/lu'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  allLabel?: string
  className?: string
  disabled?: boolean
  autocomplete?: boolean
  error?: string
  renderOption?: (option: MultiSelectOption) => React.ReactNode
  /** Quando informado, a busca é delegada ao consumidor (server-side) em vez do filtro local por label. */
  onSearch?: (query: string) => void
  searching?: boolean
  /** Texto quando não há opções e nenhuma busca foi digitada */
  emptyText?: string
  /** Mapa value → label para resolver itens selecionados fora das options atuais */
  selectedLabels?: Record<string, string>
}

const DROPDOWN_MAX_HEIGHT = 280

interface DropdownPosition {
  top: number
  left: number
  width: number
  flipUp: boolean
}

function useDropdownPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
): DropdownPosition | null {
  const [pos, setPos] = useState<DropdownPosition | null>(null)

  useLayoutEffect(() => {
    if (!open) { setPos(null); return }

    function update() {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const flipUp = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow
      setPos({
        top: flipUp ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        flipUp,
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, triggerRef])

  return pos
}

function dropdownStyle(pos: DropdownPosition): React.CSSProperties {
  return {
    position: 'fixed',
    left: pos.left,
    minWidth: pos.width,
    maxWidth: typeof window !== 'undefined' ? window.innerWidth - pos.left - 8 : undefined,
    ...(pos.flipUp
      ? { bottom: typeof window !== 'undefined' ? window.innerHeight - pos.top + 6 : 0 }
      : { top: pos.top + 6 }),
  }
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  allLabel = 'Todos',
  className,
  disabled,
  autocomplete = false,
  error,
  renderOption,
  onSearch,
  searching,
  emptyText,
  selectedLabels,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownPos = useDropdownPosition(triggerRef, open)

  const filtered = onSearch
    ? options
    : autocomplete && search
      ? options.filter((o) => normalize(o.label).includes(normalize(search)))
      : options

  function handleSearchChange(v: string) {
    setSearch(v)
    onSearch?.(v)
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (!containerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false)
        setSearch('')
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); setSearch('') }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (open && autocomplete && dropdownPos) searchRef.current?.focus()
  }, [open, autocomplete, dropdownPos])

  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  function triggerLabel(): string {
    if (value.length === 0) return placeholder
    if (!onSearch && value.length === options.length) return allLabel
    if (value.length <= 2) {
      return value
        .map((v) => options.find((o) => o.value === v)?.label ?? selectedLabels?.[v] ?? v)
        .join(', ')
    }
    return `${value.length} selecionados`
  }

  const isEmpty = value.length === 0

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center justify-between gap-2 w-full',
          'bg-white border rounded-lg px-3 py-2.5 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-400' : 'border-gray-200',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate min-w-0 ${isEmpty ? 'text-gray-400' : 'text-gray-800'}`}>
          {triggerLabel()}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value.length > 0 && value.length !== options.length && (
            <span
              role="button"
              onClick={clearAll}
              className="text-gray-400 hover:text-red-500 cursor-pointer"
              aria-label="Limpar seleção"
            >
              <LuX size={14} />
            </span>
          )}
          <LuChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="z-50 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60 overflow-hidden"
          style={dropdownStyle(dropdownPos)}
        >
          {autocomplete && (
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar..."
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1 pr-2">
            {searching ? (
              <li className="px-3 py-3 text-sm text-center text-gray-400">Buscando...</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-center text-gray-400">
                {emptyText && !search ? emptyText : 'Nenhuma opção encontrada'}
              </li>
            ) : (
              filtered.map((opt) => {
                const checked = value.includes(opt.value)
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={checked}
                    onMouseDown={(e) => { e.preventDefault(); toggle(opt.value) }}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2.5 ml-1 rounded-lg',
                      'text-sm cursor-pointer transition-colors select-none',
                      checked ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    ].join(' ')}
                  >
                    <span className={[
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all',
                      checked ? 'bg-brand border-brand' : 'border-gray-300 bg-white',
                    ].join(' ')}>
                      {checked && <LuCheck size={10} strokeWidth={3} className="text-white" />}
                    </span>
                    {renderOption ? renderOption(opt) : opt.label}
                  </li>
                )
              })
            )}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  )
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
