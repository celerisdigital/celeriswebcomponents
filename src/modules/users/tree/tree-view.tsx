'use client'

import '@xyflow/react/dist/style.css'
import { useMemo, useState } from 'react'
import { Background, Controls, Panel, ReactFlow, type Edge } from '@xyflow/react'
import { useQueryModal } from '../../../lib/use-query-modal'
import { UserDetailModal } from '../detail/detail-modal'
import { useUser } from '../queries'
import { buildTree, type TreeUser, type UserTreeNode } from './build-tree'
import { TreeContainer } from './tree-container'
import { TreeRoleFilter, type TreeRole } from './tree-role-filter'
import { UserNode } from './user-node'

const nodeTypes = { user: UserNode }

interface TreeViewProps {
  root: TreeUser
  rows: TreeUser[]
  roles: TreeRole[]
}

export function TreeView({ root, rows, roles }: TreeViewProps) {
  const [roleId, setRoleId] = useState(() => roles[roles.length - 1]?.id ?? '')
  const { id: selectedId, open: openUser, close: closeUser } = useQueryModal('userId')
  const selected = useUser(selectedId ? Number(selectedId) : null)
  const detail = selectedId ? (selected.data ?? null) : null
  const roleMap = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r.name])), [roles])

  const { nodes, edges, note } = useMemo(() => {
    const levelOf = Object.fromEntries(roles.map((r) => [r.id, r.level]))
    const minLevel = levelOf[roleId] ?? Number.NEGATIVE_INFINITY
    const visible = rows.filter((u) => (levelOf[u.role] ?? Number.NEGATIVE_INFINITY) >= minLevel)
    const ids = new Set<number>([root.id, ...visible.map((u) => u.id)])

    const linked = visible.map((u) => {
      if (u.id === root.id) return u

      if (u.parentId !== undefined && u.parentId !== u.id && ids.has(u.parentId)) return u

      return { ...u, parentId: root.id, indirectParent: true }
    })

    const indirect = linked.filter((u) => u.indirectParent).length
    const graph = buildTree(root, linked, roleMap)

    return {
      ...graph,
      note:
        graph.nodes.length <= 1
          ? 'Nenhum usuário abaixo deste na hierarquia.'
          : indirect > 0
            ? `${indirect} usuários com vínculo indireto — ligados ao topo da hierarquia.`
            : undefined,
    }
  }, [root, rows, roles, roleMap, roleId])

  return (
    <>
      <TreeContainer>
        <ReactFlow<UserTreeNode, Edge>
          key={roleId}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => openUser(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.05}
          onlyRenderVisibleElements
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          elementsSelectable={false}
          edgesFocusable={false}
          zoomOnDoubleClick={false}
        >
          <Background />
          <Controls showInteractive={false} />
          <Panel position="top-left">
            <TreeRoleFilter roles={roles} value={roleId} onChange={setRoleId} />
          </Panel>
          {note && (
            <Panel position="top-center">
              <span className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs text-gray-500">{note}</span>
            </Panel>
          )}
        </ReactFlow>
      </TreeContainer>
      <UserDetailModal key={detail?.id ?? 'closed'} user={detail} onClose={closeUser} roleMap={roleMap} />
    </>
  )
}
