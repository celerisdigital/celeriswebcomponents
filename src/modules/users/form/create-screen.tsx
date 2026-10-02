'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LuLoader } from 'react-icons/lu'
import { Button, Field, Select } from '../../../ui'
import { digitsOnly } from '../../../lib/format'
import { useBack } from '../../../lib/use-back'
import { useRoles } from '../../../entities/roles/queries'
import type { Viewer } from '../../../types'
import { userErrorMessage } from '../errors'
import { useCreateUser, useUploadUserFile } from '../mutations'
import { useFinanceLevels } from '../queries'
import { parentContextFor } from './parent-context'
import { buildExtraData, createUserSchema, type CreateUserValues, type UpdateUserValues } from './schemas'
import { BELOW_ME, useParentSelect } from './use-parent-select'
import { UserFormBody } from './user-form-body'

export interface UserCreateScreenProps {
  basePath: string
  viewer: Viewer
  canCreateHorizontal: boolean
  canManageFinance: boolean
}

type UploadPhase =
  | { status: 'uploading'; total: number; current: number }
  | { status: 'error'; failedFiles: string[]; userId: number }

export function UserCreateScreen({ basePath, viewer, canCreateHorizontal, canManageFinance }: UserCreateScreenProps) {
  const router = useRouter()
  const back = useBack(basePath)
  const createUser = useCreateUser()
  const uploadFile = useUploadUserFile()
  const { data: allRoles = [] } = useRoles()
  const { data: financeLevels = [] } = useFinanceLevels(canManageFinance)
  const roles = allRoles.filter((r) => (canCreateHorizontal ? r.level <= viewer.level : r.level < viewer.level))

  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [isPJ, setIsPJ] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState<string | undefined>()
  const [needNFSe, setNeedNFSe] = useState(false)
  const [autoRequestWithdraw, setAutoRequestWithdraw] = useState(true)
  const [commissionLevelId, setCommissionLevelId] = useState('')
  const [uploadPhase, setUploadPhase] = useState<UploadPhase | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    shouldUnregister: true,
    defaultValues: {
      role: '',
      name: '',
      email: '',
      document: '',
      password: '',
      phone: '',
      address: { cep: '', uf: '', city: '', district: '', street: '', number: '', complement: '' },
      bankAccount: {
        document: '',
        pix: { kind: '', key: '' },
        account: { bank: '', accountType: '', agency: '', accountNumber: '', accountOwner: '' },
      },
      fantasy: '',
      responsible: { name: '', document: '' },
    },
  })

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null
  const fields = selectedRole?.config.fields ?? {}
  const canBePJ = selectedRole?.config.canBePJ ?? false
  const { parentRoleOptions, myRoleIsParent, parentsCount, parentRoleRequired } = parentContextFor(
    selectedRole,
    roles,
    viewer.role,
  )

  const ps = useParentSelect()
  const effectiveBelowMe = myRoleIsParent && ps.belowMeChecked

  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId)
    setIsPJ(false)

    if (!roleId) return

    const next = parentContextFor(roles.find((r) => r.id === roleId) ?? null, roles, viewer.role)
    ps.resetForRole(next.myRoleIsParent, next.parentRoleOptions)
  }

  async function onSubmit(values: CreateUserValues) {
    if (fields.attachments && attachmentFiles.length === 0) {
      setAttachmentError('É obrigatório enviar pelo menos um documento.')

      return
    }

    setAttachmentError(undefined)

    const needsParentUser = !effectiveBelowMe && !!ps.selectedParentRoleId && ps.selectedParentRoleId !== BELOW_ME

    if (needsParentUser && !ps.selectedParentUser) {
      setError('root', { message: 'Selecione o usuário superior.' })

      return
    }

    let createdId: number | undefined

    try {
      const created = await createUser.mutateAsync({
        role: values.role,
        name: values.name,
        email: values.email,
        document: digitsOnly(values.document),
        password: values.password || undefined,
        parentId: effectiveBelowMe ? viewer.id : ps.selectedParentUser?.id,
        extraData: {
          ...buildExtraData(values),
          needNFSe,
          autoRequestWithdraw,
          ...(commissionLevelId ? { commissionLevel: Number(commissionLevelId) } : {}),
        },
      })
      createdId = created.id
    } catch (error) {
      setError('root', { message: userErrorMessage(error, 'criar usuário') })

      return
    }

    if (fields.attachments && attachmentFiles.length > 0 && createdId) {
      const failedFiles: string[] = []

      for (let i = 0; i < attachmentFiles.length; i++) {
        setUploadPhase({ status: 'uploading', total: attachmentFiles.length, current: i + 1 })

        try {
          await uploadFile.mutateAsync({ userId: createdId, file: attachmentFiles[i] })
        } catch {
          failedFiles.push(attachmentFiles[i].name)
        }
      }

      if (failedFiles.length > 0) {
        setUploadPhase({ status: 'error', failedFiles, userId: createdId })

        return
      }
    }

    router.push(basePath)
  }

  const roleElement = (
    <Field label="Perfil *" error={errors.role?.message} asDiv>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Select
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
            placeholder="Selecione um perfil..."
            value={field.value}
            onChange={(v) => {
              field.onChange(v)
              handleRoleChange(v)
            }}
            autocomplete
          />
        )}
      />
    </Field>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <UserFormBody
        register={register as unknown as UseFormRegister<UpdateUserValues>}
        control={control as unknown as Control<UpdateUserValues>}
        errors={errors as unknown as FieldErrors<UpdateUserValues>}
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
        attachmentFiles={attachmentFiles}
        onAttachmentFilesChange={setAttachmentFiles}
        attachmentError={attachmentError}
        needNFSe={needNFSe}
        autoRequestWithdraw={autoRequestWithdraw}
        onNeedNFSeChange={setNeedNFSe}
        onAutoRequestWithdrawChange={setAutoRequestWithdraw}
        financeLevels={financeLevels}
        commissionLevelId={commissionLevelId}
        onCommissionLevelChange={setCommissionLevelId}
        passwordLabel="Senha"
        passwordPlaceholder="Mínimo 6 caracteres"
        canManageFinance={canManageFinance}
        canUpdateBankAccount
        canMigrate
      />

      {errors.root && !uploadPhase && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{errors.root.message}</p>
      )}

      {uploadPhase?.status === 'uploading' && (
        <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg">
          <LuLoader className="animate-spin h-4 w-4 text-gray-500 shrink-0" />
          <p className="text-sm text-gray-600">
            Enviando documentos… {uploadPhase.current} de {uploadPhase.total}
          </p>
        </div>
      )}

      {uploadPhase?.status === 'error' && (
        <div className="flex flex-col gap-3 px-4 py-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm font-medium text-red-700">
            Usuário criado, mas {uploadPhase.failedFiles.length === 1 ? 'um arquivo não pôde' : 'alguns arquivos não puderam'}{' '}
            ser enviado{uploadPhase.failedFiles.length > 1 ? 's' : ''}:
          </p>
          <ul className="text-sm text-red-600 list-disc list-inside">
            {uploadPhase.failedFiles.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => router.push(basePath)}>
              Ir para usuários
            </Button>
            <Button type="button" size="sm" onClick={() => router.push(`${basePath}/${uploadPhase.userId}/editar`)}>
              Editar usuário
            </Button>
          </div>
        </div>
      )}

      {!uploadPhase && (
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" size="md" onClick={back} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="md" loading={isSubmitting} disabled={isSubmitting || !selectedRoleId}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      )}
    </form>
  )
}
