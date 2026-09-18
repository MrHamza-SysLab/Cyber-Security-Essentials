import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  CheckSquare,
  CircleHelp,
  Grid3x3,
  Inbox,
  Menu,
  PenSquare,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  Shield,
  Star,
  MoreVertical,
  MonitorSmartphone,
} from 'lucide-react'
import splash from '../../../assets/games/account-hijack-simulator/splash.png'
import CyberSplash, { CyberHud, FeedbackToast } from '../shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'ACCOUNT HIJACK SIMULATOR',
  'Colleague account looks compromised.',
  '• Find 3 compromise indicators',
  '• Sessions · Inbox rules · Sent spam',
  '• Tap every red flag you spot',
  'Detective mode. Clear the account.',
]

const HOTSPOTS = {
  sessions: {
    id: 'sessions',
    label: 'Unknown Linux Device',
    xp: 50,
    detail: 'Active session from a device this user never enrolled.',
  },
  rules: {
    id: 'rules',
    label: 'Auto-forward Invoice rule',
    xp: 50,
    detail: "Rule forwards emails containing 'Invoice' to an external Gmail.",
  },
  sent: {
    id: 'sent',
    label: 'Spam blast in Sent',
    xp: 50,
    detail: '100 spam emails sent in the last 5 minutes.',
  },
}

const INBOX_ROWS = [
  { from: 'HR Portal', subject: 'Payslip available', time: '09:12', preview: 'Your latest payslip is ready to download from the HR portal.' },
  { from: 'AWS Billing', subject: 'Invoice #88421', time: '08:55', preview: 'Your AWS invoice for this billing period is attached.' },
  { from: 'IT Helpdesk', subject: 'Password expiry notice', time: '08:40', preview: 'Your corporate password will expire in 7 days.' },
  { from: 'Unknown', subject: 'Urgent wire transfer', time: '08:11', preview: 'Please process this payment immediately — details inside.' },
]

const NAV = [
  { id: 'inbox', label: 'Inbox', Icon: Inbox },
  { id: 'sent', label: 'Sent', Icon: Send },
  { id: 'rules', label: 'Inbox Rules', Icon: Shield },
  { id: 'sessions', label: 'Active Sessions', Icon: MonitorSmartphone },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

function GmailLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden="true">
        <path fill="#4285F4" d="M2 4.5v13A2.5 2.5 0 0 0 4.5 20H7V9.2L14 14l7-4.8V20h2.5A2.5 2.5 0 0 0 26 17.5v-13L14 12.2 2 4.5Z" />
        <path fill="#34A853" d="M26 4.5V3.2A2.5 2.5 0 0 0 23.5 1H21l-7 5.2L7 1H4.5A2.5 2.5 0 0 0 2 3.2v1.3L14 12.2 26 4.5Z" />
        <path fill="#FBBC04" d="M2 4.5 14 12.2V20H7V9.2L2 5.8V4.5Z" opacity=".9" />
        <path fill="#EA4335" d="M26 4.5v1.3l-5 3.4V20h-7v-7.8L26 4.5Z" opacity=".9" />
      </svg>
      <span className="hidden text-[22px] font-normal tracking-tight text-[#5f6368] sm:inline" style={{ fontFamily: 'Product Sans, Roboto, Arial, sans-serif' }}>
        Gmail
      </span>
    </div>
  )
}

