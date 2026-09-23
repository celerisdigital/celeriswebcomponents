interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
}

export function SubtleCard({ label, value, sub, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function HighlightCard({ label, value, sub, icon, color }: StatCardProps) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: color }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/80 uppercase tracking-wide">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15">
          <span className="text-white">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-sm text-white/70 mt-1.5">{sub}</p>}
      </div>
    </div>
  )
}
