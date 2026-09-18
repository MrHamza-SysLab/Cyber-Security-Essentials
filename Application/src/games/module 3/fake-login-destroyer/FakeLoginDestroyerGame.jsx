import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Unlock,
  XCircle,
} from 'lucide-react'
import splash from '../../../assets/games/fake-login-destroyer/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'FAKE LOGIN PAGE',
  'Lookalike portals steal passwords.',
  '• Compare two login pages each round',
  '• Pick the SAFE website only',
  '• Check HTTPS · lock · domain spelling',
  'Never type credentials on doubt.',
]

const SCENARIOS = [
  {
    id: 'bank',
    title: 'Bank Login',
    difficulty: 'BASIC',
    explanation:
      'Always check HTTPS and the padlock. HTTP is unencrypted — never enter bank credentials on a Not Secure page.',
    options: [
      {
        id: 'bank-safe',
        isSafe: true,
        url: 'https://secure.mybank.com/login',
        isHttps: true,
        brand: 'mybank',
        cues: ['HTTPS protocol', 'Green lock icon', 'secure.mybank.com'],
      },
      {
        id: 'bank-phish',
        isSafe: false,
        url: 'http://mybank.com/login',
        isHttps: false,
        brand: 'mybank',
        cues: ['Missing HTTPS (HTTP)', 'No lock — Not Secure', 'Easy to intercept passwords'],
      },
    ],
  },
  {
    id: 'microsoft',
    title: 'Microsoft 365',
    difficulty: 'BASIC',
    explanation:
      'micros0ft-login.com uses a zero instead of “o”. Real Microsoft sign-in is on login.microsoftonline.com with HTTPS.',
    options: [
      {
        id: 'ms-phish',
        isSafe: false,
        url: 'http://micros0ft-login.com/oauth',
        isHttps: false,
        brand: 'microsoft',
        cues: ['Typosquat domain (0 for o)', 'HTTP — Not Secure', 'Not microsoftonline.com'],
      },
      {
        id: 'ms-safe',
        isSafe: true,
        url: 'https://login.microsoftonline.com',
        isHttps: true,
        brand: 'microsoft',
        cues: ['Official microsoftonline.com', 'HTTPS + lock', 'Real Microsoft 365 host'],
      },
    ],
  },
  {
    id: 'paypal',
    title: 'PayPal Sign-In',
    difficulty: 'INTERMEDIATE',
    explanation:
      'paypal-support.biz is not PayPal. Official login is always paypal.com — ignore lookalike TLDs like .biz.',
    options: [
      {
        id: 'pp-safe',
        isSafe: true,
        url: 'https://www.paypal.com/signin',
        isHttps: true,
        brand: 'paypal',
        cues: ['Official paypal.com', 'HTTPS enabled', 'Familiar PayPal layout'],
      },
      {
        id: 'pp-phish',
        isSafe: false,
        url: 'https://paypal-support.biz/login',
        isHttps: true,
        brand: 'paypal',
        cues: ['Suspicious .biz domain', 'Hyphenated “support” bait', 'Not paypal.com'],
      },
    ],
  },
  {
    id: 'google',
    title: 'Google Account',
    difficulty: 'ADVANCED',
    explanation:
      'Even with HTTPS and a lock, google-security-alert.net is phishing. Real Google accounts live on accounts.google.com.',
    options: [
      {
        id: 'g-phish',
        isSafe: false,
        url: 'https://google-security-alert.net/verify',
        isHttps: true,
        brand: 'google',
        cues: ['Fake .net domain', '“Security alert” urgency bait', 'Not accounts.google.com'],
      },
      {
        id: 'g-safe',
        isSafe: true,
        url: 'https://accounts.google.com',
        isHttps: true,
        brand: 'google',
        cues: ['Official accounts.google.com', 'HTTPS + lock', 'Correct Google branding'],
      },
    ],
  },
]

function MicrosoftLogo() {
  return (
    <div className="mb-5 flex items-center gap-2" aria-hidden>
      <svg width="108" height="24" viewBox="0 0 108 24">
        <rect x="0" y="0" width="11" height="11" fill="#F25022" />
        <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
        <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
        <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
        <text x="30" y="17" fontSize="14" fontFamily="Segoe UI, Arial, sans-serif" fill="#737373">
          Microsoft
        </text>
      </svg>
    </div>
  )
}

function GoogleLogo() {
  return (
    <div className="mb-4 flex justify-center" aria-hidden>
      <svg width="74" height="24" viewBox="0 0 74 24">
        <text x="0" y="19" fontSize="22" fontFamily="Product Sans, Arial, sans-serif" fontWeight="500">
          <tspan fill="#4285F4">G</tspan>
          <tspan fill="#EA4335">o</tspan>
          <tspan fill="#FBBC05">o</tspan>
          <tspan fill="#4285F4">g</tspan>
          <tspan fill="#34A853">l</tspan>
          <tspan fill="#EA4335">e</tspan>
        </text>
      </svg>
    </div>
  )
}

