import { isAxiosError } from 'axios'

export function extractErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined

    return data?.message ?? data?.error ?? fallback
  }

  if (error instanceof Error) return error.message

  return fallback
}
