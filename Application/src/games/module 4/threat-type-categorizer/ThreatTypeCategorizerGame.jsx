import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Bell,
  Bug,
  Eye,
  Keyboard,
  Lock,
  Monitor,
  ShieldCheck,
  Skull,
} from 'lucide-react'
import splash from '../../../assets/games/threat-spotter-catch-the-impostor/red-flag-scanner.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import { usePointerDrag } from '../../module 1/shared/usePointerDrag'

const BRIEF = [
  'THREAT TYPE CATEGORIZER',
  'Triage real attack chains — not textbook labels.',
  '• Ransomware · Trojan · Spyware · Keylogger',
  '• Read host, process & network IoCs',
  '• Match how the attacker actually struck',
  'Wrong bucket = wrong containment playbook.',
]

const BUCKETS = [
  {
    id: 'ransomware',
    label: 'Ransomware',
    hint: 'Encrypts files · demands payment',
    icon: Lock,
    accent: 'border-rose-400/50 bg-rose-950/30',
  },
  {
    id: 'trojan',
    label: 'Trojan',
    hint: 'Disguised as trusted software',
    icon: Skull,
    accent: 'border-violet-400/50 bg-violet-950/30',
  },
  {
    id: 'keylogger',
    label: 'Keylogger',
    hint: 'Captures typed credentials',
    icon: Keyboard,
    accent: 'border-amber-400/50 bg-amber-950/30',
  },
  {
    id: 'spyware',
    label: 'Spyware',
    hint: 'Silent tracking & exfiltration',
    icon: Eye,
    accent: 'border-cyan-400/50 bg-cyan-950/30',
  },
]

const ALERTS = [
  {
    id: 'a1',
    severity: 'CRITICAL',
    host: 'WS-FIN-014',
    title: 'Mass file encryption + ransom note',
    text: 'Phish: invoice.zip → user ran invoice.exe. Docs renamed to .locked; README_DECRYPT.txt demands BTC via Tor onion site.',
    attack: 'Email attachment → encryptor → ransom',
    bucket: 'ransomware',
    xp: 25,
  },
  {
    id: 'a2',
    severity: 'HIGH',
    host: 'LAPTOP-HR-07',
    title: 'Fake installer drops backdoor',
    text: 'User installed FreePDFReader_Setup.exe from a cracked-software site. Binary looks like a reader UI but opens outbound C2 and dumps credentials.',
    attack: 'Malicious download → trusted disguise → payload',
    bucket: 'trojan',
    xp: 25,
  },
  {
    id: 'a3',
    severity: 'HIGH',
    host: 'WS-ACC-221',
    title: 'Keyboard API hooks on bank login',
    text: 'EDR: unknown DLL injected into chrome.exe. Keystroke buffer captured while user typed into online-banking portal; logs staged in %TEMP%\\kb.dat.',
    attack: 'Process inject → steal typed passwords',
    bucket: 'keylogger',
    xp: 25,
  },
  {
    id: 'a4',
    severity: 'MEDIUM',
    host: 'DESK-MKT-03',
    title: 'Silent browser history exfil',
    text: 'Hidden svc_update.exe in AppData scrapes cookies & browsing history every 15 min; HTTPS POST to unknown CDN — no popup, no ransom, no UI.',
    attack: 'Stealth agent → track & leak data',
    bucket: 'spyware',
    xp: 25,
  },
]

export default function ThreatTypeCategorizerGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [pool, setPool] = useState(() => ALERTS.map((a) => a.id))
  const [placements, setPlacements] = useState({})
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)

  const alertMap = useMemo(() => Object.fromEntries(ALERTS.map((a) => [a.id, a])), [])

  const { drag, start } = usePointerDrag(({ payload, zoneId }) => {
    if (!payload?.alertId || !zoneId || wrongFeedback) return
    assign(payload.alertId, zoneId)
  })

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function assign(alertId, bucketId) {
    const alert = alertMap[alertId]
    if (!alert || placements[alertId]) return

    if (alert.bucket !== bucketId) {
      const correct = BUCKETS.find((b) => b.id === alert.bucket)?.label
      const wrong = BUCKETS.find((b) => b.id === bucketId)?.label
      setWrongFeedback({
        title: 'Incorrect Malware Classification',
        reason: `Attack chain "${alert.attack}" is ${correct}, not ${wrong}. Trace how the attacker got in and what they did next.`,
      })
      return
    }

    setPlacements((prev) => {
      const next = { ...prev, [alertId]: bucketId }
      if (Object.keys(next).length >= ALERTS.length) {
        window.setTimeout(() => setPhase('result'), 900)
      }
      return next
    })
    setPool((list) => list.filter((id) => id !== alertId))
    setScore((s) => s + alert.xp)
    setToast({
      tone: 'ok',
      title: `Classified · +${alert.xp} XP`,
      detail: `${BUCKETS.find((b) => b.id === bucketId)?.label} bucket secured.`,
    })
  }

  function resetPlay() {
    setScore(0)
    setPool(ALERTS.map((a) => a.id))
    setPlacements({})
    setToast(null)
    setWrongFeedback(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 2 · MALWARE CATEGORIES"
        lines={BRIEF}
        cta="OPEN SOC QUEUE"
        alt="Threat Type Categorizer"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="THREAT TYPE CATEGORIZER" score={score} onExit={onExit} status="QUEUE CLEARED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">ALL ALERTS MAPPED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You mapped real attack chains: phish→encrypt, fake apps, keystroke hooks, and silent exfil — each family needs a different playbook.
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

  return (
    <CyberHud
      title="THREAT TYPE CATEGORIZER"
      score={score}
      onExit={onExit}
      status={`${Object.keys(placements).length}/4 CLASSIFIED`}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
          <div className="flex items-center gap-2 text-slate-300">
            <Monitor className="size-4 text-cyan-400" />
            <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">SOC TRIAGE CONSOLE</span>
          </div>
          <div className="flex items-center gap-2 text-amber-200">
            <Bell className="size-3.5" />
            <span className="font-mono text-[10px] sm:text-xs">{pool.length} alerts pending</span>
          </div>
        </div>

        <p className="text-center text-sm text-slate-300">
          Drag each EDR ticket into the matching <span className="text-cyan-300">malware bucket</span> — classify by attack method.
        </p>

        <div className="mx-auto grid w-full max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BUCKETS.map((bucket) => {
            const Icon = bucket.icon
            const assigned = ALERTS.filter((a) => placements[a.id] === bucket.id)
            return (
              <div
                key={bucket.id}
                data-drop-id={bucket.id}
                className={`min-h-40 rounded-2xl border border-dashed p-3 transition hover:brightness-110 ${bucket.accent}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-white/80" />
                  <p className="font-game text-sm font-bold tracking-wide text-white">{bucket.label}</p>
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-400">{bucket.hint}</p>
                <div className="mt-3 space-y-2">
                  {assigned.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-emerald-400/30 bg-emerald-950/40 px-2 py-1.5 text-[11px] leading-snug text-emerald-100"
                    >
                      <p className="font-mono text-[9px] text-emerald-400/70">{alert.host}</p>
                      <p className="mt-0.5 font-semibold">{alert.title}</p>
                    </div>
                  ))}
                  {!assigned.length && (
                    <p className="py-8 text-center text-[11px] text-slate-600">Drop alert here</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-slate-900/55 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Bug className="size-4 text-rose-300" />
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-400">EDR / SIEM QUEUE</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pool.map((id) => {
              const alert = alertMap[id]
              const sevColor =
                alert.severity === 'CRITICAL'
                  ? 'text-rose-400'
                  : alert.severity === 'HIGH'
                    ? 'text-amber-400'
                    : 'text-cyan-400'
              return (
                <button
                  key={id}
                  type="button"
                  onPointerDown={(event) => start(event, { alertId: id })}
                  className="cursor-grab touch-none rounded-xl border border-cyan-400/35 bg-slate-950/80 px-3 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-mono text-[9px] tracking-[0.16em] ${sevColor}`}>
                      {alert.severity}
                    </p>
                    <p className="font-mono text-[9px] text-slate-500">{alert.host}</p>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-100">{alert.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400 sm:text-xs">{alert.text}</p>
                  <p className="mt-2 font-mono text-[9px] tracking-wide text-cyan-500/70">
                    CHAIN · {alert.attack}
                  </p>
                </button>
              )
            })}
            {!pool.length && (
              <p className="col-span-full py-4 text-center text-sm text-emerald-300/80">All alerts routed.</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drag && (
          <motion.div
            className="pointer-events-none fixed z-[90] max-w-xs rounded-xl border border-cyan-300/60 bg-slate-950 px-3 py-2 text-xs text-white shadow-xl"
            style={{ left: drag.x + 12, top: drag.y + 12 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="font-semibold">{alertMap[drag.alertId]?.title}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{alertMap[drag.alertId]?.host}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {wrongFeedback && (
        <WrongChoiceOverlay
          feedback={wrongFeedback}
          onTryAgain={() => setWrongFeedback(null)}
        />
      )}

      {toast && (
        <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
      )}
    </CyberHud>
  )
}
