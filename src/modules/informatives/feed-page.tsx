import type { ReactNode } from 'react'
import type { CelerisConfig } from '../../server/config'
import { InformativesFeedScreen } from './feed-screen'

export interface InformativesFeedPageProps {
  config: CelerisConfig
}

// O feed busca pelo client; config fica na assinatura para não quebrar as apps
export const InformativesFeedPage: (props: InformativesFeedPageProps) => ReactNode = () => (
  <div className="p-6 flex flex-col gap-5">
    <h1 className="text-xl font-semibold text-gray-800">Informativos</h1>
    <InformativesFeedScreen />
  </div>
)
