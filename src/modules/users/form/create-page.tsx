import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../../server/config'
import { getViewer } from '../../../server/session'
import { UsersPageHeader } from '../list/page-header'
import { UserFormSkeleton } from '../list/skeletons'
import type { UserCreatePermissions } from '../permissions'
import { UserCreateLoader } from './create-loader'

export interface UserCreatePageProps {
  config: CelerisConfig
  permissions: () => Promise<UserCreatePermissions>
  basePath: string
  deniedRedirect: string
}

async function CreateContent({ config, permissions, basePath, deniedRedirect }: UserCreatePageProps) {
  const [perms, viewer] = await Promise.all([permissions(), getViewer(config)])

  if (!perms.canCreate || !viewer) redirect(deniedRedirect)

  return (
    <UserCreateLoader
      basePath={basePath}
      viewer={viewer}
      canCreateHorizontal={perms.canCreateHorizontal}
      canManageFinance={perms.canManageFinance}
    />
  )
}

export function UserCreatePage(props: UserCreatePageProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <UsersPageHeader title="Novo usuário" backFallback={props.basePath} />
      <Suspense fallback={<UserFormSkeleton />}>
        <CreateContent {...props} />
      </Suspense>
    </div>
  )
}
