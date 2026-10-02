import { cities } from './cities'
import { states } from './states'

export function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’\-\s]+/g, ' ')
    .trim()
}

export function findCity(name: string, uf?: string) {
  if (!name) return undefined

  const stateId = uf ? states.find((s) => s.Sigla === uf)?.ID : undefined
  const key = normalizeCityName(name)

  return cities.find((c) => normalizeCityName(c.Nome) === key && (!stateId || c.Estado === stateId))
}

export function canonicalCityName(name: string, uf?: string): string {
  if (!name) return ''

  return findCity(name, uf)?.Nome ?? name
}
