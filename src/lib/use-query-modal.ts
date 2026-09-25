'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function useQueryModal(key: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const id = searchParams.get(key)

  function open(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  function close() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return { id, open, close }
}
