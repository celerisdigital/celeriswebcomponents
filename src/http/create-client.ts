import axios, { type AxiosInstance } from 'axios'

export interface CreateHttpClientOptions {
  baseUrl: string
  token?: string
}

/**
 * Fábrica — nunca exportar uma instância pronta. No servidor o módulo é
 * compartilhado entre requisições concorrentes, então um cliente global faria o
 * token de um usuário vazar para a request de outro.
 */
export function createHttpClient({ baseUrl, token }: CreateHttpClientOptions): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
