'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { ImpersonationTransitionProvider } from '../contexts/impersonation-transition-context'
import type { CelerisAdapters } from './types'

const AdaptersContext = createContext<CelerisAdapters | null>(null)

export interface CelerisAdaptersProviderProps {
  adapters: CelerisAdapters
  children: ReactNode
}

export function CelerisAdaptersProvider({ adapters, children }: CelerisAdaptersProviderProps) {
  return (
    <AdaptersContext.Provider value={adapters}>
      <ImpersonationTransitionProvider>{children}</ImpersonationTransitionProvider>
    </AdaptersContext.Provider>
  )
}

export function useAdapter<K extends keyof CelerisAdapters>(name: K): NonNullable<CelerisAdapters[K]> {
  const adapters = useContext(AdaptersContext)
  const adapter = adapters?.[name]

  if (!adapter) {
    throw new Error(
      `Adaptador "${name}" não configurado — envolva o layout com CelerisAdaptersProvider (ver README, "Adaptadores").`,
    )
  }

  return adapter as NonNullable<CelerisAdapters[K]>
}
