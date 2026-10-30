import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../server/config'
import { InformativeCreateScreen } from './create-screen'
import { InformativeFormHeader } from './form-header'
import type { InformativesPermissions } from './permissions'
import { InformativeFormSkeleton } from './skeletons'

export interface InformativeCreatePageProps {
  config: CelerisConfig
  permissions: () => Promise<Pick<InformativesPermissions, 'canCreate'>>
  basePath: string
}

async function CreateContent({ permissions, basePath }: InformativeCreatePageProps) {
  const perms = await permissions()
  if (!perms.canCreate) redirect(basePath)

  return <InformativeCreateScreen basePath={basePath} />
}

export function InformativeCreatePage(props: InformativeCreatePageProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <InformativeFormHeader title="Novo informativo" basePath={props.basePath} />
      <Suspense fallback={<InformativeFormSkeleton />}>
        <CreateContent {...props} />
      </Suspense>
    </div>
  )
}
