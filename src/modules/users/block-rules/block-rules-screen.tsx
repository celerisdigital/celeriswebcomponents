'use client'

import { useState } from 'react'
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu'
import { Badge, Button, Table, type Column } from '../../../ui'
import { useConfirm } from '../../../contexts/confirm-modal-context'
import { useRoles } from '../../../entities/roles/queries'
import { userErrorMessage } from '../errors'
import { useDeleteBlockRule } from '../mutations'
import { useBlockRules } from '../queries'
import type { IBlockRule } from '../types'
import { BlockRuleModal } from './block-rule-modal'
import { blockRuleScopeSummaries, blockRuleTypeLabels } from './schemas'

interface Props {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

function configSummary(rule: IBlockRule, roleMap: Record<string, string>): string {
  const roleNames = rule.config.roleIds?.map((id) => roleMap[id] ?? id).join(', ')
  const days =
    rule.type !== 'role' && typeof rule.config.days === 'number'
      ? `${rule.config.days} dia${rule.config.days === 1 ? '' : 's'}`
      : undefined
  const scope = rule.config.scope ? blockRuleScopeSummaries[rule.config.scope] : undefined

  return [days, roleNames, scope].filter(Boolean).join(' · ') || '—'
}

export function BlockRulesScreen({ canCreate, canUpdate, canDelete }: Props) {
  const confirm = useConfirm()
  const rules = useBlockRules()
  const { data: roles = [] } = useRoles()
  const deleteRule = useDeleteBlockRule()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IBlockRule | undefined>()
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]))

  function openCreate() {
    setEditTarget(undefined)
    setModalOpen(true)
  }

  function openEdit(rule: IBlockRule) {
    setEditTarget(rule)
    setModalOpen(true)
  }

  function handleDelete(rule: IBlockRule) {
    confirm({
      title: 'Excluir regra de bloqueio',
      description: `Tem certeza que deseja excluir a regra "${rule.name}"?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteRule.mutateAsync(rule.id)
        } catch (error) {
          throw new Error(userErrorMessage(error, 'remover regra'))
        }
      },
    })
  }

  const columns: Column<IBlockRule>[] = [
    { header: 'Nome', cell: (r) => <span className="font-medium text-gray-800">{r.name}</span> },
    { header: 'Tipo', cell: (r) => <Badge variant="info">{blockRuleTypeLabels[r.type]}</Badge> },
    { header: 'Configuração', cell: (r) => <span className="text-gray-600">{configSummary(r, roleMap)}</span> },
    {
      header: 'Status',
      cell: (r) => <Badge variant={r.active ? 'success' : 'default'}>{r.active ? 'Ativa' : 'Inativa'}</Badge>,
    },
    ...(canUpdate || canDelete
      ? [
          {
            header: '',
            cell: (r: IBlockRule) => (
              <div className="flex items-center justify-end gap-1">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
                    title="Editar regra"
                  >
                    <LuPencil size={14} />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir regra"
                  >
                    <LuTrash2 size={14} />
                  </button>
                )}
              </div>
            ),
            className: 'text-right',
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openCreate}>
            <LuPlus size={14} className="mr-1.5" />
            Nova regra
          </Button>
        </div>
      )}

      {rules.isError && <p className="text-sm text-red-500">Não foi possível carregar as regras de bloqueio.</p>}

      <Table
        columns={columns}
        rows={rules.data ?? []}
        keyExtractor={(r) => r.id}
        empty="Nenhuma regra de bloqueio cadastrada."
      />

      <BlockRuleModal open={modalOpen} rule={editTarget} roles={roles} onClose={() => setModalOpen(false)} />
    </div>
  )
}
