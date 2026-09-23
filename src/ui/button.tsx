import { LuLoader } from 'react-icons/lu'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /**
   * Quando `true`, mostra `LuLoader` animado antes do `children` e desabilita o botão.
   * Use sempre que houver chamada async — não trocar só o texto por "Salvando...".
   */
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50',
  secondary: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50',
  ghost:     'text-gray-500 hover:text-gray-700 underline underline-offset-2',
  danger:    'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-sm',
}

const loaderSizes: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
        'cursor-pointer disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {loading && <LuLoader size={loaderSizes[size]} className="animate-spin" />}
      {children}
    </button>
  )
}
