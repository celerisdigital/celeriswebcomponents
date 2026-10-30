import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../server/config'
import { InformativeEditScreen } from './edit-screen'
import { InformativeFormHeader } from './form-header'
import type { InformativesPermissions } from './permissions'
import { InformativeFormSkeleton } from './skeletons'

export interface InformativeEditPageProps {
  config: CelerisConfig
  permissions: () => Promise<Pick<InformativesPermissions, 'canUpdate'>>
  basePath: string
  params: Promise<{ id: string }>
}

async function EditContent({ permissions, basePath, params }: InformativeEditPageProps) {
  const [{ id }, perms] = await Promise.all([params, permissions()])
  if (!perms.canUpdate) redirect(basePath)

  return <InformativeEditScreen key={id} basePath={basePath} id={id} />
}

export function InformativeEditPage(props: InformativeEditPageProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <InformativeFormHeader title="Editar informativo" basePath={props.basePath} />
      <Suspense fallback={<InformativeFormSkeleton />}>
        <EditContent {...props} />
      </Suspense>
    </div>
  )
}
