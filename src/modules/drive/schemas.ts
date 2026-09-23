import { z } from 'zod'

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Informe o nome da pasta.').max(40, 'Máximo de 40 caracteres.'),
  visibility: z.enum(['public', 'private']),
  roles: z.array(z.string()),
})
export type CreateFolderValues = z.infer<typeof createFolderSchema>

export const editFolderSchema = z.object({
  name: z.string().min(1, 'Informe o nome da pasta.').max(40, 'Máximo de 40 caracteres.'),
  visibility: z.enum(['public', 'private']),
  roles: z.array(z.string()),
})
export type EditFolderValues = z.infer<typeof editFolderSchema>

export const editFileSchema = z.object({
  name: z.string().min(1, 'Informe o nome do arquivo.').max(120, 'Máximo de 120 caracteres.'),
  roles: z.array(z.string()),
})
export type EditFileValues = z.infer<typeof editFileSchema>

export const uploadVisibilitySchema = z.object({
  visibility: z.enum(['public', 'private']),
  roles: z.array(z.string()),
})
export type UploadVisibilityValues = z.infer<typeof uploadVisibilitySchema>
