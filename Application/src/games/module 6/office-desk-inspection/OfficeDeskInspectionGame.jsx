import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Building2,
  Clock,
  Eye,
  FileWarning,
  IdCard,
  Monitor,
  ShieldCheck,
  StickyNote,
} from 'lucide-react'
import splash from '../../../assets/games/office-desk-inspection/splash.png'
import deskScene from '../../../assets/games/office-desk-inspection/desk-scene.jpg'
import CyberSplash, { CyberHud, FeedbackToast } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'THE OFFICE DESK INSPECTION',
  'Clean desk policy protects payroll, passwords & clients.',
  '• Spot physical security errors on the workstation',
  '• You have 30 seconds — click each violation',
  '• Unlocked screens, sticky notes, open files, loose badges',
  'Find all 4 risks before the timer hits zero.',
]

/** Positions mapped to desk-scene.jpg object bboxes (1024×713) */
const HOTSPOTS = [
  {
    id: 'screen',
    label: 'Unlocked payroll screen',
    xp: 50,
    tip: 'Employee payroll sheet left unlocked on display.',
    style: { left: '37%', top: '9%', width: '30%', height: '31%' },
    icon: Monitor,
  },
  {
    id: 'file',
    label: 'Open client file',
    xp: 50,
    tip: 'Sensitive client folder sitting open on the empty desk.',
    style: { left: '11%', top: '38%', width: '23%', height: '22%' },
    icon: FileWarning,
  },
  {
    id: 'sticky',
    label: 'Password sticky note',
    xp: 50,
    tip: 'Sticky on keyboard: Password: Admin2026!',
    style: { left: '46%', top: '51%', width: '13%', height: '11%' },
    icon: StickyNote,
  },
  {
    id: 'badge',
    label: 'Unattended visitor badge',
    xp: 50,
    tip: 'Visitor badge left unattended on the desk stand.',
    style: { left: '73%', top: '54%', width: '19%', height: '26%' },
    icon: IdCard,
  },
]

const TIMER_SEC = 30

export default function OfficeDeskInspectionGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [found, setFound] = useState({})
  const [seconds, setSeconds] = useState(TIMER_SEC)
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
    if (phase !== 'play' || endedRef.current) return undefined
    if (seconds <= 0) {
      endedRef.current = true
      setPhase(allFound ? 'result' : 'timeout')
      return undefined
    }
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [phase, seconds, allFound])

  useEffect(() => {
    if (phase !== 'play' || !allFound || endedRef.current) return undefined
    endedRef.current = true
    setBadge(true)
    setToast({
      tone: 'ok',
      title: 'Clean Desk Master',
      detail: 'All four physical risks secured.',
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
    setSeconds(TIMER_SEC)
    setToast(null)
    setBadge(false)
    setPulseId(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · SHOULDER SURFING, CLEAN DESK & UNATTENDED PCS"
        lines={BRIEF}
        cta="INSPECT WORKSTATION"
        alt="Office Desk Inspection"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'timeout') {
    return (
      <CyberHud title="THE OFFICE DESK INSPECTION" score={score} onExit={onExit} status="TIME EXPIRED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-amber-400/40 bg-slate-950/90 p-6 text-center">
            <Clock className="mx-auto size-12 text-amber-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-amber-200">INSPECTION INCOMPLETE</h2>
            <p className="mt-2 text-sm text-slate-300">
              You secured {foundCount}/4 risks. In a real office, remaining exposures stay open for shoulder surfers
              and walk-by theft.
            </p>
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetPlay}
                className="min-h-12 cursor-pointer rounded-xl border border-cyan-400/40 px-5 font-game text-sm text-cyan-200"
              >
                Try again
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

  if (phase === 'result') {
    return (
      <CyberHud title="THE OFFICE DESK INSPECTION" score={score} onExit={onExit} status="DESK HARDENED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">WORKSTATION SECURED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Unlocked screens, password notes, open client files, and loose badges — all flagged before a passerby
              could exploit them.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">CLEAN DESK MASTER</span>
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

  const urgent = seconds <= 8

  return (
    <CyberHud
      title="THE OFFICE DESK INSPECTION"
      score={score}
      onExit={onExit}
      status={`RISKS ${foundCount}/4`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,rgba(34,211,238,0.1),transparent_45%),radial-gradient(ellipse_at_80%_90%,rgba(15,23,42,0.85),transparent_50%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="size-4 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">
                SYSLAB HQ · FLOOR 6 · DESK 14-C
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Eye className="size-3.5" />
                <span className="font-mono text-[10px] sm:text-xs">{foundCount}/4 spotted</span>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-bold ${
                  urgent
                    ? 'animate-pulse border border-rose-400/50 bg-rose-950/60 text-rose-200'
                    : 'border border-cyan-400/30 bg-cyan-950/40 text-cyan-200'
                }`}
              >
                <Clock className="size-3.5" />
                {String(seconds).padStart(2, '0')}s
              </div>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-5xl gap-3 lg:grid-cols-[1fr_240px]">
            <div
              role="img"
              onClick={missClick}
              onKeyDown={() => {}}
              className={`relative m-0 w-full cursor-crosshair overflow-hidden p-0 leading-none transition ${
                missFlash ? 'ring-2 ring-rose-400/40' : ''
              }`}
              aria-label="Office desk scene — click security risks"
            >
              <img
                src={deskScene}
                alt="3D office desk with security risks"
                className="pointer-events-none m-0 block h-auto w-full select-none p-0"
                draggable={false}
              />

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
                    className={`absolute z-10 rounded-xl border-2 transition ${
                      isFound
                        ? 'pointer-events-none border-emerald-400/80 bg-emerald-500/25 shadow-[0_0_24px_rgba(52,211,153,0.45)]'
                        : 'border-transparent hover:border-cyan-300/50 hover:bg-cyan-400/10'
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
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-950 shadow-lg">
                            <Icon className="size-3" />
                            +{item.xp}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

            {/* h-0 min-h-full: lock sidebar height to the image column */}
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-600/50 bg-slate-950/70 p-3 lg:h-0 lg:min-h-full">
              <p className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-slate-400">FIND LIST</p>
              <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-2">
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
                        <p className="mt-0.5 text-[10px] opacity-70">{isFound ? 'Secured' : '+50 XP'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
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