export default function AccountHijackSimulatorGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [panel, setPanel] = useState('inbox')
  const [found, setFound] = useState([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [glass, setGlass] = useState(null)

  const remaining = 3 - found.length
  const done = found.length >= 3

  const mission = useMemo(
    () =>
      'Aapke colleague ka account suspicious lag raha hai. 3 compromise indicators dhoond kar tap karein!',
    [],
  )

  function tapFlag(id, event) {
    if (found.includes(id) || done) return
    const spot = HOTSPOTS[id]
    const rect = event.currentTarget.getBoundingClientRect()
    setGlass({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    window.setTimeout(() => setGlass(null), 700)

    setFound((list) => [...list, id])
    setScore((s) => s + spot.xp)
    setFeedback({
      tone: 'ok',
      title: `+${spot.xp} XP · ${spot.label}`,
      detail: spot.detail,
    })

    if (found.length + 1 >= 3) {
      window.setTimeout(() => setPhase('result'), 1100)
    }
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · CREDENTIAL THEFT"
        lines={BRIEF}
        cta="START INVESTIGATION"
        alt="Account Hijack Simulator"
        centerHero={['ACCOUNT', 'HIJACK', 'SIMULATOR']}
        centerHeroTone="cyan"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="ACCOUNT HIJACK SIMULATOR" score={score} onExit={onExit} status="CASE CLOSED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/35 bg-slate-950/90 p-6 text-center">
            <Search className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">COMPROMISE MAPPED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Unknown sessions, sneaky forward rules, and sudden spam from Sent are classic account-takeover signs.
            </p>
            <ul className="mt-4 space-y-1 text-left text-xs text-slate-300">
              {Object.values(HOTSPOTS).map((h) => (
                <li key={h.id} className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-3 py-2">
                  ✓ {h.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setFound([])
                  setScore(0)
                  setPanel('inbox')
                  setFeedback(null)
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

  const panelTitle =
    panel === 'inbox'
      ? 'Inbox'
      : panel === 'sent'
        ? 'Sent'
        : panel === 'rules'
          ? 'Filters and blocked addresses'
          : panel === 'sessions'
            ? 'Security · Your devices'
            : 'Settings'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#f6f8fc] text-[#202124]"
      style={{ fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}
    >
      {/* Gmail top bar */}
      <header className="flex h-16 shrink-0 items-center gap-2 px-2 sm:gap-3 sm:px-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5"
          aria-label="Exit"
          title="Exit"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          type="button"
          className="hidden size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5 sm:inline-flex"
          aria-label="Main menu"
        >
          <Menu className="size-5" />
        </button>
        <GmailLogo />

        <div className="mx-1 flex min-w-0 flex-1 justify-center sm:mx-4">
          <div className="flex h-12 w-full max-w-[720px] items-center gap-2 rounded-full bg-[#eaf1fb] px-3 transition focus-within:bg-white focus-within:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)] sm:px-4">
            <Search className="size-5 shrink-0 text-[#5f6368]" />
            <input
              type="search"
              readOnly
              value=""
              placeholder="Search mail"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[#202124] outline-none placeholder:text-[#5f6368]"
            />
            <span className="hidden shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#1a73e8] sm:inline">
              {found.length}/3 flags · {score} XP
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <span className="mr-1 rounded-full bg-[#e8f0fe] px-2 py-1 text-[10px] font-medium text-[#1967d2] sm:hidden">
            {found.length}/3 · {score} XP
          </span>
          <button type="button" className="hidden size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5 sm:inline-flex">
            <CircleHelp className="size-5" />
          </button>
          <button type="button" className="hidden size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5 sm:inline-flex">
            <Settings className="size-5" />
          </button>
          <button type="button" className="hidden size-10 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5 md:inline-flex">
            <Grid3x3 className="size-5" />
          </button>
          <div
            className="ml-1 flex size-8 cursor-default items-center justify-center rounded-full bg-[#1a73e8] text-sm font-medium text-white"
            title="colleague@company.com"
          >
            C
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="hidden w-[256px] shrink-0 flex-col px-3 pb-3 pt-1 sm:flex">
          <button
            type="button"
            className="mb-4 flex h-14 w-[140px] cursor-default items-center gap-3 rounded-2xl bg-[#c2e7ff] px-4 text-sm font-medium text-[#001d35] shadow-sm"
          >
            <PenSquare className="size-5" />
            Compose
          </button>

          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ id, label, Icon }) => {
              const active = panel === id
              const hasFlag = HOTSPOTS[id] && !found.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPanel(id)}
                  className={`flex h-8 cursor-pointer items-center gap-4 rounded-r-full pl-6 pr-3 text-left text-sm transition ${
                    active
                      ? 'bg-[#d3e3fd] font-bold text-[#001d35]'
                      : 'font-normal text-[#202124] hover:bg-[#e8eaed]'
                  }`}
                >
                  <Icon className={`size-[18px] shrink-0 ${active ? 'text-[#001d35]' : 'text-[#5f6368]'}`} />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {hasFlag && (
                    <span className="rounded-full bg-[#d93025] px-1.5 text-[11px] font-bold leading-5 text-white">
                      !
                    </span>
                  )}
                  {HOTSPOTS[id] && found.includes(id) && (
                    <span className="text-[11px] font-medium text-[#188038]">✓</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="mt-6 border-t border-[#dadce0] pt-3">
            <p className="px-4 text-[11px] font-medium uppercase tracking-wide text-[#5f6368]">Labels</p>
            <div className="mt-1 flex h-8 items-center gap-4 rounded-r-full pl-6 pr-3 text-sm text-[#202124]">
              <span className="size-3 rounded-sm bg-[#f6bf26]" />
              Investigation
            </div>
          </div>
        </aside>

        {/* Main mail pane */}
        <main className="mr-0 mb-0 flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] sm:mr-4 sm:mb-4">
          {/* Mission banner */}
          <div className="mx-3 mt-3 flex items-start gap-3 rounded-lg border border-[#f9ab00]/40 bg-[#fef7e0] px-3 py-2.5 sm:mx-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#e37400]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#e37400]">Security alert · Mission</p>
              <p className="mt-0.5 text-sm leading-snug text-[#3c4043]">{mission}</p>
              <p className="mt-1 text-xs font-medium text-[#5f6368]">{remaining} remaining</p>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto border-b border-[#dadce0] px-2 py-2 sm:hidden">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPanel(id)}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs ${
                  panel === id ? 'bg-[#d3e3fd] font-bold text-[#001d35]' : 'bg-[#f1f3f4] text-[#5f6368]'
                }`}
              >
                {label}
                {HOTSPOTS[id] && !found.includes(id) && (
                  <span className="ml-1 inline-block size-1.5 rounded-full bg-[#d93025] align-middle" />
                )}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex h-12 shrink-0 items-center gap-1 border-b border-transparent px-2 sm:px-3">
            <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5">
              <CheckSquare className="size-[18px]" />
            </button>
            <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5">
              <RefreshCw className="size-[18px]" />
            </button>
            <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-black/5">
              <MoreVertical className="size-[18px]" />
            </button>
            <p className="ml-2 truncate text-sm font-medium text-[#202124]">{panelTitle}</p>
            {panel === 'inbox' && (
              <span className="ml-auto hidden text-xs text-[#5f6368] sm:inline">1–4 of 4</span>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {panel === 'inbox' && (
              <div>
                {INBOX_ROWS.map((row) => (
                  <div
                    key={row.subject}
                    className="group flex h-10 cursor-default items-center gap-1 border-b border-[#f2f2f2] px-2 hover:z-[1] hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] sm:gap-2 sm:px-3"
                  >
                    <input type="checkbox" readOnly className="size-4 accent-[#1a73e8]" tabIndex={-1} />
                    <Star className="size-4 shrink-0 text-[#dadce0]" />
                    <span className="w-[100px] shrink-0 truncate text-sm font-bold text-[#202124] sm:w-[140px]">
                      {row.from}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <span className="font-bold text-[#202124]">{row.subject}</span>
                      <span className="text-[#5f6368]"> — {row.preview}</span>
                    </span>
                    <span className="shrink-0 pl-2 text-xs font-bold text-[#202124]">{row.time}</span>
                  </div>
                ))}
                <p className="px-4 py-6 text-center text-xs text-[#5f6368]">
                  Tip: check Sessions, Rules, and Sent for red flags.
                </p>
              </div>
            )}

            {panel === 'settings' && (
              <div className="m-4 max-w-xl rounded-lg border border-[#dadce0] bg-white p-4">
                <h3 className="text-base font-medium text-[#202124]">General</h3>
                <p className="mt-2 text-sm text-[#5f6368]">
                  Display name, signature, and theme look normal. Dig deeper in other tabs.
                </p>
                <div className="mt-4 space-y-3 text-sm text-[#202124]">
                  <div className="flex justify-between border-b border-[#f1f3f4] pb-2">
                    <span>Language</span>
                    <span className="text-[#5f6368]">English (US)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#f1f3f4] pb-2">
                    <span>Maximum page size</span>
                    <span className="text-[#5f6368]">50 conversations</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desktop notifications</span>
                    <span className="text-[#5f6368]">Off</span>
                  </div>
                </div>
              </div>
            )}

            {panel === 'sessions' && (
              <div className="space-y-0 p-2 sm:p-4">
                <p className="mb-3 px-2 text-sm text-[#5f6368]">
                  You&apos;re currently signed in to these devices. Review anything unfamiliar.
                </p>
                <div className="rounded-lg border border-[#dadce0] px-4 py-3">
                  <p className="text-sm font-medium text-[#202124]">Windows Laptop · Karachi</p>
                  <p className="text-xs text-[#188038]">This device · Active now</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => tapFlag('sessions', e)}
                  className={`mt-2 w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition ${
                    found.includes('sessions')
                      ? 'border-[#188038]/40 bg-[#e6f4ea]'
                      : 'border-[#fce8e6] bg-[#fce8e6] hover:bg-[#fad2cf]'
                  }`}
                >
                  <p className="text-sm font-medium text-[#202124]">Logged in from Unknown Linux Device</p>
                  <p className="text-xs text-[#d93025]">Moscow · 03:14 AM · new fingerprint</p>
                  {found.includes('sessions') && (
                    <p className="mt-1 text-xs font-medium text-[#188038]">Flagged</p>
                  )}
                </button>
              </div>
            )}

            {panel === 'rules' && (
              <div className="space-y-2 p-2 sm:p-4">
                <p className="mb-2 px-2 text-sm text-[#5f6368]">
                  Create a filter to manage incoming messages. Review forwarding carefully.
                </p>
                <div className="rounded-lg border border-[#dadce0] px-4 py-3 text-sm text-[#202124]">
                  Move newsletters to folder &quot;Updates&quot;
                </div>
                <button
                  type="button"
                  onClick={(e) => tapFlag('rules', e)}
                  className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition ${
                    found.includes('rules')
                      ? 'border-[#188038]/40 bg-[#e6f4ea]'
                      : 'border-[#fce8e6] bg-[#fce8e6] hover:bg-[#fad2cf]'
                  }`}
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-[#202124]">
                    <ShieldAlert className="size-4 shrink-0 text-[#d93025]" />
                    Rule: Auto-forward all emails containing &apos;Invoice&apos; to external Gmail
                  </p>
                  {found.includes('rules') && (
                    <p className="mt-1 text-xs font-medium text-[#188038]">Flagged</p>
                  )}
                </button>
              </div>
            )}

            {panel === 'sent' && (
              <div>
                <div className="flex h-10 items-center gap-2 border-b border-[#f2f2f2] px-3 text-sm text-[#5f6368]">
                  <Star className="size-4 text-[#dadce0]" />
                  <span className="w-[140px] font-medium text-[#202124]">You</span>
                  <span className="flex-1 truncate">Re: Project timeline</span>
                  <span className="text-xs">Yesterday</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => tapFlag('sent', e)}
                  className={`flex w-full cursor-pointer items-start gap-2 border-b px-3 py-3 text-left transition ${
                    found.includes('sent')
                      ? 'border-[#188038]/20 bg-[#e6f4ea]'
                      : 'border-[#fce8e6] bg-[#fce8e6] hover:bg-[#fad2cf]'
                  }`}
                >
                  <Star className="mt-0.5 size-4 shrink-0 text-[#d93025]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-sm font-bold text-[#202124]">You</span>
                      <span className="text-xs font-bold text-[#d93025]">Just now</span>
                    </div>
                    <p className="text-sm font-medium text-[#202124]">100 Spam emails sent in last 5 minutes</p>
                    <p className="text-xs text-[#5f6368]">Bulk phishing links · external recipients</p>
                    {found.includes('sent') && (
                      <p className="mt-1 text-xs font-medium text-[#188038]">Flagged</p>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {glass && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed z-50 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#1a73e8] bg-[#1a73e8]/15 shadow-[0_0_24px_rgba(26,115,232,0.45)]"
            style={{ left: glass.x, top: glass.y }}
          >
            <Search className="size-7 text-[#1a73e8]" />
          </motion.div>
        )}
      </AnimatePresence>

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
