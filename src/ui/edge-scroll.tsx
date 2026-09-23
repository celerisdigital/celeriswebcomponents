'use client'

import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react'
import { LuChevronsLeft, LuChevronsRight } from 'react-icons/lu'

interface Props {
  children: ReactNode
  className?: string
  /** Largura da zona de borda que ativa o scroll (px) */
  edgeSize?: number
  /** Velocidade máxima de scroll (px/frame) */
  maxSpeed?: number
}

const OVERFLOW_THRESHOLD = 4

function findScrollable(root: HTMLElement): HTMLElement | null {
  if (root.scrollWidth - root.clientWidth > OVERFLOW_THRESHOLD) return root
  const queue: HTMLElement[] = Array.from(root.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement,
  )
  while (queue.length > 0) {
    const node = queue.shift()!
    if (node.scrollWidth - node.clientWidth > OVERFLOW_THRESHOLD) return node
    queue.push(
      ...Array.from(node.children).filter((c): c is HTMLElement => c instanceof HTMLElement),
    )
  }
  return null
}

type ActiveEdge = 'left' | 'right' | null

export function EdgeScroll({ children, className = '', edgeSize = 80, maxSpeed = 14 }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const speedRef = useRef(0)
  const scrollElRef = useRef<HTMLElement | null>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [activeEdge, setActiveEdge] = useState<ActiveEdge>(null)
  const [intensity, setIntensity] = useState(0)
  const [cursorY, setCursorY] = useState(0)

  const updateFades = useCallback(() => {
    const el = scrollElRef.current
    if (!el) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const overflow = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > OVERFLOW_THRESHOLD)
    setCanScrollRight(overflow > OVERFLOW_THRESHOLD && el.scrollLeft < overflow - OVERFLOW_THRESHOLD)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let currentScrollEl: HTMLElement | null = null
    const ro = new ResizeObserver(() => resolve())

    function attachScroll(el: HTMLElement | null) {
      if (currentScrollEl === el) return
      if (currentScrollEl) {
        currentScrollEl.removeEventListener('scroll', updateFades)
        ro.unobserve(currentScrollEl)
      }
      currentScrollEl = el
      if (el) {
        el.addEventListener('scroll', updateFades, { passive: true })
        ro.observe(el)
      }
    }

    function resolve() {
      const found = findScrollable(wrapper!)
      scrollElRef.current = found
      attachScroll(found)
      updateFades()
    }

    resolve()
    ro.observe(wrapper)
    const mo = new MutationObserver(resolve)
    mo.observe(wrapper, { childList: true, subtree: true })

    return () => {
      ro.disconnect()
      mo.disconnect()
      if (currentScrollEl) currentScrollEl.removeEventListener('scroll', updateFades)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [updateFades])

  function startRaf() {
    if (rafRef.current !== null) return
    function frame() {
      const el = scrollElRef.current
      if (!el || speedRef.current === 0) {
        rafRef.current = null
        return
      }
      const maxLeft = el.scrollWidth - el.clientWidth
      const atStart = el.scrollLeft <= 0
      const atEnd = el.scrollLeft >= maxLeft - 1
      if ((speedRef.current < 0 && atStart) || (speedRef.current > 0 && atEnd)) {
        speedRef.current = 0
        setActiveEdge(null)
        setIntensity(0)
        rafRef.current = null
        return
      }
      el.scrollLeft += speedRef.current
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function stopRaf() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const { left, top, width } = wrapper.getBoundingClientRect()
    const x = e.clientX - left
    setCursorY(e.clientY - top)

    const el = scrollElRef.current
    const overflow = el ? el.scrollWidth - el.clientWidth : 0
    const hasOverflow = overflow > OVERFLOW_THRESHOLD
    const liveLeft = !!el && hasOverflow && el.scrollLeft > OVERFLOW_THRESHOLD
    const liveRight = !!el && hasOverflow && el.scrollLeft < overflow - OVERFLOW_THRESHOLD

    if (x < edgeSize && liveLeft) {
      const ratio = 1 - x / edgeSize
      speedRef.current = -(ratio * maxSpeed)
      setActiveEdge('left')
      setIntensity(ratio)
      startRaf()
    } else if (x > width - edgeSize && liveRight) {
      const ratio = 1 - (width - x) / edgeSize
      speedRef.current = ratio * maxSpeed
      setActiveEdge('right')
      setIntensity(ratio)
      startRaf()
    } else {
      speedRef.current = 0
      setActiveEdge(null)
      setIntensity(0)
      stopRaf()
    }
  }

  function handleMouseLeave() {
    speedRef.current = 0
    setActiveEdge(null)
    setIntensity(0)
    stopRaf()
  }

  const leftActive = activeEdge === 'left'
  const rightActive = activeEdge === 'right'
  const badgeScale = 0.85 + intensity * 0.25
  const badgeOpacity = 0.55 + intensity * 0.45

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {canScrollLeft && (
        <div
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 bottom-0 z-10 rounded-l-xl bg-linear-to-r from-white/80 to-transparent transition-all duration-200 ${
            leftActive ? 'w-24 from-white/95' : 'w-16'
          }`}
        />
      )}
      {canScrollRight && (
        <div
          aria-hidden
          className={`pointer-events-none absolute right-0 top-0 bottom-0 z-10 rounded-r-xl bg-linear-to-l from-white/80 to-transparent transition-all duration-200 ${
            rightActive ? 'w-24 from-white/95' : 'w-16'
          }`}
        />
      )}

      {leftActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 rounded-l-xl"
          style={{
            width: 100,
            background: `linear-gradient(to right, rgba(107, 114, 128, ${0.35 + intensity * 0.35}), rgba(107, 114, 128, 0))`,
          }}
        >
          <div
            className="absolute text-gray-600 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]"
            style={{
              left: 14,
              top: cursorY,
              transform: `translateY(-50%) scale(${badgeScale})`,
              opacity: badgeOpacity,
              animation: 'edgeScrollNudgeLeft 900ms ease-in-out infinite',
            }}
          >
            <LuChevronsLeft size={26} strokeWidth={2} />
          </div>
        </div>
      )}

      {rightActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 rounded-r-xl"
          style={{
            width: 100,
            background: `linear-gradient(to left, rgba(107, 114, 128, ${0.35 + intensity * 0.35}), rgba(107, 114, 128, 0))`,
          }}
        >
          <div
            className="absolute text-gray-600 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]"
            style={{
              right: 14,
              top: cursorY,
              transform: `translateY(-50%) scale(${badgeScale})`,
              opacity: badgeOpacity,
              animation: 'edgeScrollNudgeRight 900ms ease-in-out infinite',
            }}
          >
            <LuChevronsRight size={26} strokeWidth={2} />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes edgeScrollNudgeRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes edgeScrollNudgeLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
      `}</style>

      {children}
    </div>
  )
}
