import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Bitcoin,
  Cable,
  FileLock2,
  Mail,
  Power,
  ShieldCheck,
  Siren,
  Timer,
  Wifi,
  WifiOff,
} from 'lucide-react'
import splash from '../../../assets/games/first-responder/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'THE FIRST RESPONDER',
  'Active ransomware — every second counts.',
  '• Contain the infection before it spreads',
  '• Preserve volatile memory for forensics',
  '• Never negotiate with attackers',
  'Apply the corporate emergency response protocol.',
]

const TIMER_SEC = 15

const CHOICES = [
  {
    id: 'power',
    label: 'Press the power button — shut down immediately',
    icon: Power,
    correct: false,
    wrongTitle: 'Forensics Destroyed',
    wrongReason:
      'Hard power-off erases volatile RAM that the security team needs for malware analysis. Contain the network first — isolate, then preserve evidence.',
  },
  {
    id: 'isolate',
    label: 'Disconnect Ethernet cable & turn off Wi-Fi',
    icon: Cable,
    correct: true,
    xp: 100,
    okMsg: 'Network isolated — ransomware cannot spread to shared drives or peers.',
  },
  {
    id: 'email',
    label: 'Email the attackers asking for a discount',
    icon: Mail,
    correct: false,
    wrongTitle: 'Policy Violation',
    wrongReason:
      'Never contact or pay ransomware operators. Negotiation legitimizes the attack, may trigger further extortion, and violates corporate incident policy.',
  },
]

