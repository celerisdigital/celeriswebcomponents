export interface DriveBreadcrumbItem {
  id: number
  name: string
  isPublic: boolean
  roles: string[] | null
}

/**
 * A API não expõe "pasta por id" (só listagem de filhos), então a trilha inteira
 * (id, nome e visibilidade de cada ancestral) precisa viajar na URL pra refresh/deep-link
 * funcionarem — e pra sugerir a visibilidade da pasta atual no upload sem uma chamada extra.
 */
export function parseDrivePath(path: string | undefined): DriveBreadcrumbItem[] {
  if (!path) return []
  try {
    const decoded: unknown = JSON.parse(decodeURIComponent(path))
    if (!Array.isArray(decoded)) return []
    return decoded
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .filter((item) => typeof item.id === 'number' && typeof item.name === 'string')
      .map((item) => ({
        id: item.id as number,
        name: item.name as string,
        isPublic: !!item.isPublic,
        roles: Array.isArray(item.roles) ? (item.roles as string[]) : null,
      }))
  } catch {
    return []
  }
}

export function buildDrivePath(items: DriveBreadcrumbItem[]): string {
  if (items.length === 0) return ''
  return encodeURIComponent(JSON.stringify(items))
}
