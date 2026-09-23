'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AxiosInstance } from 'axios'
import { createHttpClient } from '../http/create-client'
import { ToastProvider } from '../contexts/toast-context'
import { ConfirmModalProvider } from '../contexts/confirm-modal-context'
import { FilePreviewProvider } from '../contexts/file-preview-context'

const HttpContext = createContext<AxiosInstance | null>(null)

export function useHttp(): AxiosInstance {
  const client = useContext(HttpContext)
  if (!client) throw new Error('useHttp precisa estar dentro de CelerisProvider')

  return client
}

export interface CelerisProviderProps {
  token?: string
  apiBaseUrl: string
  children: ReactNode
}

export function CelerisProvider({ token, apiBaseUrl, children }: CelerisProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  )

  const http = useMemo(() => createHttpClient({ baseUrl: apiBaseUrl, token }), [apiBaseUrl, token])

  return (
    <QueryClientProvider client={queryClient}>
      <HttpContext.Provider value={http}>
        <FilePreviewProvider>
          <ToastProvider>
            <ConfirmModalProvider>{children}</ConfirmModalProvider>
          </ToastProvider>
        </FilePreviewProvider>
      </HttpContext.Provider>
    </QueryClientProvider>
  )
}
