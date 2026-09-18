import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Building2,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  Globe2,
  Lock,
  Newspaper,
  ShieldCheck,
} from 'lucide-react'
import splash from '../../../assets/games/classification-sorter/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import { usePointerDrag } from '../../module 1/shared/usePointerDrag'

const BRIEF = [
  'THE CLASSIFICATION SORTER',
  'Protect confidential corporate information.',
  '• Public — anyone may see it',
  '• Internal — staff only',
  '• Restricted — confidential / regulated',
  'Drag each asset into the correct sensitivity tier.',
]

const BUCKETS = [
  {
    id: 'public',
    label: 'Public',
    hint: 'External marketing & press-ready',
    icon: Globe2,
    accent: 'border-emerald-400/50 bg-emerald-950/30',
  },
  {
    id: 'internal',
    label: 'Internal',
    hint: 'Employees only · not for vendors',
    icon: Building2,
    accent: 'border-amber-400/50 bg-amber-950/30',
  },
  {
    id: 'restricted',
    label: 'Restricted / Confidential',
    hint: 'Need-to-know · high impact if leaked',
    icon: Lock,
    accent: 'border-rose-400/50 bg-rose-950/30',
  },
]

const ASSETS = [
  {
    id: 'brochure',
    label: 'Marketing Product Brochure',
    detail: 'Published product overview for customers',
    icon: Newspaper,
    bucket: 'public',
    xp: 25,
  },
  {
    id: 'calendar',
    label: 'Internal Staff Holiday Calendar',
    detail: 'Office closures for employees',
    icon: CalendarDays,
    bucket: 'internal',
    xp: 25,
  },
  {
    id: 'earnings',
    label: 'Unannounced Financial Earnings & Acquisition Plan',
    detail: 'Pre-release M&A and earnings figures',
    icon: FileSpreadsheet,
    bucket: 'restricted',
    xp: 25,
  },
  {
    id: 'customer-db',
    label: 'Customer Database with Credit Card Numbers',
    detail: 'PCI-scope PII and payment data',
    icon: CreditCard,
    bucket: 'restricted',
    xp: 25,
  },
]

