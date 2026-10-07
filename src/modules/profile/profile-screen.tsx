'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Field, Input, Section, Select } from '../../ui'
import { digitsOnly } from '../../lib/format'
import { updateMeErrorMessage } from './errors'
import { useUpdateMe } from './mutations'
import { toUpdateMePayload, type ProfileSections } from './payload'
import { profileSchema, toProfileValues, type ProfileValues } from './schemas'
import type { IMe, ProfileRoleConfig } from './types'

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ value: uf, label: uf }))

const PIX_KIND_OPTIONS = [
  { value: 'cpf', label: 'CPF' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'uuid', label: 'Chave aleatória' },
]

const groupTitleClass = 'sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1'

interface Props {
  me: IMe
  roleConfig: ProfileRoleConfig
}

export function ProfileScreen({ me, roleConfig }: Props) {
  const router = useRouter()
  const updateMe = useUpdateMe()
  const [success, setSuccess] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileValues(me),
  })

  const fields = roleConfig.fields
  const isPJ = digitsOnly(me.document).length === 14
  const sections: ProfileSections = {
    phone: !!fields.phone,
    address: !!fields.address,
    bankAccount: !!fields.bankAccount,
    fantasy: !!roleConfig.canBePJ && isPJ,
  }

  async function onSubmit(values: ProfileValues) {
    setSuccess(false)

    try {
      await updateMe.mutateAsync(toUpdateMePayload(values, sections))
    } catch (error) {
      setError('root', { message: updateMeErrorMessage(error) })

      return
    }

    setSuccess(true)
    router.refresh()
  }

  return (
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

      {sections.phone && (
        <Section title="Contato">
          <Field label="Telefone" error={errors.phone?.message}>
            <Input {...register('phone')} type="tel" inputMode="numeric" placeholder="DDI + DDD + número (12–13 dígitos)" />
          </Field>
        </Section>
      )}

      {sections.address && (
        <Section title="Endereço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CEP" error={errors.address?.cep?.message}>
              <Input {...register('address.cep')} inputMode="numeric" placeholder="Somente números" />
            </Field>
            <Field label="UF" asDiv>
              <Controller
                name="address.uf"
                control={control}
                render={({ field }) => (
                  <Select options={UF_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Selecione..." clearable />
                )}
              />
            </Field>
            <Field label="Cidade">
              <Input {...register('address.city')} placeholder="Cidade" />
            </Field>
            <Field label="Bairro">
              <Input {...register('address.district')} placeholder="Bairro" />
            </Field>
            <Field label="Rua" className="sm:col-span-2">
              <Input {...register('address.street')} placeholder="Rua / Avenida" />
            </Field>
            <Field label="Número">
              <Input {...register('address.number')} placeholder="S/N" />
            </Field>
            <Field label="Complemento">
              <Input {...register('address.complement')} placeholder="Apto, bloco..." />
            </Field>
          </div>
        </Section>
      )}

      {sections.bankAccount && (
        <Section title="Dados bancários">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CPF / CNPJ do titular" error={errors.bankAccount?.document?.message}>
              <Input {...register('bankAccount.document')} inputMode="numeric" placeholder="Somente números" />
            </Field>

            <p className={groupTitleClass}>Chave PIX</p>
            <Field label="Tipo de chave" asDiv>
              <Controller
                name="bankAccount.pix.kind"
                control={control}
                render={({ field }) => (
                  <Select options={PIX_KIND_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Selecione..." clearable />
                )}
              />
            </Field>
            <Field label="Chave">
              <Input {...register('bankAccount.pix.key')} placeholder="Chave PIX" />
            </Field>

            <p className={groupTitleClass}>Conta bancária (opcional)</p>
            <Field label="Banco">
              <Input {...register('bankAccount.account.bank')} placeholder="Nome do banco" />
            </Field>
            <Field label="Tipo de conta">
              <Input {...register('bankAccount.account.accountType')} placeholder="Corrente / Poupança" />
            </Field>
            <Field label="Agência">
              <Input {...register('bankAccount.account.agency')} placeholder="Agência" />
            </Field>
            <Field label="Número da conta">
              <Input {...register('bankAccount.account.accountNumber')} placeholder="Número" />
            </Field>
            <Field label="Dígito">
              <Input {...register('bankAccount.account.accountDigit')} placeholder="Dígito" />
            </Field>
            <Field label="Titular da conta">
              <Input {...register('bankAccount.account.accountOwner')} placeholder="Nome do titular" />
            </Field>
          </div>
        </Section>
      )}

      {sections.fantasy && (
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
  )
}
