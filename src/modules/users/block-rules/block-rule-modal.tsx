'use client'

import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Field, Input, Modal, MultiSelect, Select, Switch } from '../../../ui'
import type { RoleFull } from '../../../entities/roles/types'
import { userErrorMessage } from '../errors'
import { useCreateBlockRule, useUpdateBlockRule } from '../mutations'
import type { IBlockRule } from '../types'
import {
  blockRuleSchema,
  blockRuleScopeOptions,
  blockRuleScopes,
  blockRuleTypeOptions,
  blockRuleTypes,
  buildBlockRuleConfig,
  type BlockRuleValues,
} from './schemas'

interface Props {
  open: boolean
  rule?: IBlockRule
  roles: RoleFull[]
  onClose: () => void
}

export function BlockRuleModal({ open, rule, roles, onClose }: Props) {
  const createRule = useCreateBlockRule()
  const updateRule = useUpdateBlockRule()
  const isEdit = !!rule

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlockRuleValues>({
    resolver: zodResolver(blockRuleSchema),
    defaultValues: {
      name: '',
      type: blockRuleTypes.role,
      active: true,
      scope: blockRuleScopes.self,
      roleIds: [],
      days: undefined,
    },
  })

  const type = useWatch({ control, name: 'type' })

  useEffect(() => {
    if (!open) return

    reset({
      name: rule?.name ?? '',
      type: rule?.type ?? blockRuleTypes.role,
      active: rule?.active ?? true,
      scope: rule?.config.scope ?? blockRuleScopes.self,
      roleIds: rule?.config.roleIds ?? [],
      days: rule?.config.days,
    })
  }, [open, rule, reset])

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  async function onSubmit(values: BlockRuleValues) {
    const body = { name: values.name, active: values.active, config: buildBlockRuleConfig(values) }

    try {
      if (rule) await updateRule.mutateAsync({ id: rule.id, body })
      else await createRule.mutateAsync({ ...body, type: values.type })
    } catch (error) {
      setError('root', { message: userErrorMessage(error, rule ? 'atualizar regra' : 'criar regra') })

      return
    }

    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnBackdropClick={false}
      title={
        <span className="text-base font-semibold text-gray-800">
          {isEdit ? 'Editar regra de bloqueio' : 'Nova regra de bloqueio'}
        </span>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button size="md" type="submit" form="block-rule-form" loading={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="block-rule-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nome *" error={errors.name?.message}>
          <Input {...register('name')} placeholder="Ex: Bloquear substabelecidos inativos" error={errors.name?.message} />
        </Field>

        <Field label="Tipo *" error={errors.type?.message} asDiv>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select options={blockRuleTypeOptions} value={field.value} onChange={field.onChange} disabled={isEdit} />
            )}
          />
        </Field>

        {type === blockRuleTypes.role && (
          <Field label="Perfis *" error={errors.roleIds?.message} asDiv>
            <Controller
              control={control}
              name="roleIds"
              render={({ field }) => (
                <MultiSelect
                  options={roleOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Selecione os perfis"
                  autocomplete
                />
              )}
            />
          </Field>
        )}

        {(type === blockRuleTypes.typingInactivity || type === blockRuleTypes.loginInactivity) && (
          <>
            <Field label="Dias de inatividade *" error={errors.days?.message}>
              <Input
                type="number"
                min={1}
                {...register('days', { valueAsNumber: true })}
                placeholder="Ex: 30"
                error={errors.days?.message}
              />
            </Field>

            <Field label="Restringir a perfis (opcional)" error={errors.roleIds?.message} asDiv>
              <Controller
                control={control}
                name="roleIds"
                render={({ field }) => (
                  <MultiSelect
                    options={roleOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Todos os perfis"
                    autocomplete
                  />
                )}
              />
            </Field>
          </>
        )}

        <Field label="Abrangência do bloqueio *" error={errors.scope?.message} asDiv>
          <Controller
            control={control}
            name="scope"
            render={({ field }) => (
              <Select options={blockRuleScopeOptions} value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>

        <Switch label="Regra ativa" {...register('active')} />
      </form>
    </Modal>
  )
}
