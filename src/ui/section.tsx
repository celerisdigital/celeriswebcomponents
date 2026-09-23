export interface SectionProps {
  title: string
  /** Linha de texto explicativa abaixo do título */
  subtitle?: string
  children: React.ReactNode
  className?: string
  /** Conteúdo extra exibido no canto direito do cabeçalho */
  action?: React.ReactNode
  /** Classes aplicadas no wrapper do action (ex: largura fixa pra alinhar com uma coluna do conteúdo abaixo) */
  actionClassName?: string
}

export function Section({ title, subtitle, children, className, action, actionClassName }: SectionProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className ?? ''}`}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-400 normal-case tracking-normal font-normal mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className={actionClassName}>{action}</div>}
      </div>
      {children}
    </div>
  )
}
