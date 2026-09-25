'use client'

import { useState } from 'react'
import { Button, Modal } from '../../ui'
import { RichTextContent } from '../../rich-text'
import { isRichTextEmpty } from '../../rich-text/utils'
import { InformativeModalImage } from './modal-image'
import { useMarkInformativeViewed } from './mutations'
import { useActiveInformatives } from './queries'

export function InformativesModalQueue() {
  const { data: items = [] } = useActiveInformatives()
  const markViewed = useMarkInformativeViewed()
  const [index, setIndex] = useState(0)

  const modals = items.filter((item) => item.modal)
  const current = modals[index]
  if (!current) return null

  const imageUrl = current.storageUrl
  const hasText = !isRichTextEmpty(current.text)

  function handleClose() {
    markViewed.mutate(current.id)
    setIndex((i) => i + 1)
  }

  return (
    <Modal
      open
      onClose={handleClose}
      title={imageUrl ? undefined : <h2 className="text-lg font-semibold text-gray-800">{current.title}</h2>}
      maxWidth={imageUrl ? 'max-w-fit' : 'max-w-lg'}
      bodyClassName={imageUrl ? 'p-0' : undefined}
      closeButtonVariant={imageUrl ? 'overlay' : 'default'}
      footer={
        <div className="flex items-center justify-between gap-4">
          {modals.length > 1 ? (
            <span className="text-xs text-gray-500">
              {index + 1} de {modals.length}
            </span>
          ) : (
            <span />
          )}
          <Button onClick={handleClose}>Entendi</Button>
        </div>
      }
    >
      {imageUrl ? (
        <InformativeModalImage src={imageUrl} alt={current.title}>
          {hasText && (
            <div className="px-6 py-4">
              <RichTextContent content={current.text} className="text-sm" />
            </div>
          )}
        </InformativeModalImage>
      ) : (
        <RichTextContent content={current.text} className="text-sm" />
      )}
    </Modal>
  )
}
