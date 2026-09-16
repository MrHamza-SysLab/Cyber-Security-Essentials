import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertTriangle,
  Battery,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  RotateCcw,
  Signal,
  Smartphone,
  Wifi,
  X,
} from 'lucide-react'
import splash from '../../../assets/games/mfa-gatekeeper/splash.png'
import wrongChoiceAlarm from '../../../assets/games/social-engineering-trap-detector/wrong-choice-alarm.mp3'
import CyberSplash, { CyberHud, FeedbackToast } from '../shared/CyberSplash'

const BRIEF = [
  'MFA GATEKEEPER',
  'You are the security admin on call.',
  '• Approve only trusted devices',
  '• Deny unknown / odd-hour logins',
  '• MFA Fatigue = Deny All & Report',
  'Audit every push. Protect the gate.',
]

const SCENARIOS = [
  {
    id: 1,
    email: 'you@gmail.com',
    initial: 'Y',
    avatarBg: '#1a73e8',
    device: 'Chrome on Windows',
    near: 'Karachi, PK',
    time: 'Just now',
    correct: 'approve',
    okMsg: 'Approved — matches your enrolled device.',
    wrongTitle: 'Locked Yourself Out',
    wrongReason:
      'This matched your enrolled device (Chrome on Windows · Karachi). Denying your own MFA push can lock you out of your account.',
  },
  {
    id: 2,
    email: 'you@gmail.com',
    initial: 'Y',
    avatarBg: '#1a73e8',
    device: 'Unknown Browser',
    near: 'Moscow, RU',
    time: '3:00 AM',
    correct: 'deny',
    okMsg: 'Denied — odd location & hour are classic hijack signals.',
    wrongTitle: 'Approved a Hijack Push',
    wrongReason:
      'Unknown browser from Moscow at 3:00 AM is a classic account-takeover signal. Never approve MFA pushes you did not start.',
  },
]

function playSirenBeep() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sawtooth'
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.value = 0.12

    const start = ctx.currentTime
    for (let step = 0; step < 5; step += 1) {
      oscillator.frequency.setValueAtTime(920, start + step * 0.28)
      oscillator.frequency.setValueAtTime(520, start + step * 0.28 + 0.14)
    }

    oscillator.start(start)
    oscillator.stop(start + 1.5)
    window.setTimeout(() => ctx.close(), 1600)
  } catch {
    // Audio may be blocked until user interaction.
  }
}

function WrongChoiceOverlay({ feedback, onTryAgain }) {
  const alarmRef = useRef(null)

  useEffect(() => {
    playSirenBeep()

    const alarm = new Audio(wrongChoiceAlarm)
    alarmRef.current = alarm
    const playPromise = alarm.play()
    if (playPromise?.catch) playPromise.catch(() => {})

    return () => {
      alarm.pause()
      alarm.src = ''
      alarmRef.current = null
    }
  }, [feedback])

  return (
    <div className="se-alarm-overlay fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 scanline opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(248,113,113,0.08)_0px,rgba(248,113,113,0.08)_2px,transparent_2px,transparent_6px)]" />

      <div className="se-alarm-card game-shake relative w-full max-w-xl overflow-hidden rounded-2xl border-2 border-rose-400/70 bg-slate-950/95 p-6 text-white shadow-[0_0_60px_rgba(248,113,113,0.45)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.22),transparent_55%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-rose-500/20 ring-2 ring-rose-400/60">
            <AlertTriangle className="size-8 animate-pulse text-rose-300" />
          </div>
          <p className="mt-4 font-mono text-xs tracking-[0.32em] text-rose-300">SECURITY ALERT</p>
          <h2 className="mt-2 font-game text-3xl text-white sm:text-4xl">WRONG DECISION</h2>
          <p className="mt-3 text-lg font-semibold text-cyan-200">{feedback.title}</p>
          <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-left text-sm leading-relaxed text-rose-100 sm:text-base">
            <span className="font-semibold text-rose-200">Why this is wrong:</span> {feedback.reason}
          </p>
          <button
            type="button"
            onClick={onTryAgain}
            className="mt-7 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-cyan-400 px-8 font-game text-sm tracking-wider text-slate-950 transition hover:bg-cyan-300 sm:text-base"
          >
            <RotateCcw className="size-4" />
            TRY AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}

function GoogleLogo({ className = 'h-6 w-auto' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 272 92"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google"
      role="img"
    >
      <path
        fill="#EA4335"
        d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#FBBC05"
        d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#4285F4"
        d="M209.75 26.34v39.91c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.33 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
      />
      <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
      <path
        fill="#EA4335"
        d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
      />
      <path
        fill="#4285F4"
        d="M35.29 41.41V32H67.2c.32 1.68.48 3.44.48 5.48 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.86 69.15 0 53.54 0 34.57 0 15.61 16.86 0 35.51 0c10.08 0 17.89 3.95 23.52 9.07l-6.64 6.64c-4.03-3.78-9.49-6.72-16.88-6.72-13.61 0-24.1 11.08-24.1 25.58 0 14.5 10.49 25.58 24.1 25.58 8.74 0 13.69-3.53 16.88-6.76 2.6-2.6 4.28-6.3 4.95-11.37H35.29z"
      />
    </svg>
  )
}

function GoogleGIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 36.3 44 31 44 24c0-1.3-.1-2.7-.4-3.9z"
      />
    </svg>
  )
}

