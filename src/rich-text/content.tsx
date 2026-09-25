import { cn } from '../lib/cn'
import { looksLikeHtml, sanitizeRichText } from './utils'
import './rich-text.css'

export interface RichTextContentProps {
  content: string | null | undefined
  className?: string
}

export function RichTextContent({ content, className }: RichTextContentProps) {
  if (!content) return null

  if (!looksLikeHtml(content)) {
    return <div className={cn('rich-text whitespace-pre-wrap', className)}>{content}</div>
  }

  return (
    <div
      className={cn('rich-text', className)}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
    />
  )
}
