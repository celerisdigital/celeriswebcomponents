import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../../server/config'
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

async function BlockRulesContent({ permissions, deniedRedirect }: UserBlockRulesPageProps) {
  const perms = await permissions()

  if (!perms.canReadBlockRules) redirect(deniedRedirect)

  return (
    <BlockRulesScreen
      canCreate={perms.canCreateBlockRule}
      canUpdate={perms.canUpdateBlockRule}
      canDelete={perms.canDeleteBlockRule}
    />
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
