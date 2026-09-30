'use client'

import { useRef, useState, type ReactNode, type PointerEvent, type KeyboardEvent } from 'react'
import { LuGripVertical } from 'react-icons/lu'
import { cn } from '../lib/cn'

type Key = string | number

export interface SortableItemState {
  /** Alça de arraste pronta — posicionar onde fizer sentido no item. Já trata mouse, touch e teclado (↑/↓). */
  handle: ReactNode
  index: number
  isDragging: boolean
}

export interface SortableListProps<T> {
  items: T[]
  keyExtractor: (item: T) => Key
  renderItem: (item: T, state: SortableItemState) => ReactNode
  /** Chamado ao soltar em nova posição (ou ↑/↓ na alça) com a lista já reordenada. */
  onReorder: (items: T[]) => void
  /** Esconde as alças e bloqueia a reordenação. */
  disabled?: boolean
  /** Rótulo acessível da alça. */
  handleLabel?: (item: T) => string
  className?: string
  empty?: string
}

interface DragState {
  from: number
  over: number
  /** Deslocamento do ponteiro desde o início, relativo ao container (resiste a scroll durante o arraste). */
  dy: number
  startY: number
  /** Topo/altura de cada item relativos ao container, capturados no início do arraste. */
  rects: { top: number; height: number }[]
  /** Quanto os vizinhos deslizam para abrir espaço (altura do arrastado + gap). */
  shift: number
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function SortableList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  disabled,
  handleLabel,
  className = 'flex flex-col gap-2',
  empty = 'Nenhum item encontrado.',
}: SortableListProps<T>) {
  const containerRef = useRef<HTMLUListElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-sm text-gray-400">
        {empty}
      </div>
    )
  }

  function containerY(clientY: number): number {
    return clientY - (containerRef.current?.getBoundingClientRect().top ?? 0)
  }

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>, index: number) {
    if (disabled || e.button !== 0) return
    const container = containerRef.current
    if (!container) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    const containerTop = container.getBoundingClientRect().top
    const rects = Array.from(container.children).map((el) => {
      const r = el.getBoundingClientRect()
      return { top: r.top - containerTop, height: r.height }
    })
    const next = rects[index + 1] ?? rects[index - 1]
    const gap = next
      ? next.top > rects[index].top
        ? next.top - (rects[index].top + rects[index].height)
        : rects[index].top - (next.top + next.height)
      : 0

    setDrag({ from: index, over: index, dy: 0, startY: containerY(e.clientY), rects, shift: rects[index].height + gap })
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    const dy = containerY(e.clientY) - drag.startY
    const dragged = drag.rects[drag.from]
    const center = dragged.top + dragged.height / 2 + dy
    // Nova posição = quantos outros itens têm o meio acima do centro do arrastado
    const over = drag.rects.filter((r, i) => i !== drag.from && r.top + r.height / 2 < center).length
    setDrag({ ...drag, dy, over })
  }

  function handlePointerUp() {
    if (!drag) return
    const { from, over } = drag
    setDrag(null)
    if (from !== over) onReorder(move(items, from, over))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled) return
    const to = e.key === 'ArrowUp' ? index - 1 : e.key === 'ArrowDown' ? index + 1 : null
    if (to === null) return
    e.preventDefault()
    if (to < 0 || to >= items.length) return
    onReorder(move(items, index, to))
  }

  function offsetFor(index: number): number {
    if (!drag) return 0
    if (index === drag.from) return drag.dy
    if (drag.from < drag.over && index > drag.from && index <= drag.over) return -drag.shift
    if (drag.from > drag.over && index >= drag.over && index < drag.from) return drag.shift
    return 0
  }

  return (
    <ul ref={containerRef} className={cn(className, drag && 'select-none')}>
      {items.map((item, index) => {
        const isDragging = drag?.from === index
        const offset = offsetFor(index)

        const handle = disabled ? null : (
          <button
            type="button"
            aria-label={handleLabel?.(item) ?? 'Arrastar para reordenar'}
            aria-roledescription="alça de reordenação"
            title="Arraste ou use ↑/↓ para reordenar"
            onPointerDown={(e) => handlePointerDown(e, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setDrag(null)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'shrink-0 p-1 -m-1 rounded text-gray-400 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary touch-none',
              drag ? 'cursor-grabbing' : 'cursor-grab',
            )}
          >
            <LuGripVertical size={16} />
          </button>
        )

        return (
          <li
            key={keyExtractor(item)}
            style={offset ? { transform: `translateY(${offset}px)` } : undefined}
            className={cn(
              'relative',
              isDragging
                ? 'z-10 rounded-xl shadow-lg scale-[1.01] opacity-95'
                : drag && 'transition-transform duration-200 ease-out',
            )}
          >
            {renderItem(item, { handle, index, isDragging })}
          </li>
        )
      })}
    </ul>
  )
}
