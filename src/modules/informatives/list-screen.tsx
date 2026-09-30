'use client'

import { useConfirm } from '../../contexts/confirm-modal-context'
import { useQueryModal } from '../../lib/use-query-modal'
import { useRoleOptions } from '../../roles/queries'
import { ActiveInformativesList } from './active-list'
import { InformativeDetailModal } from './detail-modal'
import { informativeErrorMessage } from './errors'
import { ExpiredInformativesTable } from './expired-table'
import type { InformativesListQueries } from './list-queries'
import { useDeleteInformative } from './mutations'
import { useInformatives } from './queries'
import type { IInformative } from './types'

interface Props {
  basePath: string
  queries: InformativesListQueries
  canUpdate: boolean
  canDelete: boolean
}

export function InformativesListScreen({ basePath, queries, canUpdate, canDelete }: Props) {
  const confirm = useConfirm()
  const deleteInformative = useDeleteInformative()
  const active = useInformatives(queries.active)
  const expired = useInformatives(queries.expired)
  const { data: roles = [] } = useRoleOptions()
  const { id: selectedId, open, close } = useQueryModal('informativeId')

  const activeItems = active.data?.rows ?? []
  const expiredItems = expired.data?.rows ?? []
  const expiredTotal = expired.data?.meta.total ?? 0
  const roleNames: Record<string, string> = Object.fromEntries(roles.map((r) => [r.id, r.name] as const))
  const selected = selectedId
    ? [...activeItems, ...expiredItems].find((i) => String(i.id) === selectedId) ?? null
    : null

  function openItem(item: IInformative) {
    open(String(item.id))
  }

  function askDelete(item: IInformative) {
    confirm({
      title: 'Excluir informativo',
      description: `Tem certeza que deseja excluir "${item.title}"?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteInformative.mutateAsync(item.id)
        } catch (error) {
          throw new Error(informativeErrorMessage(error, 'excluir informativo'))
        }
      },
    })
  }

  return (
    <>
      {(active.isError || expired.isError) && (
        <p className="text-sm text-red-500">Não foi possível carregar os informativos.</p>
      )}

      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Ativos e agendados</h2>
      <ActiveInformativesList
        items={activeItems}
        query={queries.active}
        basePath={basePath}
        roleNames={roleNames}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpen={openItem}
        onDelete={askDelete}
      />

      {expiredTotal > 0 && (
        <ExpiredInformativesTable
          items={expiredItems}
          total={expiredTotal}
          query={queries.expired}
          basePath={basePath}
          roleNames={roleNames}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onOpen={openItem}
          onDelete={askDelete}
        />
      )}

      <InformativeDetailModal item={selected} roleNames={roleNames} onClose={close} />
    </>
  )
}
