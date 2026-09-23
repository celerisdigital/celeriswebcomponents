'use client'

import { LuLink } from 'react-icons/lu'
import { useToast } from '../contexts/toast-context'
import { Tooltip } from './tooltip'

export interface CopyableValueProps {
  value: string
  /** Conteúdo visual (default: o próprio `value`) */
  display?: React.ReactNode
  /** Mensagem do toast ao copiar */
  successMessage?: string
  className?: string
  /** Esconde o ícone de link à direita */
  hideIcon?: boolean
}

export function CopyableValue({
  value,
  display,
  successMessage = 'Copiado para a área de transferência!',
  className,
  hideIcon = false,
}: CopyableValueProps) {
  const toast = useToast()

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      toast(successMessage, { variant: 'success' })
    } catch {
      toast('Falha ao copiar', { variant: 'error' })
    }
  }

  return (
    <Tooltip content="Clique para copiar">
      <span
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity ${className ?? ''}`}
      >
        {display ?? value}
        {!hideIcon && value && <LuLink size={12} className="text-gray-400 shrink-0 rotate-[135deg]" />}
      </span>
    </Tooltip>
  )
}
