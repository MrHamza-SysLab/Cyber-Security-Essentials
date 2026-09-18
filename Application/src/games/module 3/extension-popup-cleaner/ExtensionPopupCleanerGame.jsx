import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gift,
  Home,
  Lock,
  MoreVertical,
  Puzzle,
  RotateCw,
  ShieldCheck,
  Star,
  X,
  FileType,
} from 'lucide-react'
import splash from '../../../assets/games/permission-matrix-sorter/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'EXTENSION & POP-UP CLEANER',
  'Your work browser is cluttered.',
  '• Close the scam prize pop-up',
  '• Open Extensions → Remove junk',
  '• Keep AdBlocker Pro installed',
  'Unknown add-ons = session theft.',
]

const EXTENSIONS = [
  {
    id: 'vpn',
    label: 'Free VPN Extension',
    detail: 'Unknown publisher · Can read and change all your data on websites you visit',
    Icon: Puzzle,
    safe: false,
    xp: 35,
    version: '2.4.1',
  },
  {
    id: 'adblock',
    label: 'AdBlocker Pro',
    detail: 'Verified · Chrome Web Store · Blocks ads and trackers',
    Icon: ShieldCheck,
    safe: true,
    xp: 0,
    version: '5.12.0',
  },
  {
    id: 'pdf',
    label: 'PDF Converter Extension',
    detail: 'Can access file URLs and read data on every site',
    Icon: FileType,
    safe: false,
    xp: 30,
    version: '1.0.8',
  },
]

const POPUP = {
  id: 'iphone',
  label: 'You Won an iPhone!',
  xp: 35,
}

export default function ExtensionPopupCleanerGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [removed, setRemoved] = useState([])
  const [popupClosed, setPopupClosed] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [extPanelOpen, setExtPanelOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [claimEmail, setClaimEmail] = useState('')

  const remainingBad = useMemo(() => {
    const extLeft = EXTENSIONS.filter((e) => !e.safe && !removed.includes(e.id)).length
    const popupLeft = popupClosed ? 0 : 1
    return extLeft + popupLeft
  }, [removed, popupClosed])

  const installedExts = useMemo(
    () => EXTENSIONS.filter((e) => e.safe || !removed.includes(e.id)),
    [removed],
  )

  function checkWin(nextRemoved, nextPopupClosed) {
    const extLeft = EXTENSIONS.filter((e) => !e.safe && !nextRemoved.includes(e.id)).length
    const popupLeft = nextPopupClosed ? 0 : 1
    if (extLeft + popupLeft === 0) {
      window.setTimeout(() => setPhase('result'), 1100)
    }
  }

  function removeExtension(ext) {
    if (wrongFeedback || removed.includes(ext.id)) return

    if (ext.safe) {
      setWrongFeedback({
        title: 'Removed a Trusted Security Tool',
        reason:
          'AdBlocker Pro is a verified extension from the Chrome Web Store. Removing it weakens your browser defenses — only remove unknown or suspicious add-ons.',
      })
      return
    }

    const next = [...removed, ext.id]
    setRemoved(next)
    setScore((s) => s + ext.xp)
    setFeedback({
      tone: 'ok',
      title: `Extension removed · +${ext.xp} XP`,
      detail: `${ext.label} was uninstalled from this browser.`,
    })
    checkWin(next, popupClosed)
  }

  function closePopup({ claim = false } = {}) {
    if (wrongFeedback || popupClosed) return

    if (claim) {
      const typed = claimEmail.trim()
      setWrongFeedback({
        title: 'You Engaged a Prize Scam',
        reason: typed
          ? `You entered “${typed}” into a fake prize form. “You won an iPhone” pop-ups are phishing bait — never submit your corporate email. Close the window instead.`
          : '“You won an iPhone” pop-ups are phishing bait. Closing the window is safe — claiming the prize can steal your corporate email and session.',
      })
      return
    }

    setPopupClosed(true)
    setClaimEmail('')
    setScore((s) => s + POPUP.xp)
    setFeedback({
      tone: 'ok',
      title: `Pop-up closed · +${POPUP.xp} XP`,
      detail: 'Unsolicited prize alerts should be closed — never enter work credentials.',
    })
    checkWin(removed, true)
  }

  function resetPlay() {
    setRemoved([])
    setPopupClosed(false)
    setClaimEmail('')
    setScore(0)
    setFeedback(null)
    setWrongFeedback(null)
    setExtPanelOpen(false)
    setManageOpen(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 5 · EXTENSIONS & MALVERTISING"
        lines={BRIEF}
        cta="OPEN BROWSER"
        alt="Extension & Pop-Up Cleaner"
        centerHero={['EXTENSION', 'POP-UP', 'CLEANER']}
        centerHeroTone="emerald"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="EXTENSION & POP-UP CLEANER" score={score} onExit={onExit} status="CLEAN">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">BROWSER HARDENED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Close unsolicited pop-ups and remove unknown extensions. Keep only tools from verified
              publishers with least-privilege permissions.
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
      title="EXTENSION & POP-UP CLEANER"
      score={score}
      onExit={onExit}
      status={`${remainingBad} LEFT`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4">
        {/* Chrome-like browser window */}
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-lg border border-[#dadce0] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          {/* Tab strip */}
          <div className="flex items-end gap-1 bg-[#dee1e6] px-2 pt-2">
            <div className="flex max-w-[220px] items-center gap-2 rounded-t-lg bg-white px-3 py-2 text-[12px] text-[#202124]">
              <Home className="size-3.5 shrink-0 text-[#5f6368]" />
              <span className="truncate font-medium">Contoso Intranet</span>
              <X className="ml-auto size-3.5 shrink-0 text-[#5f6368]" />
            </div>
            <div className="mb-1.5 ml-1 flex size-6 items-center justify-center rounded-full text-[#5f6368]">
              <span className="text-lg leading-none">+</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="relative flex items-center gap-1.5 border-b border-[#dadce0] bg-white px-2 py-1.5 sm:px-3">
            <button type="button" className="flex size-8 items-center justify-center rounded-full text-[#5f6368]" tabIndex={-1}>
              <ArrowLeft className="size-4" />
            </button>
            <button type="button" className="flex size-8 items-center justify-center rounded-full text-[#5f6368]/50" tabIndex={-1}>
              <ArrowRight className="size-4" />
            </button>
            <button type="button" className="flex size-8 items-center justify-center rounded-full text-[#5f6368]" tabIndex={-1}>
              <RotateCw className="size-3.5" />
            </button>

            <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f1f3f4] px-3 py-1.5">
              <Lock className="size-3.5 shrink-0 text-[#188038]" />
              <span className="truncate font-sans text-[13px] text-[#202124]">
                <span className="text-[#188038]">https://</span>
                intranet.contoso.com/dashboard
              </span>
            </div>

            {/* Extension icons in toolbar */}
            <div className="relative ml-1 flex items-center gap-0.5">
              {installedExts.map((ext) => {
                const Icon = ext.Icon
                return (
                  <button
                    key={ext.id}
                    type="button"
                    title={ext.label}
                    onClick={() => {
                      setExtPanelOpen(true)
                      setManageOpen(false)
                    }}
                    className={`flex size-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#f1f3f4] ${
                      ext.safe ? 'text-[#188038]' : 'text-[#5f6368]'
                    }`}
                  >
                    <Icon className="size-4" />
                  </button>
                )
              })}

              <button
                type="button"
                title="Extensions"
                onClick={() => {
                  setExtPanelOpen((o) => !o)
                  setManageOpen(false)
                }}
                className={`flex size-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#f1f3f4] ${
                  extPanelOpen ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-[#5f6368]'
                }`}
              >
                <Puzzle className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full text-[#5f6368]"
                tabIndex={-1}
              >
                <MoreVertical className="size-4" />
              </button>

              {/* Extensions dropdown — Chrome style */}
              <AnimatePresence>
                {extPanelOpen && !manageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full z-40 mt-1 w-[min(92vw,320px)] overflow-hidden rounded-xl border border-[#dadce0] bg-white shadow-[0_8px_28px_rgba(60,64,67,0.28)]"
                  >
                    <div className="border-b border-[#dadce0] px-4 py-3">
                      <p className="text-sm font-medium text-[#202124]">Extensions</p>
                      <p className="mt-0.5 text-xs text-[#5f6368]">
                        Remove anything you did not install on purpose
                      </p>
                    </div>
                    <ul className="max-h-[280px] overflow-y-auto py-1">
                      {installedExts.map((ext) => {
                        const Icon = ext.Icon
                        return (
                          <li
                            key={ext.id}
                            className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#f8f9fa]"
                          >
                            <div
                              className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                ext.safe ? 'bg-[#e6f4ea] text-[#188038]' : 'bg-[#f1f3f4] text-[#5f6368]'
                              }`}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-medium text-[#202124]">{ext.label}</p>
                                {ext.safe && (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-medium text-[#137333]">
                                    <CheckCircle2 className="size-2.5" /> Verified
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#5f6368]">
                                {ext.detail}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeExtension(ext)}
                                className={`mt-1.5 cursor-pointer text-xs font-medium ${
                                  ext.safe
                                    ? 'text-[#5f6368] hover:text-[#d93025]'
                                    : 'text-[#d93025] hover:underline'
                                }`}
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setManageOpen(true)}
                      className="flex w-full cursor-pointer items-center border-t border-[#dadce0] px-4 py-3 text-left text-sm text-[#1a73e8] hover:bg-[#f8f9fa]"
                    >
                      Manage extensions
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Page content */}
          <div className="relative min-h-0 flex-1 overflow-auto bg-[#f8f9fa]">
            {manageOpen ? (
              <ExtensionsManagePage
                extensions={installedExts}
                onRemove={removeExtension}
                onBack={() => setManageOpen(false)}
              />
            ) : (
              <>
                <IntranetPage />

                {/* Realistic prize scam pop-up */}
                <AnimatePresence>
                  {!popupClosed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-4"
                    >
                      <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                      >
                        <button
                          type="button"
                          aria-label="Close pop-up"
                          onClick={() => closePopup()}
                          className="absolute right-2 top-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
                        >
                          <X className="size-5" />
                        </button>

                        <div className="bg-gradient-to-br from-[#fbbc04] via-[#ea4335] to-[#c5221f] px-6 pb-8 pt-10 text-center text-white">
                          <Gift className="mx-auto size-12 drop-shadow" />
                          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] opacity-90">
                            Congratulations!
                          </p>
                          <h3 className="mt-1 text-2xl font-bold leading-tight">You Won an iPhone!</h3>
                          <p className="mt-2 text-sm text-white/90">
                            Contoso employee #48291 — claim your prize before it expires.
                          </p>
                        </div>

                        <form
                          className="space-y-3 px-5 py-5"
                          onSubmit={(e) => {
                            e.preventDefault()
                            closePopup({ claim: true })
                          }}
                        >
                          <label
                            htmlFor="prize-claim-email"
                            className="block text-center text-xs text-[#5f6368]"
                          >
                            Enter your corporate email to verify and claim.
                          </label>
                          <input
                            id="prize-claim-email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={claimEmail}
                            onChange={(e) => setClaimEmail(e.target.value)}
                            placeholder="name@contoso.com"
                            className="w-full rounded border border-[#dadce0] bg-white px-3 py-2.5 text-sm text-[#202124] outline-none placeholder:text-[#80868b] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                          />
                          <button
                            type="submit"
                            className="w-full cursor-pointer rounded bg-[#1a73e8] py-2.5 text-sm font-medium text-white hover:bg-[#1765cc]"
                          >
                            Claim prize now
                          </button>
                          <button
                            type="button"
                            onClick={() => closePopup()}
                            className="w-full cursor-pointer py-1 text-center text-xs text-[#5f6368] hover:underline"
                          >
                            No thanks — close this window
                          </button>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Hint bar */}
          <div className="flex shrink-0 items-center gap-2 border-t border-[#dadce0] bg-white px-3 py-2 text-[11px] text-[#5f6368] sm:text-xs">
            <Puzzle className="size-3.5 shrink-0 text-[#1a73e8]" />
            <span>
              Close the pop-up with <span className="font-medium text-[#202124]">✕</span>, then open{' '}
              <span className="font-medium text-[#202124]">Extensions</span> and remove anything
              suspicious. Keep verified tools.
            </span>
            <span className="ml-auto shrink-0 font-medium text-[#202124]">
              {remainingBad} threat{remainingBad === 1 ? '' : 's'} left
            </span>
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
          onTryAgain={() => setWrongFeedback(null)}
        />
      )}
    </CyberHud>
  )
}

function IntranetPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded bg-[#0078d4] text-sm font-bold text-white">
          C
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5f6368]">
            Contoso Corporation
          </p>
          <h2 className="text-xl font-semibold text-[#202124] sm:text-2xl">Team Dashboard</h2>
        </div>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5f6368]">
        Good morning. Q3 security awareness training is due Friday. Please review your browser
        extensions and dismiss any unexpected pop-ups before continuing.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Open tickets', value: '12' },
          { label: 'Training due', value: 'Fri' },
          { label: 'Policy updates', value: '3' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-[#dadce0] bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-[#5f6368]">{card.label}</p>
            <p className="mt-1 text-lg font-semibold text-[#202124]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#dadce0] bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#202124]">Recent announcements</p>
        <ul className="mt-3 space-y-2 text-sm text-[#5f6368]">
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#1a73e8]" />
            IT: Do not install browser add-ons from email links.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#1a73e8]" />
            Security: Prize / gift pop-ups on intranet pages are never legitimate.
          </li>
        </ul>
      </div>
    </div>
  )
}

function ExtensionsManagePage({ extensions, onRemove, onBack }) {
  return (
    <div className="min-h-full bg-white px-4 py-6 sm:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 cursor-pointer text-sm text-[#1a73e8] hover:underline"
      >
        ← Back to dashboard
      </button>

      <div className="flex items-center gap-2 text-[#202124]">
        <Puzzle className="size-6 text-[#5f6368]" />
        <h2 className="text-2xl font-normal">Extensions</h2>
      </div>
      <p className="mt-1 text-sm text-[#5f6368]">
        chrome://extensions — review permissions and remove anything you do not trust.
      </p>

      <div className="mt-6 space-y-3">
        {extensions.map((ext) => {
          const Icon = ext.Icon
          return (
            <div
              key={ext.id}
              className="flex flex-col gap-3 rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-4 sm:flex-row sm:items-center"
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                  ext.safe ? 'bg-[#e6f4ea] text-[#188038]' : 'bg-white text-[#5f6368] ring-1 ring-[#dadce0]'
                }`}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-medium text-[#202124]">{ext.label}</p>
                  {ext.safe ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f4ea] px-2 py-0.5 text-[11px] font-medium text-[#137333]">
                      <Star className="size-3 fill-current" /> From Chrome Web Store
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fce8e6] px-2 py-0.5 text-[11px] font-medium text-[#c5221f]">
                      Unverified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#5f6368]">{ext.detail}</p>
                <p className="mt-1 text-[11px] text-[#80868b]">Version {ext.version}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[#e6f4ea] px-2.5 py-1 text-[11px] font-medium text-[#137333]">
                  On
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(ext)}
                  className="cursor-pointer rounded border border-[#dadce0] bg-white px-3 py-1.5 text-sm text-[#202124] hover:bg-[#f1f3f4]"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
