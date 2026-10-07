import { NextResponse, type NextRequest } from 'next/server'

export interface CelerisSession {
  access: string
  refresh: string
}

export interface CelerisApiProxyOptions {
  apiBaseUrl: string
  prefix: string
  getTokens: (request: NextRequest) => { access?: string; refresh?: string }
  refresh: (refreshToken: string) => Promise<CelerisSession | null>
  persist: (response: NextResponse, session: CelerisSession) => void
  refreshMarginMs?: number
}

function expiresWithin(token: string, marginMs: number): boolean {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return typeof payload.exp === 'number' && payload.exp * 1000 - marginMs < Date.now()
  } catch {
    return true
  }
}

export function createCelerisApiProxy({
  apiBaseUrl,
  prefix,
  getTokens,
  refresh,
  persist,
  // margem para upload grande: o body pode levar minutos até chegar no middleware de auth da API
  refreshMarginMs = 2 * 60 * 1000,
}: CelerisApiProxyOptions) {
  return async function celerisApiProxy(request: NextRequest): Promise<NextResponse> {
    const tokens = getTokens(request)
    let access = tokens.access
    let session: CelerisSession | null = null

    if (!access || expiresWithin(access, refreshMarginMs)) {
      if (tokens.refresh) {
        try {
          session = await refresh(tokens.refresh)
        } catch {
          return NextResponse.json({ message: 'Não foi possível conectar à API.' }, { status: 502 })
        }
      }

      // não apaga cookie: numa renovação concorrente, a request que perdeu chegaria depois e apagaria os cookies novos
      if (!session) {
        return NextResponse.json({ message: 'Sessão expirada. Faça login novamente.' }, { status: 401 })
      }

      access = session.access
    }

    const { pathname, search } = request.nextUrl
    const target = new URL(`${apiBaseUrl}${pathname.slice(prefix.length)}${search}`)
    const headers = new Headers(request.headers)
    headers.delete('cookie')
    headers.set('authorization', `Bearer ${access}`)

    const response = NextResponse.rewrite(target, { request: { headers } })
    if (session) persist(response, session)

    return response
  }
}
