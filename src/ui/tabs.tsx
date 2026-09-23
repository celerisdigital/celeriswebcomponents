'use client'

import { useState, type ReactNode } from 'react'

export interface TabItem {
  value: string
  label: string
  /** Marca visual de erro (ex: campo inválido em outra aba) */
  hasError?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
  children: (active: string) => ReactNode
}

export function Tabs({ tabs, value, defaultValue, onChange, className, children }: TabsProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.value ?? '')
  const active = isControlled ? value! : internal

  function select(v: string) {
    if (!isControlled) setInternal(v)
    onChange?.(v)
  }

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-gray-200 flex-wrap">
        {tabs.map((t) => {
          const isActive = t.value === active
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => select(t.value)}
              className={`
                relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
                border-b-2 -mb-px
                ${isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              {t.label}
              {t.hasError && (
                <span className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>
      <div className="pt-5">{children(active)}</div>
    </div>
  )
}
