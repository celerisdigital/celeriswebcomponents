'use client'

import { useMemo, type ReactNode } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { LuLoader } from 'react-icons/lu'
import { Field, Input, Section, Select } from '../../../ui'
import { digitsOnly, maskBankAccount, maskCNPJ, maskCPF, maskPhone } from '../../../lib/format'
import { banks } from '../../../lib/bank'
import { PIX_KIND_OPTIONS, type ContactValues } from './schemas'
import { useBankHolder, type BankHolder } from './use-bank-holder'

const accountTypeOptions = [
  { value: 'Corrente', label: 'Corrente' },
  { value: 'Poupança', label: 'Poupança' },
]

const groupTitleClass = 'sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1'

interface Props {
  holder?: BankHolder
  children?: ReactNode
}

export function BankAccountSection({ holder, children }: Props) {
  if (holder) return <BankAccountFields holder={holder}>{children}</BankAccountFields>

  return <OwnHolderBankAccountFields>{children}</OwnHolderBankAccountFields>
}

function OwnHolderBankAccountFields({ children }: { children?: ReactNode }) {
  const holder = useBankHolder()

  return <BankAccountFields holder={holder}>{children}</BankAccountFields>
}

function BankAccountFields({ holder, children }: { holder: BankHolder; children?: ReactNode }) {
  const { register, control, getValues, formState: { errors } } = useFormContext<ContactValues>()
  const pixKind = useWatch({ control, name: 'bankAccount.pix.kind' })

  const bankOptions = useMemo(
    () => banks.map((b) => ({ value: b.LongName, label: `${b.COMPE} - ${b.ShortName}` })),
    [],
  )

  const { onChange: onDocumentChange, ...documentRest } = register('bankAccount.document')
  const { onChange: onPixKeyChange, ...pixKeyRest } = register('bankAccount.pix.key')
  const { onChange: onAccountNumberChange, ...accountNumberRest } = register('bankAccount.account.accountNumber')
  const pixKeyLocked = pixKind === 'cpf' || pixKind === 'cnpj'

  return (
    <Section title="Dados bancários">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="CPF / CNPJ do titular *" error={errors.bankAccount?.document?.message}>
          <Input
            {...documentRest}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value)
              const masked = digits.length <= 11 ? maskCPF(digits) : maskCNPJ(digits)
              e.target.value = masked
              onDocumentChange(e)
              holder.onHolderDocumentChange(masked)
            }}
            inputMode="numeric"
            maxLength={18}
            placeholder="000.000.000-00"
            rightIcon={holder.loading
              ? <LuLoader className="w-4 h-4 animate-spin text-foreground" />
              : undefined
            }
          />
        </Field>
        <Field label="Titular da conta *" error={errors.bankAccount?.account?.accountOwner?.message}>
          <Input
            {...register('bankAccount.account.accountOwner')}
            placeholder="Nome do titular"
            disabled={holder.ownerLocked}
          />
        </Field>

        <p className={groupTitleClass}>Chave PIX</p>
        <Field label="Tipo de chave *" error={errors.bankAccount?.pix?.kind?.message} asDiv>
          <Controller
            name="bankAccount.pix.kind"
            control={control}
            render={({ field }) => (
              <Select
                options={PIX_KIND_OPTIONS}
                value={field.value ?? ''}
                onChange={(v) => {
                  field.onChange(v)
                  holder.syncPixKey(v, getValues('bankAccount.document'))
                }}
                placeholder="Selecione..."
                error={errors.bankAccount?.pix?.kind?.message}
              />
            )}
          />
        </Field>
        <Field label="Chave *" error={errors.bankAccount?.pix?.key?.message}>
          <Input
            {...pixKeyRest}
            onChange={(e) => {
              if (pixKind === 'phone') e.target.value = maskPhone(e.target.value)
              onPixKeyChange(e)
            }}
            placeholder="Chave PIX"
            disabled={pixKeyLocked}
            maxLength={pixKind === 'phone' ? 15 : undefined}
          />
        </Field>

        <p className={groupTitleClass}>Conta bancária</p>
        <Field label="Banco *" error={errors.bankAccount?.account?.bank?.message} asDiv>
          <Controller
            name="bankAccount.account.bank"
            control={control}
            render={({ field }) => (
              <Select autocomplete options={bankOptions} value={field.value ?? ''} onChange={field.onChange} placeholder="Selecione..." error={errors.bankAccount?.account?.bank?.message} />
            )}
          />
        </Field>
        <Field label="Tipo de conta *" error={errors.bankAccount?.account?.accountType?.message} asDiv>
          <Controller
            name="bankAccount.account.accountType"
            control={control}
            render={({ field }) => (
              <Select options={accountTypeOptions} value={field.value ?? ''} onChange={field.onChange} placeholder="Selecione..." error={errors.bankAccount?.account?.accountType?.message} />
            )}
          />
        </Field>
        <Field label="Agência *" error={errors.bankAccount?.account?.agency?.message}>
          <Input {...register('bankAccount.account.agency')} placeholder="Agência" />
        </Field>
        <Field label="Número da conta *" error={errors.bankAccount?.account?.accountNumber?.message}>
          <Input
            {...accountNumberRest}
            onChange={(e) => {
              e.target.value = maskBankAccount(e.target.value)
              onAccountNumberChange(e)
            }}
            placeholder="1234-5"
          />
        </Field>

        {children}
      </div>
    </Section>
  )
}
