'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { LuCircleCheck, LuCircleAlert, LuInfo, LuX } from 'react-icons/lu'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  durationMs: number
}

interface ShowToastOptions {
  variant?: ToastVariant
  durationMs?: number
}

type ToastFn = (message: string, options?: ShowToastOptions) => void

const ToastContext = createContext<ToastFn | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastFn>((message, options) => {
    const id = ++idRef.current
    const item: ToastItem = {
      id,
      message,
      variant: options?.variant ?? 'info',
      durationMs: options?.durationMs ?? 2500,
    }
    setToasts((prev) => [...prev, item])
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItemView key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, item.durationMs)
    return () => clearTimeout(id)
  }, [item.durationMs, onDismiss])

  const variantCls: Record<ToastVariant, string> = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }

  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <LuCircleCheck size={18} />,
    error:   <LuCircleAlert size={18} />,
    info:    <LuInfo size={18} />,
    warning: <LuCircleAlert size={18} />,
  }

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-md text-sm font-medium ${variantCls[item.variant]}`}
    >
      {icons[item.variant]}
      <span>{item.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Fechar"
      >
        <LuX size={14} />
      </button>
    </div>
  )
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
