# celeriswebcomponents

Telas compartilhadas entre as aplicações internas da Celeris.

O pacote entrega duas coisas:

- **Primitivos** (`/ui`, `/contexts`, `/lib`) — o design system, para as apps não manterem duas cópias.
- **Módulos** (`/drive`) — telas completas, com dados, formulários e permissões.

---

## Instalação

O pacote vive no GitHub Packages da org, em repositório privado. Três passos: os dois primeiros uma
vez por máquina e por app, o terceiro sempre que trocar de versão.

**1. Token pessoal**, no seu `~/.npmrc` — nunca no repositório:

```
//npm.pkg.github.com/:_authToken=<token do GitHub com escopo read:packages>
```

Sem ele, `yarn install` falha com **401**, não com "pacote não encontrado".

**2. `.npmrc` na raiz da app**, este vai para o git e não contém segredo:

```
@celerisdigital:registry=https://npm.pkg.github.com
```

**3. Dependência no `package.json` da app**, com versão exata:

```json
"@celerisdigital/celeriswebcomponents": "1.0.0"
```

Sem `^`: cada app aponta uma versão e atualiza quando decidir. Atualizar uma app não mexe na outra.

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
| Adicionou prop **opcional** em `DriveSection` | **minor** `1.1.0` | pode usar se quiser |
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

# 2. bump + commit + tag, num comando só
yarn version --patch      # 1.0.0 → 1.0.1
yarn version --minor      # 1.0.0 → 1.1.0
yarn version --major      # 1.0.0 → 2.0.0

# 3. publicar — o workflow .github/workflows/publish.yml roda ao ver a tag
git push --follow-tags
```

Confira na aba **Packages** da org que a versão apareceu antes de seguir.

```bash
# 4. em cada app que quiser a versão nova, uma de cada vez
yarn upgrade @celerisdigital/celeriswebcomponents@1.1.0
```

Não é obrigatório atualizar as duas apps juntas — e é justamente esse o ganho. A d7 pode ir para
`1.1.0` enquanto a trivor fica em `1.0.0`. Se algo quebrar, só uma app está exposta, e o rollback é
voltar o número e rodar `yarn install`.

Uma versão publicada nunca é alterada: para corrigir, publica-se a próxima. O registry recusa
republicar a mesma.

---

## Requisitos da app consumidora

**`next.config.ts`**

```ts
transpilePackages: ['@celerisdigital/celeriswebcomponents'],
```

O pacote publica TypeScript cru; o `transpilePackages` faz o Next compilá-lo junto com a app.
Não é preciso `turbopack.resolveAlias` nem `experimental.externalDir` — os dois só existiam enquanto
as apps consumiam a lib por `file:` (symlink para fora da raiz, com cópias próprias de React).

**`.npmrc` do projeto**, commitado:

```
@celerisdigital:registry=https://npm.pkg.github.com
```

Só o mapeamento do escopo, nunca token. Cada dev coloca o próprio token classic com `read:packages`
no `~/.npmrc` — o README de cada app explica o passo a passo.

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

**Provider**, no layout que envolve as telas:

```tsx
const token = await getAccessToken()

<CelerisProvider token={token} apiBaseUrl={process.env.API_BASE_URL ?? ''}>
  {children}
</CelerisProvider>
```

---

## Deploy da app consumidora

O build de produção roda `yarn install` numa máquina limpa, sem o `~/.npmrc` de ninguém. Sem estes
três ajustes, o GitHub Packages responde `401` e o deploy quebra.

**1. Liberar a app no pacote** — só uma vez, pela UI do GitHub: página do pacote →
*Package settings* → *Manage Actions access* → adicionar o repo da app com role **Read**.

**2. Dockerfile** — o `.npmrc` do projeto entra no `COPY`; o token entra como secret montado:

```dockerfile
# syntax=docker/dockerfile:1

COPY package.json yarn.lock .npmrc ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc yarn install --frozen-lockfile
```

O secret só existe durante aquele `RUN` e não fica em nenhuma camada da imagem. **Nunca** usar
`ARG NPM_TOKEN` + `echo > .npmrc` ou `ENV`: o token fica gravado na imagem e vai junto para o
registry de containers.

**3. Workflow** — o `GITHUB_TOKEN` automático basta, sem PAT nem secret cadastrado:

```yaml
jobs:
  deploy:
    permissions:
      contents: read
      packages: read
    steps:
      - name: Build and push image
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          printf '//npm.pkg.github.com/:_authToken=%s\n' "$NODE_AUTH_TOKEN" > "$RUNNER_TEMP/npmrc"
          docker build -f pipelines/Dockerfile --secret id=npmrc,src="$RUNNER_TEMP/npmrc" -t $IMAGE .
