import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  Coffee,
  EyeOff,
  FileText,
  Grid3x3,
  HelpCircle,
  MessageSquare,
  Pause,
  PhoneOff,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react'
import iphoneRingtone from '../../../assets/games/social-engineering-trap-detector/iphone-ringtone.mp3'
import wrongChoiceAlarm from '../../../assets/games/social-engineering-trap-detector/wrong-choice-alarm.mp3'
import GameShell from '../../module 1/shared/GameShell'

const CHAT_THREADS = [
  { name: 'Sarah Chen', time: '10:42 AM', preview: 'Thanks for the update on the quarterly report…' },
  { name: 'HR · Payroll', time: '10:40 AM', preview: 'URGENT: Salary verification OTP required…', active: true },
  { name: 'IT Helpdesk', time: 'Yesterday', preview: 'Your ticket #4821 has been resolved.' },
  { name: 'Team Standup', time: 'Yesterday', preview: 'Meeting notes from today\'s sync are attached.' },
  { name: 'Finance Dept', time: 'Monday', preview: 'Invoice approval request — action required.' },
]

const CALL_SCRIPT = {
  before: 'Hello, I am calling from HR Payroll. We are processing an urgent salary update on your account. ',
  highlight: 'I need your OTP immediately',
  after: ' so we can verify the change before payroll locks for the month.',
}

const CALL_DURATION_MS = 7000

const CHOICES = [
  {
    id: 'otp',
    label: 'Read the OTP aloud',
    correct: false,
    feedbackTitle: 'OTP Handed to Visher',
    feedback:
      'Legitimate HR never asks for one-time passwords over a cold call. Sharing OTPs lets attackers take over payroll or SSO accounts.',
  },
  {
    id: 'callback',
    label: 'Call back on this number',
    correct: false,
    feedbackTitle: 'Callback on Attacker Number',
    feedback:
      'Calling back the same number keeps you on the scammer’s line. Hang up and report through official HR / Security channels.',
  },
  {
    id: 'report',
    label: 'Hang up & report vishing',
    correct: true,
    feedbackTitle: 'Correct Response',
    feedback: 'You hung up and reported the call — the safest response to OTP pressure on an unverified line.',
  },
]

const CAFE_TASKS = {
  filter: { label: 'Privacy screen filter ON', xp: 25 },
  speaker: { label: 'Speakerphone muted / off', xp: 25 },
  angle: { label: 'Screen angled away from walkway', xp: 25 },
}

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
            <span className="font-semibold text-rose-200">Why this is wrong:</span>{' '}
            {feedback.reason}
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

