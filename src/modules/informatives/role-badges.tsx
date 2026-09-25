'use client'

import { Badge, Tooltip } from '../../ui'

interface Props {
  roleIds: string[] | null
  roleNames: Record<string, string>
  max?: number
}

export function RoleBadges({ roleIds, roleNames, max = 2 }: Props) {
  if (!roleIds || roleIds.length === 0) return <Badge variant="default">Todos</Badge>

  const visible = roleIds.slice(0, max)
  const hidden = roleIds.slice(max)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((id) => (
        <Badge key={id} variant="default">
          {roleNames[id] ?? id}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip
          content={hidden.map((id) => roleNames[id] ?? id).join(', ')}
          contentClassName="whitespace-normal max-w-xs"
        >
          <Badge variant="default">+{hidden.length}</Badge>
        </Tooltip>
      )}
    </div>
  )
}
