import 'server-only'
import { cache } from 'react'

export interface CelerisConfig {
  apiBaseUrl: string
  apiPublicUrl: string
  getToken: () => Promise<string | undefined>
}

export function defineCelerisConfig(config: CelerisConfig): CelerisConfig {
  return { ...config, getToken: cache(config.getToken) }
}