function Waveform({ active }) {
  const bars = [18, 28, 14, 32, 22, 36, 16, 30, 20, 26, 12, 34, 24, 18, 30, 16, 28, 22]

  return (
    <div className="mt-6 flex h-10 items-end justify-center gap-[3px]">
      {bars.map((height, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full bg-cyan-400 ${active ? 'animate-pulse' : 'opacity-40'}`}
          style={{
            height: `${height}px`,
            animationDelay: active ? `${index * 0.08}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}

function CallerAvatar({ size = 'lg' }) {
  const sizeClass = size === 'sm' ? 'size-28 sm:size-32' : 'size-36 sm:size-40'
  return (
    <div className={`${sizeClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 ring-2 ring-cyan-400/50`}>
      <Building2 className="size-12 text-cyan-300 sm:size-14" />
    </div>
  )
}

function IntroScreen({ onAnswer, onExit, score = 0 }) {
  const ringtoneRef = useRef(null)

  useEffect(() => {
    const ringtone = new Audio(iphoneRingtone)
    ringtone.loop = true
    ringtone.volume = 0.7
    ringtoneRef.current = ringtone

    const tryPlay = () => {
      const playPromise = ringtone.play()
      if (playPromise?.catch) playPromise.catch(() => {})
    }

    tryPlay()

    const unlock = () => {
      tryPlay()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      ringtone.pause()
      ringtone.src = ''
      ringtoneRef.current = null
    }
  }, [])

  function handleAnswer() {
    const ringtone = ringtoneRef.current
    if (ringtone) {
      ringtone.pause()
      ringtone.currentTime = 0
    }
    onAnswer()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a1018] text-white">
      <header className="flex min-h-12 shrink-0 items-center justify-between border-b border-cyan-400/15 bg-[#0d1520] px-4 sm:min-h-14 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-200 sm:text-base">
          <Shield className="size-4 text-cyan-400 sm:size-5" />
          <span className="hidden sm:inline">Security Awareness Training</span>
          <span className="sm:hidden">Training</span>
        </div>
        <p className="font-game text-sm tracking-[0.12em] text-white sm:text-base">VISHING SHIELD</p>
        <div className="flex items-center gap-3 font-mono text-xs sm:gap-5 sm:text-sm">
          <span className="font-semibold text-cyan-300">{score} PTS</span>
          <button
            type="button"
            onClick={onExit}
            className="ml-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Exit"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col p-3 sm:p-5">
        <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 overflow-hidden rounded-xl border border-slate-700/60 bg-[#121a24] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <aside className="hidden w-14 shrink-0 flex-col items-center gap-5 border-r border-slate-700/50 bg-[#0f141c] py-5 sm:flex">
            <Bell className="size-5 text-slate-500" />
            <MessageSquare className="size-5 text-cyan-400" />
            <Grid3x3 className="size-5 text-slate-500" />
            <FileText className="size-5 text-slate-500" />
            <div className="mt-auto space-y-5">
              <HelpCircle className="size-5 text-slate-500" />
              <Settings className="size-5 text-slate-500" />
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1">
            <div className="hidden w-[280px] shrink-0 flex-col border-r border-slate-700/50 bg-[#151c27] md:flex">
              <div className="border-b border-slate-700/50 px-4 py-3">
                <p className="text-lg font-semibold text-white">Chat</p>
                <p className="text-xs text-slate-400">Recent</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {CHAT_THREADS.map((thread) => (
                  <div
                    key={thread.name}
                    className={`border-b border-slate-700/30 px-4 py-3 ${
                      thread.active ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-medium ${thread.active ? 'text-cyan-200' : 'text-slate-200'}`}>
                        {thread.name}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-500">{thread.time}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{thread.preview}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-w-0 flex-1 bg-[#1a2330]">
              <div className="absolute inset-0 p-6 blur-[2px]">
                <div className="mb-4 flex items-center gap-3 border-b border-slate-700/40 pb-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-600">
                    <Building2 className="size-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">HR · Payroll</p>
                    <p className="text-xs text-slate-500">Last seen just now</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="max-w-md rounded-2xl bg-slate-700/50 px-4 py-3 text-sm text-slate-300">
                    Hi, this is HR calling about your salary update.
                  </div>
                  <div className="max-w-md rounded-2xl bg-slate-700/50 px-4 py-3 text-sm text-slate-300">
                    We need verification immediately — please respond.
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px]">
                <div className="game-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/40 bg-[#1c2430]/95 p-6 shadow-[0_0_50px_rgba(34,211,238,0.22)] sm:p-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_55%)]" />
                  <span className="absolute right-4 top-4 rounded-full bg-cyan-500/20 px-3 py-1 text-[10px] font-semibold tracking-wider text-cyan-300 ring-1 ring-cyan-400/40">
                    URGENT REQUEST
                  </span>

                  <div className="relative pt-6 text-center">
                    <h2 className="font-game text-3xl tracking-wide text-white sm:text-4xl">INCOMING CALL</h2>
                    <p className="mt-1 text-sm font-semibold tracking-[0.22em] text-cyan-300 sm:text-base">HR · PAYROLL</p>

                    <div className="mx-auto mt-6">
                      <CallerAvatar size="sm" />
                    </div>

                    <p className="mt-5 text-xl font-semibold text-white sm:text-2xl">HR · Payroll</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Calling
                      <span className="inline-flex w-6 justify-start">
                        <span className="animate-pulse">...</span>
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">Human Resources Department</p>

                    <button
                      type="button"
                      onClick={handleAnswer}
                      className="mt-7 w-full min-h-12 cursor-pointer rounded-xl border border-cyan-400/60 bg-slate-950/80 px-6 font-game text-sm tracking-[0.14em] text-cyan-200 shadow-[inset_0_0_20px_rgba(34,211,238,0.15),0_0_28px_rgba(34,211,238,0.35)] transition hover:border-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100 sm:text-base"
                    >
                      [ ANSWER CALL ]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CallPlayScreen({
  callEnded,
  choicesOpen,
  wrongFeedback,
  playing,
  paused,
  muted,
  score,
  onTogglePlaying,
  onTogglePaused,
  onToggleMute,
  onPick,
  onTryAgain,
  onExit,
  onCallEnded,
}) {
  const [transcriptOn, setTranscriptOn] = useState(true)
  const remainingRef = useRef(CALL_DURATION_MS)
  const timerRef = useRef(null)
  const lastTickRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    lastTickRef.current = null
  }, [])

  useEffect(() => {
    if (callEnded || !playing || paused) {
      if (paused && lastTickRef.current != null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - lastTickRef.current))
        lastTickRef.current = null
      }
      clearTimer()
      return undefined
    }

    lastTickRef.current = Date.now()
    timerRef.current = window.setTimeout(() => {
      remainingRef.current = 0
      onCallEnded()
    }, remainingRef.current)

    return clearTimer
  }, [callEnded, playing, paused, onCallEnded, clearTimer])

  const speaking = playing && !paused && !callEnded

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a1018] text-white">
      <header className="flex min-h-12 shrink-0 items-center justify-between border-b border-cyan-400/15 bg-[#0d1520] px-4 sm:min-h-14 sm:px-6">
        <p className="font-game text-xs tracking-[0.12em] text-white sm:text-sm">VISHING SHIELD</p>
        <div className="flex flex-wrap items-center justify-end gap-3 font-mono text-[10px] sm:gap-5 sm:text-xs">
          <span className="text-slate-300">SCORE: <span className="text-white">{score}</span></span>
          <span className="text-slate-300">
            RISK LEVEL: <span className="font-semibold text-cyan-300">HIGH</span>
          </span>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Exit"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
        <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col items-center text-center">
            <CallerAvatar />
            <p className="mt-4 text-2xl font-semibold text-white sm:text-3xl">HR · Payroll</p>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p><span className="text-slate-500">Name:</span> Unverified Caller</p>
              <p><span className="text-slate-500">Department:</span> Claims HR</p>
              <p><span className="text-slate-500">Status:</span> {speaking ? 'On Call' : callEnded ? 'Call Ended' : 'Paused'}</p>
            </div>
            <Waveform active={speaking} />
          </div>

          {transcriptOn && (
            <div className="relative flex min-h-0 flex-col">
              <div className="game-pop flex min-h-0 flex-1 flex-col rounded-sm bg-[#f3ead8] p-6 text-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-8">
                <div className="flex-1 overflow-y-auto pr-1 text-base leading-relaxed sm:text-lg">
                  <p>
                    <span className="font-semibold">HR PAYROLL:</span>{' '}
                    {CALL_SCRIPT.before}
                    <span className="rounded bg-cyan-200/80 px-1 text-slate-900 shadow-[0_0_14px_rgba(34,211,238,0.45)]">
                      {CALL_SCRIPT.highlight}
                    </span>
                    {CALL_SCRIPT.after}
                  </p>
                </div>
                <p className="mt-6 border-t border-slate-400/35 pt-4 text-sm italic text-slate-600">
                  Listen carefully. Something may not be what it seems.
                </p>
              </div>
            </div>
          )}
        </div>

        {choicesOpen && (
          <div className="mx-auto mt-4 grid w-full max-w-6xl gap-2 sm:grid-cols-3">
            {CHOICES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPick(option)}
                className="min-h-12 cursor-pointer rounded-xl border border-cyan-400/35 bg-slate-900/80 px-3 text-sm font-medium text-white transition hover:bg-cyan-500/15"
              >
                {option.id === 'report' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <PhoneOff className="size-4" />
                    {option.label}
                  </span>
                ) : (
                  option.label
                )}
              </button>
            ))}
          </div>
        )}

        {wrongFeedback && (
          <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={onTryAgain} />
        )}

        <footer className="mx-auto mt-4 flex w-full max-w-6xl shrink-0 flex-wrap items-center justify-between gap-4 border-t border-cyan-400/10 pt-4">
          <div className="flex flex-1 flex-wrap items-center justify-center gap-4 font-game text-xs tracking-wider text-cyan-300 sm:text-sm">
            <button
              type="button"
              onClick={onTogglePlaying}
              className="inline-flex cursor-pointer items-center gap-2 transition hover:text-cyan-200"
            >
              <Play className="size-3.5" />
              [ {playing && !paused ? 'PLAYING' : 'PLAY'} ]
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex cursor-pointer items-center gap-2 transition hover:text-cyan-200"
            >
              <Volume2 className="size-3.5" />
              [ {muted ? 'Muted' : 'Volume'} ]
            </button>
            <button
              type="button"
              onClick={onTogglePaused}
              className="inline-flex cursor-pointer items-center gap-2 transition hover:text-cyan-200"
            >
              <Pause className="size-3.5" />
              [ {paused ? 'Resume' : 'Pause'} ]
            </button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300 sm:text-sm">
            Call Transcript
            <button
              type="button"
              role="switch"
              aria-checked={transcriptOn}
              onClick={() => setTranscriptOn((value) => !value)}
              className={`relative h-6 w-11 rounded-full transition ${transcriptOn ? 'bg-cyan-500' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition ${transcriptOn ? 'left-5' : 'left-0.5'}`}
              />
            </button>
            <span className="font-medium text-cyan-300">{transcriptOn ? 'On' : 'Off'}</span>
          </label>
        </footer>
      </div>
    </div>
  )
}

