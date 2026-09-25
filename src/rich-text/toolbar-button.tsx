'use client'

import { cn } from '../lib/cn'

export interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}

export function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active ?? false}
      title={label}
      className={cn(
        'grid h-7 w-7 place-items-center rounded transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100',
      )}
    >
      {children}
    </button>
  )
}

export function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px bg-gray-200" />
}
