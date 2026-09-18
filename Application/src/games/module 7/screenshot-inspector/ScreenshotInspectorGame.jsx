import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Camera,
  Clock,
  Coffee,
  Eye,
  Monitor,
  Network,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import splash from '../../../assets/games/screenshot-inspector/splash.png'
import CyberSplash, { CyberHud, FeedbackToast } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'THE SCREENSHOT INSPECTOR',
  'Social posts can leak what desks quietly expose.',
  '• Scan a desk photo before it goes public',
  '• Click every hidden PII / sensitive leak',
  '• Screens, whiteboards & papers all count',
  'Find all 3 violations. +50 XP each.',
]

const HOTSPOTS = [
  {
    id: 'pii-screen',
    label: 'Customer PII on screen',
    tip: 'Background laptop shows an open customer PII record.',
    xp: 50,
    style: { left: '34%', top: '14%', width: '30%', height: '30%' },
    icon: Monitor,
  },
  {
    id: 'whiteboard-ip',
    label: 'Internal network IPs',
    tip: 'Whiteboard lists internal network IP addresses.',
    xp: 50,
    style: { left: '68%', top: '10%', width: '26%', height: '28%' },
    icon: Network,
  },
  {
    id: 'salary-slip',
    label: 'Printed salary slip',
    tip: 'Salary slip left beside the coffee mug.',
    xp: 50,
    style: { left: '58%', top: '58%', width: '22%', height: '22%' },
    icon: Receipt,
  },
]

