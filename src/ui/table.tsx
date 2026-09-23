'use client'

import { Fragment, useState, type ReactNode } from 'react'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'

export interface Column<T> {
  header: string
  cell: (row: T) => React.ReactNode
  /** Aplicado ao <td> — útil para whitespace-nowrap, larguras fixas, alinhamento */
  className?: string
  /** Ocultar este campo nos cards mobile */
  mobileHidden?: boolean
}

type Key = string | number

export interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyExtractor: (row: T) => Key
  empty?: string
  onRowClick?: (row: T) => void
  /**
   * Quando definido, cada linha vira expansível.
   * - Adiciona coluna de chevron à esquerda
   * - Click na linha alterna expansão (em vez de chamar `onRowClick`)
   * - `renderExpandedRow` recebe a row e retorna o conteúdo do painel
   * - Pode ser controlado via `expandedKey` + `onExpandToggle`, ou uncontrolled
   * - Botões de ação dentro da row devem usar `onClick={(e) => { e.stopPropagation(); ... }}`
   */
  renderExpandedRow?: (row: T) => ReactNode
  expandedKey?: Key | null
  onExpandToggle?: (key: Key | null) => void
  /** Classes de background/borda aplicadas à linha (desktop) e ao card (mobile) — para tingir levemente conforme o sentido da row. */
  rowClassName?: (row: T) => string
}

export function Table<T>({
  columns,
  rows,
  keyExtractor,
  empty = 'Nenhum item encontrado.',
  onRowClick,
  renderExpandedRow,
  expandedKey: controlledKey,
  onExpandToggle,
  rowClassName,
}: TableProps<T>) {
  const [uncontrolledKey, setUncontrolledKey] = useState<Key | null>(null)
  const isControlled = controlledKey !== undefined
  const expandedKey = isControlled ? controlledKey : uncontrolledKey

  const isExpandable = !!renderExpandedRow

  function toggleExpand(key: Key) {
    const next = expandedKey === key ? null : key
    if (isControlled) onExpandToggle?.(next)
    else setUncontrolledKey(next)
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        {empty}
      </div>
    )
  }

  const dataColumns = columns.filter((col) => col.header && !col.mobileHidden)
  const actionColumns = columns.filter((col) => !col.header)

  const rowClickable = isExpandable || !!onRowClick

  function handleRowClick(row: T) {
    if (isExpandable) toggleExpand(keyExtractor(row))
    else onRowClick?.(row)
  }

  return (
    <>
      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => {
          const key = keyExtractor(row)
          const isOpen = expandedKey === key
          return (
            <div
              key={key}
              className={`${rowClassName?.(row) ?? 'bg-white'} rounded-xl border border-gray-100 p-4 ${rowClickable ? 'cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all' : ''}`}
              onClick={() => handleRowClick(row)}
            >
              <div className="flex items-start gap-2">
                <dl className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 min-w-0">
                  {dataColumns.map((col, i) => (
                    <div key={i} className="flex flex-col gap-0.5 min-w-0">
                      <dt className="text-[0.625rem] font-semibold text-gray-400 uppercase tracking-wide">{col.header}</dt>
                      <dd className="text-sm text-gray-800 wrap-break-word min-w-0">{col.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
                {isExpandable && (
                  <div className="text-gray-400 shrink-0 pt-0.5">
                    {isOpen ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
                  </div>
                )}
              </div>
              {actionColumns.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {actionColumns.map((col, i) => (
                    <div key={i}>{col.cell(row)}</div>
                  ))}
                </div>
              )}
              {isExpandable && isOpen && renderExpandedRow && (
                <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  {renderExpandedRow(row)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop — tabela */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {isExpandable && <th className="px-4 py-3 w-8" />}
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const key = keyExtractor(row)
                const isOpen = expandedKey === key
                return (
                  <Fragment key={key}>
                    <tr
                      className={`border-b border-gray-50 transition-colors ${rowClassName?.(row) ?? 'hover:bg-gray-50'} ${rowClickable ? 'cursor-pointer' : ''}`}
                      onClick={() => handleRowClick(row)}
                    >
                      {isExpandable && (
                        <td className="px-4 py-3.5 text-gray-400">
                          {isOpen ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
                        </td>
                      )}
                      {columns.map((col, i) => (
                        <td key={i} className={`px-4 py-3.5 ${col.className ?? ''}`}>
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                    {isExpandable && isOpen && renderExpandedRow && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan={columns.length + 1} className="px-4 py-3">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
