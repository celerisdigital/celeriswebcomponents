'use client'

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { LuCalendar } from 'react-icons/lu'
import { Input } from './input'
import { DatePickerPopover } from './date-picker-popover'

export interface DateInputProps {
  value: Date | null | undefined
  onChange: (value: Date | null) => void
  error?: string
  disabled?: boolean
  className?: string
  min?: Date
  max?: Date
  autoFocus?: boolean
  name?: string
}

type Section = 'dd' | 'mm' | 'yyyy'
type Segs = { dd: string; mm: string; yyyy: string }

const SECTIONS: Record<Section, { start: number; end: number; max: number; char: string }> = {
  dd: { start: 0, end: 2, max: 2, char: 'D' },
  mm: { start: 3, end: 5, max: 2, char: 'M' },
  yyyy: { start: 6, end: 10, max: 4, char: 'A' },
}
const ORDER: Section[] = ['dd', 'mm', 'yyyy']

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

function segsFromDate(d: Date | null | undefined): Segs {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return { dd: '', mm: '', yyyy: '' }
  return { dd: pad(d.getDate()), mm: pad(d.getMonth() + 1), yyyy: pad(d.getFullYear(), 4) }
}

function renderText(segs: Segs): string {
  const part = (s: string, char: string, len: number) => {
    const fill = s.length > 0 ? '_' : char
    return s + fill.repeat(len - s.length)
  }
  return `${part(segs.dd, 'D', 2)}/${part(segs.mm, 'M', 2)}/${part(segs.yyyy, 'A', 4)}`
}

