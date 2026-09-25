'use client'

import { Badge, Modal } from '../../ui'
import { RichTextContent } from '../../rich-text'
import { deriveStatus, displayDateOnly, STATUS_LABEL, STATUS_VARIANT } from './status'
import { InformativeImage } from './informative-image'
import { RoleBadges } from './role-badges'
import type { IInformative } from './types'

interface Props {
  item: IInformative | null
  roleNames: Record<string, string>
  onClose: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  )
}

export function InformativeDetailModal({ item, roleNames, onClose }: Props) {
  if (!item) return null

  const status = deriveStatus(item.initialDate, item.finalDate)

  return (
    <Modal open onClose={onClose} title={item.title}>
      <div className="flex flex-col gap-4">
        <Row label="Status">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
        </Row>

        <Row label="Exibição">
          <div className="flex flex-wrap gap-1">
            {item.banner && <Badge variant="info">Informe Fixado</Badge>}
            {item.modal && <Badge variant="info">Modal</Badge>}
            {item.singleView && <Badge variant="default">Visualização única</Badge>}
          </div>
        </Row>

        <Row label="Público">
          <RoleBadges roleIds={item.roleIds} roleNames={roleNames} max={Infinity} />
        </Row>

        <Row label="Período">
          {displayDateOnly(item.initialDate) ?? 'Sem início'} – {displayDateOnly(item.finalDate) ?? 'Sem fim'}
        </Row>

        {item.storageUrl && (
          <Row label="Imagem">
            <InformativeImage src={item.storageUrl} className="max-h-64" />
          </Row>
        )}

        <Row label="Texto">
          {item.text ? (
            <RichTextContent content={item.text} />
          ) : (
            <span className="text-gray-400">Sem texto</span>
          )}
        </Row>
      </div>
    </Modal>
  )
}
