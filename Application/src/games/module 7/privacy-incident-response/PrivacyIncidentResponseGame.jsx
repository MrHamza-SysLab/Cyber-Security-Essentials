import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  CheckSquare,
  EyeOff,
  FileWarning,
  MailWarning,
  Scale,
  ShieldCheck,
  Siren,
  Square,
  Timer,
  UserCheck,
} from 'lucide-react'
import splash from '../../../assets/games/privacy-incident-response/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'PRIVACY POLICY INCIDENT RESPONSE',
  'Data leakage demands the right first moves.',
  '• Notify Security / DPO immediately',
  '• Ask the vendor to delete & confirm in writing',
  '• Never cover up a privacy mistake',
  'Complete the emergency checklist under time pressure.',
]

const TIMER_SEC = 45

const ACTIONS = [
  {
    id: 'notify',
    label: 'Notify Security / Data Protection Officer (DPO) Immediately',
    required: true,
    icon: UserCheck,
    hint: 'Starts the official incident & regulatory clock',
  },
  {
    id: 'delete',
    label: 'Request Vendor to Delete Email & Confirm in Writing',
    required: true,
    icon: MailWarning,
    hint: 'Contain the leak and create an evidence trail',
  },
  {
    id: 'coverup',
    label: 'Attempt to cover up the mistake and pretend it didn\'t happen',
    required: false,
    danger: true,
    icon: EyeOff,
    hint: 'Violates policy and increases regulatory risk',
  },
]

export default function PrivacyIncidentResponseGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [selected, setSelected] = useState({})
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(TIMER_SEC)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)
  const [busy, setBusy] = useState(false)
  const [timerKey, setTimerKey] = useState(0)

  const selectedIds = Object.keys(selected).filter((id) => selected[id])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (phase !== 'play' || busy || wrongFeedback) return undefined
    setLeft(TIMER_SEC)
    const tick = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [phase, busy, wrongFeedback, timerKey])

  useEffect(() => {
    if (phase !== 'play' || busy || wrongFeedback || left > 0) return undefined
    setBusy(true)
    setWrongFeedback({
      title: 'Response Window Expired',
      reason:
        'Privacy incidents require immediate action. Delayed reporting can trigger regulatory fines and destroy trust.',
    })
  }, [left, phase, busy, wrongFeedback])

  function toggle(id) {
    if (busy || wrongFeedback || phase !== 'play') return
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function submit() {
    if (busy || wrongFeedback || phase !== 'play') return
    setBusy(true)

    if (selected.coverup) {
      setWrongFeedback({
        title: 'Cover-Up Detected',
        reason:
          'Hiding a data leak makes the incident worse. Regulators treat concealment as an aggravating factor — always report through official channels.',
      })
      return
    }

    const requiredOk = ACTIONS.filter((a) => a.required).every((a) => selected[a.id])
    if (!requiredOk || selectedIds.length !== 2) {
      setWrongFeedback({
        title: 'Incomplete Incident Protocol',
        reason:
          'You must notify Security / DPO and request written deletion confirmation from the vendor. Leave the cover-up option unchecked.',
      })
      return
    }

    const speedBonus = left >= 25 ? 25 : left >= 15 ? 15 : 0
    const gained = 100 + speedBonus
    setScore(gained)
    setBadge(true)
    setToast({
      tone: 'ok',
      title: `Privacy Guardian · +${gained} XP`,
      detail: speedBonus
        ? `Proper reporting prevents regulatory fines. Speed bonus +${speedBonus}.`
        : 'Proper reporting prevents regulatory fines and protects customers.',
    })
    window.setTimeout(() => setPhase('result'), 1200)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setBusy(false)
    setSelected({})
    setLeft(TIMER_SEC)
    setTimerKey((k) => k + 1)
  }

  function resetPlay() {
    setSelected({})
    setScore(0)
    setLeft(TIMER_SEC)
    setToast(null)
    setWrongFeedback(null)
    setBadge(false)
    setBusy(false)
    setTimerKey((k) => k + 1)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 4 · DATA LEAKAGE & PRIVACY PRINCIPLES"
        lines={BRIEF}
        cta="START INCIDENT DRILL"
        alt="Privacy Policy Incident Response"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="PRIVACY INCIDENT RESPONSE" score={score} onExit={onExit} status="PROTOCOL CLEARED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">LEAK CONTAINED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You notified the DPO and secured written deletion from the vendor — the response that prevents regulatory
              fines.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">PRIVACY GUARDIAN</span>
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

  const timerPct = (left / TIMER_SEC) * 100
  const timerHot = left <= 12

  return (
    <CyberHud title="PRIVACY INCIDENT RESPONSE" score={score} onExit={onExit} status="ACTIVE INCIDENT">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(244,63,94,0.14),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-600/50 bg-slate-950/75 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Siren className={`size-4 ${timerHot ? 'animate-pulse text-rose-400' : 'text-cyan-400'}`} />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">PRIVACY EMERGENCY DESK</span>
            </div>
            <div
              className={`inline-flex items-center gap-2 font-mono text-sm ${
                timerHot ? 'text-rose-300' : 'text-amber-200'
              }`}
            >
              <Timer className="size-4" />
              <span>{left}s</span>
            </div>
          </div>

          <div className="mx-auto h-2 w-full max-w-3xl overflow-hidden rounded-full bg-slate-900">
            <motion.div
              className={`h-full ${timerHot ? 'bg-rose-400' : 'bg-cyan-400'}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="incident"
              className="mx-auto w-full max-w-3xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-950/70 ring-1 ring-rose-400/40">
                    <FileWarning className="size-6 text-rose-300" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-rose-200/80">INCIDENT · PII EXPOSURE</p>
                    <h2 className="mt-1 font-game text-xl text-white sm:text-2xl">Unencrypted Spreadsheet Sent Externally</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      You accidentally emailed an unencrypted spreadsheet containing{' '}
                      <span className="font-semibold text-amber-200">500 customer phone numbers</span> to an external
                      vendor address.
                    </p>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
                  <Scale className="size-3.5 text-amber-300" />
                  Regulatory exposure · GDPR / privacy fine risk active
                </div>

                <div className="mt-5">
                  <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-slate-400">
                    IMMEDIATE ACTIONS CHECKLIST
                  </p>
                  <div className="space-y-3">
                    {ACTIONS.map((action) => {
                      const Icon = action.icon
                      const on = Boolean(selected[action.id])
                      return (
                        <button
                          key={action.id}
                          type="button"
                          disabled={busy || !!wrongFeedback}
                          onClick={() => toggle(action.id)}
                          className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition disabled:opacity-60 ${
                            on
                              ? action.danger
                                ? 'border-rose-400/60 bg-rose-950/50'
                                : 'border-emerald-400/50 bg-emerald-950/35'
                              : action.danger
                                ? 'border-rose-500/25 bg-slate-950/60 hover:border-rose-400/40'
                                : 'border-slate-500/60 bg-slate-950/70 hover:border-cyan-400/50'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 text-cyan-200">
                            {on ? <CheckSquare className="size-5" /> : <Square className="size-5 opacity-60" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <Icon
                                className={`size-4 shrink-0 ${action.danger ? 'text-rose-300' : 'text-cyan-300'}`}
                              />
                              <span className="font-game text-sm tracking-wide text-cyan-50">{action.label}</span>
                            </span>
                            <span className="mt-1 block text-[11px] text-slate-400">{action.hint}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={busy || !!wrongFeedback || selectedIds.length === 0}
                    onClick={submit}
                    className="mt-5 w-full cursor-pointer rounded-xl bg-cyan-400 px-4 py-3.5 font-game text-sm font-bold tracking-wider text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    SUBMIT INCIDENT RESPONSE
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {wrongFeedback && <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={handleTryAgain} />}
        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
      </div>
    </CyberHud>
  )
}
