import { isAxiosError } from 'axios'
import { extractErrorMessage } from '../../lib/errors'

export function userErrorMessage(error: unknown, action: string): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Não foi possível conectar ao servidor.'

    return extractErrorMessage(error, `Erro ${error.response.status} ao ${action}.`)
  }

  return extractErrorMessage(error, `Erro ao ${action}.`)
}
