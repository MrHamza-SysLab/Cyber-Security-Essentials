import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Zap,
} from 'lucide-react'
import splash from '../../../assets/games/password-strength-cracker/splash.png'
import { useLanguage } from '../../../i18n/LanguageContext'
import CyberSplash, { CyberHud, FeedbackToast } from '../shared/CyberSplash'

const OBJECTIVE =
  'Attackers use automated tools to guess millions of password combinations per second. Reusing the same password across multiple accounts means one leak compromises everything. Use strong, unique passphrases or let an enterprise Password Manager generate and store them securely.'

const BRIEF = [
  'PASSWORD STRENGTH CRACKER',
  'Bots guess millions of combos / second.',
  '• Create 4 passwords (or use SysVault PM)',
  '• Watch the bot process each one',
  '• Your strongest unique secret wins',
  'Reuse kills. Password Managers save you.',
]

const TOTAL_CREATE = 4

function checkPasswordStrength(password) {
  let score = 0
  const feedback = []

  if (!password) return { score: 0, feedback: ['Enter a password to begin'] }

  if (password.length >= 8) score += 20
  else feedback.push('Password is too short (min 8 characters)')
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  if (/[A-Z]/.test(password)) score += 12
  else feedback.push('Add uppercase letters')

  if (/[a-z]/.test(password)) score += 12
  else feedback.push('Add lowercase letters')

  if (/[0-9]/.test(password)) score += 12
  else feedback.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) score += 14
  else feedback.push('Add special characters')

  const common = ['123456', 'password', 'qwerty', '12345678', 'admin', 'admin@123', 'pakistan2024']
  if (common.includes(password.toLowerCase())) {
    score = Math.min(score, 10)
    feedback.push('This password is very common and easily hacked')
  }

  const personal = ['hamza', 'ali', '2024', '2025', '2026', 'admin', 'pakistan']
  if (personal.some((info) => password.toLowerCase().includes(info))) {
    score -= 10
    feedback.push('Avoid using names, places, or years')
  }

  // Passphrase-like bonus (mixed length + symbols)
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password) && /[0-9]/.test(password)) {
    score += 8
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    feedback: feedback.length > 0 ? feedback : ['Strong password — hard to crack'],
  }
}

function calculateTimeToCrack(score) {
  if (score < 30) return 'Instantly'
  if (score < 50) return '2 seconds'
  if (score < 70) return '2 days'
  if (score < 90) return '200 years'
  return 'Centuries'
}

function strengthLabel(score) {
  if (score < 30) return 'Weak'
  if (score < 70) return 'Medium'
  return 'Strong'
}

function strengthBarClass(score) {
  if (score < 30) return 'bg-rose-500'
  if (score < 70) return 'bg-amber-400'
  return 'bg-emerald-400'
}

function crackSecondsFor(score) {
  if (score >= 90) return null
  if (score >= 70) return 8
  if (score >= 50) return 4
  return 2
}

