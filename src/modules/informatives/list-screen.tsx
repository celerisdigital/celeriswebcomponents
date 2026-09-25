'use client'

import { useRouter } from 'next/navigation'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { Badge, Pagination, Table, type Column } from '../../ui'
import { useConfirm } from '../../contexts/confirm-modal-context'
import { useQueryModal } from '../../lib/use-query-modal'
import type { RoleOption } from '../../types'
import { InformativeDetailModal } from './detail-modal'
import { informativeErrorMessage } from './errors'
import { InformativesFilters } from './filters'
import { useDeleteInformative } from './mutations'
import { InformativesPageHeader } from './page-header'
import { useInformatives } from './queries'
import { RoleBadges } from './role-badges'
import { deriveStatus, displayDateOnly, STATUS_LABEL, STATUS_VARIANT } from './status'
import type { IInformative, InformativesQuery } from './types'

interface Props {
  basePath: string
  backFallback: string
  roles: RoleOption[]
  query: InformativesQuery
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

function periodLabel(item: IInformative): string {
  const start = displayDateOnly(item.initialDate)
  const end = displayDateOnly(item.finalDate)
  if (!start && !end) return 'Sem prazo'

  if (start && end) return `${start} – ${end}`

  if (start) return `A partir de ${start}`

  return `Até ${end}`
}

export function InformativesListScreen({
  basePath,
  backFallback,
  roles,
  query,
  canCreate,
  canUpdate,
  canDelete,
}: Props) {
  const router = useRouter()
  const confirm = useConfirm()
  const deleteInformative = useDeleteInformative()
  const { data, isError } = useInformatives(query)
  const { id: selectedId, open, close } = useQueryModal('informativeId')

  const items = data?.rows ?? []
  const roleNames: Record<string, string> = Object.fromEntries(roles.map((r) => [r.id, r.name] as const))
  const selected = selectedId ? items.find((i) => String(i.id) === selectedId) ?? null : null

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
        <div className="flex items-center justify-end gap-2">
          {canUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`${basePath}/${i.id}/editar`)
              }}
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label={`Editar ${i.title}`}
            >
              <LuPencil size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                askDelete(i)
              }}
              className="text-gray-500 hover:text-red-600 transition-colors"
              aria-label={`Excluir ${i.title}`}
            >
              <LuTrash2 size={16} />
            </button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <>
      <InformativesPageHeader basePath={basePath} backFallback={backFallback} canCreate={canCreate} />
      <InformativesFilters />
      {isError &&<p className="text-sm text-red-500">Não foi possível carregar os informativos.</p>}
      <Table
        columns={columns}
        rows={items}
        keyExtractor={(i) => i.id}
        empty="Nenhum informativo encontrado."
        onRowClick={(i) => open(String(i.id))}
      />
      <InformativeDetailModal item={selected} roleNames={roleNames} onClose={close} />
      <Pagination total={data?.meta.total ?? 0} limit={query.limit} offset={query.offset} />
    </>
  )
}
