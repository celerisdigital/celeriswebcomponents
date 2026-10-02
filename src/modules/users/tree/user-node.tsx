'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Badge, Tooltip } from '../../../ui'
import { cn } from '../../../lib/cn'
import { STATUS_MAP } from '../status'
import { ChainButton } from '../detail/chain-modal'
import { NODE_HEIGHT, NODE_WIDTH, type UserTreeNode } from './build-tree'

export function UserNode({ id, data }: NodeProps<UserTreeNode>) {
  const status = STATUS_MAP[data.status]

  return (
    <div
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      className={cn(
        'relative flex cursor-pointer flex-col justify-center overflow-hidden rounded-xl border px-4 shadow-sm transition-shadow hover:shadow-md',
        data.isRoot ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200',
        data.indirect && 'border-amber-300',
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" isConnectable={false} />

      {data.indirect && (
        <div
          onClick={(e) => e.stopPropagation()}
          title="Vínculo indireto"
          className="absolute right-0.5 top-0.5 z-10 [&_button]:text-amber-500 [&_button]:hover:bg-amber-100 [&_button]:hover:text-amber-700"
        >
          <ChainButton userId={Number(id)} userName={data.name} />
        </div>
      )}

      <Tooltip content={data.name} delayMs={300} className="w-full min-w-0">
        <span
          className={cn(
            'block w-full truncate text-sm font-semibold',
            data.isRoot ? 'text-indigo-900' : 'text-gray-800',
          )}
        >
          {data.name}
        </span>
      </Tooltip>
      <span className="block text-xs font-medium text-gray-500 truncate mt-0.5">{data.roleName}</span>
      {status && (
        <div className="mt-2">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" isConnectable={false} />
    </div>
  )
}
