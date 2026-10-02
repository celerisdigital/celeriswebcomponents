import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../../server/config'
import { createServerHttp } from '../../../server/http'
import { userKeys } from '../../../query/keys'
import { prefetchRoles } from '../../../entities/roles/api'
import { fetchBlockRules } from '../api'
import { UsersPageHeader } from '../list/page-header'
import { BlockRulesSkeleton } from '../list/skeletons'
import type { UserBlockRulesPermissions } from '../permissions'
import { BlockRulesScreen } from './block-rules-screen'

export interface UserBlockRulesPageProps {
  config: CelerisConfig
  permissions: () => Promise<UserBlockRulesPermissions>
  basePath: string
  deniedRedirect: string
}

async function BlockRulesContent({ config, permissions, deniedRedirect }: UserBlockRulesPageProps) {
  const [perms, http] = await Promise.all([permissions(), createServerHttp(config)])

  if (!perms.canReadBlockRules) redirect(deniedRedirect)

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.fetchQuery({ queryKey: userKeys.blockRules, queryFn: () => fetchBlockRules(http) }),
    prefetchRoles(queryClient, http),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlockRulesScreen
        canCreate={perms.canCreateBlockRule}
        canUpdate={perms.canUpdateBlockRule}
        canDelete={perms.canDeleteBlockRule}
      />
    </HydrationBoundary>
  )
}

export function UserBlockRulesPage(props: UserBlockRulesPageProps) {
  return (
    <div className="p-6 flex flex-col gap-5">
      <UsersPageHeader title="Regras de Bloqueio" backFallback={props.basePath} />
      <Suspense fallback={<BlockRulesSkeleton />}>
        <BlockRulesContent {...props} />
      </Suspense>
    </div>
  )
}
