import type { AxiosInstance } from 'axios'
import type {
  IActiveInformative,
  IInformative,
  InformativePayload,
  InformativesPage,
  InformativesQuery,
} from './types'

export async function fetchInformatives(http: AxiosInstance, query: InformativesQuery): Promise<InformativesPage> {
  const { data } = await http.get<InformativesPage>('/informatives', {
    params: {
      page: Math.floor(query.offset / query.limit) + 1,
      pageSize: query.limit,
      title: query.title || undefined,
      status: query.status,
    },
  })

  return data
}

export async function fetchInformative(http: AxiosInstance, id: number): Promise<IInformative | null> {
  try {
    const { data } = await http.get<IInformative>(`/informatives/${id}`)

    return data
  } catch {
    return null
  }
}

export async function createInformative(http: AxiosInstance, body: InformativePayload): Promise<{ id?: number }> {
  const { data } = await http.post<{ id?: number }>('/informatives', body)

  return data
}

export async function updateInformative(http: AxiosInstance, id: number, body: InformativePayload): Promise<void> {
  await http.put(`/informatives/${id}`, body)
}

export async function deleteInformative(http: AxiosInstance, id: number): Promise<void> {
  await http.delete(`/informatives/${id}`)
}

export async function reorderInformatives(http: AxiosInstance, ids: number[]): Promise<void> {
  await http.put('/informatives/order', { ids })
}

export async function fetchActiveInformatives(http: AxiosInstance): Promise<IActiveInformative[]> {
  try {
    const { data } = await http.get<IActiveInformative[]>('/informatives/active')

    return data
  } catch {
    return []
  }
}

export async function markInformativeViewed(http: AxiosInstance, id: number): Promise<void> {
  await http.post(`/informatives/${id}/view`)
}

export async function uploadInformativeImage(http: AxiosInstance, file: File): Promise<{ id: number; url?: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await http.post<{ id?: unknown; url?: string }>('/informatives/image', formData)
  if (typeof data?.id !== 'number') throw new Error('Resposta inválida do servidor ao enviar a imagem.')

  return { id: data.id, url: data.url }
}
