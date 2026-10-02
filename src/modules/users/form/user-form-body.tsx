'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { LuLoader } from 'react-icons/lu'
import { Button, Checkbox, Field, Input, Section, Select } from '../../../ui'
import { digitsOnly, maskBankAccount, maskCEP, maskCNPJ, maskCPF, maskPhone } from '../../../lib/format'
import { cities, findCity, states, useCepAutofill } from '../../../lib/address'
import { banks } from '../../../lib/bank'
import { UserSearchSelect } from '../../../entities/users/user-search-select'
import type { RoleConfig, RoleFull } from '../../../entities/roles/types'
import type { IFinanceLevel } from '../types'
import { AttachmentsField } from './attachments-field'
import { EditAttachmentsField } from './edit-attachments-field'
import { suggestPixKey } from './pix-suggestion'
import { PIX_KIND_OPTIONS, type UpdateUserValues } from './schemas'
import { useDocumentLookup } from './use-document-lookup'
import { BELOW_ME, useParentSelect } from './use-parent-select'

interface Props {
  register: UseFormRegister<UpdateUserValues>
  control: Control<UpdateUserValues>
  errors: FieldErrors<UpdateUserValues>
  roleSection: ReactNode
  ps: ReturnType<typeof useParentSelect>
  myRoleIsParent: boolean
  parentsCount: number
  parentRoleOptions: RoleFull[]
  parentRoleRequired: boolean
  effectiveBelowMe: boolean
  isPJ: boolean
  canBePJ: boolean
  setIsPJ: (v: boolean) => void
  fields: RoleConfig['fields']
  selectedRole: RoleFull | null
  setValue: (name: string, value: unknown) => void
  getValues: (name: string) => string | undefined
  clearErrors: (name: string) => void
  passwordLabel?: string
  passwordPlaceholder?: string
  attachmentFiles?: File[]
  onAttachmentFilesChange?: (files: File[]) => void
  onAttachmentIdsChange?: (ids: number[]) => void
  onAttachmentLoadingChange?: (loading: boolean) => void
  attachmentError?: string
  userId?: number
  needNFSe: boolean
  autoRequestWithdraw: boolean
  onNeedNFSeChange: (v: boolean) => void
  onAutoRequestWithdrawChange: (v: boolean) => void
  financeLevels: IFinanceLevel[]
  commissionLevelId: string
  onCommissionLevelChange: (v: string) => void
  checkBankAccountPermission?: boolean
  checkMigrateUsersPermission?: boolean
  canManageFinance: boolean
  canUpdateBankAccount: boolean
  canMigrate: boolean
}

