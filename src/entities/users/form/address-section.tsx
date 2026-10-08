'use client'

import { useMemo } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { LuLoader } from 'react-icons/lu'
import { Field, Input, Section, Select } from '../../../ui'
import { maskCEP } from '../../../lib/format'
import { cities, findCity, states, useCepAutofill } from '../../../lib/address'
import type { ContactValues } from './schemas'

export function AddressSection() {
  const { register, control, setValue, clearErrors, formState: { errors } } = useFormContext<ContactValues>()
  const { loading: cepLoading, lookup: lookupCep } = useCepAutofill({
    setValue: setValue as (name: string, value: unknown) => void,
    clearErrors: clearErrors as (name: string) => void,
  })
  const selectedUF = useWatch({ control, name: 'address.uf' })
  const selectedCityName = useWatch({ control, name: 'address.city' })

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

  const { onChange: onCepChange, ...cepRest } = register('address.cep')

  return (
    <Section title="Endereço">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="CEP *" error={errors.address?.cep?.message}>
          <Input
            {...cepRest}
            onChange={(e) => {
              const masked = maskCEP(e.target.value)
              e.target.value = masked
              onCepChange(e)
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
  )
}
