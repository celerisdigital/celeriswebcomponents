'use client'

import { createContext, useContext, useEffect, useTransition, type ReactNode } from 'react'

interface NavLoadingValue {
  navigating: boolean
  startNav: (cb: () => void) => void
}

const NavLoadingContext = createContext<NavLoadingValue | null>(null)

export function NavLoadingProvider({ children }: { children: ReactNode }) {
  const [navigating, startTransition] = useTransition()
  const startNav = (cb: () => void) => startTransition(cb)
  return (
    <NavLoadingContext.Provider value={{ navigating, startNav }}>
      {children}
    </NavLoadingContext.Provider>
  )
}

/** Hook seguro — retorna no-op se fora do provider, pra preservar uso em rotas sem NavLoadingProvider. */
export function useNavLoading(): NavLoadingValue {
  const ctx = useContext(NavLoadingContext)
  if (!ctx) return { navigating: false, startNav: (cb) => cb() }
  return ctx
}

export function NavLoadingBar() {
  const { navigating } = useNavLoading()

  useEffect(() => {
    if (!navigating) return
    const prev = document.body.style.cursor
    document.body.style.cursor = 'progress'
    return () => {
      document.body.style.cursor = prev
    }
  }, [navigating])

  if (!navigating) return null
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[100] overflow-hidden">
      <div className="h-full bg-brand animate-[nav-progress_1.2s_ease-in-out_infinite]" style={{ width: '40%' }} />
      <style>{`@keyframes nav-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
    </div>
  )
}
