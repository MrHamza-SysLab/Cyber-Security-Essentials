import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Calculator,
  Camera,
  FileText,
  MapPinned,
  Mic,
  Navigation,
  ShieldCheck,
  Users,
  HardDrive,
} from 'lucide-react'
import splash from '../../../assets/games/permission-auditor-blitz/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import PhoneFrame from '../shared/PhoneFrame'

const BRIEF = [
  'PERMISSION AUDITOR BLITZ',
  'New installs are requesting device access.',
  '• Keep only permissions the app truly needs',
  '• Revoke always-on location & contact grabs',
  '• Deny surveillance from utility apps',
  'Audit each app like corporate MDM policy.',
]

const APPS = [
  {
    id: 'pdf',
    name: 'PDF Scanner App',
    publisher: 'OfficeScan Labs',
    icon: FileText,
    accent: 'from-sky-500/30 to-cyan-600/10',
    permissions: [
      { id: 'camera', label: 'Camera', detail: 'Scan documents', icon: Camera, keep: true },
      { id: 'storage', label: 'Storage', detail: 'Save scanned PDFs', icon: HardDrive, keep: true },
      { id: 'location', label: 'Location (Always)', detail: 'Not required for scanning', icon: MapPinned, keep: false },
      { id: 'contacts', label: 'Contacts', detail: 'Unnecessary for a scanner', icon: Users, keep: false },
    ],
    xp: 35,
    tip: 'Keep Camera & Storage. Revoke Location & Contacts.',
  },
  {
    id: 'calc',
    name: 'Calculator Plus',
    publisher: 'QuickMath Soft',
    icon: Calculator,
    accent: 'from-amber-500/25 to-orange-700/10',
    permissions: [
      { id: 'mic', label: 'Microphone', detail: 'No voice feature needed', icon: Mic, keep: false },
      { id: 'contacts', label: 'Contacts', detail: 'Calculators never need this', icon: Users, keep: false },
    ],
    xp: 35,
    tip: 'Revoke ALL permissions — math needs none.',
  },
  {
    id: 'maps',
    name: 'Navigation & Maps',
    publisher: 'Corp Transit',
    icon: Navigation,
    accent: 'from-emerald-500/25 to-teal-700/10',
    permissions: [
      {
        id: 'location',
        label: 'Location (While Using)',
        detail: 'Required for turn-by-turn navigation',
        icon: MapPinned,
        keep: true,
      },
    ],
    xp: 30,
    tip: 'Approve “While Using” location — legitimate need.',
  },
]

function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition ${
        on ? 'bg-cyan-400' : 'bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function PermissionAuditorBlitzGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [busy, setBusy] = useState(false)

  const app = APPS[index]
  const defaults = useMemo(
    () => Object.fromEntries((app?.permissions ?? []).map((p) => [p.id, true])),
    [app],
  )
  const [toggles, setToggles] = useState(defaults)

  useEffect(() => {
    setToggles(Object.fromEntries((APPS[index]?.permissions ?? []).map((p) => [p.id, true])))
  }, [index])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function flip(id) {
    if (busy || wrongFeedback) return
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function applyAudit() {
    if (busy || wrongFeedback || !app) return

    const mistakes = app.permissions.filter((p) => Boolean(toggles[p.id]) !== p.keep)
    if (mistakes.length) {
      const overGranted = mistakes.filter((p) => toggles[p.id] && !p.keep)
      const underGranted = mistakes.filter((p) => !toggles[p.id] && p.keep)
      let reason = app.tip
      if (overGranted.length) {
        reason = `You left risky access on: ${overGranted.map((p) => p.label).join(', ')}. ${app.tip}`
      } else if (underGranted.length) {
        reason = `You revoked needed access: ${underGranted.map((p) => p.label).join(', ')}. ${app.tip}`
      }
      setWrongFeedback({
        title: 'Permission Policy Failed',
        reason,
      })
      return
    }

    setBusy(true)
    setScore((s) => s + app.xp)
    setToast({
      tone: 'ok',
      title: `Audit cleared · +${app.xp} XP`,
      detail: `${app.name} now matches least-privilege policy.`,
    })

    window.setTimeout(() => {
      setBusy(false)
      if (index >= APPS.length - 1) {
        setPhase('result')
        return
      }
      setIndex((i) => i + 1)
    }, 900)
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · APPLICATION PERMISSIONS & DEVICE ACCESS"
        lines={BRIEF}
        cta="OPEN PERMISSION MANAGER"
        alt="Permission Auditor Blitz"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="PERMISSION AUDITOR BLITZ" score={score} onExit={onExit} status="MDM POLICY PASS">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">LEAST PRIVILEGE ENFORCED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You revoked surveillance-grade requests and kept only business-justified device access.
            </p>
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetPlay}
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

  const Icon = app.icon

  return (
    <CyberHud
      title="PERMISSION AUDITOR BLITZ"
      score={score}
      onExit={onExit}
      status={`APP ${index + 1}/${APPS.length}`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.12),transparent_40%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-cyan-300/80 sm:text-xs">
              CORPORATE MDM · INSTALL QUEUE
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Toggle access on/off, then tap <span className="text-cyan-200">Apply Audit</span>. Hint: {app.tip}
            </p>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <PhoneFrame>
              <div className={`bg-gradient-to-br px-4 pb-6 pt-2 ${app.accent}`}>
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">SETTINGS · PRIVACY</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80">
                    <Icon className="size-6 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="font-game text-lg text-white">{app.name}</h2>
                    <p className="text-xs text-slate-400">{app.publisher}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 px-3 py-3">
                <p className="px-1 font-mono text-[10px] tracking-[0.16em] text-slate-500">REQUESTED ACCESS</p>
                <AnimatePresence mode="popLayout">
                  {app.permissions.map((perm) => {
                    const PIcon = perm.icon
                    const on = Boolean(toggles[perm.id])
                    return (
                      <motion.div
                        key={perm.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-3"
                      >
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${
                            on ? 'bg-cyan-500/15 text-cyan-300' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          <PIcon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{perm.label}</p>
                          <p className="truncate text-[11px] text-slate-400">{perm.detail}</p>
                        </div>
                        <Toggle on={on} label={perm.label} onToggle={() => flip(perm.id)} />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                <button
                  type="button"
                  disabled={busy}
                  onClick={applyAudit}
                  className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                >
                  APPLY AUDIT
                </button>
              </div>
            </PhoneFrame>
          </div>
        </div>

        {toast && <FeedbackToast {...toast} onClose={() => setToast(null)} />}
        {wrongFeedback && (
          <WrongChoiceOverlay
            feedback={wrongFeedback}
            onTryAgain={() => {
              setWrongFeedback(null)
              setToggles(Object.fromEntries(app.permissions.map((p) => [p.id, true])))
            }}
          />
        )}
      </div>
    </CyberHud>
  )
}
