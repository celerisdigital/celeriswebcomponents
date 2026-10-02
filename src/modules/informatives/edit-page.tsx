import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { prefetchRoles } from '../../entities/roles/api'
import { fetchInformative } from './api'
import { InformativeFormHeader } from './form-header'
import { InformativeFormScreen } from './form-screen'
import type { InformativesPermissions } from './permissions'
import { InformativeFormSkeleton } from './skeletons'

export interface InformativeEditPageProps {
  config: CelerisConfig
  permissions: () => Promise<Pick<InformativesPermissions, 'canUpdate'>>
  basePath: string
  params: Promise<{ id: string }>
}

async function EditContent({ config, permissions, basePath, params }: InformativeEditPageProps) {
  const { id } = await params
  const numericId = Number(id)
  if (!numericId || Number.isNaN(numericId)) notFound()

  const [perms, http] = await Promise.all([permissions(), createServerHttp(config)])
  if (!perms.canUpdate) redirect(basePath)

  const queryClient = new QueryClient()
  const [item] = await Promise.all([fetchInformative(http, numericId), prefetchRoles(queryClient, http)])
  if (!item) notFound()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativeFormScreen basePath={basePath} item={item} />
    </HydrationBoundary>
  )
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
