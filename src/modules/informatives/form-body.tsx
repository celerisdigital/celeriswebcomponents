'use client'

import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { DateInput, Field, Input, MultiSelect, RadioGroup, Section, Switch, type MultiSelectOption } from '../../ui'
import { RichTextEditor } from '../../rich-text'
import { InformativeImageField } from './image-field'
import type { InformativeFormValues } from './schemas'

interface Props {
  register: UseFormRegister<InformativeFormValues>
  control: Control<InformativeFormValues>
  errors: FieldErrors<InformativeFormValues>
  roleOptions: MultiSelectOption[]
  displayType: 'banner' | 'modal'
  initialUrl?: string | null
}

export function InformativeFormBody({ register, control, errors, roleOptions, displayType, initialUrl }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Conteúdo">
        <div className="flex flex-col gap-4">
          <Field label="Título" error={errors.title?.message}>
            <Input {...register('title')} placeholder="Ex: Manutenção programada" error={errors.title?.message} />
          </Field>

          <Field label="Texto" error={errors.text?.message} asDiv>
            <Controller
              control={control}
              name="text"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.text?.message}
                  placeholder="Texto do informativo..."
                />
              )}
            />
          </Field>

          <InformativeImageField control={control} initialUrl={initialUrl} />
        </div>
      </Section>

      <Section title="Período" subtitle="Sem datas, o informativo fica ativo por tempo indeterminado.">
        <div className="flex flex-col sm:flex-row gap-4">
          <Field label="Início" error={errors.initialDate?.message} asDiv className="flex-1">
            <Controller
              control={control}
              name="initialDate"
              render={({ field }) => (
                <DateInput value={field.value} onChange={field.onChange} error={errors.initialDate?.message} />
              )}
            />
          </Field>

          <Field label="Fim" error={errors.finalDate?.message} asDiv className="flex-1">
            <Controller
              control={control}
              name="finalDate"
              render={({ field }) => (
                <DateInput value={field.value} onChange={field.onChange} error={errors.finalDate?.message} />
              )}
            />
          </Field>
        </div>
      </Section>

      <Section title="Exibição">
        <div className="flex flex-col gap-4">
          <Field label="Tipo de exibição" error={errors.displayType?.message} asDiv>
            <Controller
              control={control}
              name="displayType"
              render={({ field }) => (
                <RadioGroup
                  options={[
                    { value: 'banner', label: 'Informe Fixado', description: 'Faixa fixa no topo, sempre reexibida.' },
                    { value: 'modal', label: 'Modal', description: 'Janela sobreposta ao abrir o sistema.' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.displayType?.message}
                />
              )}
            />
          </Field>

          <div>
            <Controller
              control={control}
              name="singleView"
              render={({ field }) => (
                <Switch
                  label="Visualização única"
                  checked={field.value}
                  disabled={displayType === 'banner'}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <p className="mt-1 text-xs text-gray-500">
              {displayType === 'banner'
                ? 'Indisponível com Informe Fixado — informes fixados são sempre reexibidos.'
                : 'O modal aparece uma única vez por usuário.'}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Público-alvo" subtitle="Sem perfis selecionados, o informativo é exibido para todos.">
        <Field label="Perfis" error={errors.roleIds?.message} asDiv>
          <Controller
            control={control}
            name="roleIds"
            render={({ field }) => (
              <MultiSelect
                options={roleOptions}
                value={field.value}
                onChange={field.onChange}
                autocomplete
                placeholder="Todos os perfis"
                error={errors.roleIds?.message}
              />
            )}
          />
        </Field>
      </Section>
    </div>
  )
}
