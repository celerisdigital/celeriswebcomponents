export interface IDriveFolder {
  id: number
  name: string
  parentId: number | null
  isPublic: boolean
  createdBy: number | null
  createdAt: string
  updatedAt: string | null
  roles: string[] | null
}

export interface IDriveStorage {
  id: number
  kind: string
  filename: string
  contentType: string
  key: string
  url: string
  acl: 'public-read' | 'private'
  size?: number
}

export interface IDriveFile {
  id: number
  folderId: number | null
  storageId: number
  name: string
  isPublic: boolean
  createdBy: number | null
  createdAt: string
  updatedAt: string | null
  roles: string[] | null
  storage: IDriveStorage
}

export type DriveVisibility = 'public' | 'private'
