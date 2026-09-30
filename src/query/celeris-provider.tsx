import type { ReactNode } from 'react'
import type { CelerisConfig } from '../server/config'
import { CelerisClientProvider } from './provider'

export interface CelerisProviderProps {
  config: CelerisConfig
  children: ReactNode
}

export async function CelerisProvider({ config, children }: CelerisProviderProps) {
  const token = await config.getToken()

  return (
    <CelerisClientProvider token={token} apiBaseUrl={config.apiPublicUrl}>
      {children}
    </CelerisClientProvider>
  )
}
