import { RichTextContent } from '../../rich-text'
import { InformativeImage } from './informative-image'
import type { IActiveInformative } from './types'

export function InformativeModalCards({ modals }: { modals: IActiveInformative[] }) {
  if (modals.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {modals.map((modal) => (
        <div key={modal.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-gray-800">{modal.title}</p>
          {modal.storageUrl && <InformativeImage src={modal.storageUrl} className="mt-3" />}
          <RichTextContent content={modal.text} className="mt-2 text-sm" />
        </div>
      ))}
    </div>
  )
}
