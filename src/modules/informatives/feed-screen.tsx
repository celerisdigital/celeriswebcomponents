'use client'

import { InformativeBanners } from './banners'
import { InformativeModalCards } from './modal-cards'
import { useActiveInformatives } from './queries'

export function InformativesFeedScreen() {
  const { data: items = [] } = useActiveInformatives()
  const banners = items.filter((item) => item.banner)
  const modals = items.filter((item) => item.modal)

  if (banners.length === 0 && modals.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum informativo no momento.</p>
  }

  return (
    <div className="flex flex-col gap-5">
      <InformativeBanners banners={banners} />
      <InformativeModalCards modals={modals} />
    </div>
  )
}
