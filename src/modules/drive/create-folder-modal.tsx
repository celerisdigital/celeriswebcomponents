'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button, Field, Input, Modal, MultiSelect, RadioGroup } from '../../ui'
import { useToast } from '../../contexts/toast-context'
import type { RoleOption } from '../../types'
import { extractErrorMessage } from '../../lib/errors'
import { useCreateDriveFolder } from './mutations'
import { createFolderSchema, type CreateFolderValues } from './schemas'

interface Props {
  open: boolean
  onClose: () => void
  parentFolderId?: number
  roles: RoleOption[]
  onSuccess: () => void
}

export function CreateFolderModal({ open, onClose, parentFolderId, roles, onSuccess }: Props) {
  const toast = useToast()
  const createFolder = useCreateDriveFolder()
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateFolderValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: '', visibility: 'private', roles: [] },
  })

  const visibility = watch('visibility')
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  async function onSubmit(values: CreateFolderValues) {
    try {
      await createFolder.mutateAsync({
        name: values.name,
        isPublic: values.visibility === 'public',
        parentFolderId,
        roles: values.visibility === 'private' ? values.roles : undefined,
      })
    } catch (error) {
      setError('root', { message: extractErrorMessage(error, 'Erro ao criar pasta.') })
      return
    }

    toast('Pasta criada com sucesso.', { variant: 'success' })
    reset()
    onSuccess()
  }

  function handleClose() {
    if (isSubmitting) return
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={<span className="font-semibold text-gray-800">Nova pasta</span>}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nome da pasta" error={errors.name?.message}>
          <Input {...register('name')} placeholder="Ex.: Contratos 2026" autoFocus maxLength={40} error={errors.name?.message} />
        </Field>

        <Field label="Visibilidade" error={errors.visibility?.message} asDiv>
          <Controller
            control={control}
            name="visibility"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'public', label: 'Pública', description: 'Qualquer usuário logado pode ver.' },
                  { value: 'private', label: 'Privada', description: 'Só os perfis selecionados podem ver.' },
                ]}
                error={errors.visibility?.message}
              />
            )}
          />
        </Field>

        {visibility === 'private' && (
          <Field label="Perfis com acesso" error={errors.roles?.message} asDiv>
            <Controller
              control={control}
              name="roles"
              render={({ field }) => (
                <MultiSelect
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                  autocomplete
                  placeholder="Selecione os perfis..."
                  error={errors.roles?.message}
                />
              )}
            />
          </Field>
        )}

        {errors.root?.message && <p className="text-sm text-red-500">{errors.root.message}</p>}

        <div className="flex items-center gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar pasta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
