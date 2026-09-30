import { Suspense } from 'react'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { informativeKeys } from '../../query/keys'
import { fetchActiveInformatives } from './api'
import { InformativesModalQueue } from './modal-queue'

export interface InformativesModalsProps {
  config: CelerisConfig
}

async function ModalsContent({ config }: InformativesModalsProps) {
  const http = await createServerHttp(config)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: informativeKeys.active,
    queryFn: () => fetchActiveInformatives(http),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativesModalQueue />
    </HydrationBoundary>
  )
}

export function InformativesModals({ config }: InformativesModalsProps) {
  return (
    <Suspense fallback={null}>
      <ModalsContent config={config} />
    </Suspense>
  )
}
