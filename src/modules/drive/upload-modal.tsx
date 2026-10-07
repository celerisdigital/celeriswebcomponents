'use client'

import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { LuCheck, LuCircleAlert, LuLoader, LuPlus, LuTrash2, LuTriangleAlert } from 'react-icons/lu'
import { Button, Field, Input, Modal, MultiSelect, RadioGroup } from '../../ui'
import { useToast } from '../../contexts/toast-context'
import type { RoleOption } from '../../types'
import { extractErrorMessage } from '../../lib/errors'
import { useUpdateDriveFile, useUploadDriveFile } from './mutations'

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

export interface DriveUploadEntry {
  id: string
  file: File
  name: string
  status: 'queued' | 'uploading' | 'done' | 'error'
  error?: string
}

export interface DriveParentVisibility {
  isPublic: boolean
  roles: string[] | null
}

interface Props {
  open: boolean
  entries: DriveUploadEntry[]
  setEntries: Dispatch<SetStateAction<DriveUploadEntry[]>>
  folderId?: number
  /** Visibilidade da pasta atual — usada só pra sugerir o valor inicial do envio. */
  parentVisibility?: DriveParentVisibility
  roles: RoleOption[]
  onAddFiles: (files: File[]) => void
  onClose: () => void
  onSuccess: () => void
}

export function UploadModal({ open, entries, setEntries, folderId, parentVisibility, roles, onAddFiles, onClose, onSuccess }: Props) {
  const toast = useToast()
  const uploadFile = useUploadDriveFile()
  const updateFile = useUpdateDriveFile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function suggestedVisibility(): 'public' | 'private' {
    return parentVisibility?.isPublic ? 'public' : 'private'
  }
  function suggestedRoles(): string[] {
    return parentVisibility && !parentVisibility.isPublic ? (parentVisibility.roles ?? []) : []
  }

  const [visibility, setVisibility] = useState<'public' | 'private'>(suggestedVisibility())
  const [selectedRoles, setSelectedRoles] = useState<string[]>(suggestedRoles())
  const [submitting, setSubmitting] = useState(false)

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  function pickMoreFiles() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onAddFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  function renameEntry(id: string, name: string) {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, name } : entry)))
  }

  function reset() {
    setVisibility(suggestedVisibility())
    setSelectedRoles(suggestedRoles())
    setSubmitting(false)
  }

  function handleClose() {
    if (submitting) return
    reset()
    onClose()
  }

  async function submit() {
    if (entries.length === 0) {
      toast('Selecione ao menos um arquivo.', { variant: 'warning' })
      return
    }
    setSubmitting(true)

    let hadError = false
    for (const entry of entries) {
      if (entry.file.size > MAX_UPLOAD_BYTES) {
        hadError = true
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: 'error', error: 'Acima de 100 MB.' } : e)))
        continue
      }

      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: 'uploading', error: undefined } : e)))

      const formData = new FormData()
      formData.append('file', entry.file)
      formData.append('isPublic', String(visibility === 'public'))
      if (folderId !== undefined) formData.append('folderId', String(folderId))

      let uploadedId: number | undefined
      try {
        const uploaded = await uploadFile.mutateAsync(formData)
        uploadedId = uploaded.id
      } catch (error) {
        hadError = true
        const message = extractErrorMessage(error, 'Falha ao enviar.')
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: 'error', error: message } : e)))
        continue
      }

      if (uploadedId === undefined) {
        hadError = true
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: 'error', error: 'Falha ao enviar.' } : e)))
        continue
      }

      const nameChanged = entry.name.trim() !== entry.file.name
      const needsRolesUpdate = visibility === 'private' && selectedRoles.length > 0
      if (nameChanged || needsRolesUpdate) {
        try {
          await updateFile.mutateAsync({
            id: uploadedId,
            name: nameChanged ? entry.name.trim() : undefined,
            roles: needsRolesUpdate ? selectedRoles : undefined,
          })
        } catch (error) {
          hadError = true
          const message = extractErrorMessage(error, 'Erro ao atualizar o arquivo.')
          setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: 'error', error: message } : e)))
          continue
        }
      }

      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: 'done' } : e)))
    }

    setSubmitting(false)

    if (hadError) {
      toast('Alguns arquivos não puderam ser enviados.', { variant: 'error' })
      return
    }

    toast('Arquivos enviados com sucesso.', { variant: 'success' })
    reset()
    onSuccess()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={<span className="font-semibold text-gray-800">Enviar arquivos</span>}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />

        <button
          type="button"
          onClick={pickMoreFiles}
          disabled={submitting}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center text-sm text-gray-500 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <LuPlus size={16} />
          Adicionar mais arquivos
        </button>

        {entries.length > 0 && (
          <ul className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <StatusIcon status={entry.status} />
                <Input
                  value={entry.name}
                  onChange={(e) => renameEntry(entry.id, e.target.value)}
                  disabled={submitting}
                  maxLength={120}
                  className="flex-1"
                />
                {entry.status === 'error' && entry.error && (
                  <span className="text-xs text-red-500 max-w-32 truncate" title={entry.error}>
                    {entry.error}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-md transition-colors disabled:opacity-50 shrink-0"
                  aria-label="Remover"
                >
                  <LuTrash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Field
          label="Visibilidade (aplicada a todos os arquivos deste envio)"
          asDiv
        >
          {parentVisibility && (
            <p className="text-xs text-gray-400 mb-2">
              Sugerido com base na visibilidade da pasta atual — ajuste se quiser.
            </p>
          )}
          <RadioGroup
            value={visibility}
            onChange={setVisibility}
            disabled={submitting}
            options={[
              { value: 'public', label: 'Público', description: 'Qualquer usuário logado pode ver e baixar.' },
              { value: 'private', label: 'Privado', description: 'Só os perfis selecionados podem ver.' },
            ]}
          />
        </Field>

        <div className="flex items-start gap-2 bg-amber-50 text-amber-700 rounded-lg px-3 py-2">
          <LuTriangleAlert size={15} className="shrink-0 mt-px" />
          <p className="text-xs">A visibilidade escolhida acima não poderá ser alterada depois do envio.</p>
        </div>

        {visibility === 'private' && (
          <Field label="Perfis com acesso" asDiv>
            <MultiSelect
              options={roleOptions}
              value={selectedRoles}
              onChange={setSelectedRoles}
              autocomplete
              disabled={submitting}
              placeholder="Selecione os perfis..."
            />
          </Field>
        )}

        <div className="flex items-center gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} loading={submitting} disabled={entries.length === 0}>
            {submitting ? 'Enviando...' : `Enviar (${entries.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function StatusIcon({ status }: { status: DriveUploadEntry['status'] }) {
  switch (status) {
    case 'uploading':
      return <LuLoader size={16} className="animate-spin text-gray-400 shrink-0" />
    case 'done':
      return <LuCheck size={16} className="text-green-500 shrink-0" />
    case 'error':
      return <LuCircleAlert size={16} className="text-red-500 shrink-0" />
    default:
      return <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
  }
}
