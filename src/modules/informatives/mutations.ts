'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { informativeKeys } from '../../query/keys'
import {
  createInformative,
  deleteInformative,
  markInformativeViewed,
  updateInformative,
  uploadInformativeImage,
} from './api'
import type { InformativePayload } from './types'

function useInvalidateInformatives() {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: informativeKeys.all })
}

export function useCreateInformative() {
  const http = useHttp()
  const invalidate = useInvalidateInformatives()

  return useMutation({
    mutationFn: (body: InformativePayload) => createInformative(http, body),
    onSuccess: invalidate,
  })
}

export function useUpdateInformative() {
  const http = useHttp()
  const invalidate = useInvalidateInformatives()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: InformativePayload }) => updateInformative(http, id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteInformative() {
  const http = useHttp()
  const invalidate = useInvalidateInformatives()

  return useMutation({
    mutationFn: (id: number) => deleteInformative(http, id),
    onSuccess: invalidate,
  })
}

export function useMarkInformativeViewed() {
  const http = useHttp()

  return useMutation({
    mutationFn: (id: number) => markInformativeViewed(http, id),
  })
}

export function useUploadInformativeImage() {
  const http = useHttp()

  return useMutation({
    mutationFn: (file: File) => uploadInformativeImage(http, file),
  })
}
