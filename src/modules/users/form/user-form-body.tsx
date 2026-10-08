'use client'

import { useState, type ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { LuLoader } from 'react-icons/lu'
import { Button, Checkbox, Field, Input, Section, Select } from '../../../ui'
import { digitsOnly, maskCNPJ, maskCPF } from '../../../lib/format'
import { UserSearchSelect } from '../../../entities/users/user-search-select'
import { AddressSection, BankAccountSection, PhoneSection, useBankHolder, useDocumentLookup } from '../../../entities/users/form'
import type { RoleConfig, RoleFull } from '../../../entities/roles/types'
import type { IFinanceLevel } from '../types'
import { AttachmentsField } from './attachments-field'
import { EditAttachmentsField } from './edit-attachments-field'
import type { UpdateUserValues } from './schemas'
import { BELOW_ME, useParentSelect } from './use-parent-select'

interface Props {
  register: UseFormRegister<UpdateUserValues>
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
  register, errors,
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
  const { loading: documentLoading, lookup: lookupDocument } = useDocumentLookup()
  const holder = useBankHolder()
  const [nameLocked, setNameLocked] = useState(false)

  const canEditParent = !checkMigrateUsersPermission || canMigrate
  const showParentSection = (myRoleIsParent || parentRoleOptions.length > 0) && canEditParent

  const parentRoleSelectOptions = [
    ...(!parentRoleRequired ? [{ value: '', label: 'Nenhum' }] : []),
    ...parentRoleOptions.map((r) => ({ value: r.id, label: `${r.name} — Nível ${r.level}` })),
  ]

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
                      holder.onHolderDocumentChange(masked)
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

      {fields.phone && <PhoneSection />}

      {fields.address && <AddressSection />}

      {fields.bankAccount && (!checkBankAccountPermission || canUpdateBankAccount) && (
        <BankAccountSection holder={holder}>
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
        </BankAccountSection>
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
