import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { getViewer } from '../../server/session'
import { fetchRoles } from '../../entities/roles/api'
import type { RoleFull } from '../../entities/roles/types'
import { fetchMe } from './api'
import { ProfileScreen } from './profile-screen'
import { ProfileSkeleton } from './profile-skeleton'

export interface ProfilePageProps {
  config: CelerisConfig
  deniedRedirect: string
}

async function ProfileContent({ config, deniedRedirect }: ProfilePageProps) {
  const [viewer, http] = await Promise.all([getViewer(config), createServerHttp(config)])

  if (!viewer) redirect(deniedRedirect)

  const [me, roles] = await Promise.all([fetchMe(http), fetchRoles(http).catch((): RoleFull[] => [])])

  if (!me) redirect(deniedRedirect)

  const roleConfig = roles.find((role) => role.id === viewer.role)?.config ?? { fields: {} }

  return <ProfileScreen me={me} roleConfig={roleConfig} />
}

export function ProfilePage(props: ProfilePageProps) {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Editar meu perfil</h1>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent {...props} />
      </Suspense>
    </div>
  )
}
