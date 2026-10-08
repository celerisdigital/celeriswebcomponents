'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Field, Input, Section } from '../../ui'
import { digitsOnly } from '../../lib/format'
import { AddressSection, BankAccountSection, PhoneSection } from '../../entities/users/form'
import { updateMeErrorMessage } from './errors'
import { useUpdateMe } from './mutations'
import { toUpdateMePayload } from './payload'
import { profileSchema, toProfileValues, type ProfileValues } from './schemas'
import type { IMe, ProfileRoleConfig } from './types'

interface Props {
  me: IMe
  roleConfig: ProfileRoleConfig
}

export function ProfileScreen({ me, roleConfig }: Props) {
  const router = useRouter()
  const updateMe = useUpdateMe()
  const [success, setSuccess] = useState(false)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    shouldUnregister: true,
    defaultValues: toProfileValues(me),
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form

  const fields = roleConfig.fields
  const isPJ = digitsOnly(me.document).length === 14

  async function onSubmit(values: ProfileValues) {
    setSuccess(false)

    try {
      await updateMe.mutateAsync(toUpdateMePayload(values))
    } catch (error) {
      setError('root', { message: updateMeErrorMessage(error) })

      return
    }

    setSuccess(true)
    router.refresh()
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Section title="Dados básicos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={isPJ ? 'Razão Social' : 'Nome'} error={errors.name?.message} className="sm:col-span-2">
              <Input {...register('name')} maxLength={256} placeholder={isPJ ? 'Razão social' : 'Nome completo'} />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <Input {...register('email')} type="email" maxLength={128} placeholder="email@exemplo.com" />
            </Field>
            <Field label={isPJ ? 'CNPJ' : 'CPF'}>
              <Input defaultValue={digitsOnly(me.document)} disabled />
            </Field>
          </div>
        </Section>

        <Section title="Alterar senha">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Senha atual" error={errors.oldPassword?.message}>
              <Input
                {...register('oldPassword')}
                type="password"
                maxLength={80}
                placeholder="Obrigatório para alterar a senha"
                autoComplete="current-password"
              />
            </Field>
            <Field label="Nova senha" error={errors.password?.message}>
              <Input
                {...register('password')}
                type="password"
                maxLength={80}
                placeholder="Deixe em branco para não alterar"
                autoComplete="new-password"
              />
            </Field>
          </div>
        </Section>

        {fields.phone && <PhoneSection />}

        {fields.address && <AddressSection />}

        {fields.bankAccount && <BankAccountSection />}

        {roleConfig.canBePJ && isPJ && (
          <Section title="Dados complementares">
            <Field label="Nome fantasia">
              <Input {...register('fantasy')} placeholder="Opcional" />
            </Field>
          </Section>
        )}

        {errors.root?.message && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {errors.root.message}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
            Perfil atualizado com sucesso.
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" loading={updateMe.isPending}>
            {updateMe.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
