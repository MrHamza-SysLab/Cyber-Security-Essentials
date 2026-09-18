import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  FileText,
  Grid3x3,
  HelpCircle,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Volume2,
} from 'lucide-react'
import marcus from '../../../assets/games/social-engineering-trap-detector/marcus-bro.jpg'
import danielCallAudio from '../../../assets/games/social-engineering-trap-detector/daniel-it-call.mp3'
import iphoneRingtone from '../../../assets/games/social-engineering-trap-detector/iphone-ringtone.mp3'
import wrongChoiceAlarm from '../../../assets/games/social-engineering-trap-detector/wrong-choice-alarm.mp3'
import { LangToggleGame } from '../../../components/LangToggle'
import { useLanguage } from '../../../i18n/LanguageContext'
import { SOCIAL_ENGINEERING_UR } from '../../../i18n/module1'
import GameShell from '../shared/GameShell'

const CHAT_THREADS_EN = [
  { name: 'Sarah Chen', time: '10:42 AM', preview: 'Thanks for the update on the quarterly report…' },
  { name: 'Daniel — IT Support', time: '10:38 AM', preview: 'URGENT: Your account will be locked in 15 minutes…', active: true },
  { name: 'HR Department', time: 'Yesterday', preview: 'Reminder: Please submit your timesheets by Friday.' },
  { name: 'Team Standup', time: 'Yesterday', preview: 'Meeting notes from today\'s sync are attached.' },
  { name: 'Finance Dept', time: 'Monday', preview: 'Invoice approval request — action required.' },
]

const CALL_SCRIPT_EN = {
  before: 'Hi, this is Daniel from IT Support. We\'re currently dealing with a security issue affecting several employee accounts. ',
  highlight: 'I need your password immediately',
  after: ' so I can verify your account before it is locked.',
}

const CHOICES_EN = [
  {
    id: 'give',
    label: 'Give password',
    correct: false,
    feedbackTitle: 'Credentials Exposed',
    feedback:
      'Legitimate IT never asks for your password on a call or chat. Sharing it gives a possible impersonator full access to your account.',
  },
  {
    id: 'verify',
    label: 'Hang up & verify',
    correct: true,
    feedbackTitle: 'Correct Response',
    feedback: 'You hung up and verified through a trusted channel — the safest way to handle an urgent IT request.',
  },
  {
    id: 'ignore',
    label: 'Ignore the message',
    correct: false,
    feedbackTitle: 'Threat Not Verified',
    feedback:
      'Ignoring the caller does not confirm whether the request was real. Hang up and call IT back using a number you already trust.',
  },
]

const BLURRED_MESSAGES_EN = [
  'Hi Sarah, this is Daniel from IT Support.',
  'We detected unusual activity on your account. Please respond immediately.',
]

