'use client'

import { useRouter } from 'next/navigation'
import { LuUserCog } from 'react-icons/lu'
import { useAdapter } from '../../../adapters'
import { useConfirm } from '../../../contexts/confirm-modal-context'
import { useImpersonationTransition } from '../../../contexts/impersonation-transition-context'

interface Props {
  userId: number
  userName: string
  roleName: string
}

export function AssumeIdentityButton({ userId, userName, roleName }: Props) {
  const router = useRouter()
  const confirm = useConfirm()
  const session = useAdapter('session')
  const { phase, setPhase, setTarget, reset } = useImpersonationTransition()

  function handleClick() {
    confirm({
      title: 'Assumir identidade',
      description: `Você acessará o sistema como "${userName}" (${roleName}). Todas as ações ficarão registradas em seu nome no log de auditoria. Continuar?`,
      confirmLabel: 'Assumir',
      icon: <LuUserCog size={20} className="text-amber-600" />,
      variant: 'warning',
      onConfirm: async () => {
        setTarget({ userName, roleName })
        setPhase('connecting')

        try {
          const [result] = await Promise.all([
            session.assumeIdentity(userId),
            new Promise((resolve) => setTimeout(resolve, 1400)),
          ])

          if (result.error) throw new Error(result.error)

          setPhase('success')
          router.push(session.homePath)
          router.refresh()
        } catch (error) {
          reset()
          throw error
        }
      },
    })
  }

  return (
    <button
      title={`Assumir identidade de ${userName}`}
      onClick={handleClick}
      disabled={phase !== 'idle'}
      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
    >
      <LuUserCog size={16} />
    </button>
  )
}
