import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../../server/config'
import { getViewer } from '../../../server/session'
import type { OrganizationOption } from '../../../types'
import { UsersPageHeader } from '../list/page-header'
import { UserFormSkeleton } from '../list/skeletons'
import type { UserEditPermissions } from '../permissions'
import { UserEditLoader } from './edit-loader'

export interface UserEditPageProps {
  config: CelerisConfig
  permissions: () => Promise<UserEditPermissions>
  organizations?: () => Promise<OrganizationOption[] | null>
  basePath: string
  deniedRedirect: string
  params: Promise<{ id: string }>
}

async function EditContent({ config, permissions, organizations, basePath, deniedRedirect, params }: UserEditPageProps) {
  const [{ id }, perms, viewer, organizationOptions] = await Promise.all([
    params,
    permissions(),
    getViewer(config),
    organizations ? organizations() : null,
  ])

  if (!perms.canUpdate || !viewer) redirect(deniedRedirect)

  return (
    <UserEditLoader
      key={id}
      id={id}
      basePath={basePath}
      viewer={viewer}
      canMigrate={perms.canMigrate}
      canUpdateBankAccount={perms.canUpdateBankAccount}
      canManageFinance={perms.canManageFinance}
      organizationOptions={organizationOptions}
    />
  )
}

export function UserEditPage(props: UserEditPageProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <UsersPageHeader title="Editar usuário" backFallback={props.basePath} />
      <Suspense fallback={<UserFormSkeleton />}>
        <EditContent {...props} />
      </Suspense>
    </div>
  )
}
