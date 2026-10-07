# celeriswebcomponents

Telas compartilhadas entre as aplicações internas da Celeris.

O pacote entrega duas coisas:

- **Primitivos** (`/ui`, `/contexts`, `/lib`) — o design system, para as apps não manterem duas cópias.
- **Módulos** (`/drive`, `/informatives`, `/users`, `/profile`) — páginas completas, com dados, formulários e permissões.

---

## Instalação

O repositório é público e a app instala direto dele, pela tag — sem token, sem `.npmrc`:

```json
"@celerisdigital/celeriswebcomponents": "github:celerisdigital/celeriswebcomponents#v2.0.0"
```

Sempre uma tag fixa: cada app aponta uma versão e atualiza quando decidir. Atualizar uma app não mexe
na outra.

---

## Desenvolvimento

Quem está alterando a lib roda o watch a partir daqui; as apps rodam `next dev` normal e não precisam
de script nenhum.

```bash
# na lib
cp dev-targets.example.json dev-targets.json   # só na primeira vez, ajuste os caminhos
yarn dev

# em cada app, em outro terminal
yarn dev
```

`yarn dev` na lib copia o diretório de trabalho para dentro de
`node_modules/@celerisdigital/celeriswebcomponents` de cada app listada, e continua copiando a cada
save. O Fast Refresh da app funciona normalmente.

O `dev-targets.json` é pessoal e não vai para o git. Aceita caminho relativo a esta pasta
(`../d7-frontend`), absoluto Linux/macOS (`/home/usuario/projetos/d7-frontend`) e absoluto Windows
(`C:/Users/usuario/projetos/d7-frontend`). **Use sempre barra normal** — em JSON, `\` é escape, então
o formato nativo do Windows só funciona escrito `C:\\Users\\...`.

É copiado tudo que o `.gitignore` não exclui, commitado ou não — um arquivo recém-criado é entregue
normalmente. Rodar `yarn install` numa app restaura a versão publicada e desfaz a cópia; é só rodar
`yarn dev` de novo.

### Por que cópia e não `yarn link`

`yarn link` **não funciona**. O Turbopack não resolve módulos através de link para fora da raiz do
projeto — nem junction (o que o yarn 1 cria no Windows), nem symlink real, nem com
`experimental.externalDir: true`. Testado em Next 16.2.4.

---

## Publicando uma versão

Publicar não é o que se faz para testar — o `yarn dev` acima cobre o desenvolvimento inteiro.
Publicar é congelar uma entrega, normalmente quando a app que consome vai para produção.

### Qual bump

A pergunta que decide: **se a outra app trocar só o número da versão e rodar `yarn install`, o que
acontece com ela?**

| O que você mudou | Bump | O que a outra app sente |
|---|---|---|
| Corrigiu um bug no upload do drive | **patch** `1.0.1` | nada, só passa a funcionar certo |
| Ajustou espaçamento, cor, texto de erro | **patch** `1.0.1` | nada |
| Refatorou o interior de um primitivo sem mudar props | **patch** `1.0.1` | nada |
| Criou um módulo novo (`/relatorios`) | **minor** `1.1.0` | ganha um módulo; se não importar, nada muda |
| Adicionou prop **opcional** em `DrivePage` | **minor** `1.1.0` | pode usar se quiser |
| Adicionou export novo no `index.ts` de um módulo | **minor** `1.1.0` | pode usar se quiser |
| Adicionou prop **obrigatória** | **major** `2.0.0` | não compila até passar a prop |
| Renomeou ou removeu uma prop | **major** `2.0.0` | quebra onde usava |
| Mudou o formato de uma prop (`roles: RoleOption[]` → objeto) | **major** `2.0.0` | quebra |
| Renomeou o subpath (`/drive` → `/arquivos`) | **major** `2.0.0` | o import para de resolver |
| Passou a exigir uma CSS var ou provider novo | **major** `2.0.0` | quebra visual ou em runtime |

Na dúvida entre minor e major, é major. O custo de um major desnecessário é trocar um número; o de um
major disfarçado de minor é alguém descobrir em produção.

### O fluxo

```bash
# 1. na lib, com tudo commitado e o working tree limpo
yarn typecheck
yarn lint

# 2. bump do "version" no package.json + commit
# 3. tag igual ao version, e push dela
git tag v1.1.0
git push origin master v1.1.0
```

Em cada app que quiser a versão nova, uma de cada vez: trocar o sufixo `#v1.1.0` no `package.json` e
rodar `yarn install`.

