'use client'

import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BackButton, Button } from '../../ui'
import type { RoleOption } from '../../types'
import { informativeErrorMessage } from './errors'
import { InformativeFormBody } from './form-body'
import { useCreateInformative, useUpdateInformative } from './mutations'
import { informativeFormSchema, toFormValues, toPayload, type InformativeFormValues } from './schemas'
import type { IInformative } from './types'

interface Props {
  basePath: string
  roles: RoleOption[]
  item?: IInformative
}

export function InformativeFormScreen({ basePath, roles, item }: Props) {
  const router = useRouter()
  const create = useCreateInformative()
  const update = useUpdateInformative()
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InformativeFormValues>({
    resolver: zodResolver(informativeFormSchema),
    defaultValues: toFormValues(item),
  })

  const displayType = useWatch({ control, name: 'displayType' })

  async function onSubmit(values: InformativeFormValues) {
    const body = toPayload(values)

    try {
      if (item) await update.mutateAsync({ id: item.id, body })
      else await create.mutateAsync(body)
    } catch (error) {
      setError('root', {
        message: informativeErrorMessage(error, item ? 'atualizar informativo' : 'criar informativo'),
      })

      return
    }

    router.push(basePath)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <BackButton fallback={basePath} />
        <h1 className="text-xl font-semibold text-gray-800">{item ? 'Editar informativo' : 'Novo informativo'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <InformativeFormBody
          register={register}
          control={control}
          errors={errors}
          roleOptions={roleOptions}
          displayType={displayType}
          initialUrl={item?.storageUrl}
        />

        {errors.root?.message && <p className="text-sm text-red-500">{errors.root.message}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => router.push(basePath)}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </>
  )
}
