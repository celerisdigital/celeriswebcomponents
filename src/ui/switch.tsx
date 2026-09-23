import { forwardRef } from 'react'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: React.ReactNode
  size?: 'sm' | 'md'
  labelClassName?: string
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, labelClassName, size = 'md', disabled, ...props }, ref) => {
    const isSm = size === 'sm'
    const trackCls = isSm ? 'w-7 h-4' : 'w-9 h-5'
    const thumbCls = isSm ? 'w-3 h-3 peer-checked:translate-x-3' : 'w-4 h-4 peer-checked:translate-x-4'

    const inner = (
      <span className="relative inline-flex items-center shrink-0">
        <input ref={ref} type="checkbox" className="peer sr-only" disabled={disabled} {...props} />
        <span
          className={`
            ${trackCls} rounded-full bg-gray-300 transition-colors duration-150
            peer-checked:bg-brand
            peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-gray-400
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
          `}
        />
        <span
          className={`
            absolute left-0.5 top-1/2 -translate-y-1/2 ${thumbCls} rounded-full bg-white shadow
            transition-transform duration-150
          `}
        />
      </span>
    )

    if (!label) {
      return (
        <label className={`inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className ?? ''}`}>
          {inner}
        </label>
      )
    }

    return (
      <label className={`inline-flex items-center gap-2.5 select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className ?? ''}`}>
        {inner}
        <span className={`text-sm text-gray-700 ${labelClassName ?? ''}`}>{label}</span>
      </label>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