function LoginPageContent({ brand }) {
  if (brand === 'microsoft') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-[#f3f2f1] px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <MicrosoftLogo />
          <h3 className="text-[24px] font-semibold tracking-tight text-[#1b1b1b]">Sign in</h3>
          <p className="mt-1 text-sm text-[#616161]">to continue to Microsoft 365</p>
          <div className="mt-6 border-b border-[#8a8886] py-2.5 text-sm text-[#605e5c]">
            Email, phone, or Skype
          </div>
          <div className="mt-5 border-b border-[#8a8886] py-2.5 text-sm text-[#605e5c]">Password</div>
          <div className="mt-8 rounded-sm bg-[#0067b8] py-3 text-center text-sm font-semibold text-white">
            Sign in
          </div>
          <p className="mt-4 text-center text-xs text-[#0067b8]">Can&apos;t access your account?</p>
        </div>
      </div>
    )
  }

  if (brand === 'paypal') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-[#f5f7fa] px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="text-3xl font-bold tracking-tight">
              <span className="text-[#003087]">Pay</span>
              <span className="text-[#009cde]">Pal</span>
            </span>
          </div>
          <h3 className="text-center text-xl font-semibold text-[#2c2e2f]">Log in to your account</h3>
          <div className="mt-5 rounded border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-400">
            Email or mobile number
          </div>
          <div className="mt-3 rounded border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-400">
            Password
          </div>
          <div className="mt-6 rounded-full bg-[#0070ba] py-3 text-center text-sm font-bold text-white">
            Log In
          </div>
          <p className="mt-4 text-center text-xs text-[#0070ba]">Having trouble logging in?</p>
        </div>
      </div>
    )
  }

  if (brand === 'google') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-white px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm rounded-2xl border border-[#dadce0] p-8 shadow-sm">
          <GoogleLogo />
          <h3 className="text-center text-2xl font-normal text-[#202124]">Sign in</h3>
          <p className="mt-1 text-center text-sm text-[#202124]">Use your Google Account</p>
          <div className="mt-8 rounded border border-[#dadce0] px-3 py-3.5 text-sm text-[#5f6368]">
            Email or phone
          </div>
          <p className="mt-3 text-sm text-[#1a73e8]">Forgot email?</p>
          <div className="mt-10 flex items-center justify-between">
            <span className="text-sm font-medium text-[#1a73e8]">Create account</span>
            <span className="rounded bg-[#1a73e8] px-7 py-2.5 text-sm font-medium text-white">Next</span>
          </div>
        </div>
      </div>
    )
  }

  // mybank — realistic banking portal
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-gradient-to-b from-[#0a2540] to-[#163a5f]">
      <div className="flex shrink-0 items-center gap-2 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded bg-[#1e90ff] text-base font-bold text-white">
          M
        </div>
        <span className="text-base font-semibold tracking-wide text-white">MyBank</span>
        <span className="ml-auto text-xs uppercase tracking-wider text-sky-200/70">Online Banking</span>
      </div>
      <div className="mx-4 mb-4 flex flex-1 flex-col justify-center rounded-lg bg-white p-6 shadow-lg sm:mx-8 sm:p-8">
        <h3 className="text-xl font-bold text-[#0a2540] sm:text-2xl">Welcome Back</h3>
        <p className="mt-1 text-sm text-slate-500">Enter your credentials to access your account.</p>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Username
        </label>
        <div className="mt-1.5 h-11 rounded border border-slate-200 bg-slate-50" />
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Password
        </label>
        <div className="mt-1.5 h-11 rounded border border-slate-200 bg-slate-50" />
        <div className="mt-6 rounded bg-[#1e90ff] py-3 text-center text-sm font-semibold text-white">
          Sign In
        </div>
        <p className="mt-4 text-center text-xs text-[#1e90ff]">Forgot username or password?</p>
      </div>
    </div>
  )
}

