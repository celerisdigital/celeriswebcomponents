import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'

export function TreeContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'h-[calc(100vh-320px)] min-h-[420px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
