'use client'

import { useRoleOptions } from '../../entities/roles/queries'
import { InformativeFormScreen } from './form-screen'
import { InformativeFormSkeleton } from './skeletons'

interface Props {
  basePath: string
}

export function InformativeCreateScreen({ basePath }: Props) {
  const roles = useRoleOptions()

  if (roles.isPending) return <InformativeFormSkeleton />
  if (roles.isError) return <p className="text-sm text-red-500">Não foi possível carregar os perfis.</p>

  return <InformativeFormScreen basePath={basePath} />
}
