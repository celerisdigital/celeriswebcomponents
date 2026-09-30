'use client'

import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../ui'
import { useRoleOptions } from '../../roles/queries'
import { informativeErrorMessage } from './errors'
import { InformativeFormBody } from './form-body'
import { useCreateInformative, useUpdateInformative } from './mutations'
import { informativeFormSchema, toFormValues, toPayload, type InformativeFormValues } from './schemas'
import type { IInformative } from './types'

interface Props {
  basePath: string
  item?: IInformative
}

export function InformativeFormScreen({ basePath, item }: Props) {
  const router = useRouter()
  const create = useCreateInformative()
  const update = useUpdateInformative()
  const { data: roles = [] } = useRoleOptions()
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
  )
}
