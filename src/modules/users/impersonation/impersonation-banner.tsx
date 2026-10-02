'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LuArrowUpRight, LuLogOut } from 'react-icons/lu'
import { useAdapter } from '../../../adapters'
import { useToast } from '../../../contexts/toast-context'

export interface ImpersonationBannerProps {
  userName: string
  roleName?: string
  startedAt?: number
  exitPath: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '??'

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')

  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function ImpersonationBanner({ userName, roleName, startedAt, exitPath }: ImpersonationBannerProps) {
  const router = useRouter()
  const toast = useToast()
  const session = useAdapter('session')
  const [isPending, startTransition] = useTransition()
  const [elapsed, setElapsed] = useState(0)
  const initials = useMemo(() => getInitials(userName), [userName])

  useEffect(() => {
    const origin = startedAt ?? Date.now()
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - origin) / 1000)))
    const first = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 1000)

    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [startedAt])

  function handleExit() {
    startTransition(async () => {
      const result = await session.exitIdentity()

      if (result.error) {
        toast(result.error, { variant: 'error' })

        return
      }

      router.push(exitPath)
      router.refresh()
    })
  }

  return (
    <div className="impersonation-banner relative isolate overflow-hidden bg-brand text-white">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(to_bottom,transparent,var(--primary)_40%,var(--primary)_60%,transparent)]"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)] impersonation-banner-shimmer"
      />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

      <div className="relative flex items-center gap-4 pl-5 pr-4 py-2.5">
        <div className="shrink-0 relative">
          <div
            className="w-9 h-9 rounded-full grid place-items-center text-[11px] font-semibold tracking-wide text-primary-foreground bg-primary ring-1 ring-[color-mix(in_srgb,var(--primary)_60%,white)]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 50%, white) 0%, var(--primary) 55%, color-mix(in srgb, var(--primary) 75%, black) 100%)',
            }}
          >
            {initials}
          </div>
          <span aria-hidden className="absolute -inset-px rounded-full ring-1 ring-white/10" />
        </div>

        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] uppercase tracking-[0.22em] text-primary font-medium">Sessão assumida</span>
          <span className="text-sm font-semibold truncate">
            {userName}
            {roleName && <span className="ml-2 text-[11px] font-normal text-white/55 tracking-wide">{roleName}</span>}
          </span>
        </div>

        <div className="hidden sm:flex items-center ml-2 pl-4 border-l border-white/10">
          <span className="font-mono text-[13px] tabular-nums text-white/85">{formatElapsed(elapsed)}</span>
        </div>

        <button
          type="button"
          onClick={handleExit}
          disabled={isPending}
          className="group ml-auto shrink-0 inline-flex items-center gap-2 rounded-full bg-white text-primary-foreground hover:bg-primary hover:text-primary-foreground active:scale-[0.97] transition-all duration-200 px-4 py-1.5 text-xs font-semibold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LuLogOut size={13} className="opacity-80 group-hover:opacity-100" />
          <span>{isPending ? 'Encerrando…' : 'Devolver identidade'}</span>
          <LuArrowUpRight
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>

      <style>{`
        .impersonation-banner-shimmer {
          background-size: 200% 100%;
          animation: ib-a-shimmer 5.5s linear infinite;
        }
        @keyframes ib-a-shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