function PhoneBezel({ children, dark = false }) {
  return (
    <div className="overflow-hidden rounded-[2.2rem] border-[5px] border-[#1c1c1e] bg-[#1c1c1e] p-[3px] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div
        className={`relative overflow-hidden rounded-[1.85rem] ${dark ? 'bg-black' : 'bg-white'}`}
      >
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  )
}

function GooglePromptShell({ children, onBack }) {
  return (
    <PhoneBezel>
      <div className="flex min-h-[520px] flex-col bg-white px-5 pb-5 pt-10">
        <div className="relative mb-6 flex items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5"
            aria-label="Back"
          >
            <ChevronLeft className="size-6" strokeWidth={2} />
          </button>
          <GoogleLogo className="h-7 w-auto" />
        </div>
        {children}
      </div>
    </PhoneBezel>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[15px] font-medium leading-tight text-[#202124]">{label}</p>
      <p className="mt-0.5 text-[14px] leading-snug text-[#5f6368]">{value}</p>
    </div>
  )
}

function PromptBody({ email, initial, avatarBg, device, near, time }) {
  return (
    <>
      <h2 className="text-center text-[26px] font-normal leading-tight tracking-tight text-[#202124]">
        Is it you trying to sign in?
      </h2>

      <div className="mt-5 flex items-center justify-center gap-2.5">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
          style={{ backgroundColor: avatarBg }}
        >
          {initial}
        </span>
        <p className="text-[14px] text-[#3c4043]">{email}</p>
      </div>

      <div className="mt-10 space-y-7 text-left">
        <DetailRow label="Device" value={device} />
        <DetailRow label="Near" value={near} />
        <DetailRow label="Time" value={time} />
      </div>
    </>
  )
}

function PromptActions({ busy, onDeny, onApprove, denyLabel = "No, it's not me", approveLabel = 'Yes' }) {
  return (
    <div className="mt-auto grid grid-cols-2 gap-3 pt-10">
      <button
        type="button"
        disabled={busy}
        onClick={onDeny}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dadce0] px-2 text-[14px] font-medium text-[#1a73e8] transition hover:bg-[#f8f9fa] disabled:opacity-50"
      >
        <X className="size-4 shrink-0 text-[#d93025]" strokeWidth={2.5} />
        <span className="leading-tight">{denyLabel}</span>
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onApprove}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dadce0] px-2 text-[14px] font-medium text-[#1a73e8] transition hover:bg-[#f8f9fa] disabled:opacity-50"
      >
        <Check className="size-4 shrink-0 text-[#188038]" strokeWidth={2.5} />
        <span>{approveLabel}</span>
      </button>
    </div>
  )
}

