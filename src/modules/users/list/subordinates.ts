import type { ParamsReader } from './query'

export interface ParentEntry {
  id: string
  name: string
  role: string
}

function readHistory(raw: string | null): ParentEntry[] {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)

    return Array.isArray(parsed) ? (parsed as ParentEntry[]) : []
  } catch {
    return []
  }
}

export function readParentChain(params: ParamsReader): ParentEntry[] {
  const currentId = params.get('parentId')

  if (!currentId) return []

  return [
    ...readHistory(params.get('parentHistory')),
    { id: currentId, name: params.get('parentName') ?? currentId, role: params.get('parentRole') ?? '' },
  ]
}

export function subordinatesSearch(chain: ParentEntry[], target: ParentEntry): string {
  const params = new URLSearchParams()

  if (chain.length > 0) params.set('parentHistory', JSON.stringify(chain))

  params.set('parentId', target.id)
  params.set('parentName', target.name)

  if (target.role) params.set('parentRole', target.role)

  return params.toString()
}
