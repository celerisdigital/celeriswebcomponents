'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ImpersonationPhase = 'idle' | 'connecting' | 'success'

export interface ImpersonationTarget {
  userName: string
  roleName?: string
}

interface ImpersonationTransitionValue {
  phase: ImpersonationPhase
  target: ImpersonationTarget | null
  setPhase: (phase: ImpersonationPhase) => void
  setTarget: (target: ImpersonationTarget | null) => void
  reset: () => void
}

const ImpersonationTransitionContext = createContext<ImpersonationTransitionValue | null>(null)

export function ImpersonationTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ImpersonationPhase>('idle')
  const [target, setTarget] = useState<ImpersonationTarget | null>(null)

  const reset = useCallback(() => {
    setPhase('idle')
    setTarget(null)
  }, [])

  const value = useMemo(() => ({ phase, target, setPhase, setTarget, reset }), [phase, target, reset])

  return <ImpersonationTransitionContext.Provider value={value}>{children}</ImpersonationTransitionContext.Provider>
}

export function useImpersonationTransition(): ImpersonationTransitionValue {
  const context = useContext(ImpersonationTransitionContext)
  if (!context) throw new Error('useImpersonationTransition precisa estar dentro de CelerisAdaptersProvider')

  return context
}