export function UserFormBody({
  register, control, errors,
  roleSection, ps,
  myRoleIsParent, parentsCount, parentRoleOptions, parentRoleRequired, effectiveBelowMe,
  isPJ, canBePJ, setIsPJ,
  fields, selectedRole, setValue, getValues, clearErrors,
  passwordLabel = 'Senha',
  passwordPlaceholder = 'Mínimo 6 caracteres',
  attachmentFiles,
  onAttachmentFilesChange,
  onAttachmentIdsChange,
  onAttachmentLoadingChange,
  attachmentError,
  userId,
  needNFSe,
  autoRequestWithdraw,
  onNeedNFSeChange,
  onAutoRequestWithdrawChange,
  financeLevels,
  commissionLevelId,
  onCommissionLevelChange,
  checkBankAccountPermission,
  checkMigrateUsersPermission,
  canManageFinance,
  canUpdateBankAccount,
  canMigrate,
}: Props) {
  const { loading: cepLoading, lookup: lookupCep } = useCepAutofill({ setValue, clearErrors })
  const { loading: documentLoading, lookup: lookupDocument } = useDocumentLookup()
  const { loading: holderLoading, lookup: lookupHolder } = useDocumentLookup()
  const [nameLocked, setNameLocked] = useState(false)
  const [ownerLocked, setOwnerLocked] = useState(false)
  const pixKind = useWatch({ control, name: 'bankAccount.pix.kind' as never }) as string
  const selectedUF = useWatch({ control, name: 'address.uf' as never }) as string
  const selectedCityName = useWatch({ control, name: 'address.city' as never }) as string

  const stateMaps = useMemo(() => {
    const bySigla = new Map<string, string>()
    const byId = new Map<string, string>()
    const options: { value: string; label: string }[] = []
    for (const s of states) {
      bySigla.set(s.Sigla, s.ID)
      byId.set(s.ID, s.Sigla)
      options.push({ value: s.Sigla, label: s.Nome })
    }
    return { bySigla, byId, options }
  }, [])

  const cityOptions = useMemo(() => {
    const stateId = selectedUF ? stateMaps.bySigla.get(selectedUF) : undefined
    const filtered = stateId ? cities.filter((c) => c.Estado === stateId) : cities
    return filtered.map((c) => ({
      value: c.ID,
      label: stateId ? c.Nome : `${c.Nome} - ${stateMaps.byId.get(c.Estado) ?? ''}`,
    }))
  }, [selectedUF, stateMaps])

  const citySelectValue = useMemo(() => {
    if (!selectedCityName) return ''

    return findCity(selectedCityName, selectedUF)?.ID ?? ''
  }, [selectedCityName, selectedUF])

  const bankOptions = useMemo(
    () => banks.map((b) => ({ value: b.LongName, label: `${b.COMPE} - ${b.ShortName}` })),
    [],
  )

  const accountTypeOptions = [
    { value: 'Corrente', label: 'Corrente' },
    { value: 'Poupança', label: 'Poupança' },
  ]

  const canEditParent = !checkMigrateUsersPermission || canMigrate
  const showParentSection = (myRoleIsParent || parentRoleOptions.length > 0) && canEditParent

  const parentRoleSelectOptions = [
    ...(!parentRoleRequired ? [{ value: '', label: 'Nenhum' }] : []),
    ...parentRoleOptions.map((r) => ({ value: r.id, label: `${r.name} — Nível ${r.level}` })),
  ]

  function syncPixKey(kind: string, holderDocument: string | undefined) {
    setValue('bankAccount.pix.key', suggestPixKey(kind, {
      holderDocument,
      email: getValues('email'),
      phone: getValues('phone'),
    }))
    clearErrors('bankAccount.pix.key')
  }

  async function handleHolderDocumentChange(masked: string) {
    if (pixKind === 'cpf' || pixKind === 'cnpj') syncPixKey(pixKind, masked)

    const result = await lookupHolder(masked)

    if (!result) {
      setOwnerLocked(false)
      return
    }

    setValue('bankAccount.account.accountOwner', result.name)
    clearErrors('bankAccount.account.accountOwner')
    setOwnerLocked(true)
  }

  return (
    <>
      <Section title="Perfil">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={showParentSection ? '' : 'sm:col-span-2'}>
            {roleSection}
          </div>

          {canEditParent && myRoleIsParent && parentsCount > 1 && (
            <Field label="Perfil do superior" asDiv>
              <Checkbox
                label="Criar novo usuário abaixo de mim"
                checked={ps.belowMeChecked}
                onChange={(e) => ps.handleBelowMeToggle(e.target.checked, parentRoleOptions)}
              />
            </Field>
          )}

          {canEditParent && !myRoleIsParent && parentRoleOptions.length > 0 && (
            <Field label={`Perfil do superior${parentRoleRequired ? ' *' : ''}`} asDiv>
              <Select
                options={parentRoleSelectOptions}
                value={ps.selectedParentRoleId}
                onChange={(v) => ps.handleParentRoleChange(v)}
              />
            </Field>
          )}

          {canEditParent && myRoleIsParent && !ps.belowMeChecked && parentRoleOptions.length > 0 && (
            <Field label={`Perfil do superior${parentRoleRequired ? ' *' : ''}`} asDiv className="sm:col-span-2">
              <Select
                options={parentRoleSelectOptions}
                value={ps.selectedParentRoleId}
                onChange={(v) => ps.handleParentRoleChange(v)}
              />
            </Field>
          )}

          {canEditParent && !effectiveBelowMe && ps.selectedParentRoleId && ps.selectedParentRoleId !== BELOW_ME && (
            <Field label={`Usuário superior${parentRoleRequired ? ' *' : ''}`} asDiv className="sm:col-span-2">
              <UserSearchSelect
                roleId={ps.selectedParentRoleId}
                value={ps.selectedParentUser}
                onChange={ps.setSelectedParentUser}
              />
            </Field>
          )}
        </div>
      </Section>

      <Section title="Dados básicos">
        {canBePJ && (
          <div className="flex gap-3 mb-4">
            <Button type="button" size="sm" variant={!isPJ ? 'primary' : 'secondary'} onClick={() => { setIsPJ(false); setValue('document', ''); setValue('name', ''); setNameLocked(false) }}>
              Pessoa Física
            </Button>
            <Button type="button" size="sm" variant={isPJ ? 'primary' : 'secondary'} onClick={() => { setIsPJ(true); setValue('document', ''); setValue('name', ''); setNameLocked(false) }}>
              Pessoa Jurídica
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isPJ ? 'CNPJ *' : 'CPF *'} error={errors.document?.message}>
            {(() => {
              const { onChange, ...rest } = register('document')
              return (
                <Input
                  {...rest}
                  onChange={(e) => {
                    const masked = isPJ ? maskCNPJ(e.target.value) : maskCPF(e.target.value)
                    e.target.value = masked
                    onChange(e)
                    const digits = digitsOnly(masked)

                    if (fields.bankAccount && !getValues('bankAccount.document') && (digits.length === 11 || digits.length === 14)) {
                      setValue('bankAccount.document', masked)
                      handleHolderDocumentChange(masked)
                    }

                    if (digits.length !== (isPJ ? 14 : 11)) { setNameLocked(false); return }

                    lookupDocument(masked).then((result) => {
                      if (!result) { setNameLocked(false); return }

                      setValue('name', result.name)
                      setNameLocked(true)
                      clearErrors('name')

                      if (result.email) { setValue('email', result.email); clearErrors('email') }
                    })
                  }}
                  inputMode="numeric"
                  maxLength={isPJ ? 18 : 14}
                  placeholder={isPJ ? '00.000.000/0000-00' : '000.000.000-00'}
                  rightIcon={documentLoading
                    ? <LuLoader className="w-4 h-4 animate-spin text-foreground" />
                    : undefined
                  }
                />
              )
            })()}
          </Field>
          <Field label={isPJ ? 'Razão Social *' : 'Nome *'} error={errors.name?.message} className="sm:col-span-2">
            <Input
              {...register('name')}
              placeholder={isPJ ? 'Razão social' : 'Nome completo'}
              maxLength={256}
              disabled={nameLocked}
            />
          </Field>
          <Field label="E-mail *" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="email@exemplo.com" maxLength={128} />
          </Field>
          <Field label={passwordLabel} error={errors.password?.message}>
            <Input {...register('password')} type="password" maxLength={80} placeholder={passwordPlaceholder} autoComplete="new-password" />
          </Field>
        </div>
      </Section>

      {fields.phone && (
        <Section title="Contato">
          <Field label="Telefone *" error={errors.phone?.message}>
            {(() => {
              const { onChange, ...rest } = register('phone')
              return (
                <Input
                  {...rest}
                  onChange={(e) => {
                    e.target.value = maskPhone(e.target.value)
                    onChange(e)
                  }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                />
              )
            })()}
          </Field>
        </Section>
      )}

      {fields.address && (
        <Section title="Endereço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CEP *" error={errors.address?.cep?.message}>
              {(() => {
                const { onChange, ...rest } = register('address.cep')
                return (
                  <Input
                    {...rest}
                    onChange={(e) => {
                      const masked = maskCEP(e.target.value)
                      e.target.value = masked
                      onChange(e)
                      lookupCep(masked)
                    }}
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    rightIcon={cepLoading
                      ? <LuLoader className="w-4 h-4 animate-spin text-foreground" />
                      : undefined
                    }
                  />
                )
              })()}
            </Field>
            <Field label="UF *" error={errors.address?.uf?.message} asDiv>
              <Controller
                name="address.uf"
                control={control}
                render={({ field }) => (
                  <Select autocomplete options={stateMaps.options} value={field.value ?? ''} onChange={(uf) => {
                    field.onChange(uf)
                    if (selectedCityName) {
                      const newStateId = stateMaps.bySigla.get(uf)
                      const cityBelongs = cities.some((c) => c.Nome === selectedCityName && c.Estado === newStateId)
                      if (!cityBelongs) setValue('address.city', '')
                    }
                  }} placeholder="Selecione..." />
                )}
              />
            </Field>
            <Field label="Cidade *" error={errors.address?.city?.message} asDiv>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <Select
                    autocomplete
                    options={cityOptions}
                    value={citySelectValue}
                    onChange={(id) => {
                      const cityName = cities.find((c) => c.ID === id)?.Nome ?? ''
                      field.onChange(cityName)
                      if (id) {
                        const city = cities.find((c) => c.ID === id)
                        if (city) {
                          const state = states.find((s) => s.ID === city.Estado)
                          if (state) setValue('address.uf', state.Sigla)
                        }
                      }
                    }}
                    placeholder="Selecione..."
                  />
                )}
              />
            </Field>
            <Field label="Bairro *" error={errors.address?.district?.message}>
              <Input {...register('address.district')} placeholder="Bairro" />
            </Field>
            <Field label="Rua *" error={errors.address?.street?.message} className="sm:col-span-2">
              <Input {...register('address.street')} placeholder="Rua / Avenida" />
            </Field>
            <Field label="Número" error={errors.address?.number?.message}>
              <Input {...register('address.number')} placeholder="S/N" />
            </Field>
            <Field label="Complemento" error={errors.address?.complement?.message}>
              <Input {...register('address.complement')} placeholder="Apto, bloco..." />
            </Field>
          </div>
        </Section>
      )}

      {fields.bankAccount && (!checkBankAccountPermission || canUpdateBankAccount) && (
        <Section title="Dados bancários">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CPF / CNPJ do titular *" error={errors.bankAccount?.document?.message}>
              {(() => {
                const { onChange, ...rest } = register('bankAccount.document')
                return (
                  <Input
                    {...rest}
                    onChange={(e) => {
                      const digits = digitsOnly(e.target.value)
                      const masked = digits.length <= 11 ? maskCPF(digits) : maskCNPJ(digits)
                      e.target.value = masked
                      onChange(e)
                      handleHolderDocumentChange(masked)
                    }}
                    inputMode="numeric"
                    maxLength={18}
                    placeholder="000.000.000-00"
                    rightIcon={holderLoading
                      ? <LuLoader className="w-4 h-4 animate-spin text-foreground" />
                      : undefined
                    }
                  />
                )
              })()}
            </Field>
            <Field label="Titular da conta *" error={errors.bankAccount?.account?.accountOwner?.message}>
              <Input
                {...register('bankAccount.account.accountOwner')}
                placeholder="Nome do titular"
                disabled={ownerLocked}
              />
            </Field>

            <p className="sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Chave PIX</p>
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
                      syncPixKey(v, getValues('bankAccount.document'))
                    }}
                    placeholder="Selecione..."
                    error={errors.bankAccount?.pix?.kind?.message}
                  />
                )}
              />
            </Field>
            <Field label="Chave *" error={errors.bankAccount?.pix?.key?.message}>
              {(() => {
                const { onChange, ...rest } = register('bankAccount.pix.key')
                const locked = pixKind === 'cpf' || pixKind === 'cnpj'
                return (
                  <Input
                    {...rest}
                    onChange={(e) => {
                      if (pixKind === 'phone') e.target.value = maskPhone(e.target.value)
                      onChange(e)
                    }}
                    placeholder="Chave PIX"
                    disabled={locked}
                    maxLength={pixKind === 'phone' ? 15 : undefined}
                  />
                )
              })()}
            </Field>

            <p className="sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Conta bancária</p>
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
              {(() => {
                const { onChange, ...rest } = register('bankAccount.account.accountNumber')
                return (
                  <Input
                    {...rest}
                    onChange={(e) => {
                      e.target.value = maskBankAccount(e.target.value)
                      onChange(e)
                    }}
                    placeholder="1234-5"
                  />
                )
              })()}
            </Field>

            {canManageFinance && (
              <>
                <p className="sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Configurações financeiras</p>
                <Field label="NFS-e" asDiv>
                  <Checkbox
                    label="Precisa emitir NFS-e"
                    checked={needNFSe}
                    onChange={(e) => onNeedNFSeChange(e.target.checked)}
                  />
                </Field>
                <Field label="Saque automático" asDiv>
                  <Checkbox
                    label="Solicitação automática de saque"
                    checked={autoRequestWithdraw}
                    onChange={(e) => onAutoRequestWithdrawChange(e.target.checked)}
                  />
                </Field>
                <Field label="Nível de Comissão" asDiv>
                  <Select
                    options={[
                      { value: '', label: 'Nenhum' },
                      ...financeLevels.map((l) => ({ value: String(l.id), label: l.name })),
                    ]}
                    value={commissionLevelId}
                    onChange={onCommissionLevelChange}
                    placeholder="Selecione..."
                  />
                </Field>
              </>
            )}
          </div>
        </Section>
      )}

      {fields.attachments && (userId
        ? (
          <Section title="Documentos">
            <EditAttachmentsField id={userId} onFilesChange={onAttachmentIdsChange} onLoadingChange={onAttachmentLoadingChange} />
            {attachmentError && (
              <p className="text-xs text-red-500 mt-2">{attachmentError}</p>
            )}
          </Section>
        )
        : onAttachmentFilesChange && (
          <Section title="Documentos">
            <AttachmentsField
              files={attachmentFiles ?? []}
              onChange={onAttachmentFilesChange}
              error={attachmentError}
            />
          </Section>
        )
      )}

      {selectedRole && isPJ && (
        <Section title="Dados complementares">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome fantasia" className="sm:col-span-2">
              <Input {...register('fantasy')} placeholder="Opcional" />
            </Field>
            <p className="sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Responsável *</p>
            <Field label="Nome do responsável *" error={errors.responsible?.name?.message}>
              <Input {...register('responsible.name')} placeholder="Nome completo" />
            </Field>
            <Field label="CPF do responsável *" error={errors.responsible?.document?.message}>
              <Input {...register('responsible.document')} inputMode="numeric" maxLength={11} placeholder="Somente números (11 dígitos)" />
            </Field>
          </div>
        </Section>
      )}
    </>
  )
}
