'use client'

import { useEffect } from 'react'
import { useImpersonationTransition } from '../../../contexts/impersonation-transition-context'
import { AssumeIdentityOverlay } from './assume-identity-overlay'

export interface ImpersonationOverlayProps {
  impersonating: boolean
}

export function ImpersonationOverlay({ impersonating }: ImpersonationOverlayProps) {
  const { phase, target, reset } = useImpersonationTransition()

  useEffect(() => {
    if (phase !== 'success' || !impersonating) return

    const id = window.setTimeout(reset, 600)

    return () => window.clearTimeout(id)
  }, [phase, impersonating, reset])

  if (phase === 'idle' || !target) return null

  return <AssumeIdentityOverlay phase={phase} userName={target.userName} roleName={target.roleName} />
}
