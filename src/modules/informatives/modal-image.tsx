'use client'

import { useEffect, useState } from 'react'
import { LuLoader } from 'react-icons/lu'
import { ImageAnalyzer } from '../../ui'

const MAX_WIDTH_RATIO = 0.9
const MAX_HEIGHT_RATIO = 0.8
const MAX_HEIGHT_RATIO_WITH_TEXT = 0.6

interface Props {
  src: string
  alt: string
  children?: React.ReactNode
}

export function InformativeModalImage({ src, alt, children }: Props) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [box, setBox] = useState<{ width: number; height: number }>()
  const heightRatio = children ? MAX_HEIGHT_RATIO_WITH_TEXT : MAX_HEIGHT_RATIO

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
  }, [src])

  useEffect(() => {
    if (!natural) return

    const { w, h } = natural

    function compute() {
      const scale = Math.min(
        1,
        (window.innerWidth * MAX_WIDTH_RATIO) / w,
        (window.innerHeight * heightRatio) / h,
      )
      setBox({ width: w * scale, height: h * scale })
    }

    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [natural, heightRatio])

  if (!box) {
    return (
      <div className="flex h-[40vh] w-80 max-w-[90vw] items-center justify-center text-gray-400">
        <LuLoader size={24} className="animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ width: box.width }} className="max-w-full">
      <div style={{ height: box.height }}>
        <ImageAnalyzer src={src} alt={alt} className="w-full h-full rounded-t-2xl rounded-b-none" />
      </div>
      {children}
    </div>
  )
}