export default function ClassificationSorterGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [pool, setPool] = useState(() => ASSETS.map((a) => a.id))
  const [placements, setPlacements] = useState({})
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)

  const assetMap = useMemo(() => Object.fromEntries(ASSETS.map((a) => [a.id, a])), [])

  const { drag, start } = usePointerDrag(({ payload, zoneId }) => {
    if (!payload?.assetId || !zoneId || wrongFeedback) return
    assign(payload.assetId, zoneId)
  })

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function assign(assetId, bucketId) {
    const asset = assetMap[assetId]
    if (!asset || placements[assetId]) return

    if (asset.bucket !== bucketId) {
      setWrongFeedback({
        title: 'Misclassified Data Asset',
        reason: `"${asset.label}" belongs in ${BUCKETS.find((b) => b.id === asset.bucket)?.label}, not ${
          BUCKETS.find((b) => b.id === bucketId)?.label
        }. Wrong tiers create oversharing or unnecessary restriction.`,
      })
      return
    }

    setPlacements((prev) => {
      const next = { ...prev, [assetId]: bucketId }
      if (Object.keys(next).length >= ASSETS.length) {
        setBadge(true)
        window.setTimeout(() => setPhase('result'), 1000)
      }
      return next
    })
    setPool((list) => list.filter((id) => id !== assetId))
    setScore((s) => s + asset.xp)
    setToast({
      tone: 'ok',
      title: `Classified · +${asset.xp} XP`,
      detail: `${asset.label} → ${BUCKETS.find((b) => b.id === bucketId)?.label}`,
    })
  }

  function quickAssign(assetId, bucketId) {
    assign(assetId, bucketId)
  }

  function resetPlay() {
    setScore(0)
    setPool(ASSETS.map((a) => a.id))
    setPlacements({})
    setToast(null)
    setWrongFeedback(null)
    setBadge(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 1 · CONFIDENTIAL DATA & CLASSIFICATION"
        lines={BRIEF}
        cta="OPEN SORTING ENGINE"
        alt="The Classification Sorter"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="THE CLASSIFICATION SORTER" score={score} onExit={onExit} status="100% ACCURACY">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">DATA TIERS SECURED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Public, Internal, and Restricted assets are labeled correctly — the foundation of corporate information
              governance.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">DATA ARCHITECT</span>
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
      title="THE CLASSIFICATION SORTER"
      score={score}
      onExit={onExit}
      status={`${Object.keys(placements).length}/4 SORTED`}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-xl border border-slate-600/50 bg-slate-950/70 px-4 py-2.5">
          <div className="flex items-center gap-2 text-slate-300">
            <Building2 className="size-4 text-cyan-400" />
            <span className="font-mono text-[10px] tracking-[0.18em] sm:text-xs">
              SYSLAB · DATA GOVERNANCE CONSOLE
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-200 sm:text-xs">{pool.length} assets inbound</span>
        </div>

        <p className="text-center text-sm text-slate-300">
          Drag each incoming asset into its <span className="text-cyan-300">sensitivity tier</span>.
        </p>

        <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-3">
          {BUCKETS.map((bucket) => {
            const Icon = bucket.icon
            const assigned = ASSETS.filter((a) => placements[a.id] === bucket.id)
            return (
              <div
                key={bucket.id}
                data-drop-id={bucket.id}
                className={`min-h-44 rounded-2xl border border-dashed p-3 transition hover:brightness-110 ${bucket.accent}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-white/85" />
                  <p className="font-game text-sm font-bold tracking-wide text-white">{bucket.label}</p>
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-400">{bucket.hint}</p>
                <div className="mt-3 space-y-2">
                  {assigned.map((asset) => {
                    const AIcon = asset.icon
                    return (
                      <div
                        key={asset.id}
                        className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-950/40 px-2 py-1.5 text-[11px] leading-snug text-emerald-100"
                      >
                        <AIcon className="mt-0.5 size-3.5 shrink-0" />
                        {asset.label}
                      </div>
                    )
                  })}
                  {!assigned.length && (
                    <p className="py-10 text-center text-[11px] text-slate-600">Drop asset here</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-slate-900/55 p-4">
          <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-slate-400">INCOMING DATA ASSETS</p>
          <div className="flex flex-wrap justify-center gap-3">
            {pool.map((id) => {
              const asset = assetMap[id]
              const Icon = asset.icon
              return (
                <button
                  key={id}
                  type="button"
                  onPointerDown={(event) => start(event, { assetId: id })}
                  className="game-pop flex max-w-[16rem] cursor-grab touch-none flex-col gap-2 rounded-xl border border-cyan-400/35 bg-slate-950/85 px-3 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-cyan-300" />
                    <span className="font-mono text-[9px] tracking-[0.16em] text-cyan-400/80">ASSET</span>
                  </div>
                  <p className="text-xs font-semibold leading-snug text-slate-100 sm:text-sm">{asset.label}</p>
                  <p className="text-[10px] text-slate-500">{asset.detail}</p>
                </button>
              )
            })}
            {!pool.length && (
              <p className="flex items-center gap-2 py-4 text-sm text-emerald-300/80">
                <ShieldCheck className="size-4" /> All assets classified
              </p>
            )}
          </div>
        </div>

        {pool.length > 0 && (
          <div className="mx-auto w-full max-w-6xl rounded-xl border border-white/10 bg-black/30 p-3 sm:hidden">
            <p className="mb-2 font-mono text-[10px] text-slate-400">TAP ASSIGN</p>
            {pool.map((id) => {
              const asset = assetMap[id]
              return (
                <div key={id} className="mb-3">
                  <p className="mb-1 text-xs text-slate-300">{asset.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {BUCKETS.map((bucket) => (
                      <button
                        key={bucket.id}
                        type="button"
                        onClick={() => quickAssign(id, bucket.id)}
                        className="cursor-pointer rounded-lg border border-cyan-500/30 px-2 py-1 text-[10px] text-cyan-200"
                      >
                        {bucket.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {drag && (
          <motion.div
            className="pointer-events-none fixed z-[90] max-w-xs rounded-xl border border-cyan-300/60 bg-slate-950 px-3 py-2 text-xs text-white shadow-xl"
            style={{ left: drag.x + 12, top: drag.y + 12 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {assetMap[drag.assetId]?.label}
          </motion.div>
        )}
      </AnimatePresence>

      {wrongFeedback && (
        <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={() => setWrongFeedback(null)} />
      )}

      {toast && (
        <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
      )}
    </CyberHud>
  )
}
