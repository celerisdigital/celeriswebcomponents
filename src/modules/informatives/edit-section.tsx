import { notFound } from 'next/navigation'
import { createHttpClient } from '../../http/create-client'
import type { RoleOption } from '../../types'
import { fetchInformative } from './api'
import { InformativeFormScreen } from './form-screen'

export interface InformativeEditSectionProps {
  token?: string
  apiBaseUrl: string
  basePath: string
  roles: RoleOption[]
  id: number
}

export async function InformativeEditSection({ token, apiBaseUrl, basePath, roles, id }: InformativeEditSectionProps) {
  const item = await fetchInformative(createHttpClient({ baseUrl: apiBaseUrl, token }), id)
  if (!item) notFound()

  return <InformativeFormScreen basePath={basePath} roles={roles} item={item} />
}
