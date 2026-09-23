export interface FieldProps {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Mensagem de erro exibida abaixo do campo */
  error?: string
  /** Torna o wrapper um <div> em vez de <label> (útil quando o filho já tem label) */
  asDiv?: boolean
}

export function Field({ label, children, className, error, asDiv = false }: FieldProps) {
  const Tag = asDiv ? 'div' : 'label'
  return (
    <Tag className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-gray-500 leading-none">{label}</span>
      {children}
      {error && (
        <span className="text-xs text-red-500 leading-none">{error}</span>
      )}
    </Tag>
  )
}
