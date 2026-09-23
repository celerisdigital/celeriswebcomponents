'use client'

import { useRouter } from 'next/navigation'

export function useBack(fallback: string) {
  const router = useRouter()

  return function back() {
    const hasExternalReferrer =
      !!document.referrer && !document.referrer.startsWith(window.location.origin)

    // Next.js injeta uma entrada própria no history ao inicializar,
    // então uma aba aberta diretamente já começa com length === 2.
    const isDirectAccess = !document.referrer && window.history.length <= 2

    if (isDirectAccess || hasExternalReferrer) {
      router.push(fallback)
    } else {
      router.back()
    }
  }
}
