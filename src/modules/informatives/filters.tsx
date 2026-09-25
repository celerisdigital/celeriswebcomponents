'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { Button, Input } from '../../ui'

export function InformativesFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  function submitSearch() {
    const value = searchRef.current?.value ?? ''
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('title', value)
    else params.delete('title')

    params.delete('offset')
    router.push(params.toString() ? `${pathname}?${params}` : pathname)
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          ref={searchRef}
          type="text"
          placeholder="Buscar por título..."
          defaultValue={searchParams.get('title') ?? ''}
          onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
          leftIcon={<PiMagnifyingGlass size={16} />}
        />
      </div>
      <Button size="md" className="rounded-lg! px-3!" onClick={submitSearch} aria-label="Buscar">
        <PiMagnifyingGlass size={16} />
      </Button>
      {searchParams.toString() && (
        <Button variant="ghost" size="md" onClick={() => router.push(pathname)}>
          Limpar
        </Button>
      )}
    </div>
  )
}
