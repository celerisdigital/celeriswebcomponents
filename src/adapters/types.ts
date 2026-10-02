export interface SessionAdapter {
  assumeIdentity: (targetUserId: number) => Promise<{ error?: string }>
  exitIdentity: () => Promise<{ error?: string }>
  homePath: string
}

export interface DownloadsAdapter {
  started: (downloadId: number) => void
}

export interface CelerisAdapters {
  session?: SessionAdapter
  downloads?: DownloadsAdapter
}
