'use client'

import { LuLoader } from 'react-icons/lu'
import { Badge, SortableList } from '../../ui'
import { cn } from '../../lib/cn'
import { informativeErrorMessage } from './errors'
import { InformativeItemActions } from './item-actions'
import { useReorderInformatives } from './mutations'
import { RoleBadges } from './role-badges'
import { deriveStatus, periodLabel, STATUS_LABEL, STATUS_VARIANT } from './status'
import type { IInformative, InformativesQuery } from './types'

interface Props {
  items: IInformative[]
  query: InformativesQuery
  basePath: string
  roleNames: Record<string, string>
  canUpdate: boolean
  canDelete: boolean
  onOpen: (item: IInformative) => void
  onDelete: (item: IInformative) => void
}

export function ActiveInformativesList({
  items,
  query,
  basePath,
  roleNames,
  canUpdate,
  canDelete,
  onOpen,
  onDelete,
}: Props) {
  const reorder = useReorderInformatives(query)
  const filtered = !!query.title
  const canReorder = canUpdate && !filtered

  return (
    <>
      {canUpdate && items.length > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            {filtered
              ? 'Limpe a busca para reordenar os informativos.'
              : 'Arraste para definir a ordem de exibição. Modais aparecem ao entrar no sistema nessa ordem; informes fixados, na tela de Informativos.'}
          </p>
          {reorder.isPending && (
            <span className="flex items-center gap-1.5 shrink-0">
              <LuLoader size={12} className="animate-spin" />
              Salvando ordem...
            </span>
          )}
        </div>
      )}
      {reorder.isError && (
        <p className="text-xs text-red-600">{informativeErrorMessage(reorder.error, 'salvar a ordem')}</p>
      )}

      <SortableList
        items={items}
        keyExtractor={(i) => i.id}
        onReorder={(next) => reorder.mutate(next)}
        disabled={!canReorder}
        handleLabel={(i) => `Reordenar ${i.title}`}
        empty="Nenhum informativo ativo."
        renderItem={(i, { handle, index, isDragging }) => {
          const status = deriveStatus(i.initialDate, i.finalDate)

          return (
            <div
              onClick={() => onOpen(i)}
              className={cn(
                'flex items-center gap-3 bg-white rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                isDragging ? 'border-gray-300' : 'border-gray-100 hover:border-gray-200',
              )}
            >
              {handle}
              {!filtered && (
                <span className="shrink-0 w-6 h-6 rounded-md bg-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-center">
                  {index + 1}
                </span>
              )}

              <div className="flex-1 min-w-0 flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{i.title}</p>
                  <p className="text-xs text-gray-500">{periodLabel(i)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1 md:w-48 md:shrink-0">
                  {i.banner && <Badge variant="info">Informe Fixado</Badge>}
                  {i.modal && <Badge variant="info">Modal</Badge>}
                  {i.singleView && <Badge variant="default">1x</Badge>}
                </div>
                <div className="md:w-40 md:shrink-0">
                  <RoleBadges roleIds={i.roleIds} roleNames={roleNames} />
                </div>
                <div className="md:w-20 md:shrink-0">
                  <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                </div>
              </div>

              <InformativeItemActions
                item={i}
                basePath={basePath}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onDelete={onDelete}
              />
            </div>
          )
        }}
      />
    </>
  )
}
