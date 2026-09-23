'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  name?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Ativa busca por digitação no dropdown */
  autocomplete?: boolean
  /** Callback chamado ao digitar — desativa filtragem local e delega ao pai */
  onSearch?: (query: string) => void
  /** Exibe estado de carregamento na lista */
  searching?: boolean
  /** Mensagem de erro — quando presente, aplica borda vermelha no trigger. */
  error?: string
  /** Renderiza conteúdo customizado para cada opção do dropdown. */
  renderOption?: (option: SelectOption) => ReactNode
  /** Renderiza conteúdo customizado para o label do trigger quando há valor selecionado. */
  renderTrigger?: (option: SelectOption) => ReactNode
  /** Exibe botão X para limpar o valor selecionado. */
  clearable?: boolean
  /** Texto exibido quando não há opções e nenhuma busca foi digitada. */
  emptyText?: string
}

export function Select({
  autocomplete = false,
  name,
  options,
  placeholder = 'Selecione...',
  required,
  disabled,
  className,
  value,
  defaultValue,
  onChange,
  onSearch,
  searching,
  error,
  renderOption,
  renderTrigger,
  clearable,
  emptyText,
}: SelectProps) {
  if (autocomplete) {
    return (
      <AutocompleteSelect
        name={name}
        options={options}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        searching={searching}
        error={error}
        renderOption={renderOption}
        renderTrigger={renderTrigger}
        clearable={clearable}
        emptyText={emptyText}
      />
    )
  }

  return (
    <DropdownSelect
      name={name}
      options={options}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      error={error}
      renderOption={renderOption}
      renderTrigger={renderTrigger}
      clearable={clearable}
    />
  )
}

// ── Estilos compartilhados ────────────────────────────────────────────────────

const triggerBaseCls = [
  'flex items-center justify-between gap-2 w-full',
  'bg-white border rounded-lg px-3 py-2.5 text-sm text-gray-900',
  'focus:outline-none focus-visible:ring-2 transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
].join(' ')

const triggerBorderCls = (hasError?: boolean) =>
  hasError
    ? 'border-red-400 focus-visible:ring-red-200 focus-visible:border-red-500'
    : 'border-gray-300 hover:border-gray-400 focus-visible:ring-gray-400 focus-visible:border-gray-500'

const triggerCls = (hasError?: boolean) => `${triggerBaseCls} ${triggerBorderCls(hasError)}`

const dropdownCls = [
  'z-50',
  'bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60',
  'overflow-hidden',
].join(' ')

const listCls = 'max-h-56 overflow-y-auto py-1 pr-2'

// Aproximação da altura do dropdown — usada pra decidir flip up/down.
const DROPDOWN_MAX_HEIGHT = 280

export interface DropdownPosition {
  top: number
  left: number
  width: number
  /** true = abre pra cima (alinhado pelo bottom) */
  flipUp: boolean
}

/** Calcula posição fixed do dropdown a partir do trigger e atualiza em scroll/resize. */
export function useDropdownPosition(
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

export function dropdownPortalStyle(pos: DropdownPosition): React.CSSProperties {
  return {
    position: 'fixed',
    left: pos.left,
    width: pos.width,
    ...(pos.flipUp
      ? { bottom: typeof window !== 'undefined' ? window.innerHeight - pos.top + 6 : 0 }
      : { top: pos.top + 6 }),
  }
}

/** Rastreia o bounding rect de um trigger (recalcula em scroll/resize) — pra popovers que abrem pro lado. */
export function useTriggerRect(triggerRef: RefObject<HTMLElement | null>, open: boolean): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!open) { setRect(null); return }
    function update() {
      const el = triggerRef.current
      if (!el) return
      setRect(el.getBoundingClientRect())
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, triggerRef])

  return rect
}

/** Posiciona um popover fixed à direita do trigger, alinhado pelo topo ou pelo rodapé. */
export function sidePopoverStyle(rect: DOMRect, align: 'top' | 'bottom'): React.CSSProperties {
  return {
    position: 'fixed',
    left: rect.right + 8,
    ...(align === 'top'
      ? { top: rect.top }
      : { bottom: typeof window !== 'undefined' ? window.innerHeight - rect.bottom : 0 }),
  }
}

const itemCls = (selected: boolean, focused: boolean) =>
  [
    'flex items-center gap-2 px-3 py-2.5 ml-1 rounded-lg',
    'text-sm cursor-pointer transition-colors select-none',
    selected
      ? 'bg-gray-100 text-gray-900 font-medium'
      : focused
        ? 'bg-gray-50 text-gray-900'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  ].join(' ')

// ── Hook de navegação por teclado ─────────────────────────────────────────────

