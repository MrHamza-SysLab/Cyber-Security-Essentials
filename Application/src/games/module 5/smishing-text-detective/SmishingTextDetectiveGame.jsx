import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import {
  ArrowLeft,
  Building2,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  ShieldCheck,
  Smile,
  ThumbsDown,
  ThumbsUp,
  Video,
} from 'lucide-react'
import splash from '../../../assets/games/smishing-text-detective/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import PhoneFrame from '../shared/PhoneFrame'

const BRIEF = [
  'SMISHING TEXT DETECTIVE',
  'SMS is a favorite corporate attack channel.',
  '• Swipe LEFT = Smishing trap',
  '• Swipe RIGHT = Legit message',
  '• Fake links & urgency = red flags',
  'Sort three inbound texts before time pressure hits.',
]

const MESSAGES = [
  {
    id: 'pkg',
    from: 'PostOffice-Alert',
    preview: 'Your package #8821 could not be delivered.',
    body: 'Your package #8821 could not be delivered. Update address at:',
    link: 'http://post-office-delivery-update.net/auth',
    verdict: 'smish',
    xp: 35,
    wrongTitle: 'Smishing Link Trusted',
    wrongReason:
      'Unexpected delivery texts with odd domains are classic SMS phishing. Never tap unverified tracking links — check the carrier or retailer app instead.',
  },
  {
    id: 'bank',
    from: 'FirstBank Alerts',
    preview: 'Balance notification · no action link',
    body: 'Your bank balance is $1,250. Reply STOP to end SMS alerts.',
    link: null,
    verdict: 'legit',
    xp: 30,
    wrongTitle: 'Legitimate Alert Flagged',
    wrongReason:
      'This is an informational balance SMS with a standard STOP opt-out and no suspicious URL. Blocking real alerts can hide genuine fraud notices.',
  },
  {
    id: 'corp',
    from: 'IT-Security',
    preview: 'URGENT: corporate email deactivation',
    body: 'URGENT: Your corporate email will be deactivated today. Re-verify phone number here:',
    link: 'http://company-auth.online',
    verdict: 'smish',
    xp: 35,
    wrongTitle: 'Credential Harvest Allowed',
    wrongReason:
      'Urgent “email will be deactivated” + a lookalike domain is smishing. Corporate re-verification never happens via random SMS links.',
  },
]

const SWIPE_THRESHOLD = 110

