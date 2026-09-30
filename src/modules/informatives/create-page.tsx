import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { prefetchRoleOptions } from '../../roles/api'
import { InformativeFormHeader } from './form-header'
import { InformativeFormScreen } from './form-screen'
import type { InformativesPermissions } from './permissions'
import { InformativeFormSkeleton } from './skeletons'

export interface InformativeCreatePageProps {
  config: CelerisConfig
  permissions: () => Promise<Pick<InformativesPermissions, 'canCreate'>>
  basePath: string
}

async function CreateContent({ config, permissions, basePath }: InformativeCreatePageProps) {
  const [perms, http] = await Promise.all([permissions(), createServerHttp(config)])
  if (!perms.canCreate) redirect(basePath)

  const queryClient = new QueryClient()
  await prefetchRoleOptions(queryClient, http)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativeFormScreen basePath={basePath} />
    </HydrationBoundary>
  )
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
