import { z } from 'zod'
import type { BlockRuleScope, BlockRuleType, IBlockRuleConfig } from '../types'

// Espelha `userBlockRuleTypes` do backend (src/application/users/blockRules/schemas.ts)
export const blockRuleTypes = {
  role: 'role',
  typingInactivity: 'typingInactivity',
  loginInactivity: 'loginInactivity',
} as const

export const blockRuleTypeOptions: { value: BlockRuleType; label: string }[] = [
  { value: blockRuleTypes.role, label: 'Perfil bloqueado' },
  { value: blockRuleTypes.typingInactivity, label: 'Inatividade de digitação' },
  { value: blockRuleTypes.loginInactivity, label: 'Inatividade de login' },
]

export const blockRuleTypeLabels: Record<BlockRuleType, string> = {
  role: 'Perfil bloqueado',
  typingInactivity: 'Inatividade de digitação',
  loginInactivity: 'Inatividade de login',
}

export const blockRuleScopes = {
  self: 'self',
  below: 'below',
  hierarchy: 'hierarchy',
} as const

export const blockRuleScopeOptions: { value: BlockRuleScope; label: string }[] = [
  { value: blockRuleScopes.self, label: 'Somente o usuário' },
  { value: blockRuleScopes.below, label: 'Usuário e hierarquia abaixo dele' },
  { value: blockRuleScopes.hierarchy, label: 'Usuário e toda a hierarquia (acima e abaixo)' },
]

export const blockRuleScopeSummaries: Partial<Record<BlockRuleScope, string>> = {
  below: 'inclui hierarquia abaixo',
  hierarchy: 'inclui toda a hierarquia',
}

// type é imutável após a criação — o backend revalida `config` contra o
// type já persistido da regra quando ela é editada
export const blockRuleSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(256),
    type: z.enum(['role', 'typingInactivity', 'loginInactivity']),
    active: z.boolean(),
    scope: z.enum(['self', 'below', 'hierarchy']),
    roleIds: z.array(z.string()).optional(),
    days: z.number().int().min(1, 'Mínimo 1 dia').optional(),
  })
  .refine((d) => d.type !== blockRuleTypes.role || (d.roleIds && d.roleIds.length > 0), {
    message: 'Selecione ao menos um perfil',
    path: ['roleIds'],
  })
  .refine((d) => d.type === blockRuleTypes.role || d.days !== undefined, {
    message: 'Informe a quantidade de dias',
    path: ['days'],
  })

export type BlockRuleValues = z.infer<typeof blockRuleSchema>

export function buildBlockRuleConfig(values: BlockRuleValues): IBlockRuleConfig {
  if (values.type === blockRuleTypes.role) return { roleIds: values.roleIds ?? [], scope: values.scope }

  return { days: values.days, roleIds: values.roleIds?.length ? values.roleIds : undefined, scope: values.scope }
}
