export const driveKeys = {
  all: ['drive'] as const,
  folders: (parentFolderId: number | undefined) => ['drive', 'folders', parentFolderId ?? null] as const,
  files: (folderId: number | undefined) => ['drive', 'files', folderId ?? null] as const,
}

export const informativeKeys = {
  all: ['informatives'] as const,
  list: (query: { limit: number; offset: number; title?: string; status?: 'current' | 'expired' }) =>
    ['informatives', 'list', query] as const,
  active: ['informatives', 'active'] as const,
}

export const roleKeys = {
  full: ['roles', 'full'] as const,
}

export const userKeys = {
  all: ['users'] as const,
  lists: ['users', 'list'] as const,
  list: (query: object) => ['users', 'list', query] as const,
  trees: ['users', 'tree'] as const,
  tree: (parentId: number) => ['users', 'tree', parentId] as const,
  details: ['users', 'detail'] as const,
  detail: (id: number) => ['users', 'detail', id] as const,
  files: (id: number) => ['users', 'files', id] as const,
  chain: (id: number) => ['users', 'chain', id] as const,
  contractStatus: (id: number) => ['users', 'contract-status', id] as const,
  permissionCatalog: ['users', 'permission-defs'] as const,
  financeLevels: ['users', 'finance-levels'] as const,
  blockRules: ['users', 'block-rules'] as const,
  optionsByRole: (roleId: string) => ['users', 'options', 'role', roleId] as const,
  optionsSearch: (roleId: string | null, search: string) => ['users', 'options', 'search', roleId, search] as const,
  document: (cpf: string) => ['users', 'document', cpf] as const,
}

export const addressKeys = {
  cep: (digits: string) => ['address', 'cep', digits] as const,
}

export const documentKeys = {
  cnpj: (digits: string) => ['document', 'cnpj', digits] as const,
}
