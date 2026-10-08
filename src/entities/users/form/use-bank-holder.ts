'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { suggestPixKey } from './pix-suggestion'
import type { ContactValues } from './schemas'
import { useDocumentLookup } from './use-document-lookup'

export function useBankHolder() {
  const { setValue, getValues, clearErrors } = useFormContext<ContactValues>()
  const { loading, lookup } = useDocumentLookup()
  const [ownerLocked, setOwnerLocked] = useState(false)

  function syncPixKey(kind: string, holderDocument: string | undefined) {
    setValue('bankAccount.pix.key', suggestPixKey(kind, {
      holderDocument,
      email: getValues('email'),
      phone: getValues('phone'),
    }))
    clearErrors('bankAccount.pix.key')
  }

  async function onHolderDocumentChange(masked: string) {
    const pixKind = getValues('bankAccount.pix.kind')

    if (pixKind === 'cpf' || pixKind === 'cnpj') syncPixKey(pixKind, masked)

    const result = await lookup(masked)

    if (!result) {
      setOwnerLocked(false)
      return
    }

    setValue('bankAccount.account.accountOwner', result.name)
    clearErrors('bankAccount.account.accountOwner')
    setOwnerLocked(true)
  }

  return { loading, ownerLocked, syncPixKey, onHolderDocumentChange }
}

export type BankHolder = ReturnType<typeof useBankHolder>
