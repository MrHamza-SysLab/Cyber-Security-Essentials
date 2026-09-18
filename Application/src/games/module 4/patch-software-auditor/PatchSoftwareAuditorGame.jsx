import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Download,
  MonitorSmartphone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import splash from '../../../assets/games/permission-matrix-sorter/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'PATCH & SOFTWARE AUDITOR',
  'You own the workstation policy desk.',
  '• Install critical OS security patches',
  '• Block unapproved downloads',
  '• Reject & report cracked executables',
  'Approve only what keeps the estate safe.',
]

const CARDS = [
  {
    id: 'a',
    title: 'System OS Critical Security Patch Ready',
    subtitle: 'Vendor: Corporate Update Channel · Severity: Critical',
    tone: 'ok',
    icon: Sparkles,
    actions: [
      {
        id: 'install',
        label: 'Install Now',
        correct: true,
        xp: 35,
        okMsg: 'Critical patch queued — vulnerability window closed.',
      },
      {
        id: 'defer',
        label: 'Remind Me in 30 Days',
        correct: false,
        wrongTitle: 'Patch Deferred Too Long',
        wrongReason:
          'Critical OS security patches should be installed promptly. Long deferrals leave known exploits open on the corporate estate.',
      },
      {
        id: 'ignore',
        label: 'Ignore Notification',
        correct: false,
        wrongTitle: 'Unpatched Endpoint Risk',
        wrongReason:
          'Ignoring a critical security patch keeps malware and remote exploits available against your workstation.',
      },
    ],
  },
  {
    id: 'b',
    title: 'Download Torrent Downloader (Unapproved)',
    subtitle: 'Source: unknown mirror · Not on approved software list',
    tone: 'warn',
    icon: Download,
    actions: [
      {
        id: 'block',
        label: 'Block Application',
        correct: true,
        xp: 35,
        okMsg: 'Unapproved torrent client blocked at the desk.',
      },
      {
        id: 'allow',
        label: 'Allow Download',
        correct: false,
        wrongTitle: 'Shadow IT Introduced',
        wrongReason:
          'Torrent tools are unapproved and often bundled with malware. Corporate policy requires blocking unauthorized software.',
      },
      {
        id: 'personal',
        label: 'Install for Personal Use Only',
        correct: false,
        wrongTitle: 'Personal Use Still Risks the Firm',
        wrongReason:
          'Even “personal” installs on a work device can bypass controls, leak data, and violate software policy.',
      },
    ],
  },
  {
    id: 'c',
    title: 'Third-Party Video Player Crack.exe',
    subtitle: 'File: Crack.exe · Publisher: Unverified · High risk',
    tone: 'danger',
    icon: ShieldAlert,
    actions: [
      {
        id: 'report',
        label: 'Reject & Report',
        correct: true,
        xp: 30,
        okMsg: 'Crack.exe rejected and escalated to IT Security.',
      },
      {
        id: 'run',
        label: 'Run Crack.exe',
        correct: false,
        wrongTitle: 'Malware Dropper Executed',
        wrongReason:
          'Crack and keygen files are a common malware delivery method. Never run unverified executables on a corporate PC.',
      },
      {
        id: 'rename',
        label: 'Rename & Keep Offline',
        correct: false,
        wrongTitle: 'Risky Binary Retained',
        wrongReason:
          'Keeping a crack binary on disk still violates policy and can be run later by mistake. Reject and report it.',
      },
    ],
  },
]

const TONE_STYLES = {
  ok: 'border-emerald-400/40 bg-emerald-950/40',
  warn: 'border-amber-400/40 bg-amber-950/40',
  danger: 'border-rose-400/40 bg-rose-950/40',
}

export default function PatchSoftwareAuditorGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [resolved, setResolved] = useState([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)

  const card = CARDS[index]

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function handleAction(action) {
    if (busy || wrongFeedback || phase !== 'play' || !card) return

    if (!action.correct) {
      setWrongFeedback({
        title: action.wrongTitle,
        reason: action.wrongReason,
      })
      return
    }

    setBusy(true)
    setScore((s) => s + action.xp)
    setResolved((list) => [...list, card.id])
    setToast({
      tone: 'ok',
      title: `Cleared · +${action.xp} XP`,
      detail: action.okMsg,
    })

    window.setTimeout(() => {
      setBusy(false)
      if (index >= CARDS.length - 1) {
        setPhase('result')
        return
      }
      setIndex((i) => i + 1)
    }, 900)
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
    setResolved([])
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · UNAUTHORIZED SOFTWARE & UPDATES"
        lines={BRIEF}
        cta="OPEN ADMIN DESK"
        alt="Patch & Software Auditor"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="PATCH & SOFTWARE AUDITOR" score={score} onExit={onExit} status="DESK CLEAR">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">SOFTWARE POLICY ENFORCED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Critical patches installed, unapproved apps blocked, and cracked binaries rejected — that is safe software management.
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

  const Icon = card.icon

  return (
    <CyberHud
      title="PATCH & SOFTWARE AUDITOR"
      score={score}
      onExit={onExit}
      status={`REQUEST ${index + 1}/3`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.1),transparent_40%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <MonitorSmartphone className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">WORKSTATION ADMIN DESK</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 sm:text-xs">
              Resolved {resolved.length}/{CARDS.length}
            </span>
          </div>

          <div className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-3">
            {CARDS.map((item, i) => (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2 text-center font-mono text-[10px] tracking-wider ${
                  resolved.includes(item.id)
                    ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-200'
                    : i === index
                      ? 'border-cyan-400/50 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-700 bg-slate-950/50 text-slate-500'
                }`}
              >
                CARD {item.id.toUpperCase()}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              className="mx-auto w-full max-w-4xl"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.28 }}
            >
              <div className={`overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${TONE_STYLES[card.tone]}`}>
                <div className="border-b border-white/10 bg-slate-950/50 px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 ring-1 ring-white/10">
                      <Icon className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">POP-UP REQUEST</p>
                      <h2 className="mt-1 font-game text-lg text-white sm:text-xl">{card.title}</h2>
                      <p className="mt-1 text-xs text-slate-300 sm:text-sm">{card.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-950/70 p-4 sm:p-6">
                  <p className="text-sm text-slate-300">Select the compliant corporate action:</p>
                  {card.actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(action)}
                      className="w-full cursor-pointer rounded-xl border border-slate-600/70 bg-slate-900/80 px-4 py-3 text-left transition hover:border-cyan-400/50 hover:bg-cyan-950/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="font-game text-sm tracking-wide text-cyan-100">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {wrongFeedback && (
          <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={() => setWrongFeedback(null)} />
        )}

        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
      </div>
    </CyberHud>
  )
}
