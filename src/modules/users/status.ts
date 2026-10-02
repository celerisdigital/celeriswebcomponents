import type { BadgeVariant } from '../../ui'

export const usersStatus = {
  active: 1,
  waitingAprove: 5,
  blocked: 10,
  aboveBlocked: 11,
} as const

export const CONTRACT_SIGNED = 10

export const STATUS_MAP: Record<number, { label: string; variant: BadgeVariant }> = {
  [usersStatus.active]: { label: 'Ativo', variant: 'success' },
  [usersStatus.waitingAprove]: { label: 'Aguardando aprovação', variant: 'warning' },
  [usersStatus.blocked]: { label: 'Bloqueado', variant: 'danger' },
  [usersStatus.aboveBlocked]: { label: 'Bloqueado acima', variant: 'danger' },
}

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: String(usersStatus.active), label: 'Ativo' },
  { value: String(usersStatus.waitingAprove), label: 'Aguardando aprovação' },
  { value: String(usersStatus.blocked), label: 'Bloqueado' },
  { value: String(usersStatus.aboveBlocked), label: 'Bloqueado acima' },
]
