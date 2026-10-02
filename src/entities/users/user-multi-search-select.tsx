'use client'

import { useState } from 'react'
import { MultiSelect } from '../../ui'
import type { MultiSelectOption } from '../../ui/multi-select'
import { formatDocument } from '../../lib/format'
import { useDebouncedValue } from '../../lib/use-debounced-value'
import { useUserOptionsByRole, useUserOptionsSearch } from './queries'
import type { UserOption } from './types'

export interface UserMultiSearchSelectProps {
  value: UserOption[]
  onChange: (users: UserOption[]) => void
  roleId?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

function toOption(user: UserOption): MultiSelectOption & { document: string } {
  return { value: String(user.id), label: user.name, document: user.document }
}

function renderUserOption(option: MultiSelectOption) {
  const meta = option as MultiSelectOption & { document?: string }

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

export function UserMultiSearchSelect({
  value,
  onChange,
  roleId,
  placeholder = 'Buscar usuários por nome, documento ou ID...',
  disabled,
  error,
}: UserMultiSearchSelectProps) {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 400)
  const base = useUserOptionsByRole(roleId)
  const remote = useUserOptionsSearch(undefined, debounced, !!debounced)

  const displayList = query ? (remote.data ?? []) : (base.data ?? [])
  const pool = [...value, ...displayList.filter((u) => !value.some((v) => v.id === u.id))]

  function handleChange(ids: string[]) {
    onChange(ids.flatMap((id) => pool.filter((u) => String(u.id) === id)))
  }

  return (
    <MultiSelect
      options={pool.map(toOption)}
      value={value.map((v) => String(v.id))}
      onChange={handleChange}
      onSearch={setQuery}
      searching={base.isLoading || remote.isFetching || query !== debounced}
      autocomplete
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      renderOption={renderUserOption}
    />
  )
}
