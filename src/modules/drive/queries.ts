'use client'

import { useQuery } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { driveKeys } from '../../query/keys'
import { fetchDriveFiles, fetchDriveFolders } from './api'

export function useDriveFolders(parentFolderId: number | undefined) {
  const http = useHttp()

  return useQuery({
    queryKey: driveKeys.folders(parentFolderId),
    queryFn: () => fetchDriveFolders(http, parentFolderId),
  })
}

export function useDriveFiles(folderId: number | undefined) {
  const http = useHttp()

  return useQuery({
    queryKey: driveKeys.files(folderId),
    queryFn: () => fetchDriveFiles(http, folderId),
  })
}
