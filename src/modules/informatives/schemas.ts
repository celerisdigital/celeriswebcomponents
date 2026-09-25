import { z } from 'zod'
import { isRichTextEmpty } from '../../rich-text/utils'
import { formatDateOnly, parseDateOnly } from './status'
import type { IInformative, InformativePayload } from './types'

export const informativeFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe o título').max(256, 'Máximo de 256 caracteres'),
    text: z.string(),
    storageId: z.number().nullable(),
    initialDate: z.date().nullable(),
    finalDate: z.date().nullable(),
    displayType: z.enum(['banner', 'modal']),
    singleView: z.boolean(),
    roleIds: z.array(z.string()),
  })
  .refine((v) => !(v.initialDate && v.finalDate) || v.initialDate <= v.finalDate, {
    message: 'A data inicial deve ser menor ou igual à final',
    path: ['finalDate'],
  })

export type InformativeFormValues = z.infer<typeof informativeFormSchema>

export function toFormValues(item?: IInformative): InformativeFormValues {
  if (!item) {
    return {
      title: '',
      text: '',
      storageId: null,
      initialDate: null,
      finalDate: null,
      displayType: 'modal',
      singleView: false,
      roleIds: [],
    }
  }

  return {
    title: item.title,
    text: item.text ?? '',
    storageId: item.storageId,
    initialDate: parseDateOnly(item.initialDate),
    finalDate: parseDateOnly(item.finalDate),
    displayType: item.banner ? 'banner' : 'modal',
    singleView: item.singleView,
    roleIds: item.roleIds ?? [],
  }
}

export function toPayload(values: InformativeFormValues): InformativePayload {
  return {
    title: values.title,
    text: isRichTextEmpty(values.text) ? null : values.text,
    storageId: values.storageId,
    initialDate: formatDateOnly(values.initialDate),
    finalDate: formatDateOnly(values.finalDate),
    banner: values.displayType === 'banner',
    modal: values.displayType === 'modal',
    singleView: values.displayType === 'banner' ? false : values.singleView,
    roleIds: values.roleIds,
  }
}
