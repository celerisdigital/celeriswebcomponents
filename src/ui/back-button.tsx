'use client'

import { useBack } from '../lib/use-back'

interface Props {
  fallback: string
}

export default function BackButton({ fallback }: Props) {
  const back = useBack(fallback)

  return (
    <button
      onClick={back}
      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
      aria-label="Voltar"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
