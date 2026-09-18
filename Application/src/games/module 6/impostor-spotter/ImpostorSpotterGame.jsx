import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Building2,
  ClipboardCheck,
  HardDrive,
  Laptop,
  Package,
  PhoneCall,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import splash from '../../../assets/games/impostor-spotter/splash.png'
import CyberSplash, {
  CyberHud,
  FeedbackToast,
  WrongChoiceOverlay,
} from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'IMPOSTOR SPOTTER',
  'Social engineers impersonate trusted roles.',
  '• Fake IT, couriers, and auditors apply pressure',
  '• Urgency + authority = classic manipulation',
  '• Verify through official channels — never ad-hoc',
  'Handle three visitor encounters correctly.',
]

const ENCOUNTERS = [
  {
    id: 'it',
    role: 'IT Support',
    attire: 'Blue shirt · no company badge visible',
    quote: 'I am from IT. I need your laptop password to install an urgent patch right now.',
    icon: Laptop,
    accent: 'cyan',
    options: [
      {
        id: 'give',
        label: 'Share the password so the patch can go through',
        outcome: 'fail',
        feedbackTitle: 'Credential Harvest',
        reason:
          'Real IT never needs your password to push patches. Urgent “give me credentials now” requests are impersonation — call the official IT Helpdesk yourself.',
      },
      {
        id: 'refuse',
        label: 'Refuse & call IT Helpdesk directly',
        outcome: 'pass',
        xp: 40,
      },
      {
        id: 'write',
        label: 'Write the password on a sticky note for him',
        outcome: 'fail',
        feedbackTitle: 'Password Exposed',
        reason:
          'Handing credentials to an unverified visitor — even in writing — breaks policy and creates a permanent leak risk.',
      },
    ],
  },
  {
    id: 'courier',
    role: 'Courier',
    attire: 'Delivery vest · unannounced package',
    quote: 'Cash on delivery — pay me now or the package goes back. Your manager is expecting this.',
    icon: Package,
    accent: 'amber',
    options: [
      {
        id: 'pay',
        label: 'Pay cash from petty cash to avoid delay',
        outcome: 'fail',
        feedbackTitle: 'Unverified Delivery Scam',
        reason:
          'Unannounced COD packages are a common pretext. Never pay strangers at your desk — route all deliveries through Admin/Reception.',
      },
      {
        id: 'desk',
        label: 'Send to Admin / Reception',
        outcome: 'pass',
        xp: 30,
      },
      {
        id: 'open',
        label: 'Open the package at your desk first',
        outcome: 'fail',
        feedbackTitle: 'Unsafe Intake',
        reason:
          'Unknown packages can contain hazardous or malicious contents. Corporate intake happens at reception with chain-of-custody checks.',
      },
    ],
  },
  {
    id: 'auditor',
    role: 'External Auditor',
    attire: 'Clipboard · claims server-room access',
    quote: 'I’m here for a surprise audit. I need to walk the server room alone — don’t delay me.',
    icon: HardDrive,
    accent: 'rose',
    options: [
      {
        id: 'escort',
        label: 'Allow unescorted access to finish faster',
        outcome: 'fail',
        feedbackTitle: 'Restricted Zone Breach',
        reason:
          'Server rooms require verified identity and escorted access. Surprise-alone demands are a red flag for physical infiltration.',
      },
      {
        id: 'deny',
        label: 'Deny entry & alert Security Manager',
        outcome: 'pass',
        xp: 30,
      },
      {
        id: 'badge',
        label: 'Lend your badge so he can badge in',
        outcome: 'fail',
        feedbackTitle: 'Access Credential Shared',
        reason:
          'Lending badges destroys accountability. Auditors must be cleared and escorted by Security — never given employee credentials.',
      },
    ],
  },
]

const ACCENT = {
  cyan: {
    border: 'border-cyan-400/35',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-200',
    chip: 'bg-cyan-500/20 text-cyan-200',
  },
  amber: {
    border: 'border-amber-400/35',
    bg: 'bg-amber-950/40',
    text: 'text-amber-200',
    chip: 'bg-amber-500/20 text-amber-200',
  },
  rose: {
    border: 'border-rose-400/35',
    bg: 'bg-rose-950/40',
    text: 'text-rose-200',
    chip: 'bg-rose-500/20 text-rose-200',
  },
}

