export interface IInformative {
  id: number
  title: string
  text: string | null
  storageId: number | null
  storageUrl: string | null
  initialDate: string | null
  finalDate: string | null
  banner: boolean
  modal: boolean
  singleView: boolean
  roleIds: string[] | null
  createdBy: number | null
  createdAt: string
  updatedAt: string | null
}

export interface IActiveInformative extends Omit<IInformative, 'roleIds'> {
  alreadyViewed: boolean
}

export interface InformativesQuery {
  limit: number
  offset: number
  title?: string
}

export interface InformativesPage {
  rows: IInformative[]
  meta: {
    total: number
    itemsPerPage: number
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface InformativePayload {
  title: string
  text: string | null
  storageId: number | null
  initialDate: string | null
  finalDate: string | null
  banner: boolean
  modal: boolean
  singleView: boolean
  roleIds: string[]
}
