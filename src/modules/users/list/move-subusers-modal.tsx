'use client'

import { useState } from 'react'
import { LuArrowRightLeft, LuCircleAlert } from 'react-icons/lu'
import { Button, Field, Modal } from '../../../ui'
import { UserSearchSelect } from '../../../entities/users/user-search-select'
import type { UserOption } from '../../../entities/users/types'
import { userErrorMessage } from '../errors'
import { useMoveSubusers } from '../mutations'

interface Props {
  userId: number
  userName: string
  roleId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function MoveSubusersModal({ userId, userName, roleId, open, onClose, onSuccess }: Props) {
  const moveSubusers = useMoveSubusers()
  const [targetUser, setTargetUser] = useState<UserOption | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isPending = moveSubusers.isPending

  function handleClose() {
    if (isPending) return

    setTargetUser(null)
    setError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!targetUser) {
      setError('Selecione um usuário de destino.')

      return
    }

    if (targetUser.id === userId) {
      setError('O usuário de destino não pode ser o mesmo que o atual.')

      return
    }

    setError(null)

    try {
      await moveSubusers.mutateAsync({ fromUserId: userId, newParentId: targetUser.id })
    } catch (err) {
      setError(userErrorMessage(err, 'transferir usuários'))

      return
    }

    onSuccess?.()
    setTargetUser(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-2">
          <LuArrowRightLeft size={18} className="text-blue-600 shrink-0" />
          <span className="font-semibold text-gray-800">Mover usuários abaixo</span>
        </div>
      }
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={isPending}>
            {isPending ? 'Movendo...' : 'Mover'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Selecione o novo responsável para os usuários abaixo de <strong className="text-gray-700">{userName}</strong>.
        </p>
        <Field label="Usuário de destino *" error={error ?? undefined} asDiv>
          <UserSearchSelect roleId={roleId} value={targetUser} onChange={setTargetUser} error={error ?? undefined} />
        </Field>
        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2">
            <LuCircleAlert size={15} className="shrink-0 mt-px" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