function CafePlayScreen({
  score,
  privacyFilter,
  speakerOn,
  screenAngle,
  checks,
  wrongFeedback,
  onToggleFilter,
  onToggleSpeaker,
  onSetAngle,
  onTryAgain,
  onExit,
}) {
  const cafeDone = [checks.filter, checks.speaker, checks.angle].filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a1018] text-white">
      <header className="flex min-h-12 shrink-0 items-center justify-between border-b border-cyan-400/15 bg-[#0d1520] px-4 sm:min-h-14 sm:px-6">
        <p className="font-game text-xs tracking-[0.12em] text-white sm:text-sm">VISHING SHIELD</p>
        <div className="flex flex-wrap items-center justify-end gap-3 font-mono text-[10px] sm:gap-5 sm:text-xs">
          <span className="text-slate-300">SCORE: <span className="text-white">{score}</span></span>
          <span className="text-slate-300">
            CAFE: <span className="font-semibold text-cyan-300">{cafeDone}/3</span>
          </span>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Exit"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
        <div className="mx-auto mb-4 flex w-full max-w-6xl gap-2">
          <div className="flex-1 rounded-xl border border-emerald-400/40 bg-emerald-950/30 px-3 py-2 text-center font-mono text-[10px] tracking-wider text-emerald-200 sm:text-xs">
            VISHING CALL · DONE
          </div>
          <div className="flex-1 rounded-xl border border-cyan-400/50 bg-cyan-950/40 px-3 py-2 text-center font-mono text-[10px] tracking-wider text-cyan-200 sm:text-xs">
            PUBLIC CAFE · HARDEN
          </div>
        </div>

        <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-4 overflow-y-auto lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#121a24] p-4 shadow-xl sm:p-5">
            <div className="flex items-center gap-2 text-cyan-100/90">
              <Coffee className="size-5 text-cyan-300" />
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em]">DOWNTOWN CAFE · WINDOW SEAT</p>
                <h2 className="font-game text-lg text-white">Public workstation</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              You’re on open Wi-Fi near the main aisle. Harden the laptop against shoulder surfing and audio leaks
              before continuing confidential work.
            </p>

            <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Wifi className="size-3" /> Cafe_Guest
                </span>
                <span>{screenAngle === 'wall' ? 'Facing wall' : 'Facing walkway'}</span>
              </div>
              <div
                className={`relative mx-auto w-[85%] overflow-hidden rounded-lg border border-slate-600 bg-slate-900 p-3 shadow-lg transition-transform ${
                  screenAngle === 'wall' ? '-rotate-12' : 'rotate-[8deg]'
                } ${privacyFilter ? 'opacity-90' : ''}`}
              >
                {privacyFilter && (
                  <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.35)_0px,rgba(0,0,0,0.35)_2px,transparent_2px,transparent_4px)]" />
                )}
                <div className="h-2 w-2/3 rounded bg-cyan-500/30" />
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded bg-slate-700" />
                  <div className="h-1.5 w-5/6 rounded bg-slate-700" />
                  <div className="h-1.5 w-4/6 rounded bg-slate-700" />
                </div>
                <p className="mt-2 font-mono text-[8px] text-slate-500">CONFIDENTIAL DRAFT</p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                {speakerOn ? (
                  <span className="text-rose-300">Speakerphone ON — audio leaking</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <VolumeX className="size-3.5" /> Speaker off
                  </span>
                )}
              </div>
              <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] text-cyan-200/50">
                ← MAIN WALKWAY
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {Object.entries(CAFE_TASKS).map(([id, meta]) => (
                <div
                  key={id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                    checks[id]
                      ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-100'
                      : 'border-white/10 bg-black/25 text-slate-300'
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      checks[id] ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {checks[id] ? '✓' : '•'}
                  </span>
                  {meta.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-cyan-400/20 bg-[#121a24] p-4 sm:p-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500">CONTROLS</p>

            <button
              type="button"
              onClick={onToggleFilter}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                privacyFilter
                  ? 'border-emerald-400/40 bg-emerald-950/30 text-emerald-100'
                  : 'border-cyan-400/25 bg-slate-900/80 text-white hover:border-cyan-400/50'
              }`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <EyeOff className="size-4" />
                Privacy screen filter
              </span>
              <span className="font-mono text-xs">{privacyFilter ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleSpeaker}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                !speakerOn
                  ? 'border-emerald-400/40 bg-emerald-950/30 text-emerald-100'
                  : 'border-cyan-400/25 bg-slate-900/80 text-white hover:border-cyan-400/50'
              }`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <VolumeX className="size-4" />
                Switch off open speakerphone
              </span>
              <span className="font-mono text-xs">{speakerOn ? 'LEAKING' : 'MUTED'}</span>
            </button>

            <div className="rounded-xl border border-cyan-400/25 bg-slate-900/80 p-3">
              <p className="mb-2 text-sm font-medium text-white">Screen orientation</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSetAngle('walkway')}
                  className={`min-h-11 cursor-pointer rounded-lg border px-2 font-mono text-[10px] sm:text-xs ${
                    screenAngle === 'walkway'
                      ? 'border-rose-400/40 bg-rose-950/30 text-rose-100'
                      : 'border-slate-600 text-slate-300'
                  }`}
                >
                  Toward walkway
                </button>
                <button
                  type="button"
                  onClick={() => onSetAngle('wall')}
                  className={`min-h-11 cursor-pointer rounded-lg border px-2 font-mono text-[10px] sm:text-xs ${
                    screenAngle === 'wall'
                      ? 'border-emerald-400/40 bg-emerald-950/30 text-emerald-100'
                      : 'border-slate-600 text-slate-300 hover:border-cyan-400/40'
                  }`}
                >
                  Away from walkway
                </button>
              </div>
            </div>
          </div>
        </div>

        {wrongFeedback && (
          <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={onTryAgain} />
        )}
      </div>
    </div>
  )
}

export default function VishingPublicShieldGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [callEnded, setCallEnded] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)

  const [privacyFilter, setPrivacyFilter] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [screenAngle, setScreenAngle] = useState('walkway')
  const [checks, setChecks] = useState({ filter: false, speaker: false, angle: false })
  const awarded = useRef({ filter: false, speaker: false, angle: false })

  const handleCallEnded = useCallback(() => {
    setCallEnded(true)
    setPlaying(false)
    setPaused(false)
  }, [])

  const choicesOpen = phase === 'play' && callEnded && !wrongFeedback

  useEffect(() => {
    if (phase !== 'cafe') return
    if (checks.filter && checks.speaker && checks.angle) {
      const timer = window.setTimeout(() => setPhase('result'), 900)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [checks, phase])

  function award(id) {
    if (awarded.current[id]) return
    awarded.current[id] = true
    const meta = CAFE_TASKS[id]
    setChecks((c) => ({ ...c, [id]: true }))
    setScore((s) => s + meta.xp)
  }

  function pick(option) {
    if (option.correct) {
      setScore((s) => s + 75)
      setWrongFeedback(null)
      window.setTimeout(() => setPhase('cafe'), 700)
      return
    }

    setWrongFeedback({
      title: option.feedbackTitle,
      reason: option.feedback,
    })
  }

  function handleTryAgain() {
    setWrongFeedback(null)
  }

  function toggleFilter() {
    if (wrongFeedback) return
    const next = !privacyFilter
    setPrivacyFilter(next)
    if (next) award('filter')
  }

  function toggleSpeaker() {
    if (wrongFeedback) return
    if (!speakerOn) {
      setWrongFeedback({
        title: 'Speakerphone Re-enabled',
        reason:
          'Open speakerphone in a cafe leaks confidential audio to nearby tables. Keep calls muted or use a headset privately.',
      })
      return
    }
    setSpeakerOn(false)
    award('speaker')
  }

  function setAngle(mode) {
    if (wrongFeedback) return
    if (mode === 'walkway') {
      setWrongFeedback({
        title: 'Screen Facing Walkway',
        reason:
          'Leaving the display toward the main aisle invites shoulder surfing. Angle the laptop away from foot traffic.',
      })
      return
    }
    setScreenAngle('wall')
    award('angle')
  }

  function resetPlay() {
    awarded.current = { filter: false, speaker: false, angle: false }
    setScore(0)
    setWrongFeedback(null)
    setCallEnded(false)
    setPlaying(true)
    setPaused(false)
    setMuted(false)
    setPrivacyFilter(false)
    setSpeakerOn(true)
    setScreenAngle('walkway')
    setChecks({ filter: false, speaker: false, angle: false })
    setPhase('play')
  }

  const scoreTone = score >= 120 ? 'text-cyan-300' : 'text-sky-300'
  const decisionQuality = score >= 120 ? 'Excellent' : score >= 75 ? 'Fair' : 'Risky'

  if (phase === 'intro') {
    return <IntroScreen onAnswer={() => setPhase('play')} onExit={onExit} score={score} />
  }

  if (phase === 'play') {
    return (
      <CallPlayScreen
        callEnded={callEnded}
        choicesOpen={choicesOpen}
        wrongFeedback={wrongFeedback}
        playing={playing}
        paused={paused}
        muted={muted}
        score={score}
        onTogglePlaying={() => {
          setPlaying(true)
          setPaused(false)
        }}
        onTogglePaused={() => setPaused((value) => !value)}
        onToggleMute={() => setMuted((value) => !value)}
        onPick={pick}
        onTryAgain={handleTryAgain}
        onExit={onExit}
        onCallEnded={handleCallEnded}
      />
    )
  }

  if (phase === 'cafe') {
    return (
      <CafePlayScreen
        score={score}
        privacyFilter={privacyFilter}
        speakerOn={speakerOn}
        screenAngle={screenAngle}
        checks={checks}
        wrongFeedback={wrongFeedback}
        onToggleFilter={toggleFilter}
        onToggleSpeaker={toggleSpeaker}
        onSetAngle={setAngle}
        onTryAgain={handleTryAgain}
        onExit={onExit}
      />
    )
  }

  return (
    <GameShell title="SCENARIO — Vishing & Public Shield" score={score} onExit={onExit}>
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="game-pop w-full max-w-5xl rounded-3xl border border-cyan-300/25 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,0.7)] sm:p-8">
          <p className="text-center font-mono text-xs tracking-[0.3em] text-cyan-300/85 sm:text-sm">SCENARIO COMPLETE</p>
          <h2 className="mt-1 text-center font-game text-3xl text-white sm:text-5xl">DUAL THREAT CONTAINED</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <ul className="space-y-3 text-sm text-slate-100 sm:text-base">
                <li className="flex items-start gap-2"><span className="text-cyan-300">✓</span><span>Did not share OTP on the call</span></li>
                <li className="flex items-start gap-2"><span className="text-cyan-300">✓</span><span>Hung up and reported vishing</span></li>
                <li className="flex items-start gap-2"><span className="text-cyan-300">✓</span><span>Hardened cafe laptop (filter, mute, angle)</span></li>
              </ul>
            </div>
            <div className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-4 text-center">
              <p className="text-sm uppercase tracking-wide text-slate-300">Security Score</p>
              <p className={`mt-2 text-5xl font-bold ${scoreTone}`}>{score}</p>
              <p className="text-slate-300">/ 150</p>
              <p className="mt-3 text-sm text-slate-200">Decision Quality: <span className="text-cyan-300">{decisionQuality}</span></p>
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-slate-300">
            Never share OTPs on cold calls. In public spaces, use a privacy filter, mute speakerphone, and angle screens away from aisles.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {score < 120 && (
              <button
                type="button"
                onClick={resetPlay}
                className="min-h-12 cursor-pointer rounded-xl bg-cyan-400 px-6 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Retry Scenario
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              className="min-h-12 cursor-pointer rounded-xl bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
            >
              {t('backToModule')}
            </button>
          </div>
        </div>
      </div>
    </GameShell>
  )
}
