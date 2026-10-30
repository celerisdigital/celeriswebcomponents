'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { driveKeys } from '../../query/keys'
import { STALE_TIME } from '../../query/stale-time'
import { fetchDriveFiles, fetchDriveFolders } from './api'

export function useDriveFolders(parentFolderId: number | undefined) {
  const http = useHttp()

  return useQuery({
    queryKey: driveKeys.folders(parentFolderId),
    queryFn: () => fetchDriveFolders(http, parentFolderId),
    staleTime: STALE_TIME.administrative,
  })
}

export function useDriveFiles(folderId: number | undefined) {
  const http = useHttp()

  return useQuery({
    queryKey: driveKeys.files(folderId),
    queryFn: () => fetchDriveFiles(http, folderId),
    staleTime: STALE_TIME.administrative,
  })
}
