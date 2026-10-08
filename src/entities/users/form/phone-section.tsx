'use client'

import { useFormContext } from 'react-hook-form'
import { Field, Input, Section } from '../../../ui'
import { maskPhone } from '../../../lib/format'
import type { ContactValues } from './schemas'

export function PhoneSection() {
  const { register, formState: { errors } } = useFormContext<ContactValues>()
  const { onChange, ...rest } = register('phone')

  return (
    <Section title="Contato">
      <Field label="Telefone *" error={errors.phone?.message}>
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
      </Field>
    </Section>
  )
}
