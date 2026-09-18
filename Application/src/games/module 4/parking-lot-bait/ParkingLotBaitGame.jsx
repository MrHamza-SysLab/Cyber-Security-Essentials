import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertTriangle,
  Award,
  Building2,
  Car,
  MapPin,
  ShieldCheck,
  Usb,
} from 'lucide-react'
import splash from '../../../assets/games/the-parking-lot-bait/splash.jpg'
import usbDrive from '../../../assets/games/the-parking-lot-bait/item-usb.png'
import CyberSplash, {
  BinaryRain,
  CyberHud,
  FeedbackToast,
  WrongChoiceOverlay,
} from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'THE PARKING LOT BAIT',
  'Unknown USB devices are corporate landmines.',
  '• Never plug found media into a PC',
  '• Leaving bait risks other employees',
  '• Hand it to IT Security safely',
  'Choose the response that protects the firm.',
]

const CHOICES = [
  {
    id: 'plug',
    label: 'Plug into my PC',
    detail: 'Check who owns it by opening the files.',
    outcome: 'fail',
    xp: 0,
    feedbackTitle: 'Ransomware Deployed',
    reason:
      'Unknown USBs are a classic drop-attack vector. Plugging one in can auto-run malware, encrypt drives, and spread across the corporate network.',
  },
  {
    id: 'leave',
    label: 'Leave it on the ground',
    detail: 'Walk away — not my problem.',
    outcome: 'partial',
    xp: 25,
    feedbackTitle: 'Risk Still Active',
    reason:
      'You avoided infection, but the bait remains for the next curious employee. Corporate policy expects you to secure and report unknown media.',
  },
  {
    id: 'deliver',
    label: 'Tissue pickup → IT Security',
    detail: 'Handle carefully and deliver to the Security Desk.',
    outcome: 'pass',
    xp: 100,
  },
]

export default function ParkingLotBaitGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [toast, setToast] = useState(null)
  const [badge, setBadge] = useState(false)
  const [ransomware, setRansomware] = useState(false)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  function handleChoice(choice) {
    if (wrongFeedback || ransomware || phase !== 'play') return

    if (choice.outcome === 'fail') {
      setScore(0)
      setRansomware(true)
      window.setTimeout(() => {
        setRansomware(false)
        setWrongFeedback({
          title: choice.feedbackTitle,
          reason: choice.reason,
        })
      }, 2800)
      return
    }

    if (choice.outcome === 'partial') {
      setScore(choice.xp)
      setToast({
        tone: 'warn',
        title: `Partial · +${choice.xp} XP`,
        detail: 'Risk remains for other employees — try the full secure response.',
      })
      setWrongFeedback({
        title: choice.feedbackTitle,
        reason: choice.reason,
      })
      return
    }

    setScore(choice.xp)
    setBadge(true)
    setToast({
      tone: 'ok',
      title: `+${choice.xp} XP · Hardware Shield`,
      detail: 'Safe handling + IT handoff — gold-standard USB response.',
    })
    window.setTimeout(() => setPhase('result'), 1100)
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · USB RISKS & UNKNOWN DEVICES"
        lines={BRIEF}
        cta="ENTER PARKING LOT"
        alt="Parking Lot Bait"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="THE PARKING LOT BAIT" score={score} onExit={onExit} status="INCIDENT CONTAINED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">HARDWARE SHIELD EARNED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You secured unknown media without exposing the corporate network — and reported it to IT Security.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">HARDWARE SHIELD BADGE</span>
              </div>
            )}
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setScore(0)
                  setBadge(false)
                  setToast(null)
                  setWrongFeedback(null)
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
                {t('backToModule')}
              </button>
            </div>
          </div>
        </div>
      </CyberHud>
    )
  }

  return (
    <CyberHud title="THE PARKING LOT BAIT" score={score} onExit={onExit} status="CORPORATE PARKING · LEVEL B2">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(ellipse_at_70%_80%,rgba(15,23,42,0.9),transparent_50%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">SYSLAB HQ · EMPLOYEE LOT</span>
            </div>
            <div className="flex items-center gap-2 text-amber-200/90">
              <MapPin className="size-3.5" />
              <span className="font-mono text-[10px] tracking-wider sm:text-xs">SPOT 14-B · NEAR EXIT RAMP</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-600/60 bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-700/40 to-transparent" />
            <div className="relative grid gap-6 p-5 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
              <div className="relative min-h-64 overflow-hidden rounded-xl border border-dashed border-slate-500/40 bg-slate-950/50 p-4">
                <div className="absolute inset-4 rounded-lg border-2 border-white/15" />
                <div className="absolute left-1/2 top-6 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-slate-500">
                  PARKING SPACE 14-B
                </div>
                <Car className="absolute right-8 top-10 size-10 text-slate-600" />
                <div className="absolute bottom-8 left-8 right-8 h-2 rounded-full bg-amber-400/30" />
                <div className="absolute bottom-12 left-10 right-10 h-px bg-white/20" />

                <motion.div
                  className="absolute bottom-16 left-1/2 flex w-[min(90%,18rem)] -translate-x-1/2 flex-col items-center"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="mb-3 max-w-[14rem] rounded-md border border-amber-300/50 bg-amber-50 px-3 py-2 text-center shadow-lg">
                    <p className="font-mono text-[9px] tracking-[0.16em] text-amber-800">FOUND MEDIA LABEL</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">Executive Salaries 2026</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">Confidential · Finance</p>
                  </div>
                  <img src={usbDrive} alt="Unknown USB drive" className="h-20 w-auto drop-shadow-[0_0_18px_rgba(248,113,113,0.45)]" />
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-950/70 px-2.5 py-1 text-[10px] text-rose-200">
                    <Usb className="size-3" />
                    Unknown device
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-400/80">DECISION POINT</p>
                <h2 className="mt-1 font-game text-xl text-white sm:text-2xl">What do you do?</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  A polished USB drive is sitting by Spot 14-B with a salary spreadsheet label. Curiosity is the attack.
                </p>

                <div className="mt-5 space-y-3">
                  {CHOICES.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleChoice(choice)}
                      className="group w-full cursor-pointer rounded-xl border border-slate-600/70 bg-slate-950/70 p-3.5 text-left transition hover:border-cyan-400/50 hover:bg-cyan-950/30"
                    >
                      <p className="font-game text-sm tracking-wide text-cyan-100 group-hover:text-cyan-50">
                        {choice.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{choice.detail}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {ransomware && (
            <motion.div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BinaryRain columns={12} stopAfterMs={2800} />
              <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border-2 border-rose-500/70 bg-rose-950/90 p-6 text-center shadow-[0_0_60px_rgba(244,63,94,0.45)]">
                <AlertTriangle className="mx-auto size-12 animate-pulse text-rose-300" />
                <p className="mt-3 font-mono text-xs tracking-[0.28em] text-rose-300">RANSOMWARE TRIGGERED</p>
                <h3 className="mt-2 font-game text-2xl text-white sm:text-3xl">FILES ENCRYPTING…</h3>
                <p className="mt-3 text-sm text-rose-100/90">
                  Auto-run payload from the bait USB. Corporate score reset to 0.
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-rose-950">
                  <motion.div
                    className="h-full bg-rose-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.4, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {wrongFeedback && (
          <WrongChoiceOverlay
            feedback={wrongFeedback}
            onTryAgain={() => {
              setWrongFeedback(null)
              setScore(0)
              setToast(null)
            }}
          />
        )}

        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
      </div>
    </CyberHud>
  )
}
