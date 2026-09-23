'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuCalendar, LuX } from 'react-icons/lu'
import { Button } from './button'
import { DateInput } from './date-input'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function dateToIso(d: Date | null): string {
  if (!d) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function isoToDate(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(y, m - 1, d)
  return Number.isNaN(dt.getTime()) ? null : dt
}

export interface DateRangePickerProps {
  startValue: string
  endValue: string
  onApply: (start: string, end: string) => void
  className?: string
  /** Atalhos de período exibidos no topo do popover. */
  shortcuts?: Array<{ label: string; compute: () => [string, string] }>
  disabled?: boolean
  /** Exibe botão X para limpar o período. Default true. */
  clearable?: boolean
}

type Shortcut = NonNullable<DateRangePickerProps['shortcuts']>[number]

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { label: 'Hoje', compute: () => [today(), today()] },
  { label: 'Ontem', compute: () => [daysAgo(1), daysAgo(1)] },
  { label: 'Últimos 7 dias', compute: () => [daysAgo(7), today()] },
  { label: 'Últimos 30 dias', compute: () => [daysAgo(30), today()] },
  { label: 'Este mês', compute: () => [monthStart(0), today()] },
  { label: 'Mês passado', compute: () => [monthStart(1), monthEnd(1)] },
]

export function DateRangePicker({
  startValue,
  endValue,
  onApply,
  className,
  shortcuts = DEFAULT_SHORTCUTS,
  disabled,
  clearable = true,
}: DateRangePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const [draftStart, setDraftStart] = useState(startValue)
  const [draftEnd, setDraftEnd] = useState(endValue)

  useEffect(() => {
    if (open) {
      setDraftStart(startValue)
      setDraftEnd(endValue)
    }
  }, [open, startValue, endValue])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popWidth = 360
    const left = Math.min(rect.left, window.innerWidth - popWidth - 16)
    setPos({ top: rect.bottom + 6, left: Math.max(16, left), width: popWidth })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (popoverRef.current?.contains(t)) return
      if (t instanceof Element && t.closest('[data-datepicker-popover]')) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function clearRange(e: React.MouseEvent) {
    e.stopPropagation()
    onApply('', '')
  }

  function apply() {
    onApply(draftStart, draftEnd)
    setOpen(false)
  }

  function reset() {
    setDraftStart(today())
    setDraftEnd(today())
  }

  const triggerLabel =
    startValue || endValue
      ? `${formatBR(startValue) || '...'} - ${formatBR(endValue) || '...'}`
      : 'Selecione o período'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 bg-white border rounded-lg px-3 py-2.5 text-sm text-gray-900 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 border-gray-300 hover:border-gray-400 ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
          } ${className ?? ''}`}
      >
        <span className={`flex-1 truncate ${startValue || endValue ? 'text-gray-700' : 'text-gray-400'}`}>
          {triggerLabel}
        </span>
        {clearable && (startValue || endValue) ? (
          <span
            role="button"
            onClick={clearRange}
            aria-label="Limpar período"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <LuX size={16} />
          </span>
        ) : (
          <LuCalendar size={16} className="text-gray-400" />
        )}
      </button>

      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            {shortcuts.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  const [a, b] = s.compute()
                  setDraftStart(a)
                  setDraftEnd(b)
                  onApply(a, b)
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-500">Período</span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <DateInput
                value={isoToDate(draftStart)}
                onChange={(d) => setDraftStart(dateToIso(d))}
              />
              <span className="text-gray-400 text-sm">—</span>
              <DateInput
                value={isoToDate(draftEnd)}
                onChange={(d) => setDraftEnd(dateToIso(d))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={reset} className="flex-1">
              Desfazer
            </Button>
            <Button type="button" size="sm" onClick={apply} className="flex-1">
              Aplicar
            </Button>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthStart(monthsAgo: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
}

function monthEnd(monthsAgo: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo + 1, 0)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatBR(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

