import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../server/config'
import { getViewer } from '../../server/session'
import { ProfileLoader } from './profile-loader'
import { ProfileSkeleton } from './profile-skeleton'

export interface ProfilePageProps {
  config: CelerisConfig
  deniedRedirect: string
}

async function ProfileContent({ config, deniedRedirect }: ProfilePageProps) {
  const viewer = await getViewer(config)

  if (!viewer) redirect(deniedRedirect)

  return <ProfileLoader viewerRole={viewer.role} />
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
