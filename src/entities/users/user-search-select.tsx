'use client'

import { useMemo, useState } from 'react'
import { Select } from '../../ui'
import type { SelectOption } from '../../ui/select'
import { formatDocument } from '../../lib/format'
import { useDebouncedValue } from '../../lib/use-debounced-value'
import { useUserOptionsByRole, useUserOptionsSearch } from './queries'
import type { UserOption } from './types'

export interface UserSearchSelectProps {
  roleId?: string
  value: UserOption | null
  onChange: (user: UserOption | null) => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

function matches(user: UserOption, query: string) {
  return user.name.toLowerCase().includes(query) || user.document.includes(query) || String(user.id).includes(query)
}

function toSelectOption(user: UserOption): SelectOption & { document: string } {
  return { value: String(user.id), label: user.name, document: user.document }
}

function renderUserOption(option: SelectOption) {
  const meta = option as SelectOption & { document?: string }

  return (
    <div className="flex flex-col gap-0.5 min-w-0 w-full">
      <div className="text-sm text-gray-700">
        <span className="font-medium text-gray-900">{option.value}</span>
        {' — '}
        {option.label}
      </div>
      {meta.document && <span className="text-gray-400 text-xs">{formatDocument(meta.document)}</span>}
    </div>
  )
}

export function UserSearchSelect({
  roleId,
  value,
  onChange,
  error,
  placeholder = 'Buscar por nome, documento ou ID...',
  disabled,
}: UserSearchSelectProps) {
  const [search, setSearch] = useState({ roleId, query: '' })
  const query = search.roleId === roleId ? search.query : ''
  const debounced = useDebouncedValue(query, 400)
  const base = useUserOptionsByRole(roleId)
  const options = useMemo(() => base.data ?? [], [base.data])
  const normalized = query.toLowerCase()
  const localHits = normalized ? options.filter((u) => matches(u, normalized)) : options
  const remote = useUserOptionsSearch(roleId, debounced, !!debounced && localHits.length === 0)
  const remoteHits = remote.data ?? []
  const list = localHits.length > 0 ? localHits : remoteHits

  const selectOptions = list.map(toSelectOption)

  if (value && !selectOptions.some((o) => o.value === String(value.id))) {
    selectOptions.unshift(toSelectOption(value))
  }

  const searching = base.isLoading || remote.isFetching || (query !== debounced && localHits.length === 0)

  function handleChange(id: string) {
    const pool = [...options, ...remoteHits, ...(value ? [value] : [])]

    onChange(pool.find((u) => String(u.id) === id) ?? null)
  }

  return (
    <Select
      key={roleId}
      autocomplete
      options={selectOptions}
      value={value ? String(value.id) : ''}
      onChange={handleChange}
      onSearch={(next) => setSearch({ roleId, query: next })}
      searching={searching}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      renderOption={renderUserOption}
      renderTrigger={(option) => `${option.value} — ${option.label}`}
    />
  )
}
