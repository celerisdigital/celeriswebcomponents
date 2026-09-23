/**
 * Mínimo estrutural de um perfil. A app passa seu `IRoleFull[]` sem cast —
 * os módulos consomem apenas `id` e `name`.
 */
export interface RoleOption {
  id: string
  name: string
}
