import 'server-only'
import type { AxiosInstance } from 'axios'
import { createHttpClient } from '../http/create-client'
import type { CelerisConfig } from './config'

export async function createServerHttp(config: CelerisConfig): Promise<AxiosInstance> {
  return createHttpClient({ baseUrl: config.apiBaseUrl, token: await config.getToken() })
}
