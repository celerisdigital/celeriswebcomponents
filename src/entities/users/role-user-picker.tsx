'use client'

import { useState } from 'react'
import { Field, Select } from '../../ui'
import type { SelectOption } from '../../ui/select'
import { useRoleOptions } from '../roles/queries'
import { UserSearchSelect } from './user-search-select'
import type { UserOption } from './types'

export interface RoleUserPickerProps {
  onUserChange: (user: UserOption | null) => void
  onRoleChange?: (roleId: string) => void
  error?: string
  roleLabel?: string
  userLabel?: string
  required?: boolean
  roleFieldWidth?: string
  userFieldWidth?: string
}

export function RoleUserPicker({
  onUserChange,
  onRoleChange,
  error,
  roleLabel = 'Perfil',
  userLabel = 'Usuário',
  required = false,
  roleFieldWidth,
  userFieldWidth,
}: RoleUserPickerProps) {
  const { data: roles = [] } = useRoleOptions()
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)

  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId)
    setSelectedUser(null)
    onUserChange(null)
    onRoleChange?.(roleId)
  }

  function handleUserChange(user: UserOption | null) {
    setSelectedUser(user)
    onUserChange(user)
  }

  const roleOptions: SelectOption[] = [
    { value: '', label: 'Selecione um perfil...' },
    ...roles.map((r) => ({ value: r.id, label: r.name })),
  ]
  const star = required ? ' *' : ''

  return (
    <>
      <Field label={`${roleLabel}${star}`} asDiv className={roleFieldWidth}>
        <Select
          options={roleOptions}
          value={selectedRoleId}
          onChange={handleRoleChange}
          autocomplete={roleOptions.length > 5}
        />
      </Field>

      {selectedRoleId && (
        <Field label={`${userLabel}${star}`} error={error} asDiv className={userFieldWidth}>
          <UserSearchSelect roleId={selectedRoleId} value={selectedUser} onChange={handleUserChange} error={error} />
        </Field>
      )}
    </>
  )
}
