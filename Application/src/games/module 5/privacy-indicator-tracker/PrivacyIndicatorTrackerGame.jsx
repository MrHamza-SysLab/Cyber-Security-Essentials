import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Camera,
  ChevronRight,
  Gamepad2,
  Mic,
  MicOff,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import splash from '../../../assets/games/privacy-indicator-tracker/splash.jpg'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import PhoneFrame from '../shared/PhoneFrame'

const BRIEF = [
  'PRIVACY INDICATOR TRACKER',
  'Background access leaves green dots.',
  '• Camera / mic indicators mean live capture',
  '• Do not ignore unexplained privacy lights',
  '• Kill spyware via Permission Manager',
  'Spot the alert — then neutralize it.',
]

const OPTIONS = [
  {
    id: 'ignore',
    label: 'Ignore it and keep playing',
    detail: 'The green dots are probably nothing.',
    correct: false,
    wrongTitle: 'Surveillance Continues',
    wrongReason:
      'Ignoring camera/microphone privacy indicators leaves the app recording in the background. Corporate policy requires investigating unexplained access lights immediately.',
  },
  {
    id: 'fix',
    label: 'Minimize → Settings → Permission Manager → Block microphone',
    detail: 'Investigate the indicator and revoke access.',
    correct: true,
    xp: 100,
  },
  {
    id: 'flip',
    label: 'Turn the phone upside down',
    detail: 'Maybe the sensors will stop.',
    correct: false,
    wrongTitle: 'Physical Trick Failed',
    wrongReason:
      'Flipping the phone does not revoke software permissions. Spyware can keep using the microphone until you block access in Permission Manager.',
  },
]

export default function PrivacyIndicatorTrackerGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [indicatorOn, setIndicatorOn] = useState(false)
  const [screen, setScreen] = useState('game') // game | home | settings | perms | neutralized
  const [tapScore, setTapScore] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (phase !== 'play') return undefined
    const timer = window.setTimeout(() => setIndicatorOn(true), 1600)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function chooseOption(option) {
    if (busy || wrongFeedback || !indicatorOn || screen !== 'game') return

    if (!option.correct) {
      setWrongFeedback({
        title: option.wrongTitle,
        reason: option.wrongReason,
      })
      return
    }

    setScreen('home')
    setToast({
      tone: 'warn',
      title: 'Game minimized',
      detail: 'Open Settings → Permission Manager and block the microphone.',
    })
  }

  function blockMic() {
    if (busy || wrongFeedback) return
    setBusy(true)
    setIndicatorOn(false)
    setScore(100)
    setScreen('neutralized')
    setToast({
      tone: 'ok',
      title: 'Spyware Permission Neutralized · +100 XP',
      detail: 'Microphone access blocked for Pulse Runner.',
    })
    window.setTimeout(() => {
      setBusy(false)
      setPhase('result')
    }, 1400)
  }

  function resetPlay() {
    setScore(0)
    setToast(null)
    setWrongFeedback(null)
    setIndicatorOn(false)
    setScreen('game')
    setTapScore(0)
    setBusy(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 4 · CONTACTS, FILES, CAMERA, MIC & LOCATION"
        lines={BRIEF}
        cta="START CASUAL GAME"
        alt="Privacy Indicator Tracker"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="PRIVACY INDICATOR TRACKER" score={score} onExit={onExit} status="SPYWARE NEUTRALIZED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">SPYWARE PERMISSION NEUTRALIZED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You treated the green privacy dots as a real alert, opened Permission Manager, and blocked microphone access.
            </p>
            <p className="mt-4 font-mono text-emerald-300">+{score} XP</p>
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
      title="PRIVACY INDICATOR TRACKER"
      score={score}
      onExit={onExit}
      status={indicatorOn ? 'PRIVACY LIGHT ACTIVE' : 'MONITORING'}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_40%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-300/80 sm:text-xs">
              CORPORATE BYOD · PRIVACY WATCH
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Play the casual game. When green camera/mic dots appear, choose the corporate response — then finish the
              Settings path if you minimize.
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <PhoneFrame
              indicators={
                indicatorOn ? (
                  <span className="flex items-center gap-1">
                    <span className="relative flex size-2.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                      <span className="relative size-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <Camera className="size-3 text-emerald-300" />
                    <Mic className="size-3 text-emerald-300" />
                  </span>
                ) : (
                  <Sparkles className="size-3 text-slate-500" />
                )
              }
            >
              <AnimatePresence mode="wait">
                {screen === 'game' && (
                  <motion.div
                    key="game"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[520px] flex-col bg-gradient-to-b from-indigo-950 via-slate-950 to-black px-3 pb-6 pt-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="size-4 text-cyan-300" />
                        <p className="font-game text-sm text-white">Pulse Runner</p>
                      </div>
                      <p className="font-mono text-xs text-cyan-200">{tapScore}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTapScore((n) => n + 1)}
                      className="relative mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-cyan-400/20 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.2),transparent_55%)]"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="flex size-20 items-center justify-center rounded-full bg-cyan-400/20 ring-2 ring-cyan-300/50"
                      >
                        <span className="font-game text-3xl text-cyan-200">◎</span>
                      </motion.div>
                      <p className="mt-4 text-xs text-slate-400">Tap to score · casual distraction</p>
                    </button>

                    {indicatorOn && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-950/50 px-3 py-3"
                      >
                        <p className="font-mono text-[10px] tracking-[0.16em] text-emerald-300">PRIVACY INDICATOR</p>
                        <p className="mt-1 text-sm text-emerald-50">
                          Green camera & microphone dots are on — something is listening/recording.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {screen === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="min-h-[520px] bg-gradient-to-b from-slate-800 to-slate-950 px-4 pb-6 pt-3"
                  >
                    <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500">HOME SCREEN</p>
                    <h2 className="mt-1 font-game text-xl text-white">Quick Launch</h2>
                    <button
                      type="button"
                      onClick={() => setScreen('settings')}
                      className="mt-6 flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-600 bg-slate-900/90 px-4 py-4 text-left hover:border-cyan-400/40"
                    >
                      <div className="flex size-11 items-center justify-center rounded-xl bg-slate-700">
                        <Settings className="size-5 text-cyan-300" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Settings</p>
                        <p className="text-xs text-slate-400">Privacy · Permissions · Network</p>
                      </div>
                      <ChevronRight className="size-4 text-slate-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreen('game')}
                      className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-left text-sm text-slate-300"
                    >
                      <Gamepad2 className="size-4 text-slate-400" />
                      Return to Pulse Runner
                    </button>
                  </motion.div>
                )}

                {screen === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="min-h-[520px] bg-slate-950 px-4 pb-6 pt-3"
                  >
                    <button
                      type="button"
                      onClick={() => setScreen('home')}
                      className="cursor-pointer font-mono text-[10px] text-cyan-300"
                    >
                      ← Home
                    </button>
                    <h2 className="mt-2 font-game text-xl text-white">Settings</h2>
                    <button
                      type="button"
                      onClick={() => setScreen('perms')}
                      className="mt-5 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-emerald-100">Permission Manager</p>
                        <p className="text-xs text-emerald-200/70">Camera · Microphone · Location</p>
                      </div>
                      <ChevronRight className="size-4 text-emerald-300" />
                    </button>
                  </motion.div>
                )}

                {screen === 'perms' && (
                  <motion.div
                    key="perms"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="min-h-[520px] bg-slate-950 px-4 pb-6 pt-3"
                  >
                    <button
                      type="button"
                      onClick={() => setScreen('settings')}
                      className="cursor-pointer font-mono text-[10px] text-cyan-300"
                    >
                      ← Settings
                    </button>
                    <h2 className="mt-2 font-game text-xl text-white">Permission Manager</h2>
                    <p className="mt-1 text-xs text-slate-400">Pulse Runner · background access detected</p>

                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Camera className="size-4 text-slate-300" />
                          <span className="text-sm text-white">Camera</span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-200">WHILE USING</span>
                      </div>
                      <div className="rounded-2xl border border-emerald-400/40 bg-emerald-950/20 px-3 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic className="size-4 text-emerald-300" />
                            <span className="text-sm text-white">Microphone</span>
                          </div>
                          <span className="font-mono text-[10px] text-rose-300">ALWAYS / ACTIVE</span>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={blockMic}
                          className="mt-3 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 font-game text-xs font-bold tracking-wider text-white hover:bg-rose-400 disabled:opacity-60"
                        >
                          <MicOff className="size-4" />
                          BLOCK MICROPHONE ACCESS
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {screen === 'neutralized' && (
                  <motion.div
                    key="ok"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex min-h-[520px] flex-col items-center justify-center bg-slate-950 px-6 text-center"
                  >
                    <ShieldCheck className="size-14 text-emerald-300" />
                    <p className="mt-4 font-game text-2xl text-emerald-300">NEUTRALIZED</p>
                    <p className="mt-2 text-sm text-slate-300">Spyware Permission Neutralized</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </PhoneFrame>

            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-slate-600/60 bg-slate-950/80 p-4">
                <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500">RESPONSE OPTIONS</p>
                <div className="mt-3 space-y-2">
                  {OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!indicatorOn || screen !== 'game' || busy || Boolean(wrongFeedback)}
                      onClick={() => chooseOption(option)}
                      className="flex w-full cursor-pointer flex-col rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-left transition hover:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="text-sm font-semibold text-white">{option.label}</span>
                      <span className="mt-1 text-xs text-slate-400">{option.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              {screen !== 'game' && screen !== 'neutralized' && (
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
                  Path in progress: Home → Settings → Permission Manager → Block microphone.
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && <FeedbackToast {...toast} onClose={() => setToast(null)} />}
        {wrongFeedback && (
          <WrongChoiceOverlay
            feedback={wrongFeedback}
            onTryAgain={() => {
              setWrongFeedback(null)
              setScreen('game')
            }}
          />
        )}
      </div>
    </CyberHud>
  )
}
