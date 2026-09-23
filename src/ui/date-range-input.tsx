import { Input } from './input'

export interface DateRangeInputProps {
  startValue?: string
  endValue?: string
  onStartChange?: (value: string) => void
  onEndChange?: (value: string) => void
  className?: string
}

export function DateRangeInput({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  className,
}: DateRangeInputProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <div className="flex-1 min-w-0">
        <Input
          type="date"
          value={startValue}
          onChange={(e) => onStartChange?.(e.target.value)}
        />
      </div>
      <span className="text-gray-400 text-sm shrink-0">até</span>
      <div className="flex-1 min-w-0">
        <Input
          type="date"
          value={endValue}
          onChange={(e) => onEndChange?.(e.target.value)}
        />
      </div>
    </div>
  )
}