```

O `GITHUB_TOKEN` só consegue ler o pacote porque o passo 1 foi feito. O arquivo em `$RUNNER_TEMP` é
apagado pelo runner ao fim do job.

Referência pronta: `pipelines/Dockerfile` e `.github/workflows/*.yml` do `d7-frontend`.

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
| `/ui` | `Button` `Input` `Select` `MultiSelect` `Table` `Modal` `ConfirmModal` `Field` `Section` `Badge` `Checkbox` `Switch` `Tabs` `Tooltip` `Skeleton` `TableSkeleton` `Pagination` `BackButton` `FileDropzone` `FileTypeIcon` `AttachmentList` `ImageAnalyzer` `CollapsibleCard` `EdgeScroll` `CopyableValue` `TagsInput` `RadioGroup` `CurrencyInput` `PercentInput` `DateInput` `DateRangeInput` `DateRangePicker` `SubtleCard` `HighlightCard` `ImageUploadField` |
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
import { DriveSection, DriveSkeleton } from '@celerisdigital/celeriswebcomponents/drive'
```

### Props de `DriveSection`

| Prop | Tipo | Descrição |
|---|---|---|
| `token` | `string \| undefined` | access token, usado no prefetch server-side |
| `apiBaseUrl` | `string` | base da API no servidor |
| `basePath` | `string` | onde a tela está montada, ex: `/arquivos` |
| `path` | `string \| undefined` | valor do search param `?path=` (breadcrumb) |
| `roles` | `RoleOption[]` | perfis para permissionar pastas; `IRoleFull[]` encaixa por tipagem estrutural |
| `canCreate` | `boolean` | `PERMISSIONS.drive.create` (1700) |
| `canUpdate` | `boolean` | `PERMISSIONS.drive.update` (1701) |
| `canDelete` | `boolean` | `PERMISSIONS.drive.delete` (1702) |

O upload vai **direto do browser para a API** — a API precisa aceitar preflight
`OPTIONS` com `Authorization` para a origem da app.

---

## Módulo: Informativos

```tsx
import {
  InformativesListSection,
  InformativesListSkeleton,
  InformativeCreateSection,
  InformativeEditSection,
  InformativeFormSkeleton,
  InformativesFeedSection,
  InformativesFeedSkeleton,
  InformativesModalQueueSection,
} from '@celerisdigital/celeriswebcomponents/informatives'
```

Cada componente é a tela inteira (título, voltar, ações, filtros, conteúdo). A app monta só o
container da página, o gate de permissão e o `<Suspense>` com o skeleton correspondente:

| Onde | Componente | Props |
|---|---|---|
| gestão (ex: `/gerenciar-informativos`) | `InformativesListSection` | `token`, `apiBaseUrl`, `basePath`, `backFallback`, `roles`, `limit`, `offset`, `title`, `canCreate`, `canUpdate`, `canDelete` |
| `<basePath>/novo` | `InformativeCreateSection` | `basePath`, `roles` |
| `<basePath>/[id]/editar` | `InformativeEditSection` — chama `notFound()` se o id não existe | `token`, `apiBaseUrl`, `basePath`, `roles`, `id` |
| feed (ex: `/informativos`) | `InformativesFeedSection` | `token`, `apiBaseUrl` |
| layout privado, dentro do `CelerisProvider` | `InformativesModalQueueSection` em `<Suspense fallback={null}>` | `token`, `apiBaseUrl` |

`limit` (padrão 10), `offset` e `title` vêm dos search params da página de gestão. O modal de
detalhe usa `?informativeId=`. Criação, edição e exclusão invalidam `['informatives']`; a imagem é
comprimida no browser antes do upload, que vai direto para a API.

---

## Contrato de módulo

Todo módulo exporta a mesma forma, no subpath `celeriswebcomponents/<nome>`:

| Export | Tipo | Papel |
|---|---|---|
| `<Nome>Section` | server component | recebe token + contexto, faz prefetch, desidrata |
| `<Nome>Skeleton` | client component | fallback do `Suspense` |
| `<Nome>Screen` | client component | a tela |

Três regras que mantêm isso extensível:

1. **Módulos nunca importam uns aos outros.** O que um precisa do outro entra por prop.
2. **Os primitivos crescem por acréscimo**, nunca mudando assinatura existente — são consumidos
   pelas apps diretamente, então mexer numa prop é breaking para todo mundo.
3. **Query keys sempre com namespace do módulo** — `['drive', 'folders', id]`.

### Instalar um módulo numa app

A lib entrega componentes. Rota, permissão e menu são decisões da app — um módulo pode ser montado em
qualquer caminho, com ou sem guard, com o nome de menu que a app quiser. Ao instalar:

1. Criar a `page.tsx` na rota escolhida, com `<Suspense>` e o `<Nome>Skeleton` como fallback
2. Passar `basePath` igual à rota onde a página foi criada
3. Decidir o route guard em `proxy.ts` — e se a tela deve mesmo ser guardada
4. Decidir o item de menu na sidebar, com o mesmo critério de permissão do guard
5. Calcular as permissões de ação (`canCreate`, `canUpdate`, `canDelete`) com o `hasPermission` e o
   `enums.ts` da própria app

---

## Verificação

```bash
yarn typecheck
yarn lint
```

Não há testes: o repositório espelha o ferramental do `d7-frontend`.
