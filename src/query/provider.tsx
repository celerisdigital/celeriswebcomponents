'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { isAxiosError, type AxiosInstance } from 'axios'
import { useRouter } from 'next/navigation'
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

export interface CelerisClientProviderProps {
  apiBaseUrl: string
  children: ReactNode
}

export function CelerisClientProvider({ apiBaseUrl, children }: CelerisClientProviderProps) {
  const router = useRouter()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  )

  const http = useMemo(() => {
    const client = createHttpClient({ baseUrl: apiBaseUrl })
    // 401 aqui = o proxy da app já tentou renovar e a sessão morreu; o refresh do RSC passa pelo proxy, que leva ao login
    client.interceptors.response.use(undefined, (error) => {
      if (isAxiosError(error) && error.response?.status === 401) router.refresh()

      return Promise.reject(error)
    })

    return client
  }, [apiBaseUrl, router])

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
