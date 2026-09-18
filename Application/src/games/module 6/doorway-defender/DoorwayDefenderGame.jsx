import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Building2,
  CreditCard,
  DoorClosed,
  DoorOpen,
  Package,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import splash from '../../../assets/games/doorway-defender/splash.png'
import CyberSplash, {
  CyberHud,
  FeedbackToast,
  WrongChoiceOverlay,
} from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'DOORWAY DEFENDER',
  'Tailgating is the #1 physical access bypass.',
  '• Swipe your card at the turnstile',
  '• Someone with full hands will pressure you',
  '• Never share badges or hold doors for unknowns',
  'Choose the entry protocol that keeps HQ secure.',
]

const CHOICES = [
  {
    id: 'hold',
    label: 'Hold the door and let him inside',
    detail: 'Be polite — his hands are full.',
    outcome: 'fail',
    feedbackTitle: 'Tailgating Successful',
    reason:
      'You let an unvetted person through a controlled entrance. Boxes and urgency are classic social pressure — visitors must check in at reception first.',
  },
  {
    id: 'reception',
    label: 'Direct him to reception for a visitor badge',
    detail: 'Proper protocol: badge first, then escorted entry.',
    outcome: 'pass',
    xp: 100,
  },
  {
    id: 'borrow',
    label: 'Borrow his badge and swipe for him',
    detail: 'Help him through using his card.',
    outcome: 'fail',
    feedbackTitle: 'Badge Misuse',
    reason:
      'Using someone else’s access credential — or letting them use yours — violates access-control policy and breaks audit trails. Never swipe on behalf of another person.',
  },
]

