import { forwardRef } from 'react'
import { LuCheck } from 'react-icons/lu'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  labelClassName?: string
  size?: 'sm' | 'md'
}

const sizeMap = {
  md: { box: 'w-4 h-4', check: 13, gap: 'gap-2.5' },
  sm: { box: 'w-3 h-3', check: 10, gap: 'gap-1.5' },
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, labelClassName, size = 'md', ...props }, ref) => {
    const s = sizeMap[size]
    return (
      <label className={`group flex items-center ${s.gap} cursor-pointer select-none ${className ?? ''}`}>
        <span className="relative flex items-center justify-center shrink-0">
          <input
            type="checkbox"
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <span className={`
            ${s.box} rounded border border-gray-300 bg-white
            transition-all duration-150
            peer-checked:bg-brand peer-checked:border-brand
            peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-gray-400
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            group-hover:border-gray-400
          `} />
          <LuCheck
            size={s.check}
            strokeWidth={3}
            className="
              absolute text-white
              opacity-0 scale-50
              peer-checked:opacity-100 peer-checked:scale-100
              transition-all duration-150
              pointer-events-none
            "
          />
        </span>
        <span className={`text-sm text-gray-700 leading-none ${labelClassName ?? ''}`}>{label}</span>
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