function BrowserPane({ option, selected, result, onClick, disabled }) {
  const showOk = result && selected && option.isSafe
  const showBad = result && selected && !option.isSafe
  const showMissed = result && !selected && option.isSafe

  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.998 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-full min-h-0 w-full cursor-pointer flex-col overflow-hidden bg-white text-left transition ${
        showOk
          ? 'ring-4 ring-inset ring-emerald-500'
          : showBad
            ? 'ring-4 ring-inset ring-rose-500'
            : showMissed
              ? 'ring-2 ring-inset ring-emerald-400/70'
              : 'hover:ring-2 hover:ring-inset hover:ring-cyan-400/80'
      } ${disabled && !result ? 'cursor-default' : ''}`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
          {option.isHttps ? (
            <Lock className="size-3.5 shrink-0 text-emerald-600" />
          ) : (
            <Unlock className="size-3.5 shrink-0 text-rose-500" />
          )}
          <span className="truncate font-mono text-[11px] text-slate-600 sm:text-xs">
            <span className={option.isHttps ? 'text-emerald-700' : 'text-rose-600'}>
              {option.isHttps ? 'https://' : 'http://'}
            </span>
            {option.url.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>

      <LoginPageContent brand={option.brand} />

      <AnimatePresence>
        {result && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] ${
              option.isSafe ? 'bg-emerald-500/20' : 'bg-rose-500/25'
            }`}
          >
            <div
              className={`flex flex-col items-center gap-1 rounded-2xl px-5 py-4 ${
                option.isSafe ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {option.isSafe ? <CheckCircle2 className="size-10" /> : <XCircle className="size-10" />}
              <span className="font-game text-sm tracking-wider">
                {option.isSafe ? 'SAFE SITE' : 'PHISHING!'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function FakeLoginDestroyerGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const scenario = SCENARIOS[index]
  const decided = selectedId != null

  function pick(option) {
    if (decided || wrongFeedback || phase !== 'play') return

    setSelectedId(option.id)

    if (option.isSafe) {
      const gained = 25
      setScore((s) => s + gained)
      setCorrectCount((c) => c + 1)
      setFeedback({
        tone: 'ok',
        title: `Safe site · +${gained} XP`,
        detail: scenario.explanation,
      })
      window.setTimeout(() => setShowBreakdown(true), 900)
    } else {
      window.setTimeout(() => {
        setWrongFeedback({
          title: 'You Chose a Fake Login Page',
          reason: scenario.explanation,
        })
      }, 700)
    }
  }

  function afterWrongTryAgain() {
    setWrongFeedback(null)
    setSelectedId(null)
    setFeedback(null)
    setShowBreakdown(false)
  }

  function nextRound() {
    setSelectedId(null)
    setFeedback(null)
    setShowBreakdown(false)
    if (index >= SCENARIOS.length - 1) {
      setPhase('result')
      return
    }
    setIndex((i) => i + 1)
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 4 · FAKE LOGIN PAGES"
        lines={BRIEF}
        cta="OPEN PORTAL"
        alt="Fake Login Page"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="FAKE LOGIN PAGE" score={score} onExit={onExit} status="AUDIT COMPLETE">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">LOGIN PAGES CLEARED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You spotted {correctCount}/{SCENARIOS.length} safe portals. Always verify HTTPS, the lock,
              and the real domain before signing in.
            </p>
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setIndex(0)
                  setScore(0)
                  setCorrectCount(0)
                  setSelectedId(null)
                  setFeedback(null)
                  setShowBreakdown(false)
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

  const difficultyColor =
    scenario.difficulty === 'BASIC'
      ? 'bg-emerald-500/20 text-emerald-300'
      : scenario.difficulty === 'INTERMEDIATE'
        ? 'bg-amber-500/20 text-amber-300'
        : 'bg-rose-500/20 text-rose-300'

  return (
    <CyberHud
      title="FAKE LOGIN PAGE"
      score={score}
      onExit={onExit}
      status={`${index + 1}/${SCENARIOS.length}`}
      maxScore={SCENARIOS.length * 25}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-cyan-400/20 bg-slate-950/80 px-3 py-2 sm:px-5">
          <div className="min-w-0">
            <h2 className="font-game text-sm font-bold text-white sm:text-base">{scenario.title}</h2>
            <p className="text-xs text-slate-400">
              Select the <span className="font-semibold text-emerald-400">safe</span> website
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${difficultyColor}`}>
              {scenario.difficulty}
            </span>
            <div className="flex gap-1.5">
              {SCENARIOS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-6 bg-cyan-400' : i < index ? 'w-1.5 bg-emerald-400' : 'w-1.5 bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
          {scenario.options.map((option) => (
            <div key={option.id} className="min-h-0 border-b border-slate-700 last:border-b-0 md:border-b-0 md:border-r md:border-slate-700 md:last:border-r-0">
              <BrowserPane
                option={option}
                selected={selectedId === option.id}
                result={decided}
                disabled={decided || !!wrongFeedback}
                onClick={() => pick(option)}
              />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-slate-950 p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-8 text-emerald-400" />
                <div>
                  <h3 className="font-game text-lg text-emerald-300">Excellent spot!</h3>
                  <p className="text-sm text-slate-400">You picked the secure login page.</p>
                </div>
              </div>
              <p className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-sm leading-relaxed text-slate-300">
                {scenario.explanation}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {scenario.options.map((opt) => (
                  <div key={opt.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                    <p
                      className={`mb-2 font-mono text-[10px] tracking-wider ${
                        opt.isSafe ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {opt.isSafe ? 'SAFE SITE' : 'PHISHING SITE'}
                    </p>
                    <ul className="space-y-1">
                      {opt.cues.map((cue) => (
                        <li key={cue} className="flex items-start gap-1.5 text-xs text-slate-400">
                          <span
                            className={`mt-1.5 size-1 shrink-0 rounded-full ${
                              opt.isSafe ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={nextRound}
                className="mt-5 w-full cursor-pointer rounded-xl bg-cyan-400 py-3 font-game text-sm font-bold text-slate-950 hover:bg-cyan-300"
              >
                {index < SCENARIOS.length - 1 ? 'Next challenge' : 'See results'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && !wrongFeedback && !showBreakdown && (
        <FeedbackToast
          tone={feedback.tone}
          title={feedback.title}
          detail={feedback.detail}
          onClose={() => setFeedback(null)}
        />
      )}

      {wrongFeedback && (
        <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={afterWrongTryAgain} />
      )}
    </CyberHud>
  )
}
