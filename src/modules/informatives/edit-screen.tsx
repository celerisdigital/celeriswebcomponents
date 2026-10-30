'use client'

import { useRoleOptions } from '../../entities/roles/queries'
import { InformativeFormScreen } from './form-screen'
import { useInformative } from './queries'
import { InformativeFormSkeleton } from './skeletons'

interface Props {
  basePath: string
  id: string
}

function parseId(id: string) {
  const numericId = Number(id)

  return Number.isInteger(numericId) && numericId > 0 ? numericId : null
}

export function InformativeEditScreen({ basePath, id }: Props) {
  const informativeId = parseId(id)
  const informative = useInformative(informativeId)
  const roles = useRoleOptions()

  if (informativeId === null) return <p className="text-sm text-gray-500">Informativo não encontrado.</p>
  if (informative.isError) return <p className="text-sm text-red-500">Não foi possível carregar o informativo.</p>
  if (roles.isError) return <p className="text-sm text-red-500">Não foi possível carregar os perfis.</p>
  if (!informative.isFetchedAfterMount || roles.isPending) return <InformativeFormSkeleton />
  if (!informative.data) return <p className="text-sm text-gray-500">Informativo não encontrado.</p>

  return <InformativeFormScreen basePath={basePath} item={informative.data} />
}
