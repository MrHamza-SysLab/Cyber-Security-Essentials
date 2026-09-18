import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, ChevronDown, Lock, Search, ShieldCheck, Sparkles } from 'lucide-react'
import splash from '../../../assets/games/threat-spotter-catch-the-impostor/splash.jpg'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const QUERY = 'Download Zoom Desktop'

const BRIEF = [
  'SEARCH POISONING INSPECTOR',
  'Poisoned ads hijack download searches.',
  '• Query: Download Zoom Desktop',
  '• Top 2 results are Sponsored traps',
  '• Click the real zoom.com download link',
  'Never click the loudest download ad.',
]

const NAV_TABS = [
  { id: 'ai', label: 'AI Mode' },
  { id: 'all', label: 'All', active: true },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'short', label: 'Short videos' },
  { id: 'forums', label: 'Forums' },
  { id: 'news', label: 'News' },
  { id: 'more', label: 'More', hasMenu: true },
  { id: 'tools', label: 'Tools', hasMenu: true },
]

const RESULTS = [
  {
    id: 'ad-1',
    sponsored: true,
    title: 'Zoom Desktop — Free Instant Installer',
    url: 'https://zoom-download-free-now.com/get',
    displayUrl: 'zoom-download-free-now.com',
    snippet:
      'Download Zoom Meetings in one click. Free desktop client · Windows & Mac · No signup required.',
    official: false,
  },
  {
    id: 'ad-2',
    sponsored: true,
    title: 'Zoom App Installer — Official Looking Setup',
    url: 'https://zoom-app-installer.net/zoom.exe',
    displayUrl: 'zoom-app-installer.net › download',
    snippet:
      'Fast Zoom installer mirror. Trusted by millions. Start your meeting in seconds — download now.',
    official: false,
  },
  {
    id: 'organic',
    sponsored: false,
    title: 'Download Center - Zoom',
    url: 'https://zoom.com/download',
    displayUrl: 'https://zoom.com › download',
    snippet:
      'Download Zoom Workplace for desktop, mobile, and Zoom Rooms. Get the official Zoom client from Zoom Communications.',
    official: true,
  },
]

export default function SearchPoisoningInspectorGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [cleared, setCleared] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [typedQuery, setTypedQuery] = useState('')
  const [searchReady, setSearchReady] = useState(false)

  useEffect(() => {
    if (phase !== 'play') return undefined

    setTypedQuery('')
    setSearchReady(false)

    let index = 0
    const typeTimer = window.setInterval(() => {
      index += 1
      setTypedQuery(QUERY.slice(0, index))
      if (index >= QUERY.length) {
        window.clearInterval(typeTimer)
        window.setTimeout(() => setSearchReady(true), 450)
      }
    }, 55)

    return () => window.clearInterval(typeTimer)
  }, [phase])

  const handleResultClick = (result) => {
    if (!searchReady || cleared || wrongFeedback) return

    if (result.official) {
      setCleared(true)
      setScore(100)
      setFlashId(result.id)
      setFeedback({
        tone: 'ok',
        title: '+100 XP · Official Domain Verified',
        detail: 'zoom.com is Zoom’s real download portal. Sponsored lookalikes often push malware.',
      })
      window.setTimeout(() => setPhase('result'), 1400)
      return
    }

    setFlashId(result.id)
    setWrongFeedback({
      title: 'Poisoned Search Result',
      reason: `${result.displayUrl} is a sponsored lookalike — not Zoom’s official domain. Always verify the real company domain (zoom.com) before downloading.`,
    })
  }

  const resetPlay = () => {
    setScore(0)
    setCleared(false)
    setFeedback(null)
    setFlashId(null)
    setWrongFeedback(null)
    setTypedQuery('')
    setSearchReady(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · SAFE SEARCH & SCAMS"
        lines={BRIEF}
        cta="OPEN SEARCH"
        alt="Search Poisoning Inspector"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="SEARCH POISONING INSPECTOR" score={score} onExit={onExit} status="CLEAR">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">OFFICIAL LINK SECURED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Sponsored ads can impersonate brands. Prefer the organic result that matches the real
              company domain — here, <span className="font-mono text-cyan-300">zoom.com</span>.
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

  const addressQuery = typedQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(typedQuery).replace(/%20/g, '+')}`
    : 'https://www.google.com/'

  return (
    <CyberHud
      title="SEARCH POISONING INSPECTOR"
      score={score}
      onExit={onExit}
      status="CLICK OFFICIAL LINK"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-5">
        <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-2xl border border-slate-300 bg-[#fff] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          {/* Chrome-like toolbar */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-[#dee1e6] px-3 py-2">
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
              <Lock className="size-3.5 shrink-0 text-emerald-600" />
              <span className="truncate font-mono text-xs sm:text-sm">{addressQuery}</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-end gap-0.5 select-none" aria-hidden>
                <span className="text-[28px] font-medium leading-none text-[#4285F4]">G</span>
                <span className="text-[28px] font-medium leading-none text-[#EA4335]">o</span>
                <span className="text-[28px] font-medium leading-none text-[#FBBC05]">o</span>
                <span className="text-[28px] font-medium leading-none text-[#4285F4]">g</span>
                <span className="text-[28px] font-medium leading-none text-[#34A853]">l</span>
                <span className="text-[28px] font-medium leading-none text-[#EA4335]">e</span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 shadow-sm">
                <Search className="size-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                  {typedQuery}
                  {!searchReady && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#4285F4] align-middle" />
                  )}
                </span>
              </div>
            </div>

            {searchReady && (
              <>
                <nav
                  className="mb-3 flex items-center gap-5 overflow-x-auto border-b border-slate-200 pb-0 text-sm whitespace-nowrap"
                  aria-label="Search result types"
                >
                  {NAV_TABS.map((tab) => (
                    <span
                      key={tab.id}
                      className={`inline-flex shrink-0 items-center gap-0.5 pb-2.5 ${
                        tab.active
                          ? 'border-b-[3px] border-[#1a0dab] font-medium text-[#202124]'
                          : 'border-b-[3px] border-transparent text-[#5f6368]'
                      }`}
                    >
                      {tab.label}
                      {tab.hasMenu && <ChevronDown className="size-3.5 opacity-70" aria-hidden />}
                    </span>
                  ))}
                </nav>

                <p className="mb-4 text-xs text-slate-500">About 48,200,000 results (0.38 seconds)</p>

                <div className="space-y-5">
                  {RESULTS.map((result) => {
                    const isFlash = flashId === result.id
                    const isOk = cleared && result.official
                    return (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        disabled={cleared || Boolean(wrongFeedback)}
                        className={`w-full rounded-lg p-2 text-left transition ${
                          isOk
                            ? 'bg-emerald-50 ring-2 ring-emerald-500'
                            : isFlash
                              ? 'bg-rose-50 ring-2 ring-rose-400'
                              : 'cursor-pointer hover:bg-slate-50'
                        } disabled:cursor-default`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {result.sponsored && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                              Sponsored
                            </span>
                          )}
                          <span className="font-mono text-xs text-[#202124]">{result.displayUrl}</span>
                        </div>
                        <h3 className="mt-1 text-lg leading-snug text-[#1a0dab] sm:text-xl">
                          {result.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">{result.snippet}</p>
                        {isOk && (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 className="size-4" /> Official download verified
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {!searchReady && typedQuery.length > 0 && (
              <p className="mt-8 text-center font-mono text-xs tracking-wide text-slate-400">
                Searching…
              </p>
            )}
          </div>
        </div>
      </div>

      {feedback && !wrongFeedback && (
        <FeedbackToast
          tone={feedback.tone}
          title={feedback.title}
          detail={feedback.detail}
          onClose={() => setFeedback(null)}
        />
      )}

      {wrongFeedback && (
        <WrongChoiceOverlay
          feedback={wrongFeedback}
          onTryAgain={() => {
            setWrongFeedback(null)
            setFlashId(null)
          }}
        />
      )}

      {cleared && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-center pt-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-950/90 px-5 py-2 text-emerald-200 shadow-lg"
          >
            <Sparkles className="size-4" />
            <span className="font-game text-sm tracking-wide">GREEN SIGNAL · +100 XP</span>
          </motion.div>
        </div>
      )}
    </CyberHud>
  )
}
