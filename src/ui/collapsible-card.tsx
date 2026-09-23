'use client'

import { useState, type ReactNode } from 'react'
import { LuChevronDown } from 'react-icons/lu'

export interface CollapsibleCardProps {
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  /** Conteúdo extra no cabeçalho, à direita (não interativo — clique abre/fecha mesmo assim).
   *  Para botões interativos, use stopPropagation no onClick deles. */
  action?: ReactNode
}

export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  className,
  action,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`bg-white rounded-xl border border-gray-100 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className="flex items-center gap-3 text-gray-400">
          {action}
          <LuChevronDown
            size={18}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 border-t border-gray-100">{children}</div>
      )}
    </div>
  )
}
