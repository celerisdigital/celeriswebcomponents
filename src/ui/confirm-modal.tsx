'use client'

import { LuTriangleAlert, LuCircleAlert } from 'react-icons/lu'
import { Modal } from './modal'
import { Button } from './button'

export type ConfirmModalVariant = 'danger' | 'warning'

export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmModalVariant
  isPending?: boolean
  error?: string | null
  icon?: React.ReactNode
}

const variantStyles: Record<ConfirmModalVariant, { bg: string; icon: string }> = {
  danger:  { bg: 'bg-red-50',    icon: 'text-red-500'    },
  warning: { bg: 'bg-amber-50',  icon: 'text-amber-500'  },
}

const defaultIcons: Record<ConfirmModalVariant, React.ReactNode> = {
  danger:  <LuCircleAlert size={28} />,
  warning: <LuTriangleAlert size={28} />,
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isPending = false,
  error,
  icon,
}: ConfirmModalProps) {
  const styles = variantStyles[variant]
  const resolvedIcon = icon ?? defaultIcons[variant]

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-sm"
      title={
        <div className="flex flex-col items-center text-center w-full gap-3">
          <div className={`p-3 rounded-full ${styles.bg} ${styles.icon}`}>
            {resolvedIcon}
          </div>
          <span className="text-base font-semibold text-gray-800">{title}</span>
        </div>
      }
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={isPending}
          >
            {isPending ? 'Aguarde...' : confirmLabel}
          </Button>
        </div>
      }
    >
      {description && (
        <p className="text-sm text-gray-500 text-center">{description}</p>
      )}
      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2">
          <LuCircleAlert size={15} className="shrink-0 mt-px" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </Modal>
  )
}
