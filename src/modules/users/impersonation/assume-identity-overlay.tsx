'use client'

import { useEffect, useMemo, useState } from 'react'
import { LuCheck, LuShieldHalf, LuLoader } from 'react-icons/lu'
import { cn } from '../../../lib/cn'

interface Props {
  phase: 'connecting' | 'success'
  userName: string
  roleName?: string
}

const STEPS = [
  'Validando permissões',
  'Trocando contexto',
  'Carregando ambiente',
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '??'

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AssumeIdentityOverlay({ phase, userName, roleName }: Props) {
  const initials = useMemo(() => getInitials(userName), [userName])
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    if (phase !== 'connecting') return

    const id = window.setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))
    }, 450)

    return () => window.clearInterval(id)
  }, [phase])

  return (
    <div className="aio-a fixed inset-0 z-[200] grid place-items-center bg-brand/95 backdrop-blur-sm">
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_60%)]" />
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--primary)_60%,transparent),transparent)]" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--primary)_60%,transparent),transparent)]" />

      <div className="relative w-[min(420px,90vw)] rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden aio-a-card">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--primary)_75%,black),var(--primary),color-mix(in_srgb,var(--primary)_60%,white),var(--primary),color-mix(in_srgb,var(--primary)_75%,black))]" />

        <div className="pt-9 pb-7 px-8 flex flex-col items-center">
          <div className="relative w-28 h-28 grid place-items-center mb-5">
            <span aria-hidden className="absolute inset-0 rounded-full border border-brand/12 aio-a-ring aio-a-ring-1" />
            <span aria-hidden className="absolute inset-0 rounded-full border border-brand/8 aio-a-ring aio-a-ring-2" />
            <span aria-hidden className="absolute inset-0 rounded-full border border-brand/5 aio-a-ring aio-a-ring-3" />
            <div
              className="relative w-20 h-20 rounded-full grid place-items-center text-white font-semibold text-lg tracking-wider shadow-inner"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--brand) 70%, white) 0%, color-mix(in srgb, var(--brand) 88%, white) 55%, var(--brand) 100%)',
              }}
            >
              {phase === 'success' ? (
                <span className="aio-a-check">
                  <LuCheck size={30} className="text-primary" strokeWidth={3} />
                </span>
              ) : (
                <span className="text-white/95">{initials}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--primary)_75%,black)] font-medium mb-2">
            <LuShieldHalf size={11} />
            {phase === 'success' ? 'Acesso concedido' : 'Estabelecendo sessão'}
          </div>

          <h2 className="text-foreground text-xl font-semibold tracking-tight">{userName}</h2>
          {roleName && (
            <span className="text-[11px] text-gray-500 tracking-wide mt-0.5">{roleName}</span>
          )}

          <span aria-hidden className="mt-5 block h-px w-12 bg-primary/70" />

          <div className="mt-5 w-full min-h-[60px]">
            {phase === 'connecting' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-[12px] text-foreground/80 font-medium aio-a-step" key={stepIdx}>
                  {stepIdx === STEPS.length - 1 && (
                    <LuLoader size={12} className="animate-spin text-[color-mix(in_srgb,var(--primary)_75%,black)]" />
                  )}
                  <span>
                    {STEPS[stepIdx]}
                    {stepIdx < STEPS.length - 1 && <span className="aio-a-ellipsis" />}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-[3px] w-10 rounded-full transition-all duration-500',
                        i <= stepIdx ? 'bg-primary' : 'bg-brand/8',
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-[12px] text-foreground/70 aio-a-fade">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Redirecionando…
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .aio-a {
          animation: aio-a-bg 260ms ease-out;
        }
        @keyframes aio-a-bg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .aio-a-card {
          animation: aio-a-card 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes aio-a-card {
          from { transform: translateY(8px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .aio-a-ring {
          animation: aio-a-ring 2.8s ease-out infinite;
        }
        .aio-a-ring-1 { animation-delay: 0s; }
        .aio-a-ring-2 { animation-delay: 0.7s; }
        .aio-a-ring-3 { animation-delay: 1.4s; }
        @keyframes aio-a-ring {
          0%   { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .aio-a-step {
          animation: aio-a-step 320ms ease-out;
        }
        @keyframes aio-a-step {
          from { transform: translateY(4px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .aio-a-ellipsis::after {
          content: '';
          display: inline-block;
          width: 1.2em;
          text-align: left;
          animation: aio-a-ellipsis 1.2s steps(4, end) infinite;
        }
        @keyframes aio-a-ellipsis {
          0%   { content: ''; }
          25%  { content: '.'; }
          50%  { content: '..'; }
          75%  { content: '...'; }
        }
        .aio-a-check {
          display: inline-block;
          animation: aio-a-check 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes aio-a-check {
          from { transform: scale(0.3); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .aio-a-fade {
          animation: aio-a-fade 280ms ease-out;
        }
        @keyframes aio-a-fade {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
