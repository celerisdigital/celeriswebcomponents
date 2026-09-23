'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { driveKeys } from '../../query/keys'
import {
  createDriveFolder,
  deleteDriveFile,
  deleteDriveFolder,
  updateDriveFile,
  updateDriveFolder,
  uploadDriveFile,
  type CreateDriveFolderBody,
  type UpdateDriveFileBody,
  type UpdateDriveFolderBody,
} from './api'

function useInvalidateDrive() {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: driveKeys.all })
}

export function useCreateDriveFolder() {
  const http = useHttp()
  const invalidate = useInvalidateDrive()

  return useMutation({
    mutationFn: (body: CreateDriveFolderBody) => createDriveFolder(http, body),
    onSuccess: invalidate,
  })
}

export function useUpdateDriveFolder() {
  const http = useHttp()
  const invalidate = useInvalidateDrive()

  return useMutation({
    mutationFn: (body: UpdateDriveFolderBody) => updateDriveFolder(http, body),
    onSuccess: invalidate,
  })
}

export function useDeleteDriveFolder() {
  const http = useHttp()
  const invalidate = useInvalidateDrive()

  return useMutation({
    mutationFn: (id: number) => deleteDriveFolder(http, id),
    onSuccess: invalidate,
  })
}

export function useUpdateDriveFile() {
  const http = useHttp()
  const invalidate = useInvalidateDrive()

  return useMutation({
    mutationFn: (body: UpdateDriveFileBody) => updateDriveFile(http, body),
    onSuccess: invalidate,
  })
}

export function useDeleteDriveFile() {
  const http = useHttp()
  const invalidate = useInvalidateDrive()

  return useMutation({
    mutationFn: (id: number) => deleteDriveFile(http, id),
    onSuccess: invalidate,
  })
}

export function useUploadDriveFile() {
  const http = useHttp()
  const invalidate = useInvalidateDrive()

  return useMutation({
    mutationFn: (formData: FormData) => uploadDriveFile(http, formData),
    onSuccess: invalidate,
  })
}