function useKeyboardNav(
  items: SelectOption[],
  open: boolean,
  selectedValue: string,
  onSelect: (opt: SelectOption) => void,
  onClose: () => void,
  onOpen: () => void,
) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  // Reseta só quando o dropdown abre/fecha — não quando items muda (busca)
  useEffect(() => {
    if (open) {
      const idx = items.findIndex((o) => o.value === selectedValue)
      setFocusedIndex(idx >= 0 ? idx : 0)
    } else {
      setFocusedIndex(-1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Scroll automático para o item em foco
  useEffect(() => {
    if (focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        onOpen()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((i) => (i + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => (i - 1 + items.length) % items.length)
        break
      case 'Enter': {
        e.preventDefault()
        const idx = Math.min(focusedIndex, items.length - 1)
        if (idx >= 0 && items[idx]) onSelect(items[idx])
        break
      }
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case 'Tab':
        onClose()
        break
    }
  }

  return { focusedIndex, itemRefs, handleKeyDown }
}

// ── Select dropdown (sem busca) ───────────────────────────────────────────────

type DropdownProps = Omit<SelectProps, 'autocomplete'>

function DropdownSelect({
  name,
  options,
  placeholder,
  required,
  disabled,
  className,
  value: controlledValue,
  defaultValue,
  onChange,
  error,
  renderOption,
  renderTrigger,
  clearable,
}: DropdownProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const dropdownPos = useDropdownPosition(triggerRef, open)

  const selectedValue = isControlled ? (controlledValue ?? '') : internalValue
  const selectedOption = options.find((o) => o.value === selectedValue)

  function handleSelect(opt: SelectOption) {
    if (!isControlled) setInternalValue(opt.value)
    onChange?.(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleClear() {
    if (!isControlled) setInternalValue('')
    onChange?.('')
    setOpen(false)
  }

  const { focusedIndex, itemRefs, handleKeyDown } = useKeyboardNav(
    options, open, selectedValue, handleSelect, close, () => setOpen(true),
  )

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const inTrigger = containerRef.current?.contains(target)
      const inDropdown = dropdownRef.current?.contains(target)
      if (!inTrigger && !inDropdown) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {name && (
        <input type="hidden" name={name} value={selectedValue} required={required} aria-hidden />
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={`${triggerCls(!!error)}${clearable && selectedOption ? ' pr-8' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={!!error || undefined}
      >
        <span className={`truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption ? (renderTrigger ? renderTrigger(selectedOption) : selectedOption.label) : placeholder}
        </span>
        {!(clearable && selectedOption) && <ChevronDown open={open} />}
      </button>

      {clearable && selectedOption && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClear() }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Limpar"
          tabIndex={-1}
        >
          <LuX size={14} />
        </button>
      )}

      {open && dropdownPos && typeof document !== 'undefined' && createPortal(
        <ul
          ref={dropdownRef}
          role="listbox"
          className={`${dropdownCls} ${listCls}`}
          style={dropdownPortalStyle(dropdownPos)}
        >
          {options.map((opt, i) => (
            <li
              key={`${opt.value}-${i}`}
              ref={(el) => { itemRefs.current[i] = el }}
              role="option"
              aria-selected={opt.value === selectedValue}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt) }}
              onMouseEnter={() => {}}
              className={itemCls(opt.value === selectedValue, i === focusedIndex)}
            >
              {renderOption ? renderOption(opt) : opt.label}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  )
}

// ── Select com busca (autocomplete) ──────────────────────────────────────────

type AutocompleteProps = Omit<SelectProps, 'autocomplete' | 'defaultValue'>

function AutocompleteSelect({
  name,
  options,
  placeholder,
  required,
  disabled,
  className,
  value: controlledValue,
  onChange,
  onSearch,
  searching,
  error,
  renderOption,
  renderTrigger,
  clearable,
  emptyText,
}: AutocompleteProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownPos = useDropdownPosition(triggerRef, open)

  const selectedValue = isControlled ? (controlledValue ?? '') : internalValue
  const selectedOption = options.find((o) => o.value === selectedValue)

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()

  const filtered = useMemo(() => {
    if (onSearch) return options
    const q = normalize(query)
    if (!q) return options
    return options.filter((o) => normalize(o.label).includes(q))
  }, [options, query, onSearch])

  function handleSelect(opt: SelectOption) {
    if (!isControlled) setInternalValue(opt.value)
    onChange?.(opt.value)
    setQuery('')
    setOpen(false)
    triggerRef.current?.focus()
  }

  function close() {
    setQuery('')
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleClear() {
    if (!isControlled) setInternalValue('')
    onChange?.('')
    setQuery('')
    setOpen(false)
  }

  const { focusedIndex, itemRefs, handleKeyDown } = useKeyboardNav(
    filtered, open, selectedValue, handleSelect, close, () => setOpen(true),
  )

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const inTrigger = containerRef.current?.contains(target)
      const inDropdown = dropdownRef.current?.contains(target)
      if (!inTrigger && !inDropdown) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])


  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {name && (
        <input type="hidden" name={name} value={selectedValue} required={required} aria-hidden />
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`${triggerCls(!!error)}${clearable && selectedOption ? ' pr-8' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={!!error || undefined}
      >
        <span className={`truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption ? (renderTrigger ? renderTrigger(selectedOption) : selectedOption.label) : placeholder}
        </span>
        {!(clearable && selectedOption) && <ChevronDown open={open} />}
      </button>

      {clearable && selectedOption && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClear() }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Limpar"
          tabIndex={-1}
        >
          <LuX size={14} />
        </button>
      )}

      {open && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          role="listbox"
          className={dropdownCls}
          style={dropdownPortalStyle(dropdownPos)}
        >
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value) }}
              onKeyDown={handleKeyDown}
              placeholder="Buscar..."
              className="w-full px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <ul className={listCls}>
            {searching ? (
              <li className="px-3 py-3 text-sm text-center text-gray-400">Buscando...</li>
            ) : filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <li
                  key={`${opt.value}-${i}`}
                  ref={(el) => { itemRefs.current[i] = el }}
                  role="option"
                  aria-selected={opt.value === selectedValue}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt) }}
                  className={itemCls(opt.value === selectedValue, i === focusedIndex)}
                >
                  {renderOption ? renderOption(opt) : opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-center text-gray-400">
                {emptyText && !query ? emptyText : 'Nenhuma opção encontrada'}
              </li>
            )}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  )
}

// ── Ícone ─────────────────────────────────────────────────────────────────────

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-150 shrink-0 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
