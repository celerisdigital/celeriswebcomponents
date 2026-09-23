export const driveKeys = {
  all: ['drive'] as const,
  folders: (parentFolderId: number | undefined) => ['drive', 'folders', parentFolderId ?? null] as const,
  files: (folderId: number | undefined) => ['drive', 'files', folderId ?? null] as const,
}
