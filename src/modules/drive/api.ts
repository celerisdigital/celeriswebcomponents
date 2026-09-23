import type { AxiosInstance } from 'axios'
import type { IDriveFile, IDriveFolder } from './types'

export interface CreateDriveFolderBody {
  name: string
  isPublic: boolean
  parentFolderId?: number
  roles?: string[]
}

export interface UpdateDriveFolderBody {
  id: number
  name?: string
  isPublic?: boolean
  roles?: string[]
}

export interface UpdateDriveFileBody {
  id: number
  name?: string
  roles?: string[]
}

export async function fetchDriveFolders(http: AxiosInstance, parentFolderId?: number): Promise<IDriveFolder[]> {
  const { data } = await http.get<IDriveFolder[]>('/drive/folders', {
    params: parentFolderId !== undefined ? { parentFolderId } : undefined,
  })

  return data
}

export async function fetchDriveFiles(http: AxiosInstance, folderId?: number): Promise<IDriveFile[]> {
  const { data } = await http.get<IDriveFile[]>('/drive/files', {
    params: folderId !== undefined ? { folderId } : undefined,
  })

  return data
}

export async function createDriveFolder(http: AxiosInstance, body: CreateDriveFolderBody): Promise<{ id?: number }> {
  const { data } = await http.post<{ id?: number }>('/drive/folders', body)

  return data
}

export async function updateDriveFolder(http: AxiosInstance, body: UpdateDriveFolderBody): Promise<void> {
  await http.put('/drive/folders', body)
}

export async function deleteDriveFolder(http: AxiosInstance, id: number): Promise<void> {
  await http.delete(`/drive/folders/${id}`)
}

export async function updateDriveFile(http: AxiosInstance, body: UpdateDriveFileBody): Promise<void> {
  await http.put('/drive/files', body)
}

export async function deleteDriveFile(http: AxiosInstance, id: number): Promise<void> {
  await http.delete(`/drive/files/${id}`)
}

/** Sem Content-Type explícito: o axios detecta FormData e monta o boundary do multipart. */
export async function uploadDriveFile(http: AxiosInstance, formData: FormData): Promise<{ id?: number }> {
  const { data } = await http.post<{ id?: number }>('/drive/files', formData)

  return data
}
