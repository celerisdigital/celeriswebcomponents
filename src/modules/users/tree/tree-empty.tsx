import { LuNetwork } from 'react-icons/lu'
import { TreeContainer } from './tree-container'

export function TreeEmpty({ message }: { message: string }) {
  return (
    <TreeContainer className="flex flex-col items-center justify-center gap-2 text-gray-400">
      <LuNetwork size={28} />
      <p className="text-sm text-gray-500">{message}</p>
    </TreeContainer>
  )
}
