const MAX_BYTES = 1 * 1024 * 1024
const MAX_DIMENSION = 1920

const ALPHA_TYPES = ['image/png', 'image/webp']

function outputFormat(inputType: string): { mime: 'image/png' | 'image/jpeg' | 'image/webp'; ext: string } {
  if (ALPHA_TYPES.includes(inputType)) return { mime: 'image/png', ext: '.png' }
  return { mime: 'image/jpeg', ext: '.jpg' }
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.size <= MAX_BYTES)
    return file

  const { mime, ext } = outputFormat(file.type)
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const baseName = file.name.replace(/\.[^.]+$/, ext)

  // PNG não usa parâmetro quality — tenta uma vez direto
  if (mime === 'image/png') {
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), mime)
    )
    return new File([blob], baseName, { type: mime })
  }

  for (let quality = 0.9; quality >= 0.1; quality -= 0.1) {
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), mime, quality)
    )
    if (blob.size <= MAX_BYTES)
      return new File([blob], baseName, { type: mime })
  }

  return new Promise<File>((resolve) =>
    canvas.toBlob(
      (b) => resolve(new File([b!], baseName, { type: mime })),
      mime,
      0.1
    )
  )
}