Não é obrigatório atualizar as duas apps juntas — e é justamente esse o ganho. A d7 pode ir para
`v1.1.0` enquanto a trivor fica em `v1.0.0`. Se algo quebrar, só uma app está exposta, e o rollback é
voltar a tag e rodar `yarn install`.

Tag publicada não se move: para corrigir, cria-se a próxima.

---

## Requisitos da app consumidora

**`next.config.ts`**

```ts
transpilePackages: ['@celerisdigital/celeriswebcomponents'],
```

O pacote publica TypeScript cru; o `transpilePackages` faz o Next compilá-lo junto com a app.
Não é preciso `turbopack.resolveAlias` nem `experimental.externalDir` — os dois só existiam enquanto
as apps consumiam a lib por `file:` (symlink para fora da raiz, com cópias próprias de React).

**`globals.css`**

```css
@source "../../node_modules/@celerisdigital/celeriswebcomponents/src";
```

Sem isso o Tailwind não gera as classes usadas dentro do pacote.

**CSS custom properties** que o pacote consome: `--primary`, `--primary-foreground`,
`--primary-hover`, `--brand`, `--brand-foreground`, `--brand-hover`, `--background`,
`--foreground`, `--radius`.

**Peer dependencies:** `react`, `react-dom`, `next` e `@tanstack/react-query` são
instaladas pela app. Todas as apps consumidoras devem estar na mesma major de `next`
e `react` — o pacote publica TypeScript cru e é compilado pelo toolchain de cada app.

**Config**, uma vez por app, num arquivo só de servidor:

```ts
// src/lib/celeris-config.ts
import 'server-only'
import { defineCelerisConfig } from '@celerisdigital/celeriswebcomponents/server'
import { getAccessToken } from '@/lib/session'

export const celerisConfig = defineCelerisConfig({
  apiBaseUrl: process.env.API_BASE_URL ?? '',
  apiPublicUrl: process.env.API_PUBLIC_URL ?? '',
  getToken: getAccessToken,
})
```

`apiBaseUrl` é a URL que o servidor Next usa; `apiPublicUrl`, a que o browser usa. `getToken` é
chamado por request (a lib envolve em `cache()` do React, então o cookie é lido uma vez).

**Provider**, no layout que envolve as telas:

```tsx
<CelerisProvider config={celerisConfig}>{children}</CelerisProvider>
```

---

## Deploy da app consumidora

Nada de especial: o `yarn install` do build baixa a lib pelo git, pela tag do `package.json` — sem
secret, sem `--mount`, sem permissão de pacote. Referência: `pipelines/Dockerfile` do `d7-frontend`.

---

## Primitivos

O design system vive aqui, e é a única fonte. Uma app que mantém a própria cópia de um primitivo
volta a divergir — foi o que aconteceu entre d7 e trivor antes desta lib.

```tsx
import { Button, Input, Select, Table, Modal } from '@celerisdigital/celeriswebcomponents/ui'
import { useConfirm, useToast, useShowFile } from '@celerisdigital/celeriswebcomponents/contexts'
import { cn, formatDocument, maskCPF } from '@celerisdigital/celeriswebcomponents/lib'
```

| Subpath | O que traz |
|---|---|
| `/ui` | `Button` `Input` `Select` `MultiSelect` `Table` `SortableList` `Modal` `ConfirmModal` `Field` `Section` `Badge` `Checkbox` `Switch` `Tabs` `Tooltip` `Skeleton` `TableSkeleton` `Pagination` `BackButton` `FileDropzone` `FileTypeIcon` `AttachmentList` `ImageAnalyzer` `CollapsibleCard` `EdgeScroll` `CopyableValue` `TagsInput` `RadioGroup` `CurrencyInput` `PercentInput` `DateInput` `DateRangeInput` `DateRangePicker` `SubtleCard` `HighlightCard` `ImageUploadField` |
| `/contexts` | `ConfirmModalProvider`/`useConfirm`, `ToastProvider`/`useToast`, `FilePreviewProvider`/`useShowFile`, `NavLoadingProvider`/`useNavLoading`/`NavLoadingBar` |
| `/lib` | `cn`, `extractErrorMessage`, `useBack`, `useQueryModal`, `compressImage`, e o `format` completo (`formatCurrency`, `formatDocument`, `maskCPF`, `maskCNPJ`, `maskPhone`, `maskCEP`, `formatDate…`) |
| `/rich-text` | `RichTextEditor`, `RichTextContent`, `isRichTextEmpty`, `sanitizeRichText`, `toEditorContent` — os estilos vêm junto com os componentes; traz as dependências `@tiptap/*` e `isomorphic-dompurify`, por isso fica fora do `/ui` |

