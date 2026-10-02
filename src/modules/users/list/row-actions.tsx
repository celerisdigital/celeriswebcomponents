'use client'

import { useState } from 'react'
import { LuArrowRightLeft, LuBan, LuCircleAlert, LuCircleCheck, LuTrash2 } from 'react-icons/lu'
import { Button, Modal } from '../../../ui'
import { useToast } from '../../../contexts/toast-context'
import { cn } from '../../../lib/cn'
import { userErrorMessage } from '../errors'
import { useChangeUserStatus, useDeleteUser } from '../mutations'
import { usersStatus } from '../status'
import { BlockReasonModal } from './block-reason-modal'
import { MoveSubusersModal } from './move-subusers-modal'

export function ChangeStatusButton({
  userId,
  userName,
  currentStatus,
}: {
  userId: number
  userName: string
  currentStatus: number
}) {
  const toast = useToast()
  const changeStatus = useChangeUserStatus()
  const [showModal, setShowModal] = useState(false)
  const isBlocked = currentStatus === usersStatus.blocked || currentStatus === usersStatus.aboveBlocked
  const isActive = currentStatus === usersStatus.active
  const isPending = changeStatus.isPending

  if (!isActive && !isBlocked) return null

  async function submit(status: number, reason?: string, allBelow?: boolean) {
    try {
      await changeStatus.mutateAsync({ id: userId, status, reason: reason || undefined, allBelow: allBelow || undefined })
    } catch (error) {
      toast(userErrorMessage(error, 'alterar status'), { variant: 'error' })
    }
  }

  function handleClick() {
    if (isActive) {
      setShowModal(true)

      return
    }

    submit(usersStatus.active)
  }

  function handleBlockConfirm(reason: string, allBelow: boolean) {
    setShowModal(false)
    submit(usersStatus.blocked, reason, allBelow)
  }

  return (
    <>
      <button
        title={isActive ? 'Bloquear usuário' : 'Reativar usuário'}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'p-1.5 rounded-lg transition-colors disabled:opacity-50 text-gray-400',
          isActive ? 'hover:text-red-600 hover:bg-red-50' : 'hover:text-green-600 hover:bg-green-50',
        )}
      >
        {isActive ? <LuBan size={16} /> : <LuCircleCheck size={16} />}
      </button>
      {showModal && (
        <BlockReasonModal
          userName={userName}
          isPending={isPending}
          onConfirm={handleBlockConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export function MoveSubusersButton({ userId, userName, roleId }: { userId: number; userName: string; roleId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        title="Mover usuários abaixo"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <LuArrowRightLeft size={16} />
      </button>
      <MoveSubusersModal userId={userId} userName={userName} roleId={roleId} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function DeleteButton({
  userId,
  userName,
  roleId,
  canMigrate,
}: {
  userId: number
  userName: string
  roleId: string
  canMigrate: boolean
}) {
  const deleteUser = useDeleteUser()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMove, setShowMove] = useState(false)
  const isPending = deleteUser.isPending
  const lowered = error?.toLowerCase() ?? ''
  const hasSubsError = canMigrate && (lowered.includes('abaixo') || lowered.includes('subordinad'))

  function handleOpen() {
    setError(null)
    setOpen(true)
  }

  function handleClose() {
    if (isPending) return

    setOpen(false)
    setError(null)
  }

  async function handleConfirm() {
    try {
      await deleteUser.mutateAsync(userId)
      setOpen(false)
    } catch (err) {
      setError(userErrorMessage(err, 'deletar usuário'))
    }
  }

  return (
    <>
      <button
        title="Deletar usuário"
        onClick={handleOpen}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <LuTrash2 size={16} />
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        maxWidth="max-w-sm"
        title={
          <div className="flex flex-col items-center text-center w-full gap-3">
            <div className="p-3 rounded-full bg-red-50 text-red-500">
              <LuTrash2 size={28} />
            </div>
            <span className="text-base font-semibold text-gray-800">Deletar usuário</span>
          </div>
        }
        footer={
          <div className={cn('flex gap-2', hasSubsError ? 'justify-between' : 'justify-end')}>
            {hasSubsError && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOpen(false)
                  setError(null)
                  setShowMove(true)
                }}
              >
                <LuArrowRightLeft size={14} className="mr-1.5" />
                Mover usuários abaixo
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirm} loading={isPending}>
                {isPending ? 'Aguarde...' : 'Deletar'}
              </Button>
            </div>
          </div>
        }
      >
        <p className="text-sm text-gray-500 text-center">
          Tem certeza que deseja deletar &quot;{userName}&quot;? Esta ação não pode ser desfeita.
        </p>
        {error && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2">
            <LuCircleAlert size={15} className="shrink-0 mt-px" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </Modal>

      <MoveSubusersModal
        userId={userId}
        userName={userName}
        roleId={roleId}
        open={showMove}
        onClose={() => setShowMove(false)}
        onSuccess={() => setOpen(true)}
      />
    </>
  )
}