export default function ImpostorSpotterGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [busy, setBusy] = useState(false)

  const encounter = ENCOUNTERS[index]
  const styles = ACCENT[encounter?.accent] ?? ACCENT.cyan
  const Icon = encounter?.icon ?? UserRound

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function choose(option) {
    if (!encounter || busy || wrongFeedback || phase !== 'play') return

    if (option.outcome === 'fail') {
      setWrongFeedback({
        title: option.feedbackTitle,
        reason: option.reason,
      })
      return
    }

    setBusy(true)
    setScore((s) => s + option.xp)
    setToast({
      tone: 'ok',
      title: `+${option.xp} XP · Impostor blocked`,
      detail: `${encounter.role} challenge passed.`,
    })

    window.setTimeout(() => {
      setBusy(false)
      if (index >= ENCOUNTERS.length - 1) {
        setPhase('result')
        return
      }
      setIndex((i) => i + 1)
    }, 900)
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
    setToast(null)
    setWrongFeedback(null)
    setBusy(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · SOCIAL ENGINEERING & IMPERSONATION"
        lines={BRIEF}
        cta="START VISITOR DRILL"
        alt="Impostor Spotter"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="IMPOSTOR SPOTTER" score={score} onExit={onExit} status="VISITORS VERIFIED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">IMPERSONATION BLOCKED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Fake IT, rogue courier, and unescorted “auditor” — you refused pressure and followed verification
              protocols.
            </p>
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
              <ClipboardCheck className="size-4" />
              <span className="font-game text-xs tracking-wider">SOCIAL ENGINEERING SHIELD</span>
            </div>
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
      title="IMPOSTOR SPOTTER"
      score={score}
      onExit={onExit}
      status={`ENCOUNTER ${index + 1}/${ENCOUNTERS.length}`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_10%,rgba(244,63,94,0.1),transparent_40%),radial-gradient(ellipse_at_20%_90%,rgba(34,211,238,0.08),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">
                SYSLAB HQ · RECEPTION / FLOOR DESK
              </span>
            </div>
            <div className="flex gap-1.5">
              {ENCOUNTERS.map((item, i) => (
                <span
                  key={item.id}
                  className={`size-2.5 rounded-full ${
                    i < index ? 'bg-emerald-400' : i === index ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={encounter.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto w-full max-w-4xl"
            >
              <div className={`overflow-hidden rounded-2xl border ${styles.border} bg-slate-950/85 shadow-xl`}>
                <div className={`flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-4 ${styles.bg}`}>
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                    <Icon className={`size-7 ${styles.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider ${styles.chip}`}>
                      CLAIMS: {encounter.role.toUpperCase()}
                    </p>
                    <h2 className="mt-1 font-game text-lg text-white sm:text-xl">{encounter.role}</h2>
                    <p className="text-xs text-slate-400">{encounter.attire}</p>
                  </div>
                  <PhoneCall className="hidden size-5 text-slate-500 sm:block" />
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="relative rounded-2xl border border-slate-600/50 bg-slate-900/80 px-4 py-3">
                    <div className="absolute -top-2 left-6 size-3 rotate-45 border-l border-t border-slate-600/50 bg-slate-900" />
                    <p className="text-sm leading-relaxed text-slate-100 sm:text-base">“{encounter.quote}”</p>
                  </div>

                  <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500">SELECT YOUR RESPONSE</p>

                  <div className="grid gap-3">
                    {encounter.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={busy}
                        onClick={() => choose(option)}
                        className="cursor-pointer rounded-xl border border-slate-600/60 bg-black/25 px-4 py-3.5 text-left transition hover:border-cyan-400/45 hover:bg-cyan-950/25 disabled:cursor-wait disabled:opacity-60"
                      >
                        <p className="text-sm font-medium text-white sm:text-[15px]">{option.label}</p>
                        {option.outcome === 'pass' && (
                          <p className="mt-1 font-mono text-[10px] text-emerald-400/80">Recommended secure action</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
        {wrongFeedback && (
          <WrongChoiceOverlay
            feedback={wrongFeedback}
            onTryAgain={() => setWrongFeedback(null)}
          />
        )}
      </div>
    </CyberHud>
  )
}
