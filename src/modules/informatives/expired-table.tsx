'use client'

import { Badge, Pagination, Table, type Column } from '../../ui'
import { InformativeItemActions } from './item-actions'
import { RoleBadges } from './role-badges'
import { deriveStatus, periodLabel, STATUS_LABEL, STATUS_VARIANT } from './status'
import type { IInformative, InformativesQuery } from './types'

interface Props {
  items: IInformative[]
  total: number
  query: InformativesQuery
  basePath: string
  roleNames: Record<string, string>
  canUpdate: boolean
  canDelete: boolean
  onOpen: (item: IInformative) => void
  onDelete: (item: IInformative) => void
}

export function ExpiredInformativesTable({
  items,
  total,
  query,
  basePath,
  roleNames,
  canUpdate,
  canDelete,
  onOpen,
  onDelete,
}: Props) {
  const columns: Column<IInformative>[] = [
    {
      header: 'Título',
      cell: (i) => <span className="font-medium text-gray-800">{i.title}</span>,
    },
    {
      header: 'Exibição',
      cell: (i) => (
        <div className="flex flex-wrap gap-1">
          {i.banner && <Badge variant="info">Informe Fixado</Badge>}
          {i.modal && <Badge variant="info">Modal</Badge>}
          {i.singleView && <Badge variant="default">1x</Badge>}
        </div>
      ),
    },
    {
      header: 'Público',
      cell: (i) => <RoleBadges roleIds={i.roleIds} roleNames={roleNames} />,
    },
    {
      header: 'Período',
      cell: (i) => periodLabel(i),
      className: 'text-gray-600 whitespace-nowrap',
    },
    {
      header: 'Status',
      cell: (i) => {
        const status = deriveStatus(i.initialDate, i.finalDate)

        return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      },
    },
    {
      header: '',
      cell: (i) => (
        <InformativeItemActions
          item={i}
          basePath={basePath}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="flex flex-col gap-3 mt-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Expirados</h2>
      <Table
        columns={columns}
        rows={items}
        keyExtractor={(i) => i.id}
        empty="Nenhum informativo encontrado."
        onRowClick={onOpen}
      />
      <Pagination total={total} limit={query.limit} offset={query.offset} />
    </div>
  )
}
