import { forwardRef } from 'react'
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from '../lib/format'

const MASKS = { cpf: maskCPF, cnpj: maskCNPJ, phone: maskPhone, cep: maskCEP } as const

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  /** Ícone decorativo à esquerda (pointer-events-none) */
  leftIcon?: React.ReactNode
  /** Elemento interativo à esquerda */
  leftAction?: React.ReactNode
  /** Ícone decorativo à direita (pointer-events-none) */
  rightIcon?: React.ReactNode
  /** Elemento interativo à direita — ex: botão de show/hide password */
  rightAction?: React.ReactNode
  /** Bloqueia qualquer tecla não-numérica */
  onlyNumbers?: boolean
  /** Aplica máscara em tempo real (cpf/cnpj/phone/cep) — formata `value` e o texto digitado antes de repassar ao `onChange` */
  mask?: keyof typeof MASKS
}

const ALLOWED_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'])

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, leftAction, rightIcon, rightAction, onlyNumbers, mask, onKeyDown, onChange, value, ...props }, ref) => {
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (onlyNumbers && !/^\d$/.test(e.key) && !ALLOWED_KEYS.has(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
      }
      onKeyDown?.(e)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (mask) e.target.value = MASKS[mask](e.target.value)
      onChange?.(e)
    }

    const maskedValue = mask && typeof value === 'string' ? MASKS[mask](value) : value

    const borderCls = error
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-300 hover:border-gray-400 focus:ring-gray-300'

    const hasLeft = leftIcon || leftAction
    const hasRight = rightIcon || rightAction

    const inputCls = [
      'bg-white border rounded-lg text-sm text-gray-900 w-full',
      'focus:outline-none focus:ring-2 transition-colors',
      'placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
      hasLeft ? 'pl-9' : 'px-3',
      hasRight ? 'pr-9' : 'px-3',
      borderCls,
      'py-2.5',
      className ?? '',
    ].join(' ')

    return (
      <div className={hasLeft || hasRight ? 'relative w-full' : undefined}>
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}
        {leftAction && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            {leftAction}
          </span>
        )}
        <input ref={ref} className={inputCls} onKeyDown={handleKeyDown} onChange={handleChange} value={maskedValue} {...props} />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </span>
        )}
        {rightAction && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightAction}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
