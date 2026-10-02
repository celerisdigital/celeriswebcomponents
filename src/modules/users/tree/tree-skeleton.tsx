import { Skeleton } from '../../../ui'
import { TreeContainer } from './tree-container'

export function TreeSkeleton() {
  return (
    <TreeContainer className="flex flex-col items-center justify-center gap-8">
      <Skeleton className="h-20 w-56 rounded-xl" />
      <div className="flex gap-8">
        <Skeleton className="h-20 w-56 rounded-xl" />
        <Skeleton className="h-20 w-56 rounded-xl" />
      </div>
    </TreeContainer>
  )
}
