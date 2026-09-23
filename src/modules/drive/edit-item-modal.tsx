'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { LuTriangleAlert } from 'react-icons/lu'
import { Badge, Button, Field, Input, Modal, MultiSelect, RadioGroup } from '../../ui'
import { useToast } from '../../contexts/toast-context'
import type { RoleOption } from '../../types'
import { extractErrorMessage } from '../../lib/errors'
import { useUpdateDriveFile, useUpdateDriveFolder } from './mutations'
import type { DriveDetailsTarget } from './item-details-modal'

const editItemSchema = z.object({
  name: z.string().min(1, 'Informe o nome.').max(120, 'Máximo de 120 caracteres.'),
  visibility: z.enum(['public', 'private']),
  roles: z.array(z.string()),
})
type EditItemValues = z.infer<typeof editItemSchema>

interface Props {
  target: DriveDetailsTarget | null
  onClose: () => void
  roles: RoleOption[]
  onSuccess: () => void
}

export function EditItemModal({ target, onClose, roles, onSuccess }: Props) {
  const toast = useToast()
  const updateFolder = useUpdateDriveFolder()
  const updateFile = useUpdateDriveFile()
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditItemValues>({
    resolver: zodResolver(editItemSchema),
    defaultValues: { name: '', visibility: 'public', roles: [] },
  })

  useEffect(() => {
    if (!target) return
    reset({
      name: target.item.name,
      visibility: target.item.isPublic ? 'public' : 'private',
      roles: target.item.roles ?? [],
    })
  }, [target, reset])

  const visibility = watch('visibility')
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))
  const maxLength = target?.type === 'folder' ? 40 : 120
  const showRoles = target?.type === 'folder' ? visibility === 'private' : !!target && !target.item.isPublic

  async function onSubmit(values: EditItemValues) {
    if (!target) return

    try {
      if (target.type === 'folder') {
        await updateFolder.mutateAsync({
          id: target.item.id,
          name: values.name,
          isPublic: values.visibility === 'public',
          roles: values.visibility === 'private' ? values.roles : [],
        })
      } else {
        await updateFile.mutateAsync({
          id: target.item.id,
          name: values.name,
          roles: target.item.isPublic ? undefined : values.roles,
        })
      }
    } catch (error) {
      setError('root', { message: extractErrorMessage(error, 'Erro ao atualizar.') })
      return
    }

    toast('Atualizado com sucesso.', { variant: 'success' })
    onSuccess()
  }

  function handleClose() {
    if (isSubmitting) return
    onClose()
  }

  return (
    <Modal
      open={!!target}
      onClose={handleClose}
      title={
        <span className="font-semibold text-gray-800">
          {target?.type === 'folder' ? 'Editar pasta' : 'Editar arquivo'}
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nome" error={errors.name?.message}>
          <Input {...register('name')} maxLength={maxLength} error={errors.name?.message} autoFocus />
        </Field>

        {target?.type === 'folder' ? (
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
        ) : (
          <Field label="Visibilidade" asDiv>
            <div className="flex flex-col gap-2">
              <Badge variant={target?.item.isPublic ? 'success' : 'default'} className="w-fit">
                {target?.item.isPublic ? 'Público' : 'Privado'}
              </Badge>
              <div className="flex items-start gap-2 bg-gray-50 text-gray-500 rounded-lg px-3 py-2">
                <LuTriangleAlert size={14} className="shrink-0 mt-px" />
                <p className="text-xs">A visibilidade de um arquivo é definida no envio e não pode ser alterada.</p>
              </div>
            </div>
          </Field>
        )}

        {showRoles && (
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
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
