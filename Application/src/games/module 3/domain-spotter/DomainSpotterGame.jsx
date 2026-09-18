import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertTriangle,
  Globe2,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Unlock,
  ZoomIn,
} from 'lucide-react'
import splash from '../../../assets/games/account-hijack-simulator/splash.png'
import CyberSplash, { CyberHud } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'PHISHING INSPECTOR · URL HUNTER',
  'HTTPS alone never proves a site is safe.',
  '• Inspect the real root domain',
  '• Spot typosquatting & subdomain tricks',
  '• 15 seconds per URL · 6 scenarios',
  'Read the domain before you trust the lock.',
]

const TIMER_SEC = 15

const SECURITY_RULES = [
  {
    id: 'https',
    title: 'HTTPS Lock',
    detail: 'Encrypts data in transit — but attackers can get HTTPS certificates too.',
  },
  {
    id: 'typo',
    title: 'Typosquatting',
    detail: 'Watch sneaky swaps: micros0ft.com, paypaI.com (capital I vs l).',
  },
  {
    id: 'sub',
    title: 'Subdomain Trickery',
    detail: 'The label right before .com / .org / .net owns the site — not the fancy prefix.',
  },
]

/** @type {Array<{
 *  id: number
 *  url: string
 *  displayUrl: string
 *  isPhishing: boolean
 *  type: string
 *  explanation: string
 *  brand: string
 *  previewTitle: string
 *  previewHint: string
 * }>} */
const SCENARIOS = [
  {
    id: 1,
    url: 'https://paypaI.com/signin',
    displayUrl: 'https://paypaI.com/signin',
    isPhishing: true,
    type: 'Typosquatting',
    explanation:
      "Look closely at the capital 'I' replacing the lowercase 'l'. Official domain is paypal.com.",
    brand: 'PayPal',
    previewTitle: 'PayPal — Sign in',
    previewHint: 'Secure checkout · Account login',
  },
  {
    id: 2,
    url: 'https://login.microsoft.com.security-update.net/auth',
    displayUrl: 'https://login.microsoft.com.security-update.net/auth',
    isPhishing: true,
    type: 'Subdomain Trick',
    explanation:
      "The domain right before .net is 'security-update.net', NOT Microsoft. Microsoft is just a subdomain bait!",
    brand: 'Microsoft',
    previewTitle: 'Microsoft Account',
    previewHint: 'Security update required',
  },
  {
    id: 3,
    url: 'https://accounts.google.com/ServiceLogin',
    displayUrl: 'https://accounts.google.com/ServiceLogin',
    isPhishing: false,
    type: 'Legitimate',
    explanation: "This is legitimate! The root domain directly before .com is 'google'.",
    brand: 'Google',
    previewTitle: 'Sign in – Google Accounts',
    previewHint: 'accounts.google.com',
  },
  {
    id: 4,
    url: 'https://secure-login.micros0ft.com',
    displayUrl: 'https://secure-login.micros0ft.com',
    isPhishing: true,
    type: 'Typosquatting',
    explanation: "Notice the number '0' replacing the letter 'o' in micros0ft.",
    brand: 'Microsoft',
    previewTitle: 'Microsoft Secure Login',
    previewHint: 'Verify your identity',
  },
  {
    id: 5,
    url: 'https://www.your-bank-verify-account.xyz',
    displayUrl: 'https://www.your-bank-verify-account.xyz',
    isPhishing: true,
    type: 'Fake Lock / HTTPS Trap',
    explanation:
      'Even though this site uses HTTPS (padlock), the domain is suspicious (.xyz) and not your official bank.',
    brand: 'Your Bank',
    previewTitle: 'Verify Your Bank Account',
    previewHint: 'Urgent: confirm within 24 hours',
  },
  {
    id: 6,
    url: 'https://www.apple.com/shop',
    displayUrl: 'https://www.apple.com/shop',
    isPhishing: false,
    type: 'Legitimate',
    explanation: "Legitimate Apple storefront. Root domain before .com is 'apple'.",
    brand: 'Apple',
    previewTitle: 'Apple Store Online',
    previewHint: 'Shop Mac, iPhone, and more',
  },
]

