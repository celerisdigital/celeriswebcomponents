import { Suspense } from 'react'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { informativeKeys } from '../../query/keys'
import { fetchActiveInformatives } from './api'
import { InformativesFeedScreen } from './feed-screen'
import { InformativesFeedSkeleton } from './skeletons'

export interface InformativesFeedPageProps {
  config: CelerisConfig
}

async function FeedContent({ config }: InformativesFeedPageProps) {
  const http = await createServerHttp(config)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: informativeKeys.active,
    queryFn: () => fetchActiveInformatives(http),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativesFeedScreen />
    </HydrationBoundary>
  )
}

export function InformativesFeedPage({ config }: InformativesFeedPageProps) {
  return (
    <div className="p-6 flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-gray-800">Informativos</h1>
      <Suspense fallback={<InformativesFeedSkeleton />}>
        <FeedContent config={config} />
      </Suspense>
    </div>
  )
}
