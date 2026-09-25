import { LuMegaphone } from 'react-icons/lu'
import { RichTextContent } from '../../rich-text'
import { InformativeImage } from './informative-image'
import type { IActiveInformative } from './types'

export function InformativeBanners({ banners }: { banners: IActiveInformative[] }) {
  if (banners.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
        >
          <LuMegaphone size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800">{banner.title}</p>
            {banner.storageUrl && <InformativeImage src={banner.storageUrl} className="mt-3 max-h-32" />}
            <RichTextContent content={banner.text} className="mt-0.5 text-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}