export default function FirstResponderGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(TIMER_SEC)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)
  const [wifiOn, setWifiOn] = useState(true)
  const [lanConnected, setLanConnected] = useState(true)
  const [timerKey, setTimerKey] = useState(0)
  const [filesScramble, setFilesScramble] = useState(0)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2800)
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
    if (phase !== 'play' || busy || wrongFeedback) return undefined
    const scramble = window.setInterval(() => setFilesScramble((n) => n + 1), 400)
    return () => window.clearInterval(scramble)
  }, [phase, busy, wrongFeedback])

  useEffect(() => {
    if (phase !== 'play' || busy || wrongFeedback || left > 0) return undefined
    setBusy(true)
    setWrongFeedback({
      title: 'Containment Window Expired',
      reason:
        'Ransomware continued encrypting and may have reached shared network drives. Isolate the endpoint within seconds — disconnect LAN and disable Wi-Fi.',
    })
  }, [left, phase, busy, wrongFeedback])

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

    setLanConnected(false)
    setWifiOn(false)
    const speedBonus = left >= 10 ? 25 : left >= 5 ? 12 : 0
    const gained = option.xp + speedBonus
    setScore(gained)
    setBadge(true)
    setToast({
      tone: 'ok',
      title: `Containment Master · +${gained} XP`,
      detail: speedBonus
        ? `${option.okMsg} Speed bonus +${speedBonus}.`
        : option.okMsg,
    })
    window.setTimeout(() => setPhase('result'), 1400)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setBusy(false)
    setLeft(TIMER_SEC)
    setWifiOn(true)
    setLanConnected(true)
    setTimerKey((k) => k + 1)
  }

  function resetPlay() {
    setScore(0)
    setLeft(TIMER_SEC)
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    setBadge(false)
    setWifiOn(true)
    setLanConnected(true)
    setTimerKey((k) => k + 1)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · MALWARE & RANSOMWARE RESPONSE"
        lines={BRIEF}
        cta="START OUTBREAK DRILL"
        alt="The First Responder — Malware Outbreak Simulator"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="THE FIRST RESPONDER" score={score} onExit={onExit} status="OUTBREAK CONTAINED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">NETWORK ISOLATED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You cut Ethernet and disabled Wi-Fi — stopping lateral movement while preserving memory forensics for the
              security team.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">CONTAINMENT MASTER</span>
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
  const timerHot = left <= 5
  const fakeFiles = [
    'Q3_Forecast.xlsx',
    'Customer_DB.bak',
    'HR_Salaries.pdf',
    'VPN_Config.ovpn',
    'Board_Minutes.docx',
    'API_Keys.env',
  ]

  return (
    <CyberHud title="THE FIRST RESPONDER" score={score} onExit={onExit} status="ACTIVE ENCRYPTION">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(244,63,94,0.18),transparent_50%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          {/* Status bar */}
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-slate-950/80 px-4 py-3">
            <div className="flex items-center gap-2 text-rose-200">
              <Siren className={`size-4 ${timerHot ? 'animate-pulse text-rose-400' : 'text-rose-300'}`} />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">RANSOMWARE OUTBREAK · ENDPOINT 14</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[10px] ${
                  lanConnected
                    ? 'border-rose-400/40 bg-rose-950/50 text-rose-200'
                    : 'border-emerald-400/40 bg-emerald-950/40 text-emerald-200'
                }`}
              >
                <Cable className="size-3" />
                LAN {lanConnected ? 'LIVE' : 'CUT'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[10px] ${
                  wifiOn
                    ? 'border-amber-400/40 bg-amber-950/40 text-amber-200'
                    : 'border-emerald-400/40 bg-emerald-950/40 text-emerald-200'
                }`}
              >
                {wifiOn ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                Wi-Fi {wifiOn ? 'ON' : 'OFF'}
              </span>
              <div
                className={`inline-flex items-center gap-2 font-mono text-sm ${
                  timerHot ? 'text-rose-300' : 'text-amber-200'
                }`}
              >
                <Timer className="size-4" />
                <span>{left}s</span>
              </div>
            </div>
          </div>

          <div className="mx-auto h-2 w-full max-w-4xl overflow-hidden rounded-full bg-slate-900">
            <motion.div
              className={`h-full ${timerHot ? 'bg-rose-400' : 'bg-amber-400'}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          {/* Corporate desktop simulation */}
          <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-3 py-2">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="font-mono text-[10px] tracking-wider text-slate-400">CORP-WS-014 · Finance Floor</span>
              <span className="font-mono text-[10px] text-slate-500">Syslab OS</span>
            </div>

            <div className="relative min-h-[280px] p-4 sm:min-h-[320px] sm:p-6">
              {/* Desktop icons scrambling */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {fakeFiles.map((name, i) => {
                  const locked = (filesScramble + i) % 3 !== 0
                  return (
                    <motion.div
                      key={name}
                      animate={{ opacity: locked ? 0.55 : 1, scale: locked ? 0.97 : 1 }}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2"
                    >
                      <FileLock2 className={`size-4 shrink-0 ${locked ? 'text-rose-400' : 'text-cyan-300'}`} />
                      <span className="truncate font-mono text-[10px] text-slate-300 sm:text-xs">
                        {locked ? name.replace(/\.[^.]+$/, '.LOCKED') : name}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Ransomware popup */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute inset-x-3 bottom-3 top-auto z-20 mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:top-10 sm:bottom-auto"
                >
                  <div className="overflow-hidden rounded-xl border-2 border-rose-500/70 bg-slate-950 shadow-[0_0_50px_rgba(244,63,94,0.35)]">
                    <div className="bg-rose-600 px-4 py-2 text-center font-game text-sm tracking-wider text-white">
                      YOUR FILES HAVE BEEN ENCRYPTED
                    </div>
                    <div className="space-y-3 p-4 text-center">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-500/20 ring-2 ring-rose-400/50">
                        <Bitcoin className="size-7 text-amber-300" />
                      </div>
                      <p className="text-sm font-semibold text-rose-100">
                        All your files have been encrypted!
                      </p>
                      <p className="text-xs leading-relaxed text-slate-300">
                        Pay <span className="font-mono text-amber-300">5 BTC</span> within{' '}
                        <span className="font-mono text-rose-300">24 hours</span> or permanent data loss.
                      </p>
                      <div className="rounded-lg border border-rose-400/30 bg-rose-950/40 px-3 py-2 font-mono text-lg text-rose-200">
                        {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
                      </div>
                      <p className="font-mono text-[9px] tracking-widest text-slate-500">
                        DECISION WINDOW · {left}s REMAINING
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Response protocol choices */}
          <div className="mx-auto w-full max-w-4xl">
            <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-cyan-300/80">
              SELECT EMERGENCY RESPONSE ACTION
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CHOICES.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={busy || !!wrongFeedback}
                    onClick={() => handleChoice(option)}
                    className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-500/60 bg-slate-950/80 p-4 text-left transition hover:border-cyan-400/55 hover:bg-cyan-950/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 ring-1 ring-white/10 transition group-hover:ring-cyan-400/40">
                      <Icon className="size-5 text-cyan-200" />
                    </div>
                    <span className="font-game text-sm leading-snug tracking-wide text-cyan-50">
                      {option.label}
                    </span>
                  </button>
                )
              })}
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
