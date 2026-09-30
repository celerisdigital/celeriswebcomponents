import type { ReactNode } from 'react'
import { BackButton } from '../../ui'

export interface InformativesPageHeaderProps {
  backFallback: string
  action?: ReactNode
}

export function InformativesPageHeader({ backFallback, action }: InformativesPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BackButton fallback={backFallback} />
        <h1 className="text-xl font-semibold text-gray-800">Informativos</h1>
      </div>

      {action}
    </div>
  )
}
