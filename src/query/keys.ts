export const driveKeys = {
  all: ['drive'] as const,
  folders: (parentFolderId: number | undefined) => ['drive', 'folders', parentFolderId ?? null] as const,
  files: (folderId: number | undefined) => ['drive', 'files', folderId ?? null] as const,
}

export const informativeKeys = {
  all: ['informatives'] as const,
  list: (query: { limit: number; offset: number; title?: string; status?: 'current' | 'expired' }) =>
    ['informatives', 'list', query] as const,
  active: ['informatives', 'active'] as const,
}

export const roleKeys = {
  options: ['roles', 'options'] as const,
}
