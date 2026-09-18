import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertTriangle,
  Archive,
  Award,
  Calendar,
  Delete,
  FileText,
  Flag,
  Inbox,
  Lock,
  Mail,
  MessageSquareWarning,
  MoreHorizontal,
  Reply,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  ThumbsUp,
} from 'lucide-react'
import splash from '../../../assets/games/safe-share-decision-engine/splash.png'
import wrongChoiceAlarm from '../../../assets/games/social-engineering-trap-detector/wrong-choice-alarm.mp3'
import CyberSplash, { CyberHud, FeedbackToast } from '../shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'SAFE SHARE DECISION ENGINE',
  'Team Lead needs AWS DB access — now.',
  '• Never paste passwords in chat',
  '• Photos of sticky notes still leak',
  '• Use Vault secure shared links',
  'Choose the compliant reply.',
]

const OPTIONS = [
  {
    id: 'a',
    title: 'Reply A',
    text: 'Plain text password chat mein type karke bhej do.',
    safe: false,
    feedbackTitle: 'Credentials Logged Forever',
    feedback:
      'Chat and email keep a permanent copy. Anyone with inbox access, backups, or a screenshot can steal the AWS password later.',
  },
  {
    id: 'b',
    title: 'Reply B',
    text: 'Sticky note par likh kar uski pic WhatsApp kar do.',
    safe: false,
    feedbackTitle: 'Photo Still Leaks Secrets',
    feedback:
      'A sticky-note photo on WhatsApp is still an unencrypted credential share — it can be forwarded, cloud-backed up, or read by anyone with the phone.',
  },
  {
    id: 'c',
    title: 'Reply C',
    text: 'Company Vault / Password Manager ka “Secure Shared Link” generate karke send karo.',
    safe: true,
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

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 3 },
  { id: 'sent', label: 'Sent Items', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText, count: 1 },
  { id: 'deleted', label: 'Deleted Items', icon: Delete },
  { id: 'archive', label: 'Archive', icon: Archive },
]

const MAIL_LIST = [
  {
    id: 'sara',
    from: 'Sara Khan',
    subject: 'URGENT: AWS Database Password for client demo',
    preview: 'Client presentation ke liye AWS Database Password bhej do…',
    time: '10:42 AM',
    unread: true,
    flagged: true,
  },
  {
    id: 'it',
    from: 'IT Helpdesk',
    subject: 'Password reset window — Friday 6 PM',
    preview: 'Scheduled maintenance for SSO identity…',
    time: '9:15 AM',
    unread: true,
  },
  {
    id: 'hr',
    from: 'HR Bulletin',
    subject: 'Monthly security reminder',
    preview: 'Never share credentials over email or chat…',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'finance',
    from: 'Finance Ops',
    subject: 'Q3 expense report approved',
    preview: 'Your submission has been cleared…',
    time: 'Mon',
    unread: false,
  },
]

export default function SafeShareDecisionEngineGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [choice, setChoice] = useState(null)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)
  const [selectedMail, setSelectedMail] = useState('sara')

  function pick(option) {
    if (choice || wrongFeedback) return
    setChoice(option.id)

    if (!option.safe) {
      setScore((s) => Math.max(0, s - 25))
      setWrongFeedback({
        title: option.feedbackTitle,
        reason: option.feedback,
      })
      return
    }

    setWrongFeedback(null)
    setScore(100)
    setBadge(true)
    setFeedback({
      tone: 'ok',
      title: 'Compliance Master unlocked',
      detail: 'Secure Shared Link keeps secrets out of chat history.',
    })
    window.setTimeout(() => setPhase('result'), 1600)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setChoice(null)
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 4 · PASSWORD SHARING"
        lines={BRIEF}
        cta="OPEN INBOX"
        alt="Safe Share Decision Engine"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="SAFE SHARE DECISION ENGINE" score={score} onExit={onExit} status="COMPLIANT">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-400/50">
              <Award className="size-8 text-emerald-300" />
            </div>
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">COMPLIANCE MASTER</h2>
            <p className="mt-2 text-sm text-slate-300">
              Password managers with expiring secure links beat chat, screenshots, and sticky notes every time.
            </p>
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setChoice(null)
                  setScore(0)
                  setBadge(false)
                  setFeedback(null)
                  setWrongFeedback(null)
                  setSelectedMail('sara')
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

  const active = MAIL_LIST.find((m) => m.id === selectedMail) ?? MAIL_LIST[0]

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#f3f2f1] text-[#242424] select-none">
      {/* Outlook title bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#e1dfdd] bg-[#0f6cbd] px-3 text-white">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-9 cursor-pointer items-center rounded px-2 text-xs font-medium hover:bg-white/15"
        >
          ← Exit
        </button>
        <div className="flex items-center gap-2">
          <Mail className="size-5" />
          <span className="hidden text-sm font-semibold sm:inline">Outlook</span>
        </div>
        <div className="mx-auto flex h-8 w-full max-w-md items-center gap-2 rounded bg-white/15 px-3 text-white/90">
          <Search className="size-3.5 shrink-0 opacity-80" />
          <span className="truncate text-xs">Search mail and people</span>
        </div>
        <div className="shrink-0 font-mono text-xs tabular-nums">{score} XP</div>
        <div className="flex size-8 items-center justify-center rounded-full bg-[#5b5fc7] text-xs font-bold">
          You
        </div>
      </header>

      {/* Ribbon */}
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-[#e1dfdd] bg-white px-2 text-[#424242]">
        {[
          { icon: Reply, label: 'Reply' },
          { icon: Archive, label: 'Archive' },
          { icon: Delete, label: 'Delete' },
          { icon: Flag, label: 'Flag' },
          { icon: Calendar, label: 'Meet' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="inline-flex cursor-default items-center gap-1.5 rounded px-2.5 py-1.5 text-xs hover:bg-[#f5f5f5]"
          >
            <Icon className="size-3.5 text-[#0f6cbd]" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
        <span className="ml-auto hidden text-[10px] tracking-wide text-[#707070] sm:inline">
          SAFE SHARE DECISION ENGINE
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Folder pane */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-[#e1dfdd] bg-[#faf9f8] sm:flex">
          <div className="px-3 py-3">
            <button
              type="button"
              className="flex w-full cursor-default items-center justify-center gap-2 rounded bg-[#0f6cbd] py-2 text-sm font-semibold text-white"
            >
              New mail
            </button>
          </div>
          <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#707070]">
            Favorites
          </p>
          <nav className="space-y-0.5 px-2">
            {FOLDERS.map(({ id, label, icon: Icon, count }) => (
              <div
                key={id}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                  id === 'inbox' ? 'bg-[#cfe4fa] font-semibold text-[#0f6cbd]' : 'text-[#242424] hover:bg-[#f0f0f0]'
                }`}
              >
                <Icon className="size-4 shrink-0 opacity-80" />
                <span className="flex-1 truncate">{label}</span>
                {count != null && (
                  <span className="text-[10px] tabular-nums text-[#707070]">{count}</span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Message list */}
        <section className="flex w-full max-w-[20rem] shrink-0 flex-col border-r border-[#e1dfdd] bg-white sm:max-w-[22rem]">
          <div className="flex items-center justify-between border-b border-[#e1dfdd] px-3 py-2">
            <h2 className="text-sm font-semibold">Inbox</h2>
            <MoreHorizontal className="size-4 text-[#707070]" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {MAIL_LIST.map((mail) => {
              const selected = selectedMail === mail.id
              return (
                <button
                  key={mail.id}
                  type="button"
                  onClick={() => setSelectedMail(mail.id)}
                  className={`flex w-full cursor-pointer gap-2 border-b border-[#f0f0f0] px-3 py-2.5 text-left transition ${
                    selected ? 'bg-[#cfe4fa]/70' : 'hover:bg-[#f5f5f5]'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      mail.id === 'sara' ? 'bg-[#c239b3]' : 'bg-[#8764b8]'
                    }`}
                  >
                    {mail.from
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${mail.unread ? 'font-bold' : 'font-medium'}`}>
                        {mail.from}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#707070]">{mail.time}</span>
                    </div>
                    <p className={`truncate text-xs ${mail.unread ? 'font-semibold text-[#242424]' : 'text-[#424242]'}`}>
                      {mail.subject}
                    </p>
                    <p className="truncate text-[11px] text-[#707070]">{mail.preview}</p>
                    {mail.flagged && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#d13438]">
                        <Flag className="size-2.5 fill-current" /> Flagged
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Reading pane */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {selectedMail !== 'sara' ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-[#707070]">
              <Mail className="size-10 opacity-40" />
              <p className="text-sm font-medium text-[#242424]">{active.subject}</p>
              <p className="max-w-sm text-xs">
                Open Sara&apos;s urgent request to decide how you share the AWS password.
              </p>
              <button
                type="button"
                onClick={() => setSelectedMail('sara')}
                className="mt-2 cursor-pointer rounded bg-[#0f6cbd] px-4 py-2 text-xs font-semibold text-white hover:bg-[#115ea3]"
              >
                Jump to Sara&apos;s email
              </button>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="border-b border-[#e1dfdd] px-4 py-3 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-lg font-semibold leading-snug sm:text-xl">
                    URGENT: AWS Database Password for client demo
                  </h1>
                  <button type="button" className="cursor-default p-1 text-[#707070]" aria-label="Star">
                    <Star className="size-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c239b3] text-sm font-bold text-white">
                    SK
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold">Sara Khan</span>
                      <span className="text-xs text-[#707070]">&lt;sara.khan@proctorparhai.com&gt;</span>
                    </div>
                    <p className="text-xs text-[#707070]">
                      To: You &lt;you@proctorparhai.com&gt; · Today 10:42 AM
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#0f6cbd]">
                      Team Lead · Client War Room
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-4 py-4 sm:px-6">
                <div className="space-y-3 text-sm leading-relaxed text-[#242424]">
                  <p>Hi,</p>
                  <p>
                    Urgent! Client presentation ke liye AWS Database Password bhej do. Demo 30 minutes
                    mein start ho raha hai — mujhe turant access chahiye.
                  </p>
                  <p className="text-[#707070]">Thanks,</p>
                  <p className="font-medium">Sara Khan · Team Lead</p>
                </div>

                <AnimatePresence>
                  {badge && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3"
                    >
                      <Lock className="size-7 text-emerald-600" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-emerald-800">Secure Shared Link sent</p>
                        <p className="text-xs text-emerald-700/80">Expires in 30 min · audit logged</p>
                      </div>
                      <ThumbsUp className="size-5 text-emerald-600" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!badge && !wrongFeedback && (
                  <div className="rounded-lg border border-[#e1dfdd] bg-[#faf9f8] p-3 sm:p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Reply className="size-4 text-[#0f6cbd]" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#424242]">
                        How will you reply?
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          disabled={Boolean(choice)}
                          onClick={() => pick(option)}
                          className={`game-pop cursor-pointer rounded-md border bg-white p-3 text-left transition disabled:opacity-60 ${
                            choice === option.id && option.safe
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-[#e1dfdd] hover:border-[#0f6cbd] hover:bg-[#f3f9fd]'
                          }`}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0f6cbd]">
                            {option.title}
                          </p>
                          <p className="mt-1 text-sm text-[#242424]">{option.text}</p>
                          {option.safe ? (
                            <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700">
                              <ShieldCheck className="size-3.5" /> Recommended path
                            </p>
                          ) : (
                            <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700">
                              <MessageSquareWarning className="size-3.5" /> High leak risk
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {wrongFeedback && (
        <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={handleTryAgain} />
      )}

      {feedback && (
        <FeedbackToast
          tone={feedback.tone}
          title={feedback.title}
          detail={feedback.detail}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  )
}