const MULTI_PART_TLDS = new Set(['co.uk', 'com.au', 'co.jp', 'com.br', 'co.in', 'com.pk'])

function getRootDomain(hostname) {
  const host = hostname.replace(/^www\./i, '')
  const labels = host.split('.').filter(Boolean)
  if (labels.length <= 2) return host
  const lastTwoLower = labels.slice(-2).join('.').toLowerCase()
  if (MULTI_PART_TLDS.has(lastTwoLower) && labels.length >= 3) {
    return labels.slice(-3).join('.')
  }
  return labels.slice(-2).join('.')
}

function parseUrl(raw) {
  // Prefer raw display string so typosquat casing (paypaI) survives —
  // URL.hostname always lowercases.
  const match = String(raw).match(/^(https?):\/\/([^/?#]+)([^?#]*)?(\?[^#]*)?(#.*)?$/i)
  if (match) {
    const protocol = match[1].toLowerCase()
    const host = match[2]
    const path = `${match[3] || ''}${match[4] || ''}`
    const root = getRootDomain(host)
    return {
      protocol,
      host,
      path: path === '/' ? '' : path,
      root,
      isHttps: protocol === 'https',
    }
  }
  try {
    const u = new URL(raw)
    const host = u.hostname
    const root = getRootDomain(host)
    return {
      protocol: u.protocol.replace(':', ''),
      host,
      path: `${u.pathname}${u.search}` === '/' ? '' : `${u.pathname}${u.search}`,
      root,
      isHttps: u.protocol === 'https:',
    }
  } catch {
    return { protocol: '', host: raw, path: '', root: raw, isHttps: false }
  }
}

/** Split host so we can highlight the registrable root domain (case-insensitive match). */
function splitHostForHighlight(host, root) {
  const lowerHost = host.toLowerCase()
  const lowerRoot = root.toLowerCase()
  const idx = lowerHost.lastIndexOf(lowerRoot)
  if (idx < 0) return { before: host, root: '', after: '' }
  return {
    before: host.slice(0, idx),
    root: host.slice(idx, idx + root.length),
    after: host.slice(idx + root.length),
  }
}

function charLabel(ch) {
  if (ch === 'I') return 'Capital I (not lowercase L)'
  if (ch === 'l') return 'Lowercase L'
  if (ch === '0') return 'Digit zero (not letter O)'
  if (ch === 'O') return 'Capital O'
  if (ch === 'o') return 'Lowercase O'
  if (ch === '.') return 'Dot separator'
  if (ch === '-') return 'Hyphen'
  if (ch === '/') return 'Path slash'
  if (ch === ':') return 'Colon'
  return `Character “${ch}”`
}

function UrlCharacterBar({ displayUrl, inspectOn, rootDomain, zoomedIndex, onZoom }) {
  const parts = parseUrl(displayUrl)
  const hostSplit = splitHostForHighlight(parts.host, rootDomain)
  const protocol = `${parts.protocol}://`

  const segments = [
    { key: 'proto', text: protocol, kind: 'proto' },
    { key: 'before', text: hostSplit.before, kind: 'host' },
    { key: 'root', text: hostSplit.root, kind: 'root' },
    { key: 'after', text: hostSplit.after, kind: 'host' },
    { key: 'path', text: parts.path, kind: 'path' },
  ]

  let globalIndex = 0
  const chars = []
  for (const seg of segments) {
    for (const ch of seg.text) {
      chars.push({ ch, kind: seg.kind, index: globalIndex })
      globalIndex += 1
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-y-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed break-all text-slate-800 sm:text-[15px]"
        onMouseLeave={() => onZoom(null)}
      >
        {chars.map((item) => {
          const isRoot = item.kind === 'root'
          const highlighted = inspectOn && isRoot
          const isZoomed = zoomedIndex === item.index
          return (
            <button
              key={item.index}
              type="button"
              onMouseEnter={() => onZoom(item.index)}
              onFocus={() => onZoom(item.index)}
              onClick={() => onZoom(item.index)}
              className={`cursor-pointer rounded-sm px-[0.5px] transition ${
                highlighted
                  ? 'bg-amber-300/90 font-bold text-slate-950 ring-2 ring-amber-400'
                  : item.kind === 'proto'
                    ? parts.isHttps
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                    : item.kind === 'path'
                      ? 'text-slate-500'
                      : 'text-[#1a73e8]'
              } ${isZoomed ? 'scale-125 bg-cyan-200/80 text-slate-950' : 'hover:bg-slate-100'}`}
              aria-label={charLabel(item.ch)}
            >
              {item.ch === ' ' ? '\u00a0' : item.ch}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {zoomedIndex != null && chars[zoomedIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute -bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-cyan-400/40 bg-slate-950 px-4 py-2 shadow-xl"
          >
            <ZoomIn className="size-4 text-cyan-300" />
            <span className="font-mono text-4xl font-bold text-white">
              {chars[zoomedIndex].ch}
            </span>
            <span className="max-w-[10rem] text-left text-[11px] leading-snug text-slate-300">
              {charLabel(chars[zoomedIndex].ch)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BrowserPreview({ scenario, parts }) {
  const accent =
    scenario.brand === 'Google'
      ? 'from-blue-500 to-emerald-400'
      : scenario.brand === 'Apple'
        ? 'from-slate-600 to-slate-800'
        : scenario.brand === 'PayPal'
          ? 'from-sky-500 to-blue-700'
          : scenario.brand === 'Microsoft'
            ? 'from-sky-400 to-indigo-600'
            : 'from-amber-500 to-rose-600'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-200/80 px-3 py-2">
        <span className="size-2.5 rounded-full bg-rose-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 truncate font-mono text-[10px] text-slate-500">
          {scenario.brand} preview
        </span>
      </div>
      <div className={`relative h-28 bg-gradient-to-br ${accent} sm:h-32`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-1 px-4 text-center text-white">
          <Globe2 className="size-7 opacity-90" />
          <p className="font-game text-sm tracking-wide drop-shadow">{scenario.previewTitle}</p>
          <p className="text-[11px] text-white/80">{scenario.previewHint}</p>
        </div>
        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-md bg-black/35 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
          {parts.isHttps ? (
            <>
              <Lock className="size-3 text-emerald-300" />
              HTTPS
            </>
          ) : (
            <>
              <Unlock className="size-3 text-rose-300" />
              HTTP
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LearningModal({ result, scenario, parts, onContinue, onTryAgain }) {
  const ok = result === 'correct'
  const timedOut = result === 'timeout'
  const activeRule =
    scenario.type === 'Typosquatting'
      ? 'typo'
      : scenario.type === 'Subdomain Trick'
        ? 'sub'
        : scenario.type.includes('HTTPS') || scenario.type.includes('Fake Lock')
          ? 'https'
          : scenario.isPhishing
            ? 'sub'
            : 'https'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        className={`relative w-full max-w-lg overflow-hidden rounded-2xl border p-5 shadow-2xl sm:p-6 ${
          ok
            ? 'border-emerald-400/40 bg-slate-950'
            : 'border-rose-400/40 bg-slate-950'
        }`}
      >
        <div className="flex items-start gap-3">
          {ok ? (
            <ShieldCheck className="size-10 shrink-0 text-emerald-300" />
          ) : (
            <ShieldAlert className="size-10 shrink-0 text-rose-300" />
          )}
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-slate-400 uppercase">
              Feedback · {scenario.type}
            </p>
            <h3 className={`font-game text-2xl ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>
              {timedOut
                ? 'Time Expired'
                : ok
                  ? 'Correct Call'
                  : scenario.isPhishing
                    ? 'That Was Phishing'
                    : 'That Domain Was Legitimate'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{scenario.explanation}</p>
            <p className="mt-2 font-mono text-xs text-cyan-300/90">
              Root domain: <span className="font-bold text-amber-300">{parts.root}</span>
              {' · '}
              {parts.isHttps ? 'HTTPS present' : 'No HTTPS'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase">
            3 security rules
          </p>
          {SECURITY_RULES.map((rule) => {
            const focus = rule.id === activeRule
            return (
              <div
                key={rule.id}
                className={`rounded-xl border px-3 py-2.5 ${
                  focus
                    ? 'border-cyan-400/50 bg-cyan-500/10'
                    : 'border-slate-700/80 bg-slate-900/60'
                }`}
              >
                <p className={`text-sm font-semibold ${focus ? 'text-cyan-200' : 'text-slate-300'}`}>
                  {rule.title}
                  {focus ? ' · focus' : ''}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{rule.detail}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {!ok && onTryAgain && (
            <button
              type="button"
              onClick={onTryAgain}
              className="min-h-11 cursor-pointer rounded-xl border border-slate-500 px-4 font-game text-sm text-slate-200 transition hover:border-slate-300"
            >
              Try again
            </button>
          )}
          <button
            type="button"
            onClick={onContinue}
            className="min-h-11 cursor-pointer rounded-xl bg-cyan-400 px-5 font-game text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            {ok ? 'Next URL' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DomainSpotterGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [misses, setMisses] = useState(0)
  const [left, setLeft] = useState(TIMER_SEC)
  const [busy, setBusy] = useState(false)
  const [inspectOn, setInspectOn] = useState(false)
  const [zoomedIndex, setZoomedIndex] = useState(null)
  const [learning, setLearning] = useState(null)
  const [shake, setShake] = useState(false)
  const [timerKey, setTimerKey] = useState(0)

  const scenario = SCENARIOS[index]
  const parts = useMemo(() => (scenario ? parseUrl(scenario.url) : null), [scenario])

  useEffect(() => {
    if (phase !== 'play' || busy || learning || !scenario) return undefined
    setLeft(TIMER_SEC)
    setInspectOn(false)
    setZoomedIndex(null)
    const tick = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [phase, index, busy, learning, scenario, timerKey])

  useEffect(() => {
    if (phase !== 'play' || busy || learning || left > 0 || !scenario || !parts) {
      return undefined
    }
    setBusy(true)
    setMisses((m) => m + 1)
    setShake(true)
    setLearning({ result: 'timeout' })
    return undefined
  }, [left, phase, busy, learning, scenario, parts])

  function resetRoundLocal() {
    setShake(false)
    setBusy(false)
    setLearning(null)
    setInspectOn(false)
    setZoomedIndex(null)
    setLeft(TIMER_SEC)
    setTimerKey((k) => k + 1)
  }

  function advance() {
    resetRoundLocal()
    if (index >= SCENARIOS.length - 1) {
      setPhase('result')
      return
    }
    setIndex((i) => i + 1)
  }

  function handleTryAgain() {
    resetRoundLocal()
  }

  function choose(markAsPhishing) {
    if (busy || learning || !scenario || !parts) return
    setBusy(true)
    const saidPhishing = markAsPhishing
    const ok = saidPhishing === scenario.isPhishing

    if (ok) {
      const bonus = Math.max(25, left * 8)
      setScore((s) => s + bonus)
      setCorrect((c) => c + 1)
      setLearning({ result: 'correct', bonus })
      return
    }

    setMisses((m) => m + 1)
    setShake(true)
    setLearning({ result: 'wrong' })
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · URLS & HTTPS"
        lines={BRIEF}
        cta="START URL HUNT"
        alt="Phishing Inspector URL Hunter"
        centerHero={['URL', 'HUNTER']}
        centerHeroTone="cyan"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    const passed = correct >= 4
    return (
      <CyberHud title="URL HUNTER" score={score} onExit={onExit} status="COMPLETE">
        <div className="flex flex-1 items-center justify-center p-4">
          <div
            className={`game-pop w-full max-w-lg rounded-2xl border p-6 text-center ${
              passed
                ? 'border-emerald-400/40 bg-slate-950/90'
                : 'border-amber-400/40 bg-slate-950/90'
            }`}
          >
            {passed ? (
              <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            ) : (
              <ShieldAlert className="mx-auto size-12 text-amber-300" />
            )}
            <h2
              className={`mt-3 font-game text-2xl font-bold ${
                passed ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {passed ? 'URL SENSE CALIBRATED' : 'KEEP TRAINING'}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Always read the root domain before the TLD. HTTPS locks encrypt traffic — they do not
              prove identity. Typos and fake subdomains are classic bait.
            </p>
            <p className="mt-4 font-mono text-emerald-300">
              {score} XP · {correct}/{SCENARIOS.length} correct · {misses} misses
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setIndex(0)
                  setScore(0)
                  setCorrect(0)
                  setMisses(0)
                  resetRoundLocal()
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

  const timerPct = (left / TIMER_SEC) * 100

  return (
    <CyberHud
      title="URL HUNTER"
      score={score}
      onExit={onExit}
      status={`URL ${index + 1}/${SCENARIOS.length}`}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-3 sm:p-4">
        <div className="flex w-full max-w-2xl items-center gap-3">
          <Timer className={`size-5 ${left <= 5 ? 'text-rose-400' : 'text-cyan-300'}`} />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className={`h-full ${left <= 5 ? 'bg-rose-500' : 'bg-cyan-400'}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="w-10 text-right font-mono text-sm text-slate-200">{left}s</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: shake ? [0, -8, 8, -6, 6, 0] : 0,
            }}
            exit={{ opacity: 0, y: -14 }}
            className="w-full max-w-2xl rounded-2xl border border-slate-300 bg-[#f0f2f5] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:p-4"
          >
            {/* Simulated browser chrome */}
            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  {parts.isHttps ? (
                    <Lock className="size-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <Unlock className="size-3.5 shrink-0 text-rose-500" />
                  )}
                  <span className="truncate font-mono text-[11px] text-slate-600 sm:text-xs">
                    {scenario.displayUrl}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 p-3 sm:grid-cols-[1fr_11rem] sm:p-4">
                <div className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                      Address inspection
                    </p>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                      {scenario.type}
                    </span>
                  </div>

                  <UrlCharacterBar
                    displayUrl={scenario.displayUrl}
                    inspectOn={inspectOn}
                    rootDomain={parts.root}
                    zoomedIndex={zoomedIndex}
                    onZoom={setZoomedIndex}
                  />

                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ZoomIn className="size-3.5" />
                    Hover or tap characters to zoom — catch I vs l and 0 vs O.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busy || Boolean(learning)}
                      onClick={() => setInspectOn((v) => !v)}
                      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 font-game text-xs tracking-wide transition disabled:opacity-50 ${
                        inspectOn
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500'
                          : 'border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Search className="size-3.5" />
                      {inspectOn ? 'Root domain highlighted' : 'Inspect Domain'}
                    </button>
                    {inspectOn && (
                      <span className="inline-flex items-center rounded-lg bg-amber-100 px-2.5 font-mono text-xs font-semibold text-amber-900">
                        Root: {parts.root}
                      </span>
                    )}
                  </div>
                </div>

                <BrowserPreview scenario={scenario} parts={parts} />
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              Mark the URL before the timer hits zero. HTTPS ≠ safe.
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy || Boolean(learning)}
            onClick={() => choose(false)}
            className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-4 font-game text-sm tracking-wide text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50"
          >
            <ShieldCheck className="size-5" />
            Mark as Legitimate
          </button>
          <button
            type="button"
            disabled={busy || Boolean(learning)}
            onClick={() => choose(true)}
            className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-4 font-game text-sm tracking-wide text-rose-200 transition hover:bg-rose-500/25 disabled:opacity-50"
          >
            <AlertTriangle className="size-5" />
            Flag as Phishing
          </button>
        </div>
      </div>

      <AnimatePresence>
        {learning && scenario && parts && (
          <LearningModal
            result={learning.result}
            scenario={scenario}
            parts={parts}
            onContinue={advance}
            onTryAgain={learning.result !== 'correct' ? handleTryAgain : undefined}
          />
        )}
      </AnimatePresence>
    </CyberHud>
  )
}
