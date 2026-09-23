'use client'

import { useState } from 'react'
import { Input } from './input'

export interface PercentInputProps {
  /** Valor numérico (0–max). */
  value: number
  /** Recebe o valor numérico final a cada digitação. */
  onChange: (value: number) => void
  /** Limite superior (clamp). Default: 100. */
  max?: number
  /** Casas decimais exibidas no blur/load. Default: sem fixar (String(n)). */
  decimals?: number
  /** Mensagem de erro — quando presente, aplica borda vermelha. */
  error?: string
  disabled?: boolean
  placeholder?: string
  className?: string
}

/** Input decimal com sufixo "%", clamp configurável e normalização ao vivo:
 *  remove zeros à esquerda, aceita ponto como separador, e bloqueia caracteres não numéricos.
 *
 *  Ao contrário de `<input type="number">` controlado, mantém a string exibida
 *  fiel ao valor numérico (ex: "02.24" → "2.24" enquanto digita). */
export function PercentInput({
  value,
  onChange,
  max = 100,
  decimals,
  error,
  disabled,
  placeholder,
  className,
}: PercentInputProps) {
  const fmt = (n: number) => formatNumber(n, decimals)
  const [text, setText] = useState(() => fmt(value))
  const [focused, setFocused] = useState(false)

  // Resync externo: form mudou o valor (reset, edição programática) e estamos fora de foco.
  if (!focused && Number(text) !== value) {
    setText(fmt(value))
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      error={error}
      value={text}
      rightIcon={<span className="text-xs">%</span>}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const next = normalize(e.target.value, max, decimals)
        setText(next)
        const n = Number(next)
        onChange(Number.isFinite(n) ? n : 0)
      }}
      onBlur={() => {
        setFocused(false)
        // Garante texto coerente após sair (ex: "2." → "2", "" → "0").
        setText(fmt(Number(text) || 0))
      }}
    />
  )
}

/** Normaliza enquanto digita: só dígitos + um ponto, sem zeros à esquerda, clampa em max. */
function normalize(raw: string, max: number, decimals?: number): string {
  // 1. Vírgula vira ponto, mantém só dígitos e pontos
  let s = raw.replace(/,/g, '.').replace(/[^\d.]/g, '')
  // 2. Mantém apenas o primeiro ponto
  const dot = s.indexOf('.')
  if (dot >= 0) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '')
  if (s === '' || s === '.') return s
  // 3. Separa parte inteira / decimal
  const hasDot = s.includes('.')
  const [intPart, decPart = ''] = s.split('.')
  // 4. Remove zeros à esquerda — preserva "0" sozinho e "0." mid-typing
  const intNorm =
    intPart === '' ? '' : intPart.replace(/^0+(?=\d)/, '') || '0'
  // 5. Limita casas decimais se definido
  const decNorm = decimals !== undefined ? decPart.slice(0, decimals) : decPart
  const result = hasDot ? `${intNorm}.${decNorm}` : intNorm
  // 6. Clamp
  const n = Number(result)
  if (Number.isFinite(n) && n > max) return String(max)
  return result
}

function formatNumber(n: number, decimals?: number): string {
  if (!Number.isFinite(n)) return '0'
  return decimals !== undefined ? n.toFixed(decimals) : String(n)
}
