import 'server-only'
import type { Viewer } from '../types'
import type { CelerisConfig } from './config'

export async function getViewer(config: CelerisConfig): Promise<Viewer | null> {
  const token = await config.getToken()
  const payloadPart = token?.split('.')[1]

  if (!payloadPart) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Record<string, unknown>

    return {
      id: typeof payload.id === 'number' ? payload.id : 0,
      role: typeof payload.role === 'string' ? payload.role : '',
      level: typeof payload.level === 'number' ? payload.level : 0,
      inPlaceId: typeof payload.inPlaceId === 'number' ? payload.inPlaceId : null,
    }
  } catch {
    return null
  }
}
