import type { ReactNode } from 'react'
import type { CelerisConfig } from '../server/config'
import { CelerisClientProvider } from './provider'

export interface CelerisProviderProps {
  config: CelerisConfig
  children: ReactNode
}

export function CelerisProvider({ config, children }: CelerisProviderProps) {
  return <CelerisClientProvider apiBaseUrl={config.apiPublicUrl}>{children}</CelerisClientProvider>
}
