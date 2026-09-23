import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync, rmSync, statSync, watch } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGE_PATH = join('node_modules', '@celerisdigital', 'celeriswebcomponents')
const TARGETS_FILE = join(LIB_ROOT, 'dev-targets.json')
const SKIPPED_ROOTS = ['.git', 'node_modules']
const TEMP_FILE = /\.tmp\.\d+\./

function fail(message) {
  console.error(`[cwc] ${message}`)
  process.exit(1)
}

function readTargets() {
  if (!existsSync(TARGETS_FILE)) {
    fail(
      'dev-targets.json não encontrado.\n' +
        '[cwc] copie dev-targets.example.json para dev-targets.json e ajuste os caminhos.',
    )
  }

  let parsed
  try {
    parsed = JSON.parse(readFileSync(TARGETS_FILE, 'utf8'))
  } catch {
    fail('dev-targets.json não é um JSON válido. No Windows, use barra normal: C:/Users/...')
  }

  if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
    fail('dev-targets.json deve ser uma lista de caminhos. Veja dev-targets.example.json.')
  }

  const targets = []

  for (const entry of parsed) {
    const appRoot = resolve(LIB_ROOT, entry)
    const packageRoot = join(appRoot, PACKAGE_PATH)

    if (!existsSync(appRoot)) {
      console.warn(`[cwc] ignorado, caminho não existe: ${appRoot}`)
      continue
    }

    if (!existsSync(packageRoot)) {
      console.warn(`[cwc] ignorado, a app não instalou a lib: ${appRoot}`)
      continue
    }

    targets.push({ appRoot, packageRoot })
  }

  if (targets.length === 0) fail('nenhum destino utilizável em dev-targets.json.')

  return targets
}

function isSkipped(file) {
  const [root] = file.split('/')

  return SKIPPED_ROOTS.includes(root) || TEMP_FILE.test(file)
}

function listFiles() {
  const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: LIB_ROOT,
    encoding: 'utf8',
  })

  return output.split('\n').filter((file) => file && !isSkipped(file))
}

function isIgnored(file) {
  try {
    execFileSync('git', ['check-ignore', '-q', '--', file], { cwd: LIB_ROOT })
    return true
  } catch {
    return false
  }
}

function toParts(file) {
  return file.split('/')
}

function copyFile(file, targets) {
  for (const { packageRoot } of targets) {
    cpSync(join(LIB_ROOT, ...toParts(file)), join(packageRoot, ...toParts(file)), {
      recursive: true,
    })
  }
}

function removeFile(file, targets) {
  for (const { packageRoot } of targets) {
    rmSync(join(packageRoot, ...toParts(file)), { recursive: true, force: true })
  }
}

function syncAll(targets) {
  const files = listFiles()

  for (const file of files) copyFile(file, targets)

  console.log(`[cwc] ${files.length} arquivos enviados para ${targets.length} app(s)`)
}

function handleChange(file, targets) {
  if (isSkipped(file) || isIgnored(file)) return

  const source = join(LIB_ROOT, ...toParts(file))
  const stamp = new Date().toLocaleTimeString()

  if (!existsSync(source)) {
    removeFile(file, targets)
    console.log(`[cwc] ${stamp} removido ${file}`)
    return
  }

  if (statSync(source).isDirectory()) return

  copyFile(file, targets)
  console.log(`[cwc] ${stamp} ${file}`)

  if (file === 'package.json') {
    console.warn('[cwc] package.json mudou — se há dependência nova, rode yarn install nas apps')
  }
}

function watchLib(targets) {
  const pending = new Set()
  let timer

  watch(LIB_ROOT, { recursive: true }, (_event, filename) => {
    if (!filename) return

    pending.add(filename.split(/[\\/]/).join('/'))
    clearTimeout(timer)
    timer = setTimeout(() => {
      const files = [...pending]
      pending.clear()

      for (const file of files) handleChange(file, targets)
    }, 120)
  })
}

const targets = readTargets()

for (const { appRoot } of targets) console.log(`[cwc] destino: ${appRoot}`)

syncAll(targets)
watchLib(targets)
console.log('[cwc] observando alterações. Ctrl+C para sair.')