function NotificationRow({ timeLabel }) {
  return (
    <div className="flex items-start gap-3 border-t border-white/10 px-3 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#202124]">
        <GoogleGIcon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white">
          Google <span className="font-normal text-white/55">· {timeLabel}</span>
        </p>
        <p className="mt-0.5 truncate text-[12px] leading-snug text-white/60">
          Suspicious login alert There was an attempt t…
        </p>
      </div>
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
        <ChevronDown className="size-3.5 text-white/70" />
      </div>
    </div>
  )
}

function NotificationShadePhone({ count, busy, onApprove, onReport }) {
  const visible = Math.min(count, 5)
  const times = ['now', 'now', '1m', '2m', '4m']

  return (
    <PhoneBezel dark>
      <div className="relative flex min-h-[560px] flex-col bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-5 pb-2 pt-9 text-[11px] font-medium text-white">
          <div className="flex flex-col leading-tight">
            <span>9:37</span>
            <span className="text-[10px] text-white/70">Wed, Sep 16</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90">
            <Wifi className="size-3.5" />
            <Signal className="size-3.5" />
            <span className="text-[10px]">64%</span>
            <Battery className="size-3.5" />
          </div>
        </div>

        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-2 mt-1 overflow-hidden rounded-b-[1.4rem] rounded-t-xl bg-[#2a2a2e] shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <p className="text-[12px] font-medium text-white/55">Silent</p>
            <X className="size-3.5 text-white/45" />
          </div>

          <div className="flex items-center gap-2.5 px-3 pb-2 pt-1">
            <div className="flex size-7 items-center justify-center rounded-full bg-[#4285F4]/20">
              <GoogleGIcon size={18} />
            </div>
            <p className="flex-1 text-[13px] font-medium text-white">Google</p>
            <p className="mr-1 text-[11px] text-rose-300">{count}/5</p>
            <ChevronUp className="size-4 text-white/55" />
          </div>

          <div className="max-h-[280px] overflow-hidden">
            <AnimatePresence initial={false}>
              {Array.from({ length: visible }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.28 }}
                >
                  <NotificationRow timeLabel={times[i] || 'now'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
              <div className="size-2 rounded-full bg-white/70" />
            </div>
          </div>
        </motion.div>

        <div className="mt-auto space-y-2 px-4 pb-6 pt-5">
          {count >= 5 ? (
            <>
              <p className="mb-1 text-center text-[11px] font-medium tracking-wide text-rose-300">
                MFA fatigue attack — spam pushes
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={onApprove}
                className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-[14px] font-medium text-white/90 hover:bg-white/10 disabled:opacity-50"
              >
                <Check className="size-4 text-[#34A853]" strokeWidth={2.5} />
                Yes (approve latest)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onReport}
                className="game-pop flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#1a73e8] text-[14px] font-medium text-white hover:bg-[#1765cc] disabled:opacity-50"
              >
                Deny All & Report to IT
              </button>
            </>
          ) : (
            <p className="pb-8 text-center text-[12px] text-white/40">
              Incoming pushes… {count}/5
            </p>
          )}
        </div>

        <div className="mx-auto mb-2 h-1 w-28 rounded-full bg-white/80" />
      </div>
    </PhoneBezel>
  )
}

export default function MFAGatekeeperGame({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [flash, setFlash] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [fatigueCount, setFatigueCount] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (phase !== 'play' || step !== 2) return undefined
    setFatigueCount(0)
    let n = 0
    const timer = window.setInterval(() => {
      n += 1
      setFatigueCount(n)
      if (n >= 5) window.clearInterval(timer)
    }, 380)
    return () => window.clearInterval(timer)
  }, [phase, step])

  function triggerWrongAlert({ title, reason }) {
    setFlash(true)
    setWrong((w) => w + 1)
    setScore((s) => Math.max(0, s - 20))
    setWrongFeedback({ title, reason })
    window.setTimeout(() => setFlash(false), 500)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setBusy(false)
  }

  function decide(action) {
    if (busy || wrongFeedback) return
    const scene = SCENARIOS[step]
    if (!scene) return
    setBusy(true)
    if (action === scene.correct) {
      setScore((s) => s + 40)
      setFeedback({ tone: 'ok', title: 'Good call', detail: scene.okMsg })
      window.setTimeout(() => {
        setFeedback(null)
        setBusy(false)
        setStep((v) => v + 1)
      }, 900)
    } else {
      triggerWrongAlert({
        title: scene.wrongTitle,
        reason: scene.wrongReason,
      })
    }
  }

  function fatigueAction(kind) {
    if (busy || wrongFeedback) return
    setBusy(true)
    if (kind === 'report') {
      setScore((s) => s + 60)
      setFeedback({
        tone: 'ok',
        title: 'MFA Fatigue Blocked',
        detail: 'Deny All & Report to IT — correct response to spam pushes.',
      })
      window.setTimeout(() => setPhase('result'), 1200)
      return
    }
    triggerWrongAlert({
      title: 'MFA Fatigue Attack',
      reason:
        'Attackers spam MFA pushes until someone taps Yes. Approving a push you did not start can hand over your account — Deny All & Report to IT instead.',
    })
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 2 · MULTI-FACTOR AUTHENTICATION"
        lines={BRIEF}
        cta="OPEN THE GATE"
        alt="MFA Gatekeeper"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    const passed = wrong < 3
    return (
      <CyberHud title="MFA GATEKEEPER" score={score} onExit={onExit} status="SHIFT COMPLETE">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-cyan-400/35 bg-slate-950/90 p-6 text-center">
            <Smartphone className="mx-auto size-12 text-cyan-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-cyan-200">
              {passed ? 'GATE SECURED' : 'REVIEW NEEDED'}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Approve only known devices. Deny strangers. Never rubber-stamp MFA fatigue spam — Deny All &
              Report.
            </p>
            <p className="mt-4 font-mono text-emerald-300">
              {score} XP · {wrong} mistakes
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep(0)
                  setScore(0)
                  setWrong(0)
                  setFeedback(null)
                  setWrongFeedback(null)
                  setBusy(false)
                  setPhase('play')
                }}
                className="min-h-12 cursor-pointer rounded-xl border border-cyan-400/40 px-5 font-game text-sm text-cyan-200"
              >
                Replay
              </button>
              <button
                type="button"
                onClick={onExit}
                className="min-h-12 cursor-pointer rounded-xl bg-cyan-400 px-5 font-game text-sm font-bold text-slate-950"
              >
                Back to module
              </button>
            </div>
          </div>
        </div>
      </CyberHud>
    )
  }

  const scene = SCENARIOS[step]

  return (
    <CyberHud
      title="MFA GATEKEEPER"
      score={score}
      onExit={onExit}
      status={step < 2 ? `REQUEST ${step + 1}/3` : 'FATIGUE ATTACK'}
    >
      <div
        className={`relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 transition ${
          flash ? 'bg-rose-600/30 animate-pulse' : ''
        }`}
      >
        <div className="relative w-full max-w-[360px]">
          {step < 2 && scene && (
            <GooglePromptShell onBack={onExit}>
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[440px] flex-1 flex-col"
              >
                <PromptBody
                  email={scene.email}
                  initial={scene.initial}
                  avatarBg={scene.avatarBg}
                  device={scene.device}
                  near={scene.near}
                  time={scene.time}
                />
                <PromptActions
                  busy={busy}
                  onDeny={() => decide('deny')}
                  onApprove={() => decide('approve')}
                />
              </motion.div>
            </GooglePromptShell>
          )}

          {step === 2 && (
            <NotificationShadePhone
              count={fatigueCount}
              busy={busy}
              onApprove={() => fatigueAction('approve')}
              onReport={() => fatigueAction('report')}
            />
          )}
        </div>
      </div>

      {wrongFeedback && (
        <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={handleTryAgain} />
      )}

      {feedback && !wrongFeedback && (
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
