import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../../server/config'
import { getViewer } from '../../../server/session'
import type { OrganizationOption } from '../../../types'
import { UsersPageHeader } from '../list/page-header'
import { UserFormSkeleton } from '../list/skeletons'
import type { UserCreatePermissions } from '../permissions'
import { UserCreateLoader } from './create-loader'

export interface UserCreatePageProps {
  config: CelerisConfig
  permissions: () => Promise<UserCreatePermissions>
  organizations?: () => Promise<OrganizationOption[] | null>
  basePath: string
  deniedRedirect: string
}

async function CreateContent({ config, permissions, organizations, basePath, deniedRedirect }: UserCreatePageProps) {
  const [perms, viewer, organizationOptions] = await Promise.all([
    permissions(),
    getViewer(config),
    organizations ? organizations() : null,
  ])

  if (!perms.canCreate || !viewer) redirect(deniedRedirect)

  return (
    <UserCreateLoader
      basePath={basePath}
      viewer={viewer}
      canCreateHorizontal={perms.canCreateHorizontal}
      canManageFinance={perms.canManageFinance}
      organizationOptions={organizationOptions}
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
