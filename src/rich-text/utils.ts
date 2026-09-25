import DOMPurify from 'isomorphic-dompurify'

const HTML_TAG_RE = /<\/?[a-z][^>]*>/i

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function plainTextToHtml(value: string): string {
  if (!value) return ''

  return `<p>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`
}

export function toEditorContent(value: string | null | undefined): string {
  if (!value) return ''

  return looksLikeHtml(value) ? value : plainTextToHtml(value)
}

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html)
}

export function isRichTextEmpty(value: string | null | undefined): boolean {
  if (!value) return true

  const text = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ')

  return text.trim().length === 0
}
