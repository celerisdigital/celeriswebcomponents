'use client'

import { useState } from 'react'
import { LuTriangleAlert } from 'react-icons/lu'
import { Modal, Button, Field, Switch } from '../../../ui'

interface Props {
  userName: string
  isPending: boolean
  onConfirm: (reason: string, allBelow: boolean) => void
  onCancel: () => void
}

export function BlockReasonModal({ userName, isPending, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('')
  const [allBelow, setAllBelow] = useState(false)

  return (
    <Modal
      open
      onClose={onCancel}
      maxWidth="max-w-md"
      title={<h2 className="text-base font-semibold text-gray-800">Bloquear usuário</h2>}
      subtitle={
        <p className="text-sm text-gray-500">
          Bloquear <span className="font-medium text-gray-700">{userName}</span>?
        </p>
      }
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onConfirm(reason, allBelow)} loading={isPending}>
            Bloquear
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Motivo (opcional)" asDiv>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={128}
            rows={3}
            placeholder="Descreva o motivo do bloqueio..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <span className="text-xs text-gray-400 text-right">{reason.length}/128</span>
        </Field>

        <Switch
          label="Bloquear todos os usuários abaixo"
          labelClassName="font-medium text-gray-700"
          className="w-full flex-row-reverse justify-between rounded-lg border border-gray-200 px-3.5 py-3"
          checked={allBelow}
          onChange={(e) => setAllBelow(e.target.checked)}
          disabled={isPending}
        />

        {allBelow && (
          <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3">
            <LuTriangleAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <p className="text-sm leading-relaxed text-amber-800">
              Tenha em mente que isso bloqueará o usuário <span className="font-semibold">{userName}</span> e todos
              os usuários abaixo dele. Esses usuários só poderão voltar a usar o sistema se{' '}
              <span className="font-semibold">{userName}</span> for desbloqueado.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
