'use client'

import { useMutation } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { updateMe } from './api'
import type { IUpdateMePayload } from './types'

export function useUpdateMe() {
  const http = useHttp()

  return useMutation({
    mutationFn: (body: IUpdateMePayload) => updateMe(http, body),
  })
}
