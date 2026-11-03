import type { AxiosInstance } from 'axios'
import type { IMe, IUpdateMePayload } from './types'

export async function fetchMe(http: AxiosInstance): Promise<IMe> {
  const { data } = await http.get<IMe>('/users/auth/me')

  return data
}

export async function updateMe(http: AxiosInstance, body: IUpdateMePayload): Promise<void> {
  await http.patch('/users/me', body)
}
