'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../../query/provider'
import { userKeys } from '../../query/keys'
import {
  changeUserStatus,
  createBlockRule,
  createUser,
  deleteBlockRule,
  deleteUser,
  deleteUserFile,
  exportUsers,
  moveSubusers,
  sendContractSignature,
  updateBlockRule,
  updateUser,
  uploadUserFile,
} from './api'
import type {
  IBlockRulePayload,
  IChangeStatusPayload,
  ICreateUserPayload,
  IUpdateUserPayload,
  IUsersFilters,
} from './types'

function useInvalidateUsers() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: userKeys.lists }),
      queryClient.invalidateQueries({ queryKey: userKeys.trees }),
      queryClient.invalidateQueries({ queryKey: userKeys.details }),
    ])
}

export function useCreateUser() {
  const http = useHttp()
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: (body: ICreateUserPayload) => createUser(http, body),
    onSuccess: invalidate,
  })
}

export function useUpdateUser() {
  const http = useHttp()
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: (body: IUpdateUserPayload) => updateUser(http, body),
    onSuccess: invalidate,
  })
}

export function useChangeUserStatus() {
  const http = useHttp()
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: (body: IChangeStatusPayload) => changeUserStatus(http, body),
    onSuccess: invalidate,
  })
}

export function useDeleteUser() {
  const http = useHttp()
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: (id: number) => deleteUser(http, id),
    onSuccess: invalidate,
  })
}

export function useMoveSubusers() {
  const http = useHttp()
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: ({ fromUserId, newParentId }: { fromUserId: number; newParentId: number }) =>
      moveSubusers(http, fromUserId, newParentId),
    onSuccess: invalidate,
  })
}

export function useUploadUserFile() {
  const http = useHttp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) => uploadUserFile(http, userId, file),
    onSuccess: (_data, { userId }) => queryClient.invalidateQueries({ queryKey: userKeys.files(userId) }),
  })
}

export function useDeleteUserFile() {
  const http = useHttp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId }: { fileId: number; userId: number }) => deleteUserFile(http, fileId),
    onSuccess: (_data, { userId }) => queryClient.invalidateQueries({ queryKey: userKeys.files(userId) }),
  })
}

export function useSendContract() {
  const http = useHttp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => sendContractSignature(http, userId),
    onSuccess: (_data, userId) => queryClient.invalidateQueries({ queryKey: userKeys.contractStatus(userId) }),
  })
}

export function useExportUsers() {
  const http = useHttp()

  return useMutation({
    mutationFn: (filters: IUsersFilters) => exportUsers(http, filters),
  })
}

function useInvalidateBlockRules() {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: userKeys.blockRules })
}

export function useCreateBlockRule() {
  const http = useHttp()
  const invalidate = useInvalidateBlockRules()

  return useMutation({
    mutationFn: (body: IBlockRulePayload) => createBlockRule(http, body),
    onSuccess: invalidate,
  })
}

export function useUpdateBlockRule() {
  const http = useHttp()
  const invalidate = useInvalidateBlockRules()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Omit<IBlockRulePayload, 'type'> }) =>
      updateBlockRule(http, id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteBlockRule() {
  const http = useHttp()
  const invalidate = useInvalidateBlockRules()

  return useMutation({
    mutationFn: (id: number) => deleteBlockRule(http, id),
    onSuccess: invalidate,
  })
}