export default function SmishingTextDetectiveGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [busy, setBusy] = useState(false)

  const msg = MESSAGES[index]
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12])
  const trapOpacity = useTransform(x, [-160, -40, 0], [1, 0.35, 0])
  const legitOpacity = useTransform(x, [0, 40, 160], [0, 0.35, 1])
  const lockRef = useRef(false)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    x.set(0)
    lockRef.current = false
  }, [index, x])

  function settle(choice) {
    if (!msg || busy || wrongFeedback || lockRef.current) return
    lockRef.current = true

    const correct =
      (choice === 'left' && msg.verdict === 'smish') || (choice === 'right' && msg.verdict === 'legit')

    if (!correct) {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
      setWrongFeedback({
        title: msg.wrongTitle,
        reason: msg.wrongReason,
      })
      lockRef.current = false
      return
    }

    setBusy(true)
    const dir = choice === 'left' ? -1 : 1
    setScore((s) => s + msg.xp)
    setToast({
      tone: 'ok',
      title: `${msg.verdict === 'smish' ? 'Trap blocked' : 'Legit kept'} · +${msg.xp} XP`,
      detail: msg.verdict === 'smish' ? 'Smishing pattern recognized.' : 'Real alert preserved.',
    })

    animate(x, dir * 480, { duration: 0.32 }).then(() => {
      x.set(0)
      setBusy(false)
      lockRef.current = false
      if (index >= MESSAGES.length - 1) {
        setPhase('result')
        return
      }
      setIndex((i) => i + 1)
    })
  }

  function onDragEnd(_, info) {
    if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
      return
    }
    settle(info.offset.x < 0 ? 'left' : 'right')
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 2 · MOBILE PHISHING & SMS ATTACKS"
        lines={BRIEF}
        cta="OPEN MESSAGE QUEUE"
        alt="Smishing Text Detective"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="SMISHING TEXT DETECTIVE" score={score} onExit={onExit} status="INBOX HARDENED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">SMS THREATS FILTERED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You separated delivery/credential traps from genuine banking notices — mobile phishing stopped at the swipe.
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

  return (
    <CyberHud
      title="SMISHING TEXT DETECTIVE"
      score={score}
      onExit={onExit}
      status={`MSG ${index + 1}/${MESSAGES.length}`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(251,113,133,0.1),transparent_40%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">CORP MOBILE · SMS GATE</span>
            </div>
            <div className="flex gap-3 font-mono text-[10px] sm:text-xs">
              <span className="text-rose-300">← TRAP</span>
              <span className="text-emerald-300">LEGIT →</span>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <button
              type="button"
              disabled={busy || Boolean(wrongFeedback)}
              onClick={() => settle('left')}
              className="hidden min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-950/40 px-4 font-game text-sm text-rose-200 transition hover:bg-rose-900/50 disabled:opacity-50 lg:flex"
            >
              <ThumbsDown className="size-4" />
              SMISHING
            </button>

            <PhoneFrame
              notch={false}
              screenClassName="bg-[#f0f2f5]"
              statusClassName="bg-[#f0f2f5] text-[#202124]"
            >
              <div className="flex min-h-[560px] flex-col bg-[#f0f2f5]">
                {/* Android Messages top app bar */}
                <div className="flex items-center gap-1 border-b border-black/5 bg-white px-1.5 py-2 shadow-sm">
                  <button
                    type="button"
                    tabIndex={-1}
                    className="flex size-10 shrink-0 cursor-default items-center justify-center rounded-full text-[#5f6368]"
                    aria-hidden
                  >
                    <ArrowLeft className="size-5" strokeWidth={2} />
                  </button>
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-medium text-white">
                      {(msg?.from || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium leading-tight text-[#202124]">
                        {msg?.from}
                      </p>
                      <p className="truncate text-[11px] text-[#5f6368]">Mobile · SMS</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center text-[#5f6368]">
                    <span className="flex size-9 items-center justify-center rounded-full">
                      <Video className="size-[18px]" />
                    </span>
                    <span className="flex size-9 items-center justify-center rounded-full">
                      <Phone className="size-[18px]" />
                    </span>
                    <span className="flex size-9 items-center justify-center rounded-full">
                      <MoreVertical className="size-[18px]" />
                    </span>
                  </div>
                </div>

                {/* Conversation thread */}
                <div className="relative flex flex-1 flex-col px-3 pb-2 pt-4">
                  <p className="mb-4 text-center text-[11px] text-[#80868b]">Today · Just now</p>

                  <div className="relative flex-1">
                    <AnimatePresence mode="wait">
                      {msg && (
                        <motion.div
                          key={msg.id}
                          style={{ x, rotate }}
                          drag={busy || wrongFeedback ? false : 'x'}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.9}
                          onDragEnd={onDragEnd}
                          initial={{ scale: 0.96, opacity: 0, y: 18 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.12 } }}
                          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          className="cursor-grab touch-pan-y active:cursor-grabbing"
                        >
                          <div className="relative max-w-[92%]">
                            <motion.div
                              style={{ opacity: trapOpacity }}
                              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[20px] bg-rose-600/40"
                            >
                              <span className="rounded-lg border-2 border-rose-100 px-3 py-1 font-game text-xl text-rose-50">
                                TRAP
                              </span>
                            </motion.div>
                            <motion.div
                              style={{ opacity: legitOpacity }}
                              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[20px] bg-emerald-600/40"
                            >
                              <span className="rounded-lg border-2 border-emerald-100 px-3 py-1 font-game text-xl text-emerald-50">
                                LEGIT
                              </span>
                            </motion.div>

                            {/* Incoming Android Messages bubble */}
                            <div className="rounded-[20px] rounded-bl-md bg-white px-3.5 py-2.5 text-[14px] leading-snug text-[#202124] shadow-[0_1px_2px_rgba(60,64,67,0.18)]">
                              <p>{msg.body}</p>
                              {msg.link && (
                                <a
                                  href={msg.link}
                                  onClick={(e) => e.preventDefault()}
                                  className="mt-1.5 block break-all text-[#1a73e8] underline decoration-[#1a73e8]/40 underline-offset-2"
                                >
                                  {msg.link}
                                </a>
                              )}
                            </div>
                            <p className="mt-1 pl-1 text-[11px] text-[#80868b]">SMS · Just now</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="mt-auto pt-3 text-center text-[11px] text-[#80868b]">
                    Swipe left = trap · Swipe right = legit
                  </p>
                </div>

                {/* Compose bar */}
                <div className="border-t border-black/5 bg-white px-2 py-2">
                  <div className="flex items-end gap-1">
                    <span className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-[#5f6368]">
                      <Smile className="size-5" />
                    </span>
                    <div className="mb-0.5 min-h-10 flex-1 rounded-3xl bg-[#f1f3f4] px-4 py-2.5 text-[14px] text-[#80868b]">
                      Text message
                    </div>
                    <span className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-[#5f6368]">
                      <Paperclip className="size-5" />
                    </span>
                    <span className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-white">
                      <Send className="size-4" />
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 lg:hidden">
                    <button
                      type="button"
                      disabled={busy || Boolean(wrongFeedback)}
                      onClick={() => settle('left')}
                      className="min-h-11 cursor-pointer rounded-xl border border-rose-400/50 bg-rose-50 font-game text-xs text-rose-700 disabled:opacity-50"
                    >
                      ← TRAP
                    </button>
                    <button
                      type="button"
                      disabled={busy || Boolean(wrongFeedback)}
                      onClick={() => settle('right')}
                      className="min-h-11 cursor-pointer rounded-xl border border-emerald-400/50 bg-emerald-50 font-game text-xs text-emerald-700 disabled:opacity-50"
                    >
                      LEGIT →
                    </button>
                  </div>
                </div>
              </div>
            </PhoneFrame>

            <button
              type="button"
              disabled={busy || Boolean(wrongFeedback)}
              onClick={() => settle('right')}
              className="hidden min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/40 px-4 font-game text-sm text-emerald-200 transition hover:bg-emerald-900/50 disabled:opacity-50 lg:flex"
            >
              <ThumbsUp className="size-4" />
              LEGIT
            </button>
          </div>
        </div>

        {toast && <FeedbackToast {...toast} onClose={() => setToast(null)} />}
        {wrongFeedback && (
          <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={() => setWrongFeedback(null)} />
        )}
      </div>
    </CyberHud>
  )
}
