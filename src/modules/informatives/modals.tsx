import type { ReactNode } from 'react'
import type { CelerisConfig } from '../../server/config'
import { InformativesModalQueue } from './modal-queue'

export interface InformativesModalsProps {
  config: CelerisConfig
}

// A fila busca pelo client; config fica na assinatura para não quebrar as apps
export const InformativesModals: (props: InformativesModalsProps) => ReactNode = () => <InformativesModalQueue />
