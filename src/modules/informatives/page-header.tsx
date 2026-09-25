'use client'

import Link from 'next/link'
import { LuPlus } from 'react-icons/lu'
import { BackButton } from '../../ui'

export interface InformativesPageHeaderProps {
  basePath: string
  backFallback: string
  canCreate: boolean
}

export function InformativesPageHeader({ basePath, backFallback, canCreate }: InformativesPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BackButton fallback={backFallback} />
        <h1 className="text-xl font-semibold text-gray-800">Informativos</h1>
      </div>

      {canCreate && (
        <Link
          href={`${basePath}/novo`}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-3 sm:px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors"
        >
          <LuPlus size={16} />
          <span className="hidden sm:inline">Cadastrar</span>
        </Link>
      )}
    </div>
  )
}
