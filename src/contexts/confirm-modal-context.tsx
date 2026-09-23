'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { ConfirmModal } from '../ui/confirm-modal'
import type { ConfirmModalVariant } from '../ui/confirm-modal'

interface ConfirmOptions {
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmModalVariant
  icon?: React.ReactNode
  onConfirm: () => void | Promise<void>
}

type ConfirmFn = (opts: ConfirmOptions) => void

const ConfirmModalContext = createContext<ConfirmFn | null>(null)

export function ConfirmModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    setError(null)
    setOpen(true)
  }, [])

  async function handleConfirm() {
    if (!options?.onConfirm) return
    setIsPending(true)
    setError(null)
    try {
      await options.onConfirm()
      setOpen(false)
    } catch (e) {
      if (isRedirectError(e)) { setOpen(false); throw e }
      setError(e instanceof Error ? e.message : 'Ocorreu um erro inesperado.')
    } finally {
      setIsPending(false)
    }
  }

  function handleClose() {
    if (isPending) return
    setOpen(false)
  }

  return (
    <ConfirmModalContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmModal
          open={open}
          onClose={handleClose}
          onConfirm={handleConfirm}
          isPending={isPending}
          error={error}
          title={options.title}
          description={options.description}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          variant={options.variant}
          icon={options.icon}
        />
      )}
    </ConfirmModalContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmModalContext)
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmModalProvider')
  return ctx
}
