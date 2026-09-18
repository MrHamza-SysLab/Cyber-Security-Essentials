import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Cloud,
  CloudOff,
  Lock,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import splash from '../../../assets/games/channel-guard/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'CHANNEL GUARD',
  'Stop Shadow IT before data leaves the building.',
  '• Personal Dropbox & WhatsApp are not approved',
  '• Never email customer DBs to personal Gmail',
  '• Use corporate secure file transfer / OneDrive',
  'Pick the compliant sharing channel.',
]

const OPTIONS = [
  {
    id: 'dropbox',
    title: 'Choice A',
    label: 'Upload to personal Dropbox and send the link on WhatsApp',
    detail: 'Quick for the team — but outside company control.',
    safe: false,
    icon: CloudOff,
    feedbackTitle: 'Shadow IT & Data Leakage',
    feedback:
      'Personal Dropbox and WhatsApp are unapproved channels. Customer databases leave corporate DLP, audit logs, and retention controls — a classic Shadow IT leak.',
  },
  {
    id: 'corporate',
    title: 'Choice B',
    label: 'Refuse and use the official corporate secure file transfer portal / OneDrive',
    detail: 'Approved channel with access control and audit trail.',
    safe: true,
    icon: Lock,
  },
  {
    id: 'gmail',
    title: 'Choice C',
    label: 'Email the file to their personal Gmail account instead',
    detail: 'Avoids WhatsApp — but still an unapproved destination.',
    safe: false,
    icon: ShieldAlert,
    feedbackTitle: 'Unapproved Channel',
    feedback:
      'Personal Gmail is still outside corporate policy. Customer data emailed to a private inbox cannot be recalled, monitored, or legally controlled by the company.',
  },
]

export default function ChannelGuardGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [choice, setChoice] = useState(null)
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)

  function pick(option) {
    if (choice || wrongFeedback) return
    setChoice(option.id)

    if (!option.safe) {
      setWrongFeedback({
        title: option.feedbackTitle,
        reason: option.feedback,
      })
      return
    }

    setScore(100)
    setBadge(true)
    setToast({
      tone: 'ok',
      title: 'Security Sentinel unlocked · +100 XP',
      detail: 'Official secure transfer keeps customer data inside corporate controls.',
    })
    window.setTimeout(() => setPhase('result'), 1400)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setChoice(null)
  }

  function resetPlay() {
    setChoice(null)
    setScore(0)
    setToast(null)
    setWrongFeedback(null)
    setBadge(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 2 · SAFE SHARING & PERSONAL CLOUD"
        lines={BRIEF}
        cta="OPEN TEAM CHAT"
        alt="Channel Guard"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="CHANNEL GUARD" score={score} onExit={onExit} status="CHANNEL SECURED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">SAFE SHARE APPROVED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You blocked Shadow IT and routed the customer database through the corporate secure portal.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">SECURITY SENTINEL</span>
              </div>
            )}
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
    <CyberHud title="CHANNEL GUARD" score={score} onExit={onExit} status="DECISION PENDING">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_10%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(ellipse_at_80%_90%,rgba(244,63,94,0.08),transparent_50%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Chat simulator */}
            <div className="overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3 border-b border-slate-700/80 bg-slate-900/90 px-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-cyan-500/20 ring-1 ring-cyan-400/40">
                  <Smartphone className="size-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Alex Rivera · Sales Ops</p>
                  <p className="font-mono text-[10px] text-emerald-400">● Online · Teams DM</p>
                </div>
              </div>

              <div className="space-y-3 bg-gradient-to-b from-slate-900/40 to-slate-950 p-4 sm:p-5">
                <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-slate-600/50 bg-slate-800/80 px-3.5 py-2.5 text-sm leading-relaxed text-slate-100">
                  Hey — the customer DB export is too large for email.
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-amber-400/30 bg-amber-950/40 px-3.5 py-2.5 text-sm leading-relaxed text-amber-50">
                  Can you upload the customer DB to your <span className="font-semibold text-amber-200">personal Dropbox</span> and send me a{' '}
                  <span className="font-semibold text-amber-200">WhatsApp link</span>?
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-950/40 px-3 py-2 text-[11px] text-rose-100">
                  <ShieldAlert className="size-3.5 shrink-0" />
                  Policy alert: customer database · high sensitivity
                </div>

                <AnimatePresence>
                  {badge && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-950/50 px-3 py-3"
                    >
                      <Cloud className="size-6 text-emerald-300" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-200">Corporate OneDrive link sent</p>
                        <p className="text-[11px] text-emerald-300/70">Expiry 24h · audit logged · DLP scanned</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Choices */}
            <div className="rounded-2xl border border-slate-600/50 bg-slate-950/70 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="size-4 text-cyan-400" />
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">YOUR RESPONSE</p>
              </div>
              <p className="mb-4 text-sm text-slate-300">
                How do you handle this sharing request?
              </p>
              <div className="space-y-3">
                {OPTIONS.map((option) => {
                  const Icon = option.icon
                  const selected = choice === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={Boolean(choice) || Boolean(wrongFeedback)}
                      onClick={() => pick(option)}
                      className={`game-pop w-full cursor-pointer rounded-xl border p-3.5 text-left transition disabled:opacity-60 ${
                        selected && option.safe
                          ? 'border-emerald-400/60 bg-emerald-950/40'
                          : 'border-slate-600/60 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-cyan-950/25'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            option.safe ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="font-mono text-[9px] tracking-[0.18em] text-cyan-400/80">{option.title}</p>
                          <p className="mt-1 text-sm font-medium leading-snug text-slate-100">{option.label}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{option.detail}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {wrongFeedback && <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={handleTryAgain} />}
        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
      </div>
    </CyberHud>
  )
}
