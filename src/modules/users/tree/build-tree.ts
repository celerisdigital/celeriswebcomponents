import type { Edge, Node } from '@xyflow/react'

export const NODE_WIDTH = 220
export const NODE_HEIGHT = 120
const GAP_X = 32
const GAP_Y = NODE_HEIGHT + 90
const SLOT = NODE_WIDTH + GAP_X

export interface TreeUser {
  id: number
  name: string
  role: string
  status: number
  parentId?: number
  indirectParent?: boolean
}

export type UserNodeData = {
  name: string
  roleName: string
  status: number
  isRoot: boolean
  indirect: boolean
}

export type UserTreeNode = Node<UserNodeData, 'user'>

export interface TreeGraph {
  nodes: UserTreeNode[]
  edges: Edge[]
}

export function buildTree(
  root: TreeUser,
  rows: TreeUser[],
  roleMap: Record<string, string>,
): TreeGraph {
  const rootId = root.id
  const childrenOf = new Map<number, TreeUser[]>()

  for (const user of rows) {
    if (user.id === rootId) continue

    if (user.parentId === undefined || user.parentId === user.id) continue

    const siblings = childrenOf.get(user.parentId) ?? []
    siblings.push(user)
    childrenOf.set(user.parentId, siblings)
  }

  for (const siblings of childrenOf.values()) {
    siblings.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }

  const nodes: UserTreeNode[] = []
  const edges: Edge[] = []
  const visited = new Set<number>([rootId])

  function layout(user: TreeUser, depth: number, offsetX: number): number {
    const children = (childrenOf.get(user.id) ?? []).filter((child) => !visited.has(child.id))

    for (const child of children) {
      visited.add(child.id)
    }

    let cursor = offsetX
    const centers: number[] = []

    for (const child of children) {
      const childWidth = layout(child, depth + 1, cursor)
      centers.push(cursor + childWidth / 2)
      cursor += childWidth
      edges.push({
        id: `${user.id}-${child.id}`,
        source: String(user.id),
        target: String(child.id),
        type: 'step',
        style: {
          stroke: child.indirectParent ? '#f59e0b' : '#cbd5e1',
          strokeWidth: 2,
          strokeDasharray: child.indirectParent ? '6 4' : undefined,
        },
      })
    }

    const width = Math.max(cursor - offsetX, SLOT)
    const centerX = centers.length > 0
      ? (centers[0] + centers[centers.length - 1]) / 2
      : offsetX + width / 2

    nodes.push({
      id: String(user.id),
      type: 'user',
      position: { x: centerX - NODE_WIDTH / 2, y: depth * GAP_Y },
      data: {
        name: user.name,
        roleName: roleMap[user.role] ?? user.role,
        status: user.status,
        isRoot: user.id === rootId,
        indirect: user.indirectParent === true,
      },
      draggable: false,
      selectable: false,
    })

    return width
  }

  layout(root, 0, 0)

  return { nodes, edges }
}
