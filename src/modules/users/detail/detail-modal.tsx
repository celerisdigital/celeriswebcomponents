'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { LuBanknote, LuExternalLink, LuGitBranch, LuMapPin, LuPaperclip, LuShield, LuUser } from 'react-icons/lu'
import { Badge, Button, FileTypeIcon, Modal } from '../../../ui'
import { useConfirm } from '../../../contexts/confirm-modal-context'
import { useShowFile } from '../../../contexts/file-preview-context'
import { cn } from '../../../lib/cn'
import { formatCep, formatDate, formatDocument, formatPhone } from '../../../lib/format'
import { useUsersList } from '../context'
import { userErrorMessage } from '../errors'
import { useChangeUserStatus, useSendContract } from '../mutations'
import { useContractStatus, usePermissionCatalog, useUserFiles } from '../queries'
import { CONTRACT_SIGNED, STATUS_MAP, usersStatus } from '../status'
import type { IUser } from '../types'

interface Props {
  user: IUser | null
  onClose: () => void
  roleMap: Record<string, string>
}

function SectionTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
      {icon}
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-700">{children}</span>
    </div>
  )
}

export function UserDetailModal({ user, onClose, roleMap }: Props) {
  const confirm = useConfirm()
  const showFile = useShowFile()
  const { permissions, basePath } = useUsersList()
  const { canUpdate, canAnalyse } = permissions
  const userId = user?.id ?? null
  const files = useUserFiles(userId)
  const catalog = usePermissionCatalog(!!user?.permissions?.length)
  const contract = useContractStatus(userId, canAnalyse)
  const sendContract = useSendContract()
  const changeStatus = useChangeUserStatus()
  const [contractError, setContractError] = useState<string | null>(null)
  const [contractSent, setContractSent] = useState(false)

  const canSendContract = canAnalyse && contract.isSuccess && contract.data?.flowStatus !== CONTRACT_SIGNED
  const status = user ? STATUS_MAP[user.status] : undefined
  const address = user?.data?.address
  const bank = user?.data?.bankAccount
  const fileList = files.data ?? []
  const permById = new Map((catalog.data?.permissions ?? []).map((p) => [p.id, p.name]))
  const allowEffect = catalog.data?.allowEffect

  async function handleSendContract() {
    if (userId === null) return

    setContractError(null)
    setContractSent(false)

    try {
      await sendContract.mutateAsync(userId)
      setContractSent(true)
    } catch (error) {
      setContractError(userErrorMessage(error, 'enviar contrato'))
    }
  }

  function askApprove(target: IUser) {
    confirm({
      title: 'Aprovar cadastro',
      description: `Deseja aprovar o cadastro de "${target.name}"?`,
      confirmLabel: 'Aprovar',
      onConfirm: async () => {
        try {
          await changeStatus.mutateAsync({ id: target.id!, status: usersStatus.active })
        } catch (error) {
          throw new Error(userErrorMessage(error, 'alterar status'))
        }

        onClose()
      },
    })
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={
        <>
          <h2 className="font-semibold text-gray-800 text-base leading-tight">{user?.name}</h2>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </>
      }
      subtitle={user?.email ? <p className="text-sm text-gray-500">{user.email}</p> : undefined}
      footer={
        user && (canUpdate || canAnalyse) ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {canAnalyse && user.status === usersStatus.waitingAprove && (
                <Button size="sm" variant="primary" onClick={() => askApprove(user)}>
                  Aprovar cadastro
                </Button>
              )}
              {canSendContract && (
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="secondary" loading={sendContract.isPending} onClick={handleSendContract}>
                    {sendContract.isPending ? 'Enviando...' : 'Enviar contrato de assinatura'}
                  </Button>
                  {contractError && <span className="text-xs text-red-600">{contractError}</span>}
                  {contractSent && <span className="text-xs text-green-600">Contrato enviado para assinatura.</span>}
                </div>
              )}
            </div>
            {canUpdate && (
              <Link
                href={`${basePath}/${user.id}/editar`}
                className="text-sm font-medium text-foreground hover:underline ml-auto"
              >
                Editar usuário →
              </Link>
            )}
          </div>
        ) : undefined
      }
    >
      {user && (
        <div className="flex flex-col gap-6">
          <section>
            <SectionTitle icon={<LuUser size={14} />}>Informações gerais</SectionTitle>
            <div className="flex flex-col gap-2">
              <Row label="ID">{user.id}</Row>
              <Row label="CPF / CNPJ">{formatDocument(user.document)}</Row>
              <Row label="Perfil">{roleMap[user.role] ?? user.role}</Row>
              {user.data?.phone && <Row label="Telefone">{formatPhone(user.data.phone)}</Row>}
              {user.data?.fantasy && <Row label="Nome fantasia">{user.data.fantasy}</Row>}
              {user.data?.responsibleName && <Row label="Responsável">{user.data.responsibleName}</Row>}
              {user.data?.responsibleDocument && (
                <Row label="Doc. responsável">{formatDocument(user.data.responsibleDocument)}</Row>
              )}
              {user.whiteLabel != null && <Row label="White label">#{user.whiteLabel}</Row>}
              {user.inPlaceId != null && <Row label="In-place ID">#{user.inPlaceId}</Row>}
              {user.mayRedefinePass && <Row label="Redefinição de senha">Permitido</Row>}
              <Row label="Cadastro">{formatDate(user.createdAt)}</Row>
              {user.updatedAt && <Row label="Atualização">{formatDate(user.updatedAt)}</Row>}
              {user.lastLogin && <Row label="Último acesso">{formatDate(user.lastLogin)}</Row>}
            </div>
          </section>

          {address && (
            <section>
              <SectionTitle icon={<LuMapPin size={14} />}>Endereço</SectionTitle>
              <div className="flex flex-col gap-2">
                <Row label="Logradouro">{`${address.street}, ${address.number}`}</Row>
                {address.complement && <Row label="Complemento">{address.complement}</Row>}
                <Row label="Bairro">{address.district}</Row>
                <Row label="Cidade / UF">{`${address.city} — ${address.uf}`}</Row>
                <Row label="CEP">{formatCep(address.cep)}</Row>
              </div>
            </section>
          )}

          {bank && (
            <section>
              <SectionTitle icon={<LuBanknote size={14} />}>Conta bancária</SectionTitle>
              <div className="flex flex-col gap-2">
                {bank.pix?.key && <Row label={`PIX (${bank.pix.kind})`}>{bank.pix.key}</Row>}
                {bank.document && <Row label="Documento">{formatDocument(bank.document)}</Row>}
                {bank.account && (
                  <>
                    <Row label="Banco">{bank.account.bank}</Row>
                    <Row label="Tipo">{bank.account.accountType}</Row>
                    <Row label="Agência">{bank.account.agency}</Row>
                    <Row label="Conta">{`${bank.account.accountNumber}-${bank.account.accountDigit}`}</Row>
                    {bank.account.accountOwner && <Row label="Titular">{bank.account.accountOwner}</Row>}
                  </>
                )}
              </div>
            </section>
          )}

          {user.parents && user.parents.length > 0 && (
            <section>
              <SectionTitle icon={<LuGitBranch size={14} />}>Hierarquia</SectionTitle>
              <div className="flex flex-col gap-2">
                {user.parents.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100"
                  >
                    <span className="text-sm text-gray-700">{p.parentRole}</span>
                    <span className="text-xs text-gray-400">Nível {p.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {files.isError && <p className="text-xs text-red-500">Não foi possível carregar os documentos.</p>}

          {fileList.length > 0 && (
            <section>
              <SectionTitle icon={<LuPaperclip size={14} />}>
                Documentos
                <span className="ml-1.5 text-xs font-normal text-gray-400">({fileList.length})</span>
              </SectionTitle>
              <div className="flex flex-col gap-2">
                {fileList.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => showFile({ ...file, analysis: true })}
                    title="Clique para visualizar"
                    className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-100/50 transition-colors group text-left w-full"
                  >
                    <FileTypeIcon contentType={file.contentType} />
                    <span className="flex-1 text-sm text-gray-700 truncate">{file.filename}</span>
                    <LuExternalLink size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {user.permissions && user.permissions.length > 0 && (
            <section>
              <SectionTitle icon={<LuShield size={14} />}>
                Permissões
                <span className="ml-1.5 text-xs font-normal text-gray-400">({user.permissions.length})</span>
              </SectionTitle>
              <div className="flex flex-col gap-2">
                {user.permissions.map((perm, i) => {
                  const name = permById.get(perm.permission) ?? `Permissão #${perm.permission}`
                  const isAllow = perm.effect === undefined || allowEffect === undefined || perm.effect === allowEffect
                  const range = perm.to !== undefined ? ` (${perm.permission}–${perm.to})` : ` (${perm.permission})`

                  return (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span
                        className={cn(
                          'mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
                          isAllow ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
                        )}
                      >
                        {isAllow ? 'Allow' : 'Deny'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{range}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  )
}
