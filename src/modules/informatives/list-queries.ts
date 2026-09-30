import type { InformativesQuery } from './types'

// Ativos sem paginação: a ordem é global e a lista inteira à vista desencoraja manter ativos desnecessários.
const ACTIVE_LIMIT = 500
const DEFAULT_LIMIT = 10

export interface InformativesListSearchParams {
  title?: string
  limit?: string
  offset?: string
}

export interface InformativesListQueries {
  active: InformativesQuery
  expired: InformativesQuery
}

export function buildListQueries(sp: InformativesListSearchParams): InformativesListQueries {
  const title = sp.title || undefined

  return {
    active: { limit: ACTIVE_LIMIT, offset: 0, title, status: 'current' },
    expired: { limit: Number(sp.limit) || DEFAULT_LIMIT, offset: Number(sp.offset) || 0, title, status: 'expired' },
  }
}
