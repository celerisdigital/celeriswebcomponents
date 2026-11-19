export interface RoleOption {
  id: string
  name: string
}

export interface Viewer {
  id: number
  role: string
  level: number
  inPlaceId: number | null
}

export interface OrganizationOption {
  id: number
  name: string
  active: boolean
}
