/**
 * One-shot patcher: wire Urdu BRIEF/HUD + t('backToModule') into modules 2–8 games.
 * Run: node scripts/wire-urdu-games.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('src/games')
const modules = [2, 3, 4, 5, 6, 7, 8]

const GAME_ID_FROM_FOLDER = {
  'password-strength-cracker': 'password-strength-cracker',
  'mfa-gatekeeper': 'mfa-gatekeeper',
  'account-hijack-simulator': 'account-hijack-simulator',
  'safe-share-decision-engine': 'safe-share-decision-engine',
  'permission-matrix-sorter': 'permission-matrix-sorter',
  'search-poisoning-inspector': 'search-poisoning-inspector',
  'domain-spotter': 'domain-spotter',
  'fake-login-destroyer': 'fake-login-destroyer',
  'extension-popup-cleaner': 'extension-popup-cleaner',
  'parking-lot-bait': 'parking-lot-bait',
  'threat-type-categorizer': 'threat-type-categorizer',
  'patch-software-auditor': 'patch-software-auditor',
  'critical-incident-protocol': 'critical-incident-protocol',
  'permission-auditor-blitz': 'permission-auditor-blitz',
  'smishing-text-detective': 'smishing-text-detective',
  'wireless-risk-analyzer': 'wireless-risk-analyzer',
  'privacy-indicator-tracker': 'privacy-indicator-tracker',
  'office-desk-inspection': 'office-desk-inspection',
  'doorway-defender': 'doorway-defender',
  'impostor-spotter': 'impostor-spotter',
  'vishing-public-shield': 'vishing-public-shield',
  'classification-sorter': 'classification-sorter',
  'channel-guard': 'channel-guard',
  'screenshot-inspector': 'screenshot-inspector',
  'privacy-incident-response': 'privacy-incident-response',
  'first-responder': 'first-responder',
  'soc-incident-hotline': 'soc-incident-hotline',
  'pitfall-challenge': 'pitfall-challenge',
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('Game.jsx')) out.push(full)
  }
  return out
}

function gameIdFromPath(file) {
  const parts = file.split(path.sep)
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (GAME_ID_FROM_FOLDER[parts[i]]) return GAME_ID_FROM_FOLDER[parts[i]]
  }
  return null
}

function ensureImport(src, statement) {
  if (src.includes(statement)) return src
  const lines = src.split('\n')
  let lastImport = -1
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith('import ')) lastImport = i
  }
  if (lastImport === -1) return `${statement}\n${src}`
  lines.splice(lastImport + 1, 0, statement)
  return lines.join('\n')
}

function patchFile(file) {
  const gameId = gameIdFromPath(file)
  if (!gameId) return false
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('BRIEFS_UR') && src.includes("t('backToModule')")) return false

  const hasUseMemo = /\buseMemo\b/.test(src) || src.includes('useMemo')
  const reactImport = src.match(/import\s*\{([^}]+)\}\s*from\s*['"]react['"]/)
  if (reactImport) {
    const names = reactImport[1].split(',').map((s) => s.trim()).filter(Boolean)
    if (!names.includes('useMemo')) names.push('useMemo')
    if (!names.includes('useLanguage') && !src.includes('useLanguage')) {
      // keep react import only
    }
    src = src.replace(reactImport[0], `import { ${names.join(', ')} } from 'react'`)
  } else if (!hasUseMemo) {
    src = ensureImport(src, "import { useMemo } from 'react'")
  }

  src = ensureImport(src, "import { useLanguage } from '../../../i18n/LanguageContext'")
  src = ensureImport(src, "import { BRIEFS_UR, HUD_UR } from '../../../i18n/briefs.ur'")
  src = ensureImport(src, "import { pickLines } from '../../../i18n/pick'")

  // Inject hooks at start of default export function body
  const fnRe = /export default function (\w+)\(\{ onExit \}\) \{\n/
  if (fnRe.test(src) && !src.includes(`GAME_ID = '${gameId}'`)) {
    src = src.replace(
      fnRe,
      `export default function $1({ onExit }) {\n  const { t, isUr } = useLanguage()\n  const GAME_ID = '${gameId}'\n  const briefLines = useMemo(() => pickLines(isUr, BRIEFS_UR[GAME_ID], BRIEF), [isUr])\n  const hud = isUr && HUD_UR[GAME_ID] ? HUD_UR[GAME_ID] : null\n`,
    )
  }

  // CyberSplash lines={BRIEF} -> lines={briefLines}
  src = src.replace(/lines=\{BRIEF\}/g, 'lines={briefLines}')

  // CyberHud title="..." status="..." — replace with hud-aware expressions when simple string props
  src = src.replace(
    /<CyberHud title="([^"]+)" score=\{([^}]+)\} onExit=\{onExit\} status="([^"]+)"/g,
    '<CyberHud title={hud?.title ?? "$1"} score={$2} onExit={onExit} status={hud?.status ?? "$3"}',
  )
  src = src.replace(
    /<CyberHud title="([^"]+)" score=\{([^}]+)\} onExit=\{onExit\}(?! status)/g,
    '<CyberHud title={hud?.title ?? "$1"} score={$2} onExit={onExit}',
  )

  // Back to module button text
  src = src.replace(/>\s*Back to module\s*</g, ">{t('backToModule')}<")

  // Play again
  src = src.replace(/>\s*Play again\s*</gi, ">{t('playAgain')}<")
  src = src.replace(/>\s*PLAY AGAIN\s*</g, ">{t('playAgain')}<")

  fs.writeFileSync(file, src)
  return true
}

let changed = 0
for (const n of modules) {
  const dir = path.join(root, `module ${n}`)
  if (!fs.existsSync(dir)) continue
  for (const file of walk(dir)) {
    // skip nested legacy folders that aren't registered
    if (file.includes('Password&Authentication') || file.includes('BrowsingAwareness') || file.includes('SafeUnsafe') || file.includes('FakeAds')) {
      continue
    }
    if (patchFile(file)) {
      changed += 1
      console.log('patched', path.relative(process.cwd(), file))
    }
  }
}
console.log(`Done. Changed ${changed} files.`)
