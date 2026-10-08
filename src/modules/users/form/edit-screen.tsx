'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Field, Select } from '../../../ui'
import { digitsOnly, formatDocument } from '../../../lib/format'
import { useBack } from '../../../lib/use-back'
import { useRoles } from '../../../entities/roles/queries'
import { toAddressValues, toBankAccountValues, toPhoneValue } from '../../../entities/users/form'
import type { UserOption } from '../../../entities/users/types'
import type { Viewer } from '../../../types'
import { userErrorMessage } from '../errors'
import { useUpdateUser } from '../mutations'
import { useFinanceLevels } from '../queries'
import type { IUser } from '../types'
import { parentContextFor } from './parent-context'
import { buildExtraData, updateUserSchema, type UpdateUserValues } from './schemas'
import { BELOW_ME, useParentSelect } from './use-parent-select'
import { UserFormBody } from './user-form-body'

export interface UserEditScreenProps {
  user: IUser
  basePath: string
  viewer: Viewer
  initialBelowMe: boolean
  initialParentRoleId: string
  initialParentUser: UserOption | null
  canMigrate: boolean
  canUpdateBankAccount: boolean
  canManageFinance: boolean
}

export function UserEditScreen({
  user,
  basePath,
  viewer,
  initialBelowMe,
  initialParentRoleId,
  initialParentUser,
  canMigrate,
  canUpdateBankAccount,
  canManageFinance,
}: UserEditScreenProps) {
  const back = useBack(basePath)
  const updateUser = useUpdateUser()
  const { data: allRoles = [] } = useRoles()
  const { data: financeLevels = [] } = useFinanceLevels(canManageFinance)
  const roles = allRoles.filter((r) => r.level <= viewer.level)

  const [isPJ, setIsPJ] = useState(digitsOnly(user.document).length === 14)
  const [attachmentIds, setAttachmentIds] = useState<number[]>([])
  const [attachmentError, setAttachmentError] = useState<string | undefined>()
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [needNFSe, setNeedNFSe] = useState(user.data?.needNFSe ?? false)
  const [autoRequestWithdraw, setAutoRequestWithdraw] = useState(user.data?.autoRequestWithdraw ?? true)
  const [commissionLevelId, setCommissionLevelId] = useState(
    user.data?.commissionLevel != null ? String(user.data.commissionLevel) : '',
  )

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    shouldUnregister: true,
    defaultValues: {
      name: user.name,
      email: user.email,
      document: formatDocument(user.document),
      password: '',
      phone: toPhoneValue(user.data?.phone),
      address: toAddressValues(user.data?.address),
      bankAccount: toBankAccountValues(user.data?.bankAccount),
      fantasy: user.data?.fantasy ?? '',
      responsible: {
        name: user.data?.responsibleName ?? '',
        document: user.data?.responsibleDocument ?? '',
      },
    },
  })
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = form

  const selectedRole = roles.find((r) => r.id === user.role) ?? null
  const fields = selectedRole?.config.fields ?? {}
  const canBePJ = selectedRole?.config.canBePJ ?? false
  const { parentRoleOptions, myRoleIsParent, parentsCount, parentRoleRequired } = parentContextFor(
    selectedRole,
    roles,
    viewer.role,
  )

  const ps = useParentSelect({ initialBelowMe, initialParentRoleId, initialParentUser })
  const effectiveBelowMe = myRoleIsParent && ps.belowMeChecked

  function resolveParentId(): number | undefined {
    if (parentsCount === 0) return undefined

    if (!canMigrate) return initialBelowMe ? viewer.id : (initialParentUser?.id ?? undefined)

    if (effectiveBelowMe) return viewer.id

    return ps.selectedParentUser?.id ?? initialParentUser?.id ?? undefined
  }

  async function onSubmit(values: UpdateUserValues) {
    if (fields.attachments && attachmentIds.length === 0) {
      setAttachmentError('É obrigatório enviar pelo menos um documento.')

      return
    }

    setAttachmentError(undefined)

    if (canMigrate) {
      const initialSelectionId = initialBelowMe ? BELOW_ME : initialParentRoleId
      const parentRoleChanged = ps.selectedParentRoleId !== initialSelectionId
      const needsParentUser = !effectiveBelowMe && !!ps.selectedParentRoleId && ps.selectedParentRoleId !== BELOW_ME

      if (needsParentUser && parentRoleChanged && !ps.selectedParentUser) {
        setError('root', { message: 'Selecione o usuário superior.' })

        return
      }
    }

    try {
      await updateUser.mutateAsync({
        id: user.id!,
        name: values.name || undefined,
        email: values.email || undefined,
        document: values.document ? digitsOnly(values.document) : undefined,
        password: values.password || undefined,
        parentId: resolveParentId(),
        extraData: {
          ...buildExtraData(values),
          needNFSe,
          autoRequestWithdraw,
          ...(attachmentIds.length > 0 ? { attachments: attachmentIds } : {}),
          ...(commissionLevelId ? { commissionLevel: Number(commissionLevelId) } : {}),
        },
      })
    } catch (error) {
      setError('root', { message: userErrorMessage(error, 'atualizar usuário') })

      return
    }

    back()
  }

  const roleElement = (
    <Field label="Perfil *" asDiv>
      <Select options={roles.map((r) => ({ value: r.id, label: r.name }))} value={user.role} disabled />
    </Field>
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <UserFormBody
          register={register}
          errors={errors}
          setValue={setValue as (name: string, value: unknown) => void}
          getValues={getValues as (name: string) => string | undefined}
          clearErrors={clearErrors as (name: string) => void}
          roleSection={roleElement}
          ps={ps}
          myRoleIsParent={myRoleIsParent}
          parentsCount={parentsCount}
          parentRoleOptions={parentRoleOptions}
          parentRoleRequired={parentRoleRequired}
          effectiveBelowMe={effectiveBelowMe}
          isPJ={isPJ}
          canBePJ={canBePJ}
          setIsPJ={setIsPJ}
          fields={fields}
          selectedRole={selectedRole}
          passwordLabel="Nova senha"
          passwordPlaceholder="Deixe em branco para não alterar"
          userId={user.id}
          attachmentError={attachmentError}
          onAttachmentIdsChange={setAttachmentIds}
          onAttachmentLoadingChange={setAttachmentsLoading}
          needNFSe={needNFSe}
          autoRequestWithdraw={autoRequestWithdraw}
          onNeedNFSeChange={setNeedNFSe}
          onAutoRequestWithdrawChange={setAutoRequestWithdraw}
          financeLevels={financeLevels}
          commissionLevelId={commissionLevelId}
          onCommissionLevelChange={setCommissionLevelId}
          checkBankAccountPermission
          checkMigrateUsersPermission
          canManageFinance={canManageFinance}
          canUpdateBankAccount={canUpdateBankAccount}
          canMigrate={canMigrate}
        />

        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{errors.root.message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" size="md" onClick={back} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="md" loading={isSubmitting} disabled={isSubmitting || attachmentsLoading}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
