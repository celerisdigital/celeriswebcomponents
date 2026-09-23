'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu'
import { useDropdownPosition, dropdownPortalStyle } from './select'

interface Props {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  value: Date | null | undefined
  onSelect: (date: Date) => void
  onClose: () => void
  min?: Date
  max?: Date
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function monthName(month: number): string {
  const d = new Date(2000, month, 1)
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(d)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const MONTHS = Array.from({ length: 12 }, (_, i) => monthName(i))

function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay()
  const start = new Date(year, month, 1 - startWeekday)
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }
  return days
}

export function DatePickerPopover({ open, anchorRef, value, onSelect, onClose, min, max }: Props) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const initial = value && !Number.isNaN(value.getTime()) ? value : today
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [monthOpen, setMonthOpen] = useState(false)
  const [yearOpen, setYearOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const pos = useDropdownPosition(anchorRef, open)

  useEffect(() => {
    if (!yearOpen) return
    const list = yearListRef.current
    if (!list) return
    const sel = list.querySelector<HTMLElement>(`[data-year="${viewYear}"]`)
    if (sel) {
      list.scrollTop = sel.offsetTop - list.clientHeight / 2 + sel.clientHeight / 2
    }
  }, [yearOpen, viewYear])

  useEffect(() => {
    if (!open) return
    const seed = value && !Number.isNaN(value.getTime()) ? value : today
    setViewYear(seed.getFullYear())
    setViewMonth(seed.getMonth())
  }, [open, value, today])

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      const target = e.target as Node
      if (containerRef.current?.contains(target)) {
        const t = target as HTMLElement
        if (!t.closest('[data-dropdown]')) {
          setMonthOpen(false)
          setYearOpen(false)
        }
        return
      }
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open || !pos || typeof document === 'undefined') return null

  const minDay = min ? startOfDay(min) : null
  const maxDay = max ? startOfDay(max) : null
  const selected = value && !Number.isNaN(value.getTime()) ? startOfDay(value) : null
  const grid = buildGrid(viewYear, viewMonth)

  function shiftMonth(delta: number) {
    let m = viewMonth + delta
    let y = viewYear
    while (m < 0) { m += 12; y -= 1 }
    while (m > 11) { m -= 12; y += 1 }
    setViewMonth(m)
    setViewYear(y)
  }

  function isDisabled(d: Date): boolean {
    if (minDay && d.getTime() < minDay.getTime()) return true
    if (maxDay && d.getTime() > maxDay.getTime()) return true
    return false
  }

  function handlePick(d: Date) {
    if (isDisabled(d)) return
    onSelect(d)
    onClose()
  }

  const basePortalStyle = dropdownPortalStyle(pos)
  const portalStyle: React.CSSProperties = { ...basePortalStyle, width: undefined }

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Selecionar data"
      data-datepicker-popover
      style={portalStyle}
      className="z-50 w-80 rounded-xl bg-white border border-gray-100 shadow-xl shadow-gray-300/30 overflow-hidden"
    >
      <div className="flex items-center px-3 pt-3 pb-2">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => shiftMonth(-12)}
            aria-label="Ano anterior"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuChevronsLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mês anterior"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuChevronLeft size={15} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
          <div className="relative" data-dropdown>
            <button
              type="button"
              onClick={() => { setMonthOpen((o) => !o); setYearOpen(false) }}
              aria-haspopup="listbox"
              aria-expanded={monthOpen}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {MONTHS[viewMonth]}
              <LuChevronDown size={12} className="text-gray-400" />
            </button>
            {monthOpen && (
              <div
                role="listbox"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 w-32 max-h-56 overflow-y-auto rounded-lg bg-white border border-gray-100 shadow-lg shadow-gray-200/60 py-1"
              >
                {MONTHS.map((m, i) => {
                  const sel = i === viewMonth
                  return (
                    <button
                      key={i}
                      type="button"
                      role="option"
                      aria-selected={sel}
                      onClick={() => { setViewMonth(i); setMonthOpen(false) }}
                      className={`w-full text-left text-xs px-3 py-1.5 cursor-pointer ${
                        sel ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="relative" data-dropdown>
            <button
              type="button"
              onClick={() => { setYearOpen((o) => !o); setMonthOpen(false) }}
              aria-haspopup="listbox"
              aria-expanded={yearOpen}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {viewYear}
              <LuChevronDown size={12} className="text-gray-400" />
            </button>
            {yearOpen && (
              <div
                ref={yearListRef}
                role="listbox"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 w-24 max-h-56 overflow-y-auto rounded-lg bg-white border border-gray-100 shadow-lg shadow-gray-200/60 py-1"
              >
                {(() => {
                  const minYear = min ? min.getFullYear() : 1900
                  const maxYear = max ? max.getFullYear() : today.getFullYear() + 10
                  const years: number[] = []
                  for (let y = maxYear; y >= minYear; y--) years.push(y)
                  return years.map((y) => {
                    const sel = y === viewYear
                    return (
                      <button
                        key={y}
                        type="button"
                        role="option"
                        aria-selected={sel}
                        data-year={y}
                        onClick={() => { setViewYear(y); setYearOpen(false) }}
                        className={`w-full text-left text-xs px-3 py-1.5 cursor-pointer ${
                          sel ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {y}
                      </button>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Próximo mês"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(12)}
            aria-label="Próximo ano"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuChevronsRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 px-2 pb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-center py-1"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
        {grid.map((d, i) => {
          const inMonth = d.getMonth() === viewMonth
          const isSel = !!selected && sameDay(d, selected)
          const isToday = sameDay(d, today)
          const disabled = isDisabled(d)
          const base = 'h-8 text-xs rounded-lg transition-colors select-none flex items-center justify-center'
          let cls: string
          if (disabled) {
            cls = `${base} text-gray-300 cursor-not-allowed`
          } else if (isSel) {
            cls = `${base} bg-brand text-brand-foreground font-semibold shadow-sm cursor-pointer`
          } else if (isToday) {
            cls = `${base} ring-1 ring-inset ring-brand/40 text-gray-800 font-medium hover:bg-gray-100 cursor-pointer`
          } else if (inMonth) {
            cls = `${base} text-gray-700 hover:bg-gray-100 cursor-pointer`
          } else {
            cls = `${base} text-gray-300 hover:bg-gray-50 hover:text-gray-500 cursor-pointer`
          }
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handlePick(d)}
              className={cls}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>

    </div>,
    document.body,
  )
}
