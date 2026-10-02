'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LuFileSpreadsheet, LuLoader, LuShieldBan, LuUserPlus } from 'react-icons/lu'
import { useAdapter } from '../../../adapters'
import { useToast } from '../../../contexts/toast-context'
import { userErrorMessage } from '../errors'
import { useExportUsers } from '../mutations'
import { filtersFromParams } from './query'

interface Props {
  basePath: string
  canReadBlockRules: boolean
  canExport: boolean
  canCreate: boolean
}

function ExportButton() {
  const downloads = useAdapter('downloads')
  const toast = useToast()
  const searchParams = useSearchParams()
  const exportUsers = useExportUsers()
  const exporting = exportUsers.isPending

  async function handleExport() {
    try {
      downloads.started(await exportUsers.mutateAsync(filtersFromParams(searchParams)))
    } catch (error) {
      toast(userErrorMessage(error, 'exportar usuários'), { variant: 'error' })
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-3 sm:px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {exporting ? <LuLoader size={16} className="animate-spin" /> : <LuFileSpreadsheet size={16} />}
      <span className="hidden sm:inline">{exporting ? 'Exportando...' : 'Exportar'}</span>
    </button>
  )
}

export function UsersHeaderActions({ basePath, canReadBlockRules, canExport, canCreate }: Props) {
  return (
    <div className="flex items-center gap-2">
      {canReadBlockRules && (
        <Link
          href={`${basePath}/regras-bloqueio`}
          className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 text-sm font-medium px-3 sm:px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          <LuShieldBan size={16} />
          <span className="hidden sm:inline">Regras de Bloqueio</span>
        </Link>
      )}

      {canExport && <ExportButton />}

      {canCreate && (
        <Link
          href={`${basePath}/novo`}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-3 sm:px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors"
        >
          <LuUserPlus size={16} />
          <span className="hidden sm:inline">Cadastrar</span>
        </Link>
      )}
    </div>
  )
}
