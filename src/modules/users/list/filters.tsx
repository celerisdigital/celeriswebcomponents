'use client'

import { useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { Button, DateRangeInput, Input, Select } from '../../../ui'
import { useRoles } from '../../../entities/roles/queries'
import { useFinanceLevels } from '../queries'
import { STATUS_FILTER_OPTIONS } from '../status'
import { SubordinatesTrail } from './subordinates-trail'

interface Props {
  canManageFinance: boolean
  canCreateHorizontal: boolean
  viewerLevel: number
}

export function UsersFilters({ canManageFinance, canCreateHorizontal, viewerLevel }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const nameRef = useRef<HTMLInputElement>(null)
  const { data: roles = [] } = useRoles()
  const { data: financeLevels = [] } = useFinanceLevels(canManageFinance)

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) params.set(key, value)
    else params.delete(key)

    params.delete('offset')
    router.push(`${pathname}?${params}`)
  }

  function submitSearch() {
    update('search', nameRef.current?.value ?? '')
  }

  const availableRoles = canCreateHorizontal ? roles : roles.filter((r) => r.level !== viewerLevel)
  const roleOptions = [{ value: '', label: 'Todos os perfis' }, ...availableRoles.map((r) => ({ value: r.id, label: r.name }))]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={nameRef}
            type="text"
            placeholder="Buscar usuário..."
            defaultValue={searchParams.get('search') ?? ''}
            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
            leftIcon={<PiMagnifyingGlass size={16} />}
          />
        </div>
        <Button onClick={submitSearch} size="md" className="rounded-lg! px-3!" aria-label="Buscar">
          <PiMagnifyingGlass size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3">
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={searchParams.get('status') ?? ''}
          onChange={(v) => update('status', v)}
          className="w-full sm:w-52"
        />

        <Select
          options={roleOptions}
          value={searchParams.get('role') ?? ''}
          onChange={(v) => update('role', v)}
          className="w-full sm:w-52"
          autocomplete
        />

        {canManageFinance && (
          <Select
            options={[{ value: '', label: 'Todos os níveis' }, ...financeLevels.map((l) => ({ value: String(l.id), label: l.name }))]}
            value={searchParams.get('commissionLevelId') ?? ''}
            onChange={(v) => update('commissionLevelId', v)}
            className="w-full sm:w-52"
            autocomplete
          />
        )}

        <DateRangeInput
          startValue={searchParams.get('createdAtStart') ?? ''}
          endValue={searchParams.get('createdAtEnd') ?? ''}
          onStartChange={(v) => update('createdAtStart', v)}
          onEndChange={(v) => update('createdAtEnd', v)}
          className="w-full sm:w-auto"
        />

        {searchParams.toString() && (
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            Limpar filtros
          </Button>
        )}
      </div>

      <SubordinatesTrail />
    </div>
  )
}
