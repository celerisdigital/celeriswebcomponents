'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LuChevronDown, LuLoader, LuNetwork } from 'react-icons/lu'
import { Badge, Modal } from '../../../ui'
import { cn } from '../../../lib/cn'
import { useUserChain } from '../queries'
import { STATUS_MAP } from '../status'

interface Props {
  userId: number
  userName: string
}

export function ChainButton({ userId, userName }: Props) {
  const [open, setOpen] = useState(false)
  const chain = useUserChain(userId, open)
  const items = chain.data ?? []

  return (
    <>
      <button
        title="Ver cadeia hierárquica"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <LuNetwork size={16} />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title={<h2 className="font-semibold text-gray-800 text-base leading-tight">Cadeia hierárquica</h2>}
            subtitle={<p className="text-sm text-gray-500">{userName}</p>}
          >
            {chain.isLoading && (
              <div className="flex justify-center py-8 text-gray-400">
                <LuLoader size={20} className="animate-spin" />
              </div>
            )}
            {chain.isError && <p className="text-sm text-red-500 py-6 text-center">Falha ao carregar cadeia hierárquica.</p>}
            {chain.isSuccess && items.length === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center">Nenhum ancestral encontrado.</p>
            )}
            {items.length > 0 && (
              <div className="flex flex-col items-stretch">
                {items.map((u, i) => {
                  const isLast = i === items.length - 1
                  const status = STATUS_MAP[u.status]

                  return (
                    <div key={u.id} className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-full rounded-xl px-4 py-3 border shadow-sm',
                          isLast ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn('text-sm font-semibold', isLast ? 'text-indigo-900' : 'text-gray-800')}>
                            {u.name}
                          </span>
                          {status && <Badge variant={status.variant}>{status.label}</Badge>}
                        </div>
                        <span className="text-xs font-medium text-gray-500 block mt-0.5">{u.roleName}</span>
                        <span className="text-xs text-gray-400 block">{u.email}</span>
                        <span className="text-xs text-gray-400">#{u.id}</span>
                      </div>

                      {!isLast && (
                        <div className="flex flex-col items-center py-0.5 text-indigo-300">
                          <div className="w-px h-2 bg-indigo-200" />
                          <LuChevronDown size={14} />
                          <div className="w-px h-2 bg-indigo-200" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Modal>,
          document.body,
        )}
    </>
  )
}
