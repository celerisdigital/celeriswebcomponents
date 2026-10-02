'use client'

import { useState } from 'react'
import type { RoleFull } from '../../../entities/roles/types'
import type { UserOption } from '../../../entities/users/types'

export const BELOW_ME = '__below_me__'

interface Options {
  initialBelowMe?: boolean
  initialParentRoleId?: string
  initialParentUser?: UserOption | null
}

export function useParentSelect({ initialBelowMe = false, initialParentRoleId = '', initialParentUser = null }: Options = {}) {
  const [belowMeChecked, setBelowMeChecked] = useState(initialBelowMe)
  const [selectedParentRoleId, setSelectedParentRoleId] = useState(initialBelowMe ? BELOW_ME : initialParentRoleId)
  const [selectedParentUser, setSelectedParentUser] = useState<UserOption | null>(initialParentUser)

  function handleParentRoleChange(roleId: string) {
    setSelectedParentRoleId(roleId)
    setSelectedParentUser(null)
  }

  function handleBelowMeToggle(checked: boolean, parentRoleOptions: RoleFull[]) {
    setBelowMeChecked(checked)

    if (checked) {
      setSelectedParentRoleId(BELOW_ME)
      setSelectedParentUser(null)
    } else if (parentRoleOptions.length > 0) {
      handleParentRoleChange(parentRoleOptions[0].id)
    } else {
      setSelectedParentRoleId('')
    }
  }

  function resetForRole(myRoleIsParent: boolean, parentRoleOptions: RoleFull[]) {
    setBelowMeChecked(myRoleIsParent)

    if (myRoleIsParent) {
      setSelectedParentRoleId(BELOW_ME)
      setSelectedParentUser(null)
    } else if (parentRoleOptions.length > 0) {
      handleParentRoleChange(parentRoleOptions[0].id)
    } else {
      setSelectedParentRoleId('')
    }
  }

  return {
    belowMeChecked,
    selectedParentRoleId,
    selectedParentUser,
    setSelectedParentUser,
    handleParentRoleChange,
    handleBelowMeToggle,
    resetForRole,
  }
}
