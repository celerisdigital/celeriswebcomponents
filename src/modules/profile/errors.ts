import { isAxiosError } from 'axios'
import { extractErrorMessage } from '../../lib/errors'

export function updateMeErrorMessage(error: unknown): string {
  if (isAxiosError(error) && !error.response) return 'Não foi possível conectar ao servidor.'

  const status = isAxiosError(error) ? error.response?.status : undefined

  return extractErrorMessage(error, `Erro ${status} ao atualizar perfil.`)
}