export default function DoorwayDefenderGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)
  const [doorOpen, setDoorOpen] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const [attackerApproach, setAttackerApproach] = useState(false)
  const [showChoices, setShowChoices] = useState(false)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function swipeCard() {
    if (swiped || phase !== 'play' || wrongFeedback) return
    setSwiped(true)
    setDoorOpen(true)
    setToast({
      tone: 'ok',
      title: 'Access granted',
      detail: 'Your badge authenticated. Turnstile unlocked.',
    })
    window.setTimeout(() => {
      setAttackerApproach(true)
      window.setTimeout(() => setShowChoices(true), 700)
    }, 900)
  }

  function handleChoice(choice) {
    if (!showChoices || wrongFeedback || phase !== 'play') return

    if (choice.outcome === 'fail') {
      setDoorOpen(true)
      setWrongFeedback({
        title: choice.feedbackTitle,
        reason: choice.reason,
      })
      return
    }

    setDoorOpen(false)
    setScore(choice.xp)
    setBadge(true)
    setToast({
      tone: 'ok',
      title: `+${choice.xp} XP · Access Security Guard`,
      detail: 'Visitor directed to reception — entry protocol upheld.',
    })
    window.setTimeout(() => setPhase('result'), 1200)
  }

  function resetPlay() {
    setScore(0)
    setToast(null)
    setWrongFeedback(null)
    setBadge(false)
    setDoorOpen(false)
    setSwiped(false)
    setAttackerApproach(false)
    setShowChoices(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 2 · VISITORS, ACCESS CARDS & TAILGATING"
        lines={BRIEF}
        cta="APPROACH TURNSTILE"
        alt="Doorway Defender"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="DOORWAY DEFENDER" score={score} onExit={onExit} status="ENTRY SECURED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">TAILGATING BLOCKED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You refused social pressure and sent the visitor through reception — controlled access stayed intact.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">ACCESS SECURITY GUARD</span>
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
    <CyberHud
      title="DOORWAY DEFENDER"
      score={score}
      onExit={onExit}
      status={showChoices ? 'DECISION POINT' : swiped ? 'DOOR OPEN' : 'SWIPE TO ENTER'}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(ellipse_at_20%_100%,rgba(245,158,11,0.08),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">
                SYSLAB HQ · MAIN LOBBY TURNSTILE
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 sm:text-xs">
              {swiped ? 'AUTH: EMPLOYEE-OK' : 'WAITING FOR BADGE SWIPE'}
            </span>
          </div>

          <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-600/60 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl">
            {/* Lobby scene */}
            <div className="relative min-h-[320px] p-5 sm:min-h-[380px] sm:p-8">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-900/20 to-transparent" />

              {/* Glass frame */}
              <div className="relative mx-auto flex max-w-3xl items-end justify-center gap-0">
                {/* Left wall */}
                <div className="hidden h-56 w-16 rounded-l-xl border border-slate-500/40 bg-slate-800/80 sm:block" />

                {/* Door / turnstile */}
                <div className="relative flex h-56 w-full max-w-md flex-col items-center justify-end overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-b from-slate-700/40 to-slate-950">
                  <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                    <span className="rounded bg-slate-950/70 px-2 py-0.5 font-mono text-[9px] text-cyan-300">
                      SECURE ZONE
                    </span>
                    {doorOpen ? (
                      <DoorOpen className="size-5 text-amber-300" />
                    ) : (
                      <DoorClosed className="size-5 text-emerald-300" />
                    )}
                  </div>

                  <motion.div
                    className="absolute inset-y-10 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-cyan-400/40"
                    animate={{ opacity: doorOpen ? 0.2 : 0.8 }}
                  />

                  <AnimatePresence>
                    {doorOpen && (
                      <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0.15 }}
                        exit={{ scaleX: 1 }}
                        transition={{ duration: 0.55 }}
                        className="absolute inset-y-8 right-6 w-[42%] origin-right rounded-l-lg border border-slate-400/30 bg-slate-600/50 backdrop-blur-sm"
                      />
                    )}
                  </AnimatePresence>

                  {/* Player */}
                  <motion.div
                    className="absolute bottom-6 left-[18%] flex flex-col items-center"
                    animate={{ x: swiped && !showChoices ? 40 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex size-14 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-cyan-950/80">
                      <UserRound className="size-7 text-cyan-200" />
                    </div>
                    <p className="mt-1 font-mono text-[9px] text-cyan-200">YOU</p>
                  </motion.div>

                  {/* Attacker with boxes */}
                  <AnimatePresence>
                    {attackerApproach && (
                      <motion.div
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute bottom-6 right-[10%] flex flex-col items-center"
                      >
                        <div className="relative">
                          <div className="flex size-14 items-center justify-center rounded-full border-2 border-amber-400/50 bg-amber-950/70">
                            <UserRound className="size-7 text-amber-100" />
                          </div>
                          <Package className="absolute -right-3 -top-2 size-6 text-amber-300" />
                          <Package className="absolute -left-2 top-2 size-5 text-amber-400/80" />
                        </div>
                        <p className="mt-1 font-mono text-[9px] text-amber-200">UNKNOWN</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mb-3 h-2 w-3/4 rounded-full bg-slate-700" />
                </div>

                {/* Card reader */}
                <div className="ml-2 flex h-56 w-20 flex-col items-center justify-center gap-3 rounded-r-xl border border-slate-500/40 bg-slate-800/90 px-2">
                  <CreditCard className="size-6 text-cyan-300" />
                  <button
                    type="button"
                    disabled={swiped}
                    onClick={swipeCard}
                    className={`min-h-10 w-full rounded-lg px-1 font-game text-[10px] font-bold tracking-wide transition ${
                      swiped
                        ? 'cursor-default bg-emerald-500/30 text-emerald-200'
                        : 'cursor-pointer bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                    }`}
                  >
                    {swiped ? 'SWIPED' : 'SWIPE'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {attackerApproach && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mx-auto mt-6 max-w-xl rounded-2xl border border-amber-400/35 bg-amber-950/40 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
                      <div>
                        <p className="font-game text-sm text-amber-100">“Please hold the door — my hands are full!”</p>
                        <p className="mt-1 text-xs text-amber-100/70">
                          Stranger carrying heavy boxes rushes toward the open turnstile.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {showChoices && (
            <div className="mx-auto grid w-full max-w-5xl gap-3 sm:grid-cols-3">
              {CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  className="group cursor-pointer rounded-2xl border border-slate-600/60 bg-slate-950/80 p-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-950/30"
                >
                  <p className="font-game text-sm text-white group-hover:text-cyan-100">{choice.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{choice.detail}</p>
                </button>
              ))}
            </div>
          )}

          {!swiped && (
            <p className="mx-auto max-w-5xl text-center font-mono text-[10px] tracking-wider text-slate-500 sm:text-xs">
              Step 1 — swipe your corporate access card to unlock the turnstile.
            </p>
          )}
        </div>

        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
        {wrongFeedback && (
          <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={resetPlay} />
        )}
      </div>
    </CyberHud>
  )
}
