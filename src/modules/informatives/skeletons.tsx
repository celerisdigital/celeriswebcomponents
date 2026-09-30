import { Skeleton, TableSkeleton } from '../../ui'

export function InformativesListSkeleton() {
  return <TableSkeleton columns={6} rows={10} />
}

export function InformativeFormSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

export function InformativesFeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}
