'use client'

import { useState } from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Field, ImageUploadField } from '../../ui'
import { compressImage } from '../../lib/compress-image'
import { informativeErrorMessage } from './errors'
import { useUploadInformativeImage } from './mutations'
import type { InformativeFormValues } from './schemas'

interface Props {
  control: Control<InformativeFormValues>
  initialUrl?: string | null
}

export function InformativeImageField({ control, initialUrl }: Props) {
  const upload = useUploadInformativeImage()
  const [uploadError, setUploadError] = useState<string | undefined>(undefined)

  return (
    <Controller
      control={control}
      name="storageId"
      render={({ field }) => (
        <Field label="Imagem" error={uploadError} asDiv>
          <ImageUploadField
            initialUrl={initialUrl}
            emptyLabel="Selecionar imagem"
            error={uploadError}
            onSelect={async (file) => {
              setUploadError(undefined)

              let compressed: File
              try {
                compressed = await compressImage(file)
              } catch {
                setUploadError('Não foi possível processar esta imagem.')
                throw new Error('compress failed')
              }

              let uploaded: { id: number }
              try {
                uploaded = await upload.mutateAsync(compressed)
              } catch (error) {
                const message = informativeErrorMessage(error, 'enviar a imagem')
                setUploadError(message)
                throw new Error(message)
              }

              field.onChange(uploaded.id)
            }}
            onRemove={() => {
              setUploadError(undefined)
              field.onChange(null)
            }}
          />
        </Field>
      )}
    />
  )
}