**Cores saem de token, nunca de hex.** Os primitivos usam `bg-brand`, `text-brand-foreground`,
`bg-primary` — cada app resolve para a própria identidade pelas CSS vars do seu `globals.css`.
Hex literal num primitivo faz as duas apps ficarem com a cor de uma delas.

Fora do pacote de propósito: `conflict-banner` e `stepper` (só no trivor).

---

## Módulo: Arquivos

```tsx
// app/(private)/arquivos/page.tsx
import { DrivePage } from '@celerisdigital/celeriswebcomponents/drive'

const drivePermissions = celerisPermissions({
  canCreate: PERMISSIONS.drive.create,
  canUpdate: PERMISSIONS.drive.update,
  canDelete: PERMISSIONS.drive.delete,
})

export default function ArquivosPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  return <DrivePage config={celerisConfig} permissions={drivePermissions} basePath="/arquivos" searchParams={searchParams} />
}
```

| Prop | Tipo | Descrição |
|---|---|---|
| `config` | `CelerisConfig` | o `celerisConfig` da app |
| `permissions` | `() => Promise<DrivePermissions>` | `canCreate`, `canUpdate`, `canDelete` |
| `basePath` | `string` | onde a tela está montada |
| `searchParams` | `Promise<{ path?: string }>` | o `searchParams` da page, sem `await` |

O upload vai **direto do browser para a API** — a API precisa aceitar preflight
`OPTIONS` com `Authorization` para a origem da app.

---

## Módulo: Informativos

```tsx
import {
  InformativesListPage,
  InformativeCreatePage,
  InformativeEditPage,
  InformativesFeedPage,
  InformativesModals,
  type InformativesPermissions,
} from '@celerisdigital/celeriswebcomponents/informatives'
```

| Onde | Componente | Props além de `config` |
|---|---|---|
| gestão (ex: `/gerenciar-informativos`) | `InformativesListPage` | `permissions`, `basePath`, `backFallback`, `deniedRedirect`, `searchParams` |
| `<basePath>/novo` | `InformativeCreatePage` | `permissions`, `basePath` |
| `<basePath>/[id]/editar` | `InformativeEditPage` | `permissions`, `basePath`, `params` |
| feed (ex: `/informativos`) | `InformativesFeedPage` | — |
| layout privado, dentro do `CelerisProvider` | `InformativesModals` | — (já traz o próprio `Suspense`) |

Cada Page pede só as permissões que usa: a gestão, `{ canRead, canCreate, canUpdate, canDelete }`; novo,
`{ canCreate }`; editar, `{ canUpdate }`. Sem `canRead` a gestão redireciona
para `deniedRedirect`; sem `canCreate`/`canUpdate`, novo/editar voltam para `basePath`. Esses redirects são
rede de segurança — o guard de rota da app continua sendo a primeira barreira.

A gestão tem duas seções: **ativos e agendados**, sem paginação e reordenáveis por arraste (ou ↑/↓ na alça)
com `canUpdate` e sem busca ativa; e **expirados**, paginados por `limit`/`offset`. A ordem vale para o feed
e para a fila de modais. O detalhe usa `?informativeId=`. A imagem é comprimida no browser antes do upload,
que vai direto para a API.

---

## Módulo: Usuários

```tsx
import {
  UsersPage,
  UserCreatePage,
  UserEditPage,
  UserBlockRulesPage,
  ImpersonationBanner,
  ImpersonationOverlay,
  type UsersPermissions,
} from '@celerisdigital/celeriswebcomponents/users'
```

| Onde | Componente | Props além de `config` |
|---|---|---|
| gestão (ex: `/usuarios`) | `UsersPage` | `permissions`, `basePath`, `whiteLabelPath?`, `backFallback`, `deniedRedirect`, `searchParams` |
| `<basePath>/novo` | `UserCreatePage` | `permissions`, `basePath`, `deniedRedirect` |
| `<basePath>/[id]/editar` | `UserEditPage` | `permissions`, `basePath`, `deniedRedirect`, `params` |
| `<basePath>/regras-bloqueio` | `UserBlockRulesPage` | `permissions`, `basePath`, `deniedRedirect` |
| layout privado | `ImpersonationOverlay` | `impersonating` |
| layout privado, com a sessão personificada | `ImpersonationBanner` | `userName`, `roleName?`, `startedAt?`, `exitPath` |