function IntroScreen({ onAnswer, onExit, score = 0 }) {
  const { t, isUr } = useLanguage()
  const ur = SOCIAL_ENGINEERING_UR
  const chatThreads = isUr ? ur.chatThreads : CHAT_THREADS_EN
  const blurredMessages = isUr ? ur.blurredMessages : BLURRED_MESSAGES_EN
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
          <span className="hidden sm:inline">
            {isUr ? ur.securityAwarenessTraining : 'Security Awareness Training'}
          </span>
          <span className="sm:hidden">{isUr ? ur.training : 'Training'}</span>
        </div>
        <p className="font-game text-sm tracking-[0.12em] text-white sm:text-base">
          {isUr ? ur.socialEngineering : 'SOCIAL ENGINEERING'}
        </p>
        <div className="flex items-center gap-3 font-mono text-xs sm:gap-5 sm:text-sm">
          <LangToggleGame />
          <span className="font-semibold text-cyan-300">{score} PTS</span>
          <button
            type="button"
            onClick={onExit}
            className="ml-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={t('exit')}
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
                <p className="text-lg font-semibold text-white">{isUr ? ur.chat : 'Chat'}</p>
                <p className="text-xs text-slate-400">{isUr ? ur.recent : 'Recent'}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatThreads.map((thread) => (
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
                  <div className="size-10 rounded-full bg-slate-600" />
                  <div>
                    <p className="font-medium text-slate-200">{isUr ? ur.itSupport : 'Daniel — IT Support'}</p>
                    <p className="text-xs text-slate-500">
                      {isUr ? ur.lastSeenJustNow : 'Last seen just now'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {blurredMessages.map((msg) => (
                    <div
                      key={msg}
                      className="max-w-md rounded-2xl bg-slate-700/50 px-4 py-3 text-sm text-slate-300"
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px]">
                <div className="game-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/40 bg-[#1c2430]/95 p-6 shadow-[0_0_50px_rgba(34,211,238,0.22)] sm:p-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_55%)]" />
                  <span className="absolute right-4 top-4 rounded-full bg-cyan-500/20 px-3 py-1 text-[10px] font-semibold tracking-wider text-cyan-300 ring-1 ring-cyan-400/40">
                    {isUr ? ur.urgentRequest : 'URGENT REQUEST'}
                  </span>

                  <div className="relative pt-6 text-center">
                    <h2 className="font-game text-3xl tracking-wide text-white sm:text-4xl">
                      {isUr ? ur.incomingCall : 'INCOMING CALL'}
                    </h2>
                    <p className="mt-1 text-sm font-semibold tracking-[0.22em] text-cyan-300 sm:text-base">
                      {isUr ? ur.itSupport : 'IT SUPPORT'}
                    </p>

                    <div className="mx-auto mt-6 size-28 overflow-hidden rounded-full ring-2 ring-cyan-400/50 sm:size-32">
                      <img src={marcus} alt="" className="size-full object-cover object-top" />
                    </div>

                    <p className="mt-5 text-xl font-semibold text-white sm:text-2xl">
                      {isUr ? ur.itSupport : 'Daniel — IT Support'}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {isUr ? ur.calling : 'Calling'}
                      <span className="inline-flex w-6 justify-start">
                        <span className="animate-pulse">...</span>
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      {isUr ? ur.itSupportDepartment : 'IT Support Department'}
                    </p>

                    <button
                      type="button"
                      onClick={handleAnswer}
                      className="mt-7 w-full min-h-12 cursor-pointer rounded-xl border border-cyan-400/60 bg-slate-950/80 px-6 font-game text-sm tracking-[0.14em] text-cyan-200 shadow-[inset_0_0_20px_rgba(34,211,238,0.15),0_0_28px_rgba(34,211,238,0.35)] transition hover:border-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100 sm:text-base"
                    >
                      {isUr ? ur.answerCall : '[ ANSWER CALL ]'}
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
  const { isUr } = useLanguage()
  const ur = SOCIAL_ENGINEERING_UR
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
          <p className="mt-4 font-mono text-xs tracking-[0.32em] text-rose-300">
            {isUr ? ur.securityAlert : 'SECURITY ALERT'}
          </p>
          <h2 className="mt-2 font-game text-3xl text-white sm:text-4xl">
            {isUr ? ur.wrongDecision : 'WRONG DECISION'}
          </h2>
          <p className="mt-3 text-lg font-semibold text-cyan-200">{feedback.title}</p>
          <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-left text-sm leading-relaxed text-rose-100 sm:text-base">
            <span className="font-semibold text-rose-200">
              {isUr ? ur.whyWrong : 'Why this is wrong:'}
            </span>{' '}
            {feedback.reason}
          </p>
          <button
            type="button"
            onClick={onTryAgain}
            className="mt-7 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-cyan-400 px-8 font-game text-sm tracking-wider text-slate-950 transition hover:bg-cyan-300 sm:text-base"
          >
            <RotateCcw className="size-4" />
            {isUr ? ur.tryAgain : 'TRY AGAIN'}
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

function PlayScreen({
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
  const { t, isUr } = useLanguage()
  const ur = SOCIAL_ENGINEERING_UR
  const callScript = isUr ? ur.callScript : CALL_SCRIPT_EN
  const choices = isUr
    ? CHOICES_EN.map((opt) => {
        const copy = ur.choices[opt.id]
        return copy
          ? { ...opt, label: copy.label, feedbackTitle: copy.feedbackTitle, feedback: copy.feedback }
          : opt
      })
    : CHOICES_EN
  const [transcriptOn, setTranscriptOn] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio(danielCallAudio)
    audioRef.current = audio
    audio.preload = 'auto'

    const handleEnded = () => onCallEnded()
    audio.addEventListener('ended', handleEnded)

    const playPromise = audio.play()
    if (playPromise?.catch) playPromise.catch(() => {})

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [onCallEnded])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!playing || paused) {
      audio.pause()
      return
    }

    if (audio.ended) {
      audio.currentTime = 0
    }

    const playPromise = audio.play()
    if (playPromise?.catch) playPromise.catch(() => {})
  }, [playing, paused])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = muted
  }, [muted])

  const speaking = playing && !paused && !callEnded

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a1018] text-white">
      <header className="flex min-h-12 shrink-0 items-center justify-between border-b border-cyan-400/15 bg-[#0d1520] px-4 sm:min-h-14 sm:px-6">
        <p className="font-game text-xs tracking-[0.12em] text-white sm:text-sm">
          {isUr ? ur.socialEngineering : 'SOCIAL ENGINEERING'}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3 font-mono text-[10px] sm:gap-5 sm:text-xs">
          <LangToggleGame />
          <span className="text-slate-300">
            {t('score')}: <span className="text-white">{score}</span>
          </span>
          <span className="text-slate-300">
            RISK LEVEL: <span className="font-semibold text-cyan-300">HIGH</span>
          </span>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={t('exit')}
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
        <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col items-center text-center">
            <div className="size-36 overflow-hidden rounded-full ring-2 ring-cyan-400/40 sm:size-40">
              <img src={marcus} alt="" className="size-full object-cover object-top" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              {isUr ? ur.itSupport : 'Daniel — IT Support'}
            </p>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p><span className="text-slate-500">Name:</span> Daniel Morgan</p>
              <p><span className="text-slate-500">Department:</span> IT Support</p>
              <p><span className="text-slate-500">Status:</span> {speaking ? 'On Call' : callEnded ? 'Call Ended' : 'Paused'}</p>
            </div>
            <Waveform active={speaking} />
          </div>

          {transcriptOn && (
            <div className="relative flex min-h-0 flex-col">
              <div className="game-pop flex min-h-0 flex-1 flex-col rounded-sm bg-[#f3ead8] p-6 text-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-8">
                <div className="flex-1 overflow-y-auto pr-1 text-base leading-relaxed sm:text-lg">
                  <p>
                    <span className="font-semibold">IT SUPPORT:</span>{' '}
                    {callScript.before}
                    <span className="rounded bg-cyan-200/80 px-1 text-slate-900 shadow-[0_0_14px_rgba(34,211,238,0.45)]">
                      {callScript.highlight}
                    </span>
                    {callScript.after}
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
            {choices.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPick(option)}
                className="min-h-12 cursor-pointer rounded-xl border border-cyan-400/35 bg-slate-900/80 px-3 text-sm font-medium text-white transition hover:bg-cyan-500/15"
              >
                {option.label}
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

export default function SocialEngineeringGame({ onExit }) {
  const { t, isUr } = useLanguage()
  const ur = SOCIAL_ENGINEERING_UR
  const [phase, setPhase] = useState('intro')
  const [callEnded, setCallEnded] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)

  const handleCallEnded = useCallback(() => {
    setCallEnded(true)
    setPlaying(false)
    setPaused(false)
  }, [])

  const choicesOpen = phase === 'play' && callEnded && !wrongFeedback

  function pick(option) {
    if (option.correct) {
      setScore(100)
      setWrongFeedback(null)
      window.setTimeout(() => setPhase('result'), 700)
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

  const scoreTone = score >= 80 ? 'text-cyan-300' : 'text-sky-300'
  const decisionQuality = score >= 80 ? 'Excellent' : score >= 50 ? 'Fair' : 'Risky'

  if (phase === 'intro') {
    return <IntroScreen onAnswer={() => setPhase('play')} onExit={onExit} score={score} />
  }

  if (phase === 'play') {
    return (
      <PlayScreen
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

  return (
    <GameShell
      title={isUr ? ur.socialEngineering : 'SCENARIO 01 — Social Engineering'}
      score={score}
      onExit={onExit}
    >
      {phase === 'result' && (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="game-pop w-full max-w-5xl rounded-3xl border border-cyan-300/25 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,0.7)] sm:p-8">
            <p className="text-center font-mono text-xs tracking-[0.3em] text-cyan-300/85 sm:text-sm">SCENARIO COMPLETE</p>
            <h2 className="mt-1 text-center font-game text-3xl text-white sm:text-5xl">THE URGENT CALL</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <ul className="space-y-3 text-sm text-slate-100 sm:text-base">
                  <li className="flex items-start gap-2"><span className="text-cyan-300">✓</span><span>Did not share credentials</span></li>
                  <li className="flex items-start gap-2"><span className="text-cyan-300">✓</span><span>Verified the request independently</span></li>
                  <li className="flex items-start gap-2"><span className="text-cyan-300">✓</span><span>Recognized urgency as a warning sign</span></li>
                </ul>
              </div>
              <div className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-4 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-300">{t('score')}</p>
                <p className={`mt-2 text-5xl font-bold ${scoreTone}`}>{score}</p>
                <p className="text-slate-300">/ 100</p>
                <p className="mt-3 text-sm text-slate-200">Decision Quality: <span className="text-cyan-300">{decisionQuality}</span></p>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-slate-300">
              Never give a password on chat or a call. Hang up and verify on a number you already know.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              {score < 80 && (
                <button
                  type="button"
                  onClick={() => {
                    setCallEnded(false)
                    setWrongFeedback(null)
                    setScore(0)
                    setPlaying(true)
                    setPaused(false)
                    setMuted(false)
                    setPhase('play')
                  }}
                  className="min-h-12 cursor-pointer rounded-xl bg-cyan-400 px-6 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  {t('retry')}
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
      )}
    </GameShell>
  )
}