function parseSegs(segs: Segs): Date | null {
  const day = Number(segs.dd)
  const month = Number(segs.mm)
  const year = Number(segs.yyyy)
  if (!day || !month || !year) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  if (year < 1900 || year > 2100) return null
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

function clamp(date: Date, min?: Date, max?: Date): Date {
  let d = date
  if (min && d.getTime() < min.getTime()) d = min
  if (max && d.getTime() > max.getTime()) d = max
  return d
}

function maxDayFor(month: number, year: number): number {
  if (!month) return 31
  if (month === 2) {
    if (!year) return 29
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    return leap ? 29 : 28
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30
  return 31
}

function applyDigit(
  sec: Section,
  cur: string,
  d: string,
  segs: Segs,
): { value: string; advance: boolean } {
  if (sec === 'yyyy') {
    if (cur.length >= 4) return { value: d, advance: false }
    const next = cur + d
    return { value: next, advance: next.length === 4 }
  }
  if (sec === 'mm') {
    if (cur.length === 0) {
      if (Number(d) >= 2) return { value: '0' + d, advance: true }
      return { value: d, advance: false }
    }
    if (cur.length === 1) {
      const combined = cur + d
      const n = Number(combined)
      const clamped = n < 1 ? '01' : n > 12 ? '12' : combined
      return { value: clamped, advance: true }
    }
    return { value: d, advance: false }
  }
  const month = Number(segs.mm) || 0
  const year = Number(segs.yyyy) || 0
  const maxDay = maxDayFor(month, year)
  const threshold = Math.floor(maxDay / 10)
  if (cur.length === 0) {
    if (Number(d) > threshold) return { value: '0' + d, advance: true }
    return { value: d, advance: false }
  }
  if (cur.length === 1) {
    const combined = cur + d
    const n = Number(combined)
    const clamped = n < 1 ? '01' : n > maxDay ? pad(maxDay, 2) : combined
    return { value: clamped, advance: true }
  }
  return { value: d, advance: false }
}

function sectionForCaret(pos: number): Section {
  if (pos <= 2) return 'dd'
  if (pos <= 5) return 'mm'
  return 'yyyy'
}

function nextSection(s: Section): Section | null {
  const i = ORDER.indexOf(s)
  return i < ORDER.length - 1 ? ORDER[i + 1] : null
}

function prevSection(s: Section): Section | null {
  const i = ORDER.indexOf(s)
  return i > 0 ? ORDER[i - 1] : null
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  { value, onChange, error, disabled, className, min, max, autoFocus, name },
  ref,
) {
  const [segs, setSegs] = useState<Segs>(() => segsFromDate(value))
  const [active, setActive] = useState<Section>('dd')
  const [pickerOpen, setPickerOpen] = useState(false)
  const visibleRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pendingSelRef = useRef<[number, number] | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  useImperativeHandle(ref, () => visibleRef.current as HTMLInputElement)

  useEffect(() => {
    const next = segsFromDate(value)
    setSegs((cur) =>
      cur.dd === next.dd && cur.mm === next.mm && cur.yyyy === next.yyyy ? cur : next,
    )
  }, [value])

  const text = renderText(segs)

  useLayoutEffect(() => {
    const el = visibleRef.current
    if (el && pendingSelRef.current) {
      const [s, e] = pendingSelRef.current
      el.setSelectionRange(s, e)
      pendingSelRef.current = null
    }
  })

  function selectSection(s: Section) {
    pendingSelRef.current = [SECTIONS[s].start, SECTIONS[s].end]
  }

  function commit(newSegs: Segs) {
    setSegs(newSegs)
    const { dd, mm, yyyy } = newSegs
    if (!dd && !mm && !yyyy) {
      if (valueRef.current != null) onChange(null)
      return
    }
    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
      const parsed = parseSegs(newSegs)
      if (parsed) {
        const clamped = clamp(parsed, min, max)
        const cur = valueRef.current
        if (!cur || cur.getTime() !== clamped.getTime()) onChange(clamped)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    if (e.key === 'Backspace' || e.key === 'Delete') {
      const el = e.currentTarget
      const selStart = el.selectionStart ?? 0
      const selEnd = el.selectionEnd ?? 0
      if (selStart === 0 && selEnd === el.value.length && selEnd > 0) {
        e.preventDefault()
        const empty: Segs = { dd: '', mm: '', yyyy: '' }
        setActive('dd')
        selectSection('dd')
        commit(empty)
        return
      }
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault()
      const sec = active
      const cur = segs[sec]
      const { value: next, advance } = applyDigit(sec, cur, e.key, segs)
      const newSegs = { ...segs, [sec]: next }
      if (advance) {
        const adv = nextSection(sec)
        if (adv) {
          setActive(adv)
          selectSection(adv)
        } else {
          selectSection(sec)
        }
      } else {
        selectSection(sec)
      }
      commit(newSegs)
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      const sec = active
      const cur = segs[sec]
      if (cur.length > 0) {
        const newSegs = { ...segs, [sec]: cur.slice(0, -1) }
        selectSection(sec)
        commit(newSegs)
      } else {
        const prev = prevSection(sec)
        if (prev) {
          setActive(prev)
          selectSection(prev)
        }
      }
      return
    }

    if (e.key === 'Delete') {
      e.preventDefault()
      const sec = active
      const newSegs = { ...segs, [sec]: '' }
      selectSection(sec)
      commit(newSegs)
      return
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = prevSection(active)
      if (prev) {
        setActive(prev)
        selectSection(prev)
      }
      return
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = nextSection(active)
      if (next) {
        setActive(next)
        selectSection(next)
      }
      return
    }

    if (e.key === 'Home') {
      e.preventDefault()
      setActive('dd')
      selectSection('dd')
      return
    }

    if (e.key === 'End') {
      e.preventDefault()
      setActive('yyyy')
      selectSection('yyyy')
      return
    }

    if (e.key.length === 1) {
      e.preventDefault()
    }
  }

  function handleSelect(e: React.SyntheticEvent<HTMLInputElement>) {
    const el = e.currentTarget
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? start
    const sec = sectionForCaret(start)
    const [secStart, secEnd] = [SECTIONS[sec].start, SECTIONS[sec].end]
    if (start === secStart && end === secEnd) {
      if (active !== sec) setActive(sec)
      return
    }
    setActive(sec)
    selectSection(sec)
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    const start = e.currentTarget.selectionStart ?? 0
    const sec = sectionForCaret(start)
    setActive(sec)
    selectSection(sec)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (!digits) return
    const newSegs: Segs = {
      dd: digits.slice(0, 2),
      mm: digits.slice(2, 4),
      yyyy: digits.slice(4, 8),
    }
    const focusSec: Section =
      newSegs.yyyy.length === 4 ? 'yyyy' : newSegs.mm.length > 0 ? 'mm' : 'dd'
    setActive(focusSec)
    selectSection(focusSec)
    commit(newSegs)
  }

  function togglePicker() {
    if (disabled) return
    setPickerOpen((o) => !o)
  }

  function handlePickerSelect(d: Date) {
    const clamped = clamp(d, min, max)
    onChange(clamped)
  }

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0">
      <Input
        ref={visibleRef}
        type="text"
        inputMode="numeric"
        name={name}
        autoFocus={autoFocus}
        disabled={disabled}
        className={className}
        error={error}
        value={text}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onSelect={handleSelect}
        onPaste={handlePaste}
        maxLength={10}
        rightAction={
          <button
            type="button"
            tabIndex={-1}
            onClick={togglePicker}
            disabled={disabled}
            aria-label="Abrir calendário"
            aria-expanded={pickerOpen}
            className="p-1.5 -mr-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <LuCalendar size={14} />
          </button>
        }
      />
      <DatePickerPopover
        open={pickerOpen}
        anchorRef={wrapperRef}
        value={value}
        onSelect={handlePickerSelect}
        onClose={() => setPickerOpen(false)}
        min={min}
        max={max}
      />
    </div>
  )
})
