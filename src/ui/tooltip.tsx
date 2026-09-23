'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  delayMs?: number
  followCursor?: boolean
  contentClassName?: string
}

const EXIT_MS = 100

const ORIGIN: Record<NonNullable<TooltipProps['placement']>, string> = {
  top: 'origin-bottom',
  bottom: 'origin-top',
  left: 'origin-right',
  right: 'origin-left',
}

const ARROW_POSITION: Record<NonNullable<TooltipProps['placement']>, string> = {
  top: 'bottom-[-3px] left-1/2 -translate-x-1/2',
  bottom: 'top-[-3px] left-1/2 -translate-x-1/2',
  left: 'right-[-3px] top-1/2 -translate-y-1/2',
  right: 'left-[-3px] top-1/2 -translate-y-1/2',
}

export function Tooltip({ content, children, placement = 'top', className, delayMs = 0, followCursor = false, contentClassName }: TooltipProps) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const tooltipRef = useRef<HTMLSpanElement | null>(null)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null }
    if (showTimer.current) clearTimeout(showTimer.current)
    showTimer.current = setTimeout(() => {
      setMounted(true)
      requestAnimationFrame(() => setShown(true))
    }, delayMs)
  }

  function hide() {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null }
    setShown(false)
    hideTimer.current = setTimeout(() => setMounted(false), EXIT_MS)
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!followCursor) return
    setCoords({ top: e.clientY, left: e.clientX + 12 })
  }

  useEffect(() => {
    if (!mounted || followCursor || !anchorRef.current || !tooltipRef.current) return
    const a = anchorRef.current.getBoundingClientRect()
    const t = tooltipRef.current.getBoundingClientRect()
    const gap = 9
    let top = 0
    let left = 0
    if (placement === 'top') {
      top = a.top - t.height - gap
      left = a.left + a.width / 2 - t.width / 2
    } else if (placement === 'bottom') {
      top = a.bottom + gap
      left = a.left + a.width / 2 - t.width / 2
    } else if (placement === 'left') {
      top = a.top + a.height / 2 - t.height / 2
      left = a.left - t.width - gap
    } else {
      top = a.top + a.height / 2 - t.height / 2
      left = a.right + gap
    }
    const pad = 4
    left = Math.max(pad, Math.min(left, window.innerWidth - t.width - pad))
    top = Math.max(pad, Math.min(top, window.innerHeight - t.height - pad))
    setCoords({ top, left })
  }, [mounted, content, placement, followCursor])

  useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [])

  if (!content) return <>{children}</>

  return (
    <>
      <span
        ref={anchorRef}
        className={`relative inline-flex ${className ?? ''}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseMove={handleMouseMove}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {mounted && typeof window !== 'undefined' &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? 'visible' : 'hidden',
            }}
            className={`
              z-100 pointer-events-none max-w-64
              ${followCursor ? '' : ORIGIN[placement]}
              transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none
              ${shown ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
            `}
          >
            <span
              className={cn(
                'relative block whitespace-normal wrap-break-word rounded-lg border border-white/10 bg-brand px-2.5 py-1.5 text-[0.8125rem] font-medium leading-snug tracking-[-0.01em] text-brand-foreground shadow-lg shadow-black/20',
                contentClassName,
              )}
            >
              {content}
              {!followCursor && (
                <span className={`absolute h-2 w-2 rotate-45 rounded-xs bg-brand border-white/10 ${ARROW_POSITION[placement]} ${placement === 'top' || placement === 'left' ? 'border-r border-b' : 'border-l border-t'}`} />
              )}
            </span>
          </span>,
          document.body,
        )}
    </>
  )
}
