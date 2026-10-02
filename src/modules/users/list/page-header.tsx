import type { ReactNode } from 'react'
import { BackButton } from '../../../ui'

interface Props {
  title: string
  backFallback: string
  action?: ReactNode
}

export function UsersPageHeader({ title, backFallback, action }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BackButton fallback={backFallback} />
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      {action}
    </div>
  )
}
