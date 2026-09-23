'use client'

interface Props {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}

export function ItemActionButton({ label, onClick, danger, children }: Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`p-1.5 rounded-md bg-white/90 backdrop-blur-sm shadow-sm text-gray-400 hover:bg-white transition-colors ${danger ? 'hover:text-red-500' : 'hover:text-gray-700'}`}
    >
      {children}
    </button>
  )
}
