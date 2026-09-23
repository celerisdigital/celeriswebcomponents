'use client'

import { useId } from 'react'
import { cn } from '../lib/cn'

export interface RadioGroupOption<T extends string> {
  value: T
  label: string
  description?: string
}

export interface RadioGroupProps<T extends string> {
  options: RadioGroupOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  disabled,
  error,
  className,
}: RadioGroupProps<T>) {
  const name = useId()

  return (
    <div className={cn('flex flex-col gap-2', className)} role="radiogroup">
      {options.map((option) => {
        const checked = option.value === value
        return (
          <label
            key={option.value}
            className={cn(
              'relative flex items-start gap-2.5 select-none',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors',
                checked ? 'border-brand' : 'border-gray-300',
                error && !checked ? 'border-red-400' : '',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-gray-400',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full bg-brand transition-transform',
                  checked ? 'scale-100' : 'scale-0',
                )}
              />
            </span>
            <span className="flex flex-col">
              <span className="text-sm text-gray-700">{option.label}</span>
              {option.description && <span className="text-xs text-gray-500">{option.description}</span>}
            </span>
          </label>
        )
      })}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
