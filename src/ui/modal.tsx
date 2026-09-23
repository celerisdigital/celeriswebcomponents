'use client'

import { useEffect, useRef } from 'react'
import { LuX } from 'react-icons/lu'
import { cn } from '../lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  maxWidth?: string
  bodyClassName?: string
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  closeButtonVariant?: 'default' | 'overlay'
}

export function Modal({ open, onClose, title, subtitle, footer, children, maxWidth = 'max-w-lg', bodyClassName, closeOnBackdropClick = true, closeOnEscape = true, showCloseButton = true, closeButtonVariant = 'default' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const pressStartedOnBackdrop = useRef(false)

  useEffect(() => {
    if (!open || !closeOnEscape) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, closeOnEscape])

  if (!open) return null

  const overlayClose = closeButtonVariant === 'overlay'

  const closeButton = showCloseButton && (
    <button
      onClick={onClose}
      className={cn(
        'absolute top-4 right-4 z-10 flex items-center justify-center transition-colors',
        overlayClose
          ? 'w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70'
          : 'p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100',
      )}
      aria-label="Fechar"
    >
      <LuX size={overlayClose ? 15 : 18} />
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = !panelRef.current?.contains(e.target as Node)
      }}
      onClick={() => {
        if (closeOnBackdropClick && pressStartedOnBackdrop.current) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        ref={panelRef}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        {title || subtitle ? (
          <div className="relative px-6 py-5 border-b border-gray-100">
            <div className={`min-w-0 ${showCloseButton ? 'px-8' : ''}`}>
              {title && <div className="flex items-center gap-2 flex-wrap">{title}</div>}
              {subtitle && <div className="mt-1">{subtitle}</div>}
            </div>
            {closeButton}
          </div>
        ) : (
          closeButton
        )}

        <div className={cn('overflow-y-auto flex-1 px-6 py-5', bodyClassName)}>{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
        )}
      </div>
    </div>
  )
}
