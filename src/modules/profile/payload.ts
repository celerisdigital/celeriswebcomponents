import { buildContactExtraData } from '../../entities/users/form'
import type { ProfileValues } from './schemas'
import type { IUpdateMePayload } from './types'

export function toUpdateMePayload(values: ProfileValues): IUpdateMePayload {
  const extraData = buildContactExtraData(values)

  if (values.fantasy) extraData.fantasy = values.fantasy

  return {
    name: values.name || undefined,
    email: values.email || undefined,
    password: values.password || undefined,
    oldPassword: values.oldPassword || undefined,
    extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
  }
}
