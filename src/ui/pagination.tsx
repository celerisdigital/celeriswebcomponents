'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useNavLoading } from '../contexts/nav-loading-context'
import { PAGE_SIZE_OPTIONS } from './pagination-options'

interface Props {
  total: number
  limit: number
  offset: number
  /** Mostra "N resultados" antes dos controles. Default: true. */
  showCount?: boolean
  /** Override das opções do seletor de tamanho. Default: [10, 20, 50, 100]. */
  pageSizeOptions?: number[]
}

export default function Pagination({
  total,
  limit,
  offset,
  showCount = true,
  pageSizeOptions,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { startNav } = useNavLoading()

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const currentPage = Math.min(Math.floor(offset / limit) + 1, totalPages)

  if (total === 0) return null

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('offset', String((page - 1) * limit))
    startNav(() => router.push(`${pathname}?${params}`))
  }

  function changeLimit(next: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', String(next))
    params.set('offset', '0')
    startNav(() => router.push(`${pathname}?${params}`))
  }

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages
  const singlePage = totalPages <= 1
  const sizeOptions = pageSizeOptions ?? PAGE_SIZE_OPTIONS
  const showSizeSelect = sizeOptions.length > 0

  return (
    <div className="flex items-center justify-end gap-2 text-xs text-gray-500 w-full">
      {showCount && (
        <span className="text-gray-400 whitespace-nowrap">
          {total} {total === 1 ? 'resultado' : 'resultados'}
        </span>
      )}
      {showSizeSelect && (
        <label className="inline-flex items-center gap-1.5 text-gray-500">
          <span className="whitespace-nowrap">Linhas:</span>
          <select
            value={limit}
            onChange={(e) => changeLimit(Number(e.target.value))}
            className="bg-gray-50 border border-gray-100 rounded-full pl-2.5 pr-6 py-1 text-xs font-medium text-gray-700 tabular-nums cursor-pointer hover:bg-white hover:border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none bg-no-repeat"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
              backgroundPosition: 'right 6px center',
              backgroundSize: '10px',
            }}
          >
            {sizeOptions!.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}
      {!singlePage && (
        <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-full px-1 py-0.5">
          <ArrowButton onClick={() => goTo(currentPage - 1)} disabled={prevDisabled} ariaLabel="Página anterior">
            <LuChevronLeft size={14} />
          </ArrowButton>
          <span className="text-gray-600 font-medium tabular-nums px-2 select-none">
            {currentPage}<span className="text-gray-300 mx-0.5">/</span>{totalPages}
          </span>
          <ArrowButton onClick={() => goTo(currentPage + 1)} disabled={nextDisabled} ariaLabel="Próxima página">
            <LuChevronRight size={14} />
          </ArrowButton>
        </div>
      )}
    </div>
  )
}

function ArrowButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
        disabled ? 'opacity-25 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}
