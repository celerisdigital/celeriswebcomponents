// Por quanto tempo um dado buscado vale sem nova requisição, por camada — mesmas camadas das apps consumidoras.
// Nenhum staleTime solto em hook: sempre STALE_TIME.<camada>.
export const STALE_TIME = {
  /** Perfis: admins mudam raramente */
  reference: 60 * 60 * 1000,
  /** Informativos, usuários, arquivos: poucos admins mudam */
  administrative: 5 * 60 * 1000,
  /** Dado que vários operadores e o backend mudam o tempo todo */
  operational: 30 * 1000,
  /** Socket ou polling pede a recarga; o cache só serve para a volta à tela */
  realtime: 0,
} as const
