import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Laptop,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Timer,
  WifiOff,
} from 'lucide-react'
import splash from '../../../assets/games/account-hijack-simulator/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'CRITICAL INCIDENT PROTOCOL',
  'Emergencies reward speed and accuracy.',
  '• 15 seconds per scenario',
  '• Never disable antivirus',
  '• Lost devices → remote wipe fast',
  'Follow the corporate emergency playbook.',
]

const TIMER_SEC = 15

const SCENARIOS = [
  {
    id: 'av',
    label: 'Scenario A · Antivirus Alert',
    headline: 'Malware Detected',
    detail: 'Antivirus requests an immediate restart to finish quarantine and patch memory-resident threats.',
    icon: ShieldAlert,
    accent: 'border-rose-400/45 bg-rose-950/35',
    options: [
      {
        id: 'restart',
        label: 'Save work and restart immediately',
        correct: true,
        xp: 50,
        okMsg: 'AV restart completed — malware containment finished.',
      },
      {
        id: 'disable',
        label: 'Disable antivirus and keep working',
        correct: false,
        wrongTitle: 'Antivirus Disabled',
        wrongReason:
          'Never disable AV during an alert. That leaves the endpoint unprotected while malware may still be active.',
      },
      {
        id: 'later',
        label: 'Snooze restart until tomorrow',
        correct: false,
        wrongTitle: 'Containment Delayed',
        wrongReason:
          'Delaying a malware-driven restart gives the threat more time to persist, spread, or exfiltrate data.',
      },
    ],
  },
  {
    id: 'stolen',
    label: 'Scenario B · Stolen / Lost Device',
    headline: 'Laptop Bag Left in a Taxi',
    detail: 'An employee realizes their corporate laptop was left in a taxi after a client visit. Sensitive mail and VPN access may be on the device.',
    icon: Laptop,
    accent: 'border-amber-400/45 bg-amber-950/35',
    options: [
      {
        id: 'wipe',
        label: 'Trigger Emergency IT Remote Wipe',
        correct: true,
        xp: 50,
        okMsg: 'Remote wipe triggered — corporate data protected.',
      },
      {
        id: 'wait',
        label: 'Wait 24 hours for the taxi driver',
        correct: false,
        wrongTitle: 'Lost Device Left Exposed',
        wrongReason:
          'Waiting a day leaves company data at risk. Corporate policy is to trigger remote wipe / MDM lock immediately and report the loss.',
      },
      {
        id: 'email',
        label: 'Email a password tip to yourself first',
        correct: false,
        wrongTitle: 'Wrong First Priority',
        wrongReason:
          'The first action is containing the lost device (wipe / lock / report), not sending tips to yourself while the laptop is still missing.',
      },
    ],
  },
]

export default function CriticalIncidentProtocolGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(TIMER_SEC)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [timerKey, setTimerKey] = useState(0)

  const scenario = SCENARIOS[index]

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (phase !== 'play' || busy || wrongFeedback || !scenario) return undefined
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
  }, [phase, index, busy, wrongFeedback, scenario, timerKey])

  useEffect(() => {
    if (phase !== 'play' || busy || wrongFeedback || left > 0 || !scenario) return undefined
    setBusy(true)
    setWrongFeedback({
      title: 'Response Window Expired',
      reason: `Critical incidents require a decision within ${TIMER_SEC} seconds. Re-read the playbook and respond immediately.`,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase, busy, wrongFeedback])

  function advance() {
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    if (index >= SCENARIOS.length - 1) {
      setPhase('result')
      return
    }
    setIndex((i) => i + 1)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setBusy(false)
    setLeft(TIMER_SEC)
    setTimerKey((k) => k + 1)
  }

  function handleChoice(option) {
    if (busy || wrongFeedback || phase !== 'play') return
    setBusy(true)

    if (!option.correct) {
      setWrongFeedback({
        title: option.wrongTitle,
        reason: option.wrongReason,
      })
      return
    }

    const speedBonus = left >= 10 ? 15 : left >= 5 ? 8 : 0
    const gained = option.xp + speedBonus
    setScore((s) => s + gained)
    setToast({
      tone: 'ok',
      title: `Protocol Cleared · +${gained} XP`,
      detail: speedBonus
        ? `${option.okMsg} Speed bonus +${speedBonus}.`
        : option.okMsg,
    })
    window.setTimeout(advance, 950)
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
    setLeft(TIMER_SEC)
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    setTimerKey((k) => k + 1)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 4 · AV & LOST / STOLEN DEVICES"
        lines={BRIEF}
        cta="START PROTOCOL DRILL"
        alt="Critical Incident Emergency Protocol"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="CRITICAL INCIDENT PROTOCOL" score={score} onExit={onExit} status="DRILL COMPLETE">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">EMERGENCY PLAYBOOK PASSED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You restarted for AV containment and triggered remote wipe for a lost laptop — the two responses that protect people and data under pressure.
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

  const Icon = scenario.icon
  const timerPct = (left / TIMER_SEC) * 100
  const timerHot = left <= 5

  return (
    <CyberHud
      title="CRITICAL INCIDENT PROTOCOL"
      score={score}
      onExit={onExit}
      status={`SCENARIO ${index + 1}/2`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(244,63,94,0.12),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-600/50 bg-slate-950/75 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Siren className={`size-4 ${timerHot ? 'animate-pulse text-rose-400' : 'text-cyan-400'}`} />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">EMERGENCY DECISION ENGINE</span>
            </div>
            <div className={`inline-flex items-center gap-2 font-mono text-sm ${timerHot ? 'text-rose-300' : 'text-amber-200'}`}>
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
              key={scenario.id}
              className="mx-auto w-full max-w-3xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className={`rounded-2xl border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-6 ${scenario.accent}`}>
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-300">{scenario.label}</p>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-950/70 ring-1 ring-white/10">
                    <Icon className="size-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-game text-xl text-white sm:text-2xl">{scenario.headline}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">{scenario.detail}</p>
                  </div>
                </div>

                {scenario.id === 'stolen' && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
                    <WifiOff className="size-3.5 text-amber-300" />
                    Device may still hold VPN + mailbox tokens
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {scenario.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={busy || !!wrongFeedback}
                      onClick={() => handleChoice(option)}
                      className="w-full cursor-pointer rounded-xl border border-slate-500/60 bg-slate-950/75 px-4 py-3.5 text-left transition hover:border-cyan-400/55 hover:bg-cyan-950/35 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="font-game text-sm tracking-wide text-cyan-100">{option.label}</span>
                    </button>
                  ))}
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
