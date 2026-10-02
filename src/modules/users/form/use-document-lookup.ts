'use client'

import { useCallback, useState } from 'react'
import { digitsOnly } from '../../../lib/format'
import { useCnpjLookup } from '../../../lib/document'
import { useCpfLookup } from '../../../entities/users/queries'
import type { DocumentOwner } from '../../../entities/users/types'

export function useDocumentLookup() {
  const lookupCpf = useCpfLookup()
  const lookupCnpj = useCnpjLookup()
  const [loading, setLoading] = useState(false)

  const lookup = useCallback(
    async (document: string): Promise<DocumentOwner | null> => {
      const digits = digitsOnly(document)

      if (digits.length !== 11 && digits.length !== 14) return null

      setLoading(true)

      try {
        if (digits.length === 11) return await lookupCpf(digits)

        const company = await lookupCnpj(digits)

        return company ? { name: company.razaoSocial } : null
      } finally {
        setLoading(false)
      }
    },
    [lookupCpf, lookupCnpj],
  )

  return { loading, lookup }
}
