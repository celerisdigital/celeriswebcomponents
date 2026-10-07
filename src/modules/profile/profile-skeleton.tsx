import { Skeleton } from '../../ui'

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }).map((_, section) => (
        <div key={section} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