function formatSpeed(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function generateSecurePassword({
  length = 20,
  upper = true,
  lower = true,
  numbers = true,
  symbols = true,
} = {}) {
  const pools = []
  if (upper) pools.push('ABCDEFGHJKLMNPQRSTUVWXYZ')
  if (lower) pools.push('abcdefghijkmnopqrstuvwxyz')
  if (numbers) pools.push('23456789')
  if (symbols) pools.push('!@#$%^&*-_=+?')
  if (!pools.length) pools.push('abcdefghijkmnopqrstuvwxyz')

  const all = pools.join('')
  const chars = []
  // Ensure at least one from each selected set
  for (const pool of pools) {
    chars.push(pool[Math.floor(Math.random() * pool.length)])
  }
  while (chars.length < length) {
    chars.push(all[Math.floor(Math.random() * all.length)])
  }
  // Fisher–Yates shuffle
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

function GuessStream({ active }) {
  const rows = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        text: Array.from({ length: 18 }, () =>
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%'[
            Math.floor(Math.random() * 62)
          ],
        ).join(''),
      })),
    [active],
  )

  if (!active) return null
  return (
    <div className="mt-2 h-28 overflow-hidden rounded-lg border border-rose-500/30 bg-black/50 font-mono text-[10px] leading-4 text-rose-300/80">
      {rows.map((row) => (
        <motion.p
          key={`${row.id}-${row.text}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: [0.3, 1, 0.4], x: 0 }}
          transition={{ duration: 0.35, delay: row.id * 0.04 }}
          className="truncate px-2"
        >
          TRY › {row.text}
        </motion.p>
      ))}
    </div>
  )
}

/** Realistic enterprise Password Manager overlay (Bitwarden / 1Password style). */
function PasswordManagerSim({ open, onClose, vaultItems, onSaveVault, onUsePassword, slotIndex }) {
  const [unlocked, setUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [masterPw, setMasterPw] = useState('')
  const [showMaster, setShowMaster] = useState(false)
  const [tab, setTab] = useState('generator')
  const [length, setLength] = useState(20)
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true })
  const [generated, setGenerated] = useState(() => generateSecurePassword({ length: 20 }))
  const [copied, setCopied] = useState(false)
  const [itemName, setItemName] = useState(`Corp Account ${slotIndex + 1}`)
  const [username, setUsername] = useState('you@company.com')
  const [revealId, setRevealId] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  const genScore = useMemo(() => checkPasswordStrength(generated).score, [generated])

  useEffect(() => {
    if (!open) return undefined
    setUnlocked(false)
    setUnlocking(false)
    setMasterPw('')
    setTab('generator')
    setItemName(`Corp Account ${slotIndex + 1}`)
    setGenerated(generateSecurePassword({ length: 20, ...opts }))
    return undefined
  }, [open, slotIndex])

  function doUnlock() {
    if (!masterPw.trim()) return
    setUnlocking(true)
    window.setTimeout(() => {
      setUnlocking(false)
      setUnlocked(true)
    }, 900)
  }

  function regen() {
    setGenerated(generateSecurePassword({ length, ...opts }))
    setCopied(false)
  }

  async function copyGenerated() {
    try {
      await navigator.clipboard?.writeText(generated)
    } catch {
      /* ignore */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  function saveToVault() {
    if (!generated.trim()) return
    const id = `vault-${Date.now()}`
    onSaveVault({
      id,
      name: itemName.trim() || `Item ${vaultItems.length + 1}`,
      username: username.trim() || 'user',
      password: generated,
      updatedAt: new Date().toLocaleTimeString(),
      fromManager: true,
    })
    setSavedFlash(true)
    setGenerated('')
    setCopied(false)
    setItemName(`Corp Account ${slotIndex + 1}`)
    setRevealId(id)
    window.setTimeout(() => setSavedFlash(false), 1200)
    setTab('vault')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0b1220] shadow-[0_0_60px_rgba(34,211,238,0.2)]"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/50">
              <KeyRound className="size-5 text-cyan-300" />
            </div>
            <div>
              <p className="font-game text-sm font-bold tracking-wide text-white">SysVault Enterprise</p>
              <p className="font-mono text-[9px] tracking-[0.16em] text-cyan-400/70">
                PASSWORD MANAGER · SOC APPROVED
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {!unlocked ? (
          <div className="flex flex-col items-center px-6 py-10">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/40">
              <Lock className="size-8 text-cyan-300" />
            </div>
            <h3 className="font-game text-lg font-bold text-white">Unlock Your Vault</h3>
            <p className="mt-1 max-w-xs text-center text-xs text-slate-400">
              Enter your master password. The vault encrypts every unique secret locally — never reuse across
              sites.
            </p>

            <div className="relative mt-6 w-full max-w-sm">
              <input
                type={showMaster ? 'text' : 'password'}
                value={masterPw}
                onChange={(e) => setMasterPw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doUnlock()}
                placeholder="Master password"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-11 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400/50"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowMaster((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500"
              >
                {showMaster ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <button
              type="button"
              disabled={!masterPw.trim() || unlocking}
              onClick={doUnlock}
              className="mt-4 flex min-h-12 w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 hover:bg-cyan-300 disabled:opacity-40"
            >
              {unlocking ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Decrypting…
                </>
              ) : (
                'Unlock Vault'
              )}
            </button>
            <p className="mt-3 font-mono text-[10px] text-slate-500">AES-256 · zero-knowledge · enterprise SSO ready</p>
          </div>
        ) : (
          <>
            <div className="flex border-b border-white/10">
              {[
                { id: 'generator', label: 'Generator' },
                { id: 'vault', label: `Vault (${vaultItems.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 cursor-pointer py-3 font-mono text-[11px] tracking-[0.14em] transition ${
                    tab === t.id
                      ? 'border-b-2 border-cyan-400 text-cyan-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {tab === 'generator' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-cyan-500/25 bg-slate-950/80 p-4">
                    <p className="font-mono text-[9px] tracking-[0.16em] text-cyan-500">GENERATED SECRET</p>
                    <p className="mt-2 break-all font-mono text-base font-semibold text-cyan-50">
                      {generated || '— generate a new password —'}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Strength:{' '}
                        <strong className="text-cyan-300">
                          {generated ? strengthLabel(genScore) : '—'}
                        </strong>
                      </span>
                      <span>
                        Crack:{' '}
                        <strong className="text-cyan-300">
                          {generated ? calculateTimeToCrack(genScore) : '—'}
                        </strong>
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full bg-cyan-400" style={{ width: `${generated ? genScore : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-400">
                      <span>Length</span>
                      <span className="font-mono text-cyan-300">{length}</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={32}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['upper', 'A–Z'],
                      ['lower', 'a–z'],
                      ['numbers', '0–9'],
                      ['symbols', '!@#$'],
                    ].map(([key, label]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={opts[key]}
                          onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
                          className="accent-cyan-400"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Item name</label>
                      <input
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-400/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Username</label>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-400/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={regen}
                      className="min-h-11 cursor-pointer rounded-xl border border-cyan-400/40 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10"
                    >
                      ↻ Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={copyGenerated}
                      className="min-h-11 cursor-pointer rounded-xl border border-white/15 font-mono text-xs text-slate-200 hover:bg-white/5"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!generated.trim()}
                    onClick={saveToVault}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 font-mono text-xs text-cyan-200 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savedFlash ? '✓ Saved to Vault' : 'Save to Vault'}
                  </button>

                  <button
                    type="button"
                    disabled={!generated.trim()}
                    onClick={() => {
                      onUsePassword(generated, true)
                      onClose()
                    }}
                    className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Use & Autofill Form
                  </button>
                </div>
              )}

              {tab === 'vault' && (
                <div className="space-y-2">
                  <p className="mb-2 text-xs text-slate-400">
                    Encrypted items stay unique per account — one leak never opens the rest.
                  </p>
                  {!vaultItems.length && (
                    <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-500">
                      Vault empty. Generate a password and save it.
                    </div>
                  )}
                  {vaultItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-cyan-500/20 bg-slate-950/70 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                          <p className="truncate font-mono text-[11px] text-slate-400">{item.username}</p>
                        </div>
                        <span className="shrink-0 rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300">
                          SAVED
                        </span>
                      </div>
                      <p className="mt-2 break-all font-mono text-xs text-cyan-100">
                        {revealId === item.id ? item.password : '••••••••••••••••'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setRevealId((id) => (id === item.id ? null : item.id))}
                          className="cursor-pointer rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-300"
                        >
                          {revealId === item.id ? 'Hide' : 'Show password'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUsePassword(item.password, true)
                            onClose()
                          }}
                          className="cursor-pointer rounded-lg bg-cyan-400/90 px-2 py-1 text-[10px] font-bold text-slate-950"
                        >
                          Autofill
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-[9px] text-slate-600">Updated {item.updatedAt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

function CreatePasswordScreen({
  index,
  total,
  existingValues,
  savedPasswords,
  vaultItems,
  onSaveVault,
  onSecure,
  onExit,
}) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fromManager, setFromManager] = useState(false)
  const [pmOpen, setPmOpen] = useState(false)
  const { score, feedback } = useMemo(() => checkPasswordStrength(password), [password])
  const timeToCrack = calculateTimeToCrack(score)
  const reused = existingValues.includes(password) && password.length > 0

  // Reset field when moving to next password slot
  useEffect(() => {
    setPassword('')
    setShowPassword(false)
    setFromManager(false)
  }, [index])

  function clearInput() {
    setPassword('')
    setShowPassword(false)
    setFromManager(false)
  }

  function handleSave() {
    if (!password.trim()) return
    const entry = {
      id: `pw-${index}-${Date.now()}`,
      value: password,
      score,
      feedback,
      timeToCrack,
      crackSeconds: crackSecondsFor(score),
      reused,
      fromManager,
    }
    clearInput()
    onSecure(entry)
  }

  return (
    <CyberHud
      title="PASSWORD STRENGTH CRACKER"
      score={null}
      onExit={onExit}
      status={`CREATE ${index + 1}/${total}`}
    >
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur"
        >
          <div className="mb-4 flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < savedPasswords.length ? 'bg-cyan-400' : i === index ? 'bg-cyan-400/50' : 'bg-zinc-700'}`}
              />
            ))}
          </div>

          <div className="mb-1 flex items-center gap-2">
            <Shield className="size-5 text-cyan-400" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-400/80">
              PASSWORD {index + 1} OF {total}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Password</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Your account is under attack. Create a fortress of a password — or let the enterprise Password
            Manager generate a unique one.
          </p>

          {savedPasswords.length > 0 && (
            <div className="mt-4 rounded-xl border border-cyan-500/25 bg-slate-950/70 p-3">
              <p className="font-mono text-[9px] tracking-[0.16em] text-cyan-400">
                SAVED PASSWORDS ({savedPasswords.length}/{total})
              </p>
              <ul className="mt-2 space-y-2">
                {savedPasswords.map((pw, i) => (
                  <li
                    key={pw.id}
                    className="rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] text-slate-500">#{i + 1}</span>
                      <span className="font-mono text-[9px] text-cyan-400">
                        {strengthLabel(pw.score)} · {pw.score}%
                      </span>
                    </div>
                    <p className="mt-1 break-all font-mono text-xs text-cyan-50">{pw.value}</p>
                    {pw.fromManager && (
                      <p className="mt-1 font-mono text-[9px] text-cyan-500">SysVault</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => setPmOpen(true)}
            className="mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
          >
            <KeyRound className="size-4" />
            Open SysVault Password Manager
          </button>

          <div className="mt-5 space-y-2">
            <label className="text-sm font-medium text-zinc-300">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFromManager(false)
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 pr-10 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-zinc-600 focus:ring-2"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fromManager && (
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400">
                <KeyRound className="size-3" /> Autofilled from SysVault · unique · never reused
              </p>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>
                Strength:{' '}
                <span className="font-bold text-zinc-100">{password ? strengthLabel(score) : '—'}</span>
              </span>
              <span>
                Time to crack:{' '}
                <span className="font-bold text-zinc-100">{password ? timeToCrack : '—'}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full transition-all duration-300 ${
                  score >= 70 ? 'bg-cyan-400' : strengthBarClass(score)
                }`}
                style={{ width: `${password ? score : 0}%` }}
              />
            </div>
          </div>

          {reused && (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
              Reuse warning: you already used this password. One leak can compromise every account that
              shares it. Prefer SysVault to generate a unique secret.
            </div>
          )}

          <div className="mt-5 space-y-2">
            <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Info className="size-3" /> Security Feedback
            </h4>
            <div className="space-y-1.5">
              {(fromManager
                ? ['Generated & stored by enterprise Password Manager — unique per account']
                : feedback
              ).map((line) => (
                <div key={line} className="flex items-start gap-2 text-sm">
                  {score >= 70 && password ? (
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-400" />
                  ) : (
                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-zinc-600" />
                  )}
                  <span className={score >= 70 && password ? 'text-cyan-400' : 'text-zinc-400'}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!password.trim()}
            onClick={handleSave}
            className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-cyan-400 text-sm font-black uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {index + 1 < total ? 'Save & Next' : 'Secure Account'}
          </button>
        </motion.div>
      </div>

      <PasswordManagerSim
        open={pmOpen}
        onClose={() => setPmOpen(false)}
        vaultItems={vaultItems}
        onSaveVault={onSaveVault}
        slotIndex={index}
        onUsePassword={(value, managed) => {
          setPassword(value)
          setFromManager(Boolean(managed))
          setShowPassword(true)
        }}
      />
    </CyberHud>
  )
}

export default function PasswordStrengthCrackerGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [created, setCreated] = useState([])
  const [createIndex, setCreateIndex] = useState(0)
  const [vaultItems, setVaultItems] = useState([])

  const [meter, setMeter] = useState(42)
  const [speed, setSpeed] = useState(2_400_000)
  const [busy, setBusy] = useState(false)
  const [cracking, setCracking] = useState(null)
  const [botCrashed, setBotCrashed] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [scoreXp, setScoreXp] = useState(0)
  const [tested, setTested] = useState([])
  const [survivedId, setSurvivedId] = useState(null)

  const strongest = useMemo(() => {
    if (!created.length) return null
    return [...created].sort((a, b) => b.score - a.score || b.value.length - a.value.length)[0]
  }, [created])

  useEffect(() => {
    if (phase !== 'process' || busy || botCrashed) return undefined
    const timer = window.setInterval(() => {
      setSpeed((s) => Math.min(8_500_000, s + Math.floor(Math.random() * 120_000)))
      setMeter((m) => Math.max(8, m - 0.12))
    }, 400)
    return () => window.clearInterval(timer)
  }, [phase, busy, botCrashed])

  function handleSecure(entry) {
    const next = [...created, entry]
    setCreated(next)
    if (createIndex + 1 < TOTAL_CREATE) {
      setCreateIndex((i) => i + 1)
      return
    }
    setPhase('process')
  }

  function pick(password) {
    if (busy || botCrashed) return
    if (tested.includes(password.id)) return
    setBusy(true)
    setFeedback(null)

    const isStrongest = strongest && password.id === strongest.id
    const holds = password.crackSeconds == null || (isStrongest && password.score >= 70)

    if (holds) {
      setCracking(null)
      let frame = 0
      const anim = window.setInterval(() => {
        frame += 1
        setMeter((m) => Math.min(100, m + 6))
        if (frame >= 12) {
          window.clearInterval(anim)
          setMeter(100)
          setBotCrashed(true)
          setSpeed(0)
          setScoreXp(100)
          setSurvivedId(password.id)
          setTested((list) => [...list, password.id])
          setFeedback({
            tone: 'ok',
            title: 'Passphrase Secured!',
            detail: `Crack time: ${password.timeToCrack}. Unique strong secrets (or a Password Manager) stop bots and reuse leaks.`,
          })
          window.setTimeout(() => setPhase('result'), 2200)
        }
      }, 80)
      return
    }

    setCracking(password.id)
    setSpeed(12_000_000)
    const secs = password.crackSeconds ?? 2
    let t = 0
    const crack = window.setInterval(() => {
      t += 100
      setMeter((m) => Math.max(0, m - 4))
      if (t >= secs * 1000) {
        window.clearInterval(crack)
        setTested((list) => [...list, password.id])
        setFeedback({
          tone: 'bad',
          title: password.reused ? 'Breached · Reuse Risk' : 'Vault Breached',
          detail: password.reused
            ? 'Reusing the same password means one leak compromises everything.'
            : `Weak/common patterns fall fast — bots guess millions per second. Time to crack: ${password.timeToCrack}.`,
        })
        setBusy(false)
        setCracking(null)
        setSpeed(2_400_000)
        setMeter(28)
        setScoreXp((s) => Math.max(0, s - 10))

        // If every password failed except we still have untested stronger ones, keep going.
        // If all tested and none held, still show result with strongest.
        const nextTestedCount = tested.length + 1
        if (nextTestedCount >= created.length) {
          window.setTimeout(() => setPhase('result'), 1600)
        }
      }
    }, 100)
  }

  function resetAll() {
    setCreated([])
    setCreateIndex(0)
    setVaultItems([])
    setMeter(42)
    setSpeed(2_400_000)
    setBusy(false)
    setCracking(null)
    setBotCrashed(false)
    setFeedback(null)
    setScoreXp(0)
    setTested([])
    setSurvivedId(null)
    setPhase('create')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · WEAK & REUSED PASSWORDS"
        lines={BRIEF}
        cta="CREATE PASSWORDS"
        alt="Password Strength Cracker"
        centerHero={['PASSWORD', 'STRENGTH', 'CRACKER']}
        onPlay={() => setPhase('create')}
      />
    )
  }

  if (phase === 'create') {
    return (
      <CreatePasswordScreen
        index={createIndex}
        total={TOTAL_CREATE}
        existingValues={created.map((p) => p.value)}
        savedPasswords={created}
        vaultItems={vaultItems}
        onSaveVault={(item) => setVaultItems((list) => [item, ...list])}
        onSecure={handleSecure}
        onExit={onExit}
      />
    )
  }

  if (phase === 'result' && strongest) {
    return (
      <CyberHud title="PASSWORD STRENGTH CRACKER" score={scoreXp} onExit={onExit} status="MISSION CLEAR">
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-4">
          <div className="game-pop w-full max-w-xl rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center shadow-[0_0_50px_rgba(52,211,153,0.25)]">
            <ShieldCheck className="mx-auto size-14 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">STRONGEST PASSWORD</h2>
            <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-slate-400">
              BEST OF YOUR 4 CREATIONS
            </p>

            <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-950/30 p-4 text-left">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {strongest.fromManager && (
                  <span className="inline-flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    <KeyRound className="size-3" /> SYSVAULT GENERATED
                  </span>
                )}
              </div>
              <p className="break-all font-mono text-lg font-semibold text-emerald-100">{strongest.value}</p>
              <div className="mt-3 flex justify-between text-xs text-slate-300">
                <span>
                  Strength: <strong className="text-white">{strengthLabel(strongest.score)}</strong>
                </span>
                <span>
                  Time to crack: <strong className="text-white">{strongest.timeToCrack}</strong>
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-900 ring-1 ring-emerald-500/30">
                <motion.div
                  className={`h-full ${strengthBarClass(strongest.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${strongest.score}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-2 text-right font-mono text-sm text-emerald-300">{strongest.score}%</p>
            </div>

            <div className="mt-4 grid gap-2 text-left sm:grid-cols-3">
              {created.map((p, i) => (
                <div
                  key={p.id}
                  className={`rounded-lg border p-2 ${
                    p.id === strongest.id
                      ? 'border-emerald-400/40 bg-emerald-950/40'
                      : 'border-white/10 bg-slate-900/50'
                  }`}
                >
                  <p className="font-mono text-[9px] text-slate-500">#{i + 1}</p>
                  <p className="truncate font-mono text-[11px] text-slate-200">{p.value}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full ${strengthBarClass(p.score)}`} style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-left text-sm leading-relaxed text-slate-300">{OBJECTIVE}</p>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-cyan-400/30 bg-cyan-950/40 p-3 text-left">
              <KeyRound className="mt-0.5 size-5 shrink-0 text-cyan-300" />
              <p className="text-xs leading-relaxed text-cyan-100/90">
                Prefer unique passphrases — or let an enterprise Password Manager generate and store them so
                you never reuse secrets across accounts.
              </p>
            </div>

            <p className="mt-4 font-mono text-emerald-300">{scoreXp} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetAll}
                className="min-h-12 cursor-pointer rounded-xl border border-cyan-400/40 px-5 font-game text-sm text-cyan-200"
              >
                Replay
              </button>
              <button
                type="button"
                onClick={onExit}
                className="min-h-12 cursor-pointer rounded-xl bg-cyan-400 px-5 font-game text-sm font-bold text-slate-950"
              >
                {t('backToModule')}
              </button>
            </div>
          </div>
        </div>
      </CyberHud>
    )
  }

  return (
    <CyberHud
      title="PASSWORD STRENGTH CRACKER"
      score={scoreXp}
      onExit={onExit}
      status={botCrashed ? 'ATTACKER OFFLINE' : 'PROCESSING YOUR PASSWORDS'}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5 lg:flex-row">
        <div className="relative flex min-h-[280px] flex-1 flex-col items-center justify-center">
          <div className="mb-3 w-full max-w-2xl rounded-xl border border-cyan-500/25 bg-slate-950/70 px-3 py-2 text-left">
            <p className="font-mono text-[9px] tracking-[0.18em] text-cyan-400/80">PROCESS</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-300 sm:text-xs">
              Tap each password to run it against the brute-force bot. Weak/reused ones crack in seconds —
              your strongest unique passphrase should hold the vault.
            </p>
          </div>

          <div className="mb-4 w-full max-w-md">
            <div className="mb-1 flex justify-between font-mono text-[10px] tracking-[0.18em] text-cyan-400/80">
              <span>VAULT SECURITY METER</span>
              <span className={meter >= 90 ? 'text-emerald-300' : meter < 25 ? 'text-rose-300' : 'text-cyan-200'}>
                {Math.round(meter)}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-900 ring-1 ring-cyan-500/30">
              <motion.div
                className={`h-full origin-left ${
                  meter >= 90 ? 'bg-emerald-400' : meter < 25 ? 'bg-rose-500' : 'bg-cyan-400'
                }`}
                animate={{ width: `${meter}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          <motion.div
            animate={
              cracking
                ? { rotate: [0, -2, 2, -1, 0], scale: [1, 0.98, 1.02, 1] }
                : botCrashed
                  ? { scale: 1.05 }
                  : { scale: [1, 1.02, 1] }
            }
            transition={{ duration: cracking ? 0.4 : 2.4, repeat: Infinity }}
            className={`relative flex size-40 items-center justify-center rounded-full border-4 sm:size-52 ${
              botCrashed
                ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_60px_rgba(52,211,153,0.45)]'
                : cracking
                  ? 'border-rose-500 bg-rose-950/50 shadow-[0_0_50px_rgba(244,63,94,0.4)]'
                  : 'border-cyan-400/60 bg-slate-950/70 shadow-[0_0_45px_rgba(34,211,238,0.25)]'
            }`}
          >
            <div className="absolute inset-3 rounded-full border border-dashed border-white/10" />
            {botCrashed ? (
              <ShieldCheck className="size-16 text-emerald-300 sm:size-20" />
            ) : (
              <Lock className={`size-16 sm:size-20 ${cracking ? 'text-rose-300' : 'text-cyan-300'}`} />
            )}
            <p className="absolute -bottom-8 font-game text-xs tracking-[0.2em] text-slate-300">
              CENTRAL VAULT
            </p>
          </motion.div>

          <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {created.map((pw, i) => {
              const selected = cracking === pw.id
              const done = tested.includes(pw.id)
              const isBest = strongest?.id === pw.id
              return (
                <button
                  key={pw.id}
                  type="button"
                  disabled={busy || botCrashed || done}
                  onClick={() => pick(pw)}
                  className={`game-pop relative cursor-pointer rounded-xl border p-4 text-left transition disabled:cursor-not-allowed ${
                    selected
                      ? 'border-rose-400 bg-rose-950/50'
                      : survivedId === pw.id
                        ? 'border-emerald-400 bg-emerald-950/40'
                        : done
                          ? 'border-white/10 bg-slate-950/40 opacity-50'
                          : 'border-cyan-500/25 bg-slate-950/70 hover:border-cyan-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-cyan-500/80">
                      PASSWORD {i + 1}
                    </p>
                    <div className="flex items-center gap-1">
                      {pw.fromManager && (
                        <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300">
                          SYSVAULT
                        </span>
                      )}
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                          isBest ? 'bg-cyan-500/15 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {strengthLabel(pw.score)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 break-all font-mono text-sm font-semibold text-cyan-50">{pw.value}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Crack estimate: {pw.timeToCrack}
                    {pw.reused ? ' · REUSED' : ''}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full ${strengthBarClass(pw.score)}`} style={{ width: `${pw.score}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-72">
          <div
            className={`rounded-2xl border p-4 backdrop-blur ${
              botCrashed
                ? 'border-emerald-400/30 bg-emerald-950/30'
                : 'border-rose-500/40 bg-rose-950/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
            }`}
          >
            <div className="flex items-center gap-2">
              {botCrashed ? (
                <Zap className="size-5 text-emerald-300" />
              ) : (
                <Skull className="size-5 animate-pulse text-rose-300" />
              )}
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-rose-300/80">AUTOMATED ATTACKER</p>
                <p className="font-game text-sm font-bold text-white">
                  {botCrashed ? 'CRASHED' : 'Brute-Force Bot'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
              <p className="font-mono text-[9px] tracking-wider text-slate-400">CRACK SPEED</p>
              <p className={`font-mono text-2xl font-bold ${botCrashed ? 'text-emerald-300' : 'text-rose-300'}`}>
                {botCrashed ? '0' : formatSpeed(speed)}
                <span className="ml-1 text-xs text-slate-400">guesses/sec</span>
              </p>
              <p className="mt-1 text-[10px] leading-snug text-rose-200/70">
                Automated tools try millions of combinations every second.
              </p>
            </div>

            <GuessStream active={Boolean(cracking)} />

            <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/25 p-2.5">
              <p className="font-mono text-[9px] tracking-wider text-amber-300">REUSE WARNING</p>
              <p className="mt-1 text-[10px] leading-snug text-amber-100/80">
                Same password on many accounts? One leak compromises everything.
              </p>
            </div>

            <AnimatePresence>
              {botCrashed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-950/40 p-2.5"
                >
                  <p className="font-mono text-[9px] tracking-wider text-emerald-300">BEST PRACTICE</p>
                  <p className="mt-1 text-[10px] leading-snug text-emerald-100/90">
                    Unique passphrases — or an enterprise Password Manager — keep secrets safe.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {feedback && (
        <FeedbackToast
          tone={feedback.tone}
          title={feedback.title}
          detail={feedback.detail}
          onClose={() => setFeedback(null)}
        />
      )}
    </CyberHud>
  )
}
