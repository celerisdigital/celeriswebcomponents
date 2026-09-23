'use client'

import { useEffect, useRef, useState } from 'react'
import { LuZoomIn, LuZoomOut, LuRotateCw, LuRefreshCw, LuSearch, LuCircle, LuSquare } from 'react-icons/lu'
import { cn } from '../lib/cn'

type LoupeShape = 'circle' | 'square'

interface Props {
  src: string
  alt: string
  className?: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.5
const LOUPE_SIZE = 180
const LOUPE_ZOOM = 2.5

/**
 * Visualizador de imagem com ferramentas de análise:
 * - Zoom +/− (botões + scroll)
 * - Rotação 90°
 * - Pan (arrastar quando ampliado)
 * - Lupa (mostra área ampliada onde o mouse está)
 */
export function ImageAnalyzer({ src, alt, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<{ startX: number; startY: number; offX: number; offY: number } | null>(null)
  const [loupeOn, setLoupeOn] = useState(false)
  const [loupeShape, setLoupeShape] = useState<LoupeShape>('circle')
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  function zoomIn() {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  }
  function zoomOut() {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, z - ZOOM_STEP)
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }
  function rotate() {
    setRotation((r) => (r + 90) % 360)
  }
  function reset() {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }

  function onMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return
    e.preventDefault()
    setDrag({ startX: e.clientX, startY: e.clientY, offX: offset.x, offY: offset.y })
  }
  function onMouseMove(e: React.MouseEvent) {
    if (loupeOn) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setLoupePos({ x, y })
    }
  }
  function onMouseLeave() {
    setLoupePos(null)
  }

  useEffect(() => {
    if (!drag) return

    function handleMove(e: MouseEvent) {
      setOffset({ x: drag!.offX + (e.clientX - drag!.startX), y: drag!.offY + (e.clientY - drag!.startY) })
    }
    function handleUp() {
      setDrag(null)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('mouseleave', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('mouseleave', handleUp)
    }
  }, [drag])

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const t = e.currentTarget
    setImgSize({ w: t.naturalWidth, h: t.naturalHeight })
  }

  const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className={cn('group relative bg-black/40 rounded-xl overflow-hidden w-[90%] h-[90%] flex items-center justify-center', className)}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: drag ? 'grabbing' : zoom > 1 ? 'grab' : loupeOn ? 'crosshair' : 'default' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={onImgLoad}
        draggable={false}
        style={{ transform, transition: drag ? 'none' : 'transform 150ms ease-out' }}
        className="max-w-full max-h-full object-contain select-none pointer-events-none"
      />

      {loupeOn && loupePos && imgSize.w > 0 && imgRef.current && (
        <Loupe
          pos={loupePos}
          imgEl={imgRef.current}
          containerEl={containerRef.current}
          imgSize={imgSize}
          shape={loupeShape}
          rotation={rotation}
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full shadow-lg px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
      >
        <Tool onClick={zoomOut} label="Diminuir"><LuZoomOut size={16} /></Tool>
        <span className="text-xs font-semibold text-gray-700 tabular-nums px-2 select-none">
          {Math.round(zoom * 100)}%
        </span>
        <Tool onClick={zoomIn} label="Aumentar"><LuZoomIn size={16} /></Tool>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Tool onClick={rotate} label="Rotacionar"><LuRotateCw size={16} /></Tool>
        <Tool active={loupeOn} onClick={() => setLoupeOn((v) => !v)} label="Lupa"><LuSearch size={16} /></Tool>
        {loupeOn && (
          <Tool
            onClick={() => setLoupeShape((s) => (s === 'circle' ? 'square' : 'circle'))}
            label={loupeShape === 'circle' ? 'Lupa quadrada' : 'Lupa redonda'}
          >
            {loupeShape === 'circle' ? <LuSquare size={16} /> : <LuCircle size={16} />}
          </Tool>
        )}
        <Tool onClick={reset} label="Resetar"><LuRefreshCw size={16} /></Tool>
      </div>
    </div>
  )
}

function Tool({ onClick, label, children, active }: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        active ? 'bg-brand text-brand-foreground' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

interface LoupeProps {
  pos: { x: number; y: number }
  imgEl: HTMLImageElement
  containerEl: HTMLDivElement | null
  imgSize: { w: number; h: number }
  shape: LoupeShape
  rotation: number
}

function Loupe({ pos, imgEl, containerEl, shape, rotation }: LoupeProps) {
  const imgRect = imgEl.getBoundingClientRect()
  const containerRect = containerEl?.getBoundingClientRect()
  if (!containerRect) return null

  // Cursor relativo ao bounding-box da imagem rotacionada (em coords screen)
  const xRelBbox = pos.x - (imgRect.left - containerRect.left)
  const yRelBbox = pos.y - (imgRect.top - containerRect.top)

  if (xRelBbox < 0 || yRelBbox < 0 || xRelBbox > imgRect.width || yRelBbox > imgRect.height) return null

  // Dimensões natural-orientation (antes da rotação)
  const r = ((rotation % 360) + 360) % 360
  const natW = r === 90 || r === 270 ? imgRect.height : imgRect.width
  const natH = r === 90 || r === 270 ? imgRect.width : imgRect.height

  // Inverso da rotação: cursor no bbox → cursor na imagem antes da rotação
  const dx = xRelBbox - imgRect.width / 2
  const dy = yRelBbox - imgRect.height / 2
  let ux = dx
  let uy = dy
  if (r === 90)  { ux = dy;  uy = -dx }
  if (r === 180) { ux = -dx; uy = -dy }
  if (r === 270) { ux = -dy; uy = dx  }
  ux += natW / 2
  uy += natH / 2

  // Inner div ampliado, rotacionado em torno do ponto focal
  const innerW = natW * LOUPE_ZOOM
  const innerH = natH * LOUPE_ZOOM
  const focusX = ux * LOUPE_ZOOM
  const focusY = uy * LOUPE_ZOOM

  return (
    <div
      style={{
        left: pos.x - LOUPE_SIZE / 2,
        top: pos.y - LOUPE_SIZE / 2,
        width: LOUPE_SIZE,
        height: LOUPE_SIZE,
      }}
      className={`absolute pointer-events-none border-4 border-white shadow-2xl bg-white overflow-hidden ${
        shape === 'circle' ? 'rounded-full' : 'rounded-md'
      }`}
    >
      <div
        style={{
          position: 'absolute',
          width: innerW,
          height: innerH,
          left: LOUPE_SIZE / 2 - focusX,
          top: LOUPE_SIZE / 2 - focusY,
          backgroundImage: `url(${imgEl.src})`,
          backgroundSize: `${innerW}px ${innerH}px`,
          backgroundRepeat: 'no-repeat',
          transform: `rotate(${r}deg)`,
          transformOrigin: `${focusX}px ${focusY}px`,
        }}
      />
    </div>
  )
}
