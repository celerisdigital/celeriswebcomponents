'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { informativeKeys } from '../../query/keys'
import {
  createInformative,
  deleteInformative,
  markInformativeViewed,
  reorderInformatives,
  updateInformative,
  uploadInformativeImage,
} from './api'
import type { IInformative, InformativePayload, InformativesPage, InformativesQuery } from './types'

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

export function useReorderInformatives(query: InformativesQuery) {
  const http = useHttp()
  const queryClient = useQueryClient()
  const queryKey = informativeKeys.list(query)

  return useMutation({
    mutationFn: (items: IInformative[]) => reorderInformatives(http, items.map((item) => item.id)),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<InformativesPage>(queryKey)
      if (previous) queryClient.setQueryData<InformativesPage>(queryKey, { ...previous, rows: items })

      return { previous }
    },
    onError: (_error, _items, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: informativeKeys.all }),
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
