import { resolvePageSize } from '../../../ui/pagination-options'
import type { IUsersFilters, IUsersQuery } from '../types'

export interface UsersSearchParams {
  offset?: string
  limit?: string
  status?: string
  role?: string
  search?: string
  parentId?: string
  parentName?: string
  parentRole?: string
  parentHistory?: string
  createdAtStart?: string
  createdAtEnd?: string
  commissionLevelId?: string
  view?: string
  userId?: string
}

export interface ParamsReader {
  get: (name: string) => string | null
}

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined

  const parsed = Number(value)

  return Number.isNaN(parsed) ? undefined : parsed
}

export function filtersFromParams(params: ParamsReader): IUsersFilters {
  return {
    status: toNumber(params.get('status')),
    role: params.get('role') || undefined,
    search: params.get('search') || undefined,
    parentId: toNumber(params.get('parentId')),
    createdAtStart: params.get('createdAtStart') || undefined,
    createdAtEnd: params.get('createdAtEnd') || undefined,
    commissionLevelId: toNumber(params.get('commissionLevelId')),
  }
}

export function buildUsersQuery(sp: UsersSearchParams): IUsersQuery {
  const values = sp as Record<string, string | undefined>
  const reader: ParamsReader = { get: (name) => values[name] ?? null }

  return {
    limit: resolvePageSize(sp.limit),
    offset: Number(sp.offset ?? 0) || 0,
    ...filtersFromParams(reader),
  }
}
