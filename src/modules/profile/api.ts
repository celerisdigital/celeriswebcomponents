import type { AxiosInstance } from 'axios'
import type { IMe, IUpdateMePayload } from './types'

export async function fetchMe(http: AxiosInstance): Promise<IMe | null> {
  try {
    const { data } = await http.get<IMe>('/users/auth/me')

    return data
  } catch {
    return null
  }
}

export async function updateMe(http: AxiosInstance, body: IUpdateMePayload): Promise<void> {
  await http.patch('/users/me', body)
}
