export const MAX_FILES = 10
export const MAX_FILE_BYTES = 20 * 1024 * 1024
export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.docx'
export const ATTACHMENTS_HINT = `Imagens, PDF ou DOCX · máx. 20 MB por arquivo · até ${MAX_FILES} arquivos`

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateIncoming(currentCount: number, incoming: File[]): string | null {
  if (currentCount + incoming.length > MAX_FILES) return `Máximo de ${MAX_FILES} arquivos permitidos.`

  const oversized = incoming.find((f) => f.size > MAX_FILE_BYTES)

  return oversized ? `"${oversized.name}" excede o limite de 20 MB.` : null
}
