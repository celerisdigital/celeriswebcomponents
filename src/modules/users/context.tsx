'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Viewer } from '../../types'
import type { UsersListPermissions } from './permissions'

export interface UsersListContextValue {
  permissions: UsersListPermissions
  viewer: Viewer
  basePath: string
  whiteLabelPath?: string
}

const UsersListContext = createContext<UsersListContextValue | null>(null)

export function UsersListProvider({ value, children }: { value: UsersListContextValue; children: ReactNode }) {
  return <UsersListContext.Provider value={value}>{children}</UsersListContext.Provider>
}

export function useUsersList(): UsersListContextValue {
  const context = useContext(UsersListContext)
  if (!context) throw new Error('useUsersList precisa estar dentro de UsersListProvider')

  return context
}
