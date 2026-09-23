'use client'

import { forwardRef } from 'react'
import { Input, type InputProps } from './input'
import { maskCurrency } from '../lib/format'

export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  /** Valor em reais (número) — ex: 1234.56 */
  value: number | undefined | null
  /** Recebe o valor em reais (número) sempre que o usuário digita */
  onChange: (value: number) => void
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = 'R$ 0,00', ...rest }, ref) => {
    const display = value === null || value === undefined || isNaN(value)
      ? ''
      : maskCurrency(value)

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          const cents = digits ? parseInt(digits, 10) : 0
          onChange(cents / 100)
        }}
        {...rest}
      />
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
