'use client'

import { Select } from '../../../ui'

export interface TreeRole {
  id: string
  name: string
  level: number
}

export function TreeRoleFilter({
  roles,
  value,
  onChange,
}: {
  roles: TreeRole[]
  value: string
  onChange: (roleId: string) => void
}) {
  if (roles.length <= 1) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-sm">
      <span className="whitespace-nowrap text-xs font-medium text-gray-500">Exibir até</span>
      <Select
        options={roles.map((r) => ({ value: r.id, label: r.name }))}
        value={value}
        onChange={onChange}
        className="w-52"
      />
    </div>
  )
}