export default function ScreenshotInspectorGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [found, setFound] = useState({})
  const [toast, setToast] = useState(null)
  const [badge, setBadge] = useState(false)
  const [pulseId, setPulseId] = useState(null)
  const [missFlash, setMissFlash] = useState(false)
  const endedRef = useRef(false)

  const foundCount = Object.keys(found).length
  const allFound = foundCount >= HOTSPOTS.length

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (phase !== 'play' || !allFound || endedRef.current) return undefined
    endedRef.current = true
    setBadge(true)
    setToast({
      tone: 'ok',
      title: 'Leak Scan Complete',
      detail: 'All three visual exposures flagged before posting.',
    })
    const timer = window.setTimeout(() => setPhase('result'), 1100)
    return () => window.clearTimeout(timer)
  }, [allFound, phase])

  function spot(item) {
    if (phase !== 'play' || endedRef.current || found[item.id]) return
    setFound((prev) => ({ ...prev, [item.id]: true }))
    setScore((s) => s + item.xp)
    setPulseId(item.id)
    setToast({
      tone: 'ok',
      title: `+${item.xp} XP · ${item.label}`,
      detail: item.tip,
    })
    window.setTimeout(() => setPulseId(null), 700)
  }

  function missClick(e) {
    if (e.target.closest('[data-hotspot]')) return
    if (phase !== 'play' || endedRef.current) return
    setMissFlash(true)
    window.setTimeout(() => setMissFlash(false), 350)
  }

  function resetPlay() {
    endedRef.current = false
    setScore(0)
    setFound({})
    setToast(null)
    setBadge(false)
    setPulseId(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · CLOUD STORAGE, SCREENSHOTS & PHOTOS"
        lines={BRIEF}
        cta="AUDIT DESK PHOTO"
        alt="The Screenshot Inspector"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="THE SCREENSHOT INSPECTOR" score={score} onExit={onExit} status="POST BLOCKED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">VISUAL LEAKS STOPPED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Customer PII on screen, whiteboard IPs, and a salary slip — all caught before a social post could expose
              them.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">VISUAL LEAK HUNTER</span>
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
      title="THE SCREENSHOT INSPECTOR"
      score={score}
      onExit={onExit}
      status={`LEAKS ${foundCount}/3`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,rgba(34,211,238,0.1),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Camera className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">
                SOCIAL MEDIA PRE-POST AUDIT
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Eye className="size-3.5" />
              <span className="font-mono text-[10px] sm:text-xs">{foundCount}/3 spotted</span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-2 py-1 font-mono text-[10px] text-cyan-200">
                <Clock className="size-3" /> LIVE REVIEW
              </span>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-5xl gap-3 lg:grid-cols-[1fr_240px]">
            <div
              role="img"
              onClick={missClick}
              onKeyDown={() => {}}
              className={`relative aspect-[16/11] w-full cursor-crosshair overflow-hidden rounded-2xl border text-left shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition ${
                missFlash ? 'border-rose-400/60 ring-2 ring-rose-400/30' : 'border-slate-600/60'
              }`}
              aria-label="Desk photo — click security leaks"
            >
              {/* Scene */}
              <div className="absolute inset-0 bg-gradient-to-br from-stone-600 via-slate-700 to-slate-950" />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />

              {/* Wall + whiteboard */}
              <div className="absolute left-[66%] top-[6%] h-[36%] w-[30%] rounded-md border border-slate-400/40 bg-slate-100/95 p-2 shadow-lg">
                <p className="font-mono text-[8px] font-bold uppercase tracking-wider text-slate-700">Net Map · Draft</p>
                <p className="mt-1 font-mono text-[9px] text-rose-700">10.0.4.12 — Finance VLAN</p>
                <p className="font-mono text-[9px] text-rose-700">10.0.4.88 — DB Primary</p>
                <p className="font-mono text-[9px] text-rose-700">172.16.9.3 — VPN GW</p>
                <p className="mt-1 font-mono text-[7px] text-amber-700">INTERNAL ONLY</p>
              </div>

              {/* Desk */}
              <div className="absolute bottom-[6%] left-[4%] right-[4%] h-[55%] rounded-t-xl bg-gradient-to-b from-amber-900/80 via-stone-800 to-stone-950" />

              {/* Laptop with PII */}
              <div className="absolute left-[32%] top-[12%] w-[34%] overflow-hidden rounded-lg border-2 border-slate-500 bg-slate-950 shadow-xl">
                <div className="flex items-center gap-1 border-b border-slate-700 bg-slate-900 px-2 py-1">
                  <span className="size-1.5 rounded-full bg-rose-400" />
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-[8px] text-slate-500">CRM · Customer Record</span>
                </div>
                <div className="space-y-1 p-2">
                  <p className="font-mono text-[9px] text-cyan-300">Maria Santos · #CX-9021</p>
                  <p className="font-mono text-[8px] text-rose-300">SSN •••-••-4412 · DOB 03/14/1988</p>
                  <p className="font-mono text-[8px] text-amber-200">Card •••• 8841 · Exp 09/28</p>
                  <div className="mt-1 grid grid-cols-3 gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-1.5 rounded bg-slate-700/80" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute left-[46%] top-[42%] h-2.5 w-10 -translate-x-1/2 bg-slate-600" />
              <div className="absolute left-[42%] top-[44.5%] h-1.5 w-16 rounded-sm bg-slate-500" />

              {/* Coffee + salary slip */}
              <div className="absolute bottom-[22%] right-[28%] flex items-end gap-2">
                <div className="relative rotate-[-8deg] rounded border border-rose-400/40 bg-white p-1.5 shadow-md">
                  <p className="font-mono text-[7px] font-bold text-slate-800">PAYSLIP · MAR 2026</p>
                  <p className="font-mono text-[8px] text-rose-700">Net: $6,420.00</p>
                  <p className="font-mono text-[7px] text-slate-600">Emp ID: E-4419</p>
                </div>
                <div className="relative">
                  <Coffee className="size-8 text-amber-700/90" />
                  <div className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-200/80" />
                </div>
              </div>

              {/* Phone decoy */}
              <div className="absolute bottom-[24%] left-[12%] h-14 w-8 rounded-md border border-slate-500/50 bg-slate-900/80" />
              <div className="absolute left-[10%] top-[18%] h-8 w-20 rounded border border-slate-500/30 bg-slate-800/40" />

              {/* Camera frame overlay */}
              <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/20" />
              <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 font-mono text-[9px] text-white/80">
                PREVIEW · INSTAGRAM STORY
              </div>

              {HOTSPOTS.map((item) => {
                const Icon = item.icon
                const isFound = Boolean(found[item.id])
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    data-hotspot
                    onClick={(e) => {
                      e.stopPropagation()
                      spot(item)
                    }}
                    style={item.style}
                    className={`absolute z-10 rounded-lg border-2 transition ${
                      isFound
                        ? 'pointer-events-none border-emerald-400/70 bg-emerald-500/20'
                        : 'border-transparent hover:border-cyan-400/50 hover:bg-cyan-400/10'
                    }`}
                    whileTap={isFound ? undefined : { scale: 0.97 }}
                    aria-label={item.label}
                  >
                    <AnimatePresence>
                      {(pulseId === item.id || isFound) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-950 shadow">
                            <Icon className="size-3" />
                            +{item.xp}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isFound && (
                      <span className="absolute right-1 top-1 size-2 animate-ping rounded-full bg-rose-400/80" />
                    )}
                  </motion.button>
                )
              })}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-3">
                <p className="font-mono text-[10px] tracking-wider text-cyan-200/80">
                  CLICK EACH HIDDEN LEAK · DO NOT POST UNTIL CLEAR
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-600/50 bg-slate-950/70 p-3">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">FIND LIST</p>
              {HOTSPOTS.map((item) => {
                const Icon = item.icon
                const isFound = Boolean(found[item.id])
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 text-xs ${
                      isFound
                        ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-100'
                        : 'border-white/10 bg-black/20 text-slate-300'
                    }`}
                  >
                    <Icon className={`mt-0.5 size-3.5 shrink-0 ${isFound ? 'text-emerald-300' : 'text-slate-500'}`} />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-0.5 text-[10px] opacity-70">{isFound ? 'Flagged' : '+50 XP'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
      </div>
    </CyberHud>
  )
}
