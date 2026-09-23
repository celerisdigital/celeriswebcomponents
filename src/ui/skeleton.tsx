interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 5, rows = 8 }: TableSkeletonProps) {
  return (
    <>
      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-50">
                  {Array.from({ length: columns }).map((_, colIdx) => (
                    <td key={colIdx} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full max-w-30" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