Cada Page pede só as chaves de `UsersPermissions` que usa (`UsersListPermissions`, `UserCreatePermissions`,
`UserEditPermissions`, `UserBlockRulesPermissions`). `whiteLabelPath` é opcional: sem ele, o atalho de white
label da tabela some. Precisa dos adaptadores `session` (assumir e sair da identidade) e `downloads`
(exportar xlsx) — ver "Adaptadores". Quem está logado (id, perfil, nível, personificação) a lib lê do token.

---

## Módulo: Perfil

```tsx
import { ProfilePage } from '@celerisdigital/celeriswebcomponents/profile'
```

| Onde | Componente | Props além de `config` |
|---|---|---|
| meu perfil (ex: `/perfil`) | `ProfilePage` | `deniedRedirect` |

Sem `permissions`: todo usuário logado edita o próprio perfil. Os dados vêm de `GET /users/auth/me`; as seções
visíveis (contato, endereço, dados bancários, dados complementares de PJ) vêm do `config` do perfil de quem está
logado. Salvar faz `PATCH /users/me` e `router.refresh()`, para o layout da app pegar o nome novo. Sem token
válido, ou se `/users/auth/me` falhar, redireciona para `deniedRedirect`.

---

## Contrato de módulo

Todo módulo exporta a mesma forma, no subpath `celeriswebcomponents/<nome>`:

| Export | Tipo | Papel |
|---|---|---|
| `<Nome>Page` | server component síncrono | a página inteira: título e navegação na hora, dados em `Suspense` |
| `<Nome>Permissions` | tipo | o que o resolver de permissões da app devolve |

Regras:

1. **Página recebe `config`, `permissions` (função), props de rota e `searchParams`/`params` do Next sem
   `await`.** Nunca token, URL ou lista de domínio compartilhado (perfis) por prop — a lib busca.
2. **Título e navegação fora do `Suspense`**; dados e o que depende de permissão dentro.
3. **Módulos nunca importam uns aos outros.** Dado compartilhado vive fora dos módulos, em `src/entities`
   (perfis, opções de usuário). Entidade nunca importa módulo; entidade pode usar outra entidade, sem ciclo.
4. **Os primitivos crescem por acréscimo**, nunca mudando assinatura existente — são consumidos
   pelas apps diretamente, então mexer numa prop é breaking para todo mundo.
5. **Query keys sempre com namespace** — `['drive', 'folders', id]`, `['roles', 'full']`.

### Instalar um módulo numa app

A lib entrega componentes. Rota, permissão e menu são decisões da app — um módulo pode ser montado em
qualquer caminho, com ou sem guard, com o nome de menu que a app quiser. Ao instalar:

1. Criar a `page.tsx` na rota escolhida, renderizando só a `<Nome>Page` com o `celerisConfig`
2. Passar `basePath` igual à rota onde a página foi criada
3. Decidir o route guard em `proxy.ts` — e se a tela deve mesmo ser guardada
4. Decidir o item de menu na sidebar, com o mesmo critério de permissão do guard
5. Passar as permissões que a Page pede, com os códigos do `enums.ts` da própria app — no d7, via o
   helper `celerisPermissions({ canCreate: PERMISSIONS.x.create })` do `celeris-config.ts`, declarado na
   própria page

---

## Adaptadores

Alguns módulos precisam de algo que só a app sabe fazer. A lib declara a porta (`CelerisAdapters`) e a app
pluga a implementação **uma vez**, num client component dentro do `CelerisProvider`:

```tsx
'use client'

import { useMemo, type ReactNode } from 'react'
import { CelerisAdaptersProvider } from '@celerisdigital/celeriswebcomponents/adapters'

export function AppCelerisAdapters({ children }: { children: ReactNode }) {
  const { startProcessing } = useDownloadNotification()
  const adapters = useMemo(
    () => ({
      session: { assumeIdentity: assumeIdentityAction, exitIdentity: exitImpersonationAction, homePath: '/dashboard' },
      downloads: { started: startProcessing },
    }),
    [startProcessing],
  )

  return <CelerisAdaptersProvider adapters={adapters}>{children}</CelerisAdaptersProvider>
}
```

| Adaptador | Quem usa | Contrato |
|---|---|---|
| `session` | usuários — assumir e sair da identidade | `assumeIdentity(targetUserId)` e `exitIdentity()` são server actions da app: chamam a API e gravam os cookies. `homePath` é o destino depois de assumir |
| `downloads` | usuários — exportar xlsx | `started(downloadId)` entrega o id à central de downloads da app |

Adaptador ausente lança erro dizendo qual falta. A sessão é da app: o refresh token nunca passa pela lib.

---

## Verificação

```bash
yarn typecheck
yarn lint
```

Não há testes: o repositório espelha o ferramental do `d7-frontend`.
