'use client'

import { useRoles } from '../../entities/roles/queries'
import { ProfileScreen } from './profile-screen'
import { ProfileSkeleton } from './profile-skeleton'
import { useMe } from './queries'
import type { ProfileRoleConfig } from './types'

const NO_ROLE_CONFIG: ProfileRoleConfig = { fields: {} }

export function ProfileLoader({ viewerRole }: { viewerRole: string }) {
  const me = useMe()
  const roles = useRoles()

  if (me.isError) return <p className="text-sm text-red-500">Não foi possível carregar o seu perfil.</p>
  if (!me.isFetchedAfterMount || !me.data || roles.isPending) return <ProfileSkeleton />

  // Sem perfis (erro) ou perfil fora da lista: só os campos básicos, como antes
  const roleConfig = roles.data?.find((role) => role.id === viewerRole)?.config ?? NO_ROLE_CONFIG

  return <ProfileScreen me={me.data} roleConfig={roleConfig} />
}
