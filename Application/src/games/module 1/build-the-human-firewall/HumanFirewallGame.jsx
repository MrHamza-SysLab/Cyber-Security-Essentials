import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  AlertTriangle,
  Eye,
  HelpCircle,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  X,
} from 'lucide-react'
import custNgo from '../../../assets/general/cust-ngo.png'
import custPep from '../../../assets/general/cust-pep.png'
import custStudent from '../../../assets/general/cust-student.png'
import custTrader from '../../../assets/general/cust-trader.png'
import { LangToggleGame } from '../../../components/LangToggle'
import { useLanguage } from '../../../i18n/LanguageContext'
import { HUMAN_FIREWALL_UR } from '../../../i18n/module1'
import { usePointerDrag } from '../shared/usePointerDrag'

const MAX_LIVES = 3
const TARGET_BRICKS = 3

const LAYERS_BASE = [
  {
    id: 0,
    code: 'L1',
    ordinal: '1st Layer',
    title: 'Email Defense',
    needs: 'Report phishing',
    color: 'cyan',
    Icon: Mail,
  },
  {
    id: 1,
    code: 'L2',
    ordinal: '2nd Layer',
    title: 'Access Control',
    needs: 'Use MFA',
    color: 'sky',
    Icon: Lock,
  },
  {
    id: 2,
    code: 'L3',
    ordinal: '3rd Layer',
    title: 'Verify First',
    needs: 'Check sender',
    color: 'teal',
    Icon: Eye,
  },
]

const LAYER_STYLES = {
  cyan: {
    badge: 'bg-cyan-400 text-slate-950 ring-cyan-200',
    text: 'text-cyan-300',
    brick: 'border-cyan-400/60 bg-cyan-950/50 text-cyan-200',
  },
  sky: {
    badge: 'bg-sky-400 text-slate-950 ring-sky-200',
    text: 'text-sky-300',
    brick: 'border-sky-400/60 bg-sky-950/50 text-sky-200',
  },
  teal: {
    badge: 'bg-teal-400 text-slate-950 ring-teal-200',
    text: 'text-teal-300',
    brick: 'border-teal-400/60 bg-teal-950/50 text-teal-200',
  },
  risk: {
    badge: 'bg-rose-500 text-white ring-rose-300',
    text: 'text-rose-300',
    brick: '',
  },
}

const BRICKS_BASE = [
  {
    id: 'ngo',
    role: 'Charity Director',
    label: 'Reported Suspicious Email',
    hint: 'Flags phishing fast',
    avatar: custNgo,
    good: true,
    layer: 0,
  },
  {
    id: 'pep',
    role: 'Senior Executive',
    label: 'Used Multi-Factor Auth',
    hint: 'Locks accounts with MFA',
    avatar: custPep,
    good: true,
    layer: 1,
  },
  {
    id: 'student',
    role: 'Campus Intern',
    label: 'Verified Sender First',
    hint: 'Checks before clicking',
    avatar: custStudent,
    good: true,
    layer: 2,
  },
  {
    id: 'trader',
    role: 'Cash Trader',
    label: 'Shared Password on Chat',
    hint: 'Leaked credentials — risky',
    avatar: custTrader,
    good: false,
    layer: null,
  },
]

const DECOR_ICONS = [Wifi, Lock, Mail, AlertTriangle, Shield, Wifi, Lock, Mail]

const WALL_ROWS = [
  [
    { type: 'layer', layer: 0 },
    { type: 'icon', icon: 0 },
    { type: 'solid' },
    { type: 'slot', slot: 0 },
    { type: 'solid' },
    { type: 'label', text: 'Safe Employee' },
    { type: 'icon', icon: 1 },
  ],
  [
    { type: 'layer', layer: 1 },
    { type: 'solid' },
    { type: 'label', text: 'Safe Employee Actions' },
    { type: 'icon', icon: 2 },
    { type: 'slot', slot: 1 },
    { type: 'solid' },
    { type: 'icon', icon: 3 },
    { type: 'solid' },
  ],
  [
    { type: 'layer', layer: 2 },
    { type: 'icon', icon: 4 },
    { type: 'slot', slot: 2 },
    { type: 'solid' },
    { type: 'label', text: 'Human Firewall' },
    { type: 'icon', icon: 5 },
    { type: 'solid' },
  ],
  [
    { type: 'solid' },
    { type: 'icon', icon: 6 },
    { type: 'solid' },
    { type: 'solid' },
    { type: 'icon', icon: 7 },
    { type: 'solid' },
    { type: 'solid' },
  ],
]

function BrickShell({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`flex min-h-11 items-center justify-center rounded-lg border px-2 text-center text-[10px] font-semibold uppercase tracking-wide sm:min-h-12 sm:text-[11px] ${
        glow
          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.55)]'
          : 'border-cyan-500/35 bg-slate-950/70 text-slate-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

function LayerBadge({ layerId, compact = false, layers, riskLabel = 'RISK' }) {
  if (layerId == null) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-md font-mono font-bold tracking-wide ring-1 ${LAYER_STYLES.risk.badge} ${
          compact ? 'h-5 px-1.5 text-[9px]' : 'h-6 px-2 text-[10px]'
        }`}
      >
        {riskLabel}
      </span>
    )
  }
  const layer = layers[layerId]
  const style = LAYER_STYLES[layer.color]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-mono font-bold tracking-wide ring-1 ${style.badge} ${
        compact ? 'h-5 px-1.5 text-[9px]' : 'h-6 px-2 text-[10px]'
      }`}
    >
      {layer.code}
    </span>
  )
}

function AvatarBrickCard({ item, dimmed = false, compact = false }) {
  return (
    <div
      className={`flex w-full items-center text-left ${compact ? 'gap-2' : 'gap-3'} ${
        dimmed ? 'opacity-35' : ''
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-slate-900 ring-1 ring-cyan-400/35 ${
          compact ? 'h-12 w-12' : 'h-20 w-20 sm:h-24 sm:w-24'
        }`}
      >
        <img
          src={item.avatar}
          alt=""
          className="absolute inset-0 size-full object-cover object-top"
          draggable={false}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`font-mono tracking-[0.14em] text-cyan-400/90 ${
            compact ? 'text-[9px]' : 'text-[10px] sm:text-xs'
          }`}
        >
          {item.role}
        </p>
        <p
          className={`mt-1 font-semibold uppercase leading-snug text-slate-100 ${
            compact ? 'text-[10px]' : 'text-xs sm:text-sm'
          }`}
        >
          {item.label}
        </p>
        {!compact && (
          <p
            className={`mt-1 line-clamp-2 text-[11px] leading-snug sm:text-xs ${
              item.good ? 'text-slate-400' : 'text-rose-300/80'
            }`}
          >
            {item.hint}
          </p>
        )}
      </div>
    </div>
  )
}

function HintGuideModal({ onClose, layers, bricks }) {
  const { isUr } = useLanguage()
  const ur = HUMAN_FIREWALL_UR
  const trader = bricks.find((b) => b.id === 'trader')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="game-pop relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#020617] p-5 shadow-[0_0_40px_rgba(34,211,238,0.2)] sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close hint"
        >
          <X className="size-5" />
        </button>

        <p className="font-game text-sm font-bold tracking-[0.14em] text-cyan-300">
          {isUr ? ur.layerGuide : 'LAYER GUIDE'}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
          {isUr ? (
            ur.layerGuideBody
          ) : (
            <>
              Har safe brick ek wall layer seal karti hai. Matching badge (L1 / L2 / L3) wale slot pe drop
              karo. <span className="text-rose-300">RISK</span> brick kisi layer pe nahi lagti.
            </>
          )}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {layers.map((layer) => {
            const style = LAYER_STYLES[layer.color]
            const Icon = layer.Icon
            return (
              <div
                key={layer.id}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-1.5"
              >
                <LayerBadge layerId={layer.id} compact layers={layers} />
                <Icon className={`size-3.5 ${style.text}`} />
                <div className="text-left">
                  <p className={`font-mono text-[9px] font-bold tracking-wider ${style.text}`}>
                    {layer.title}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {isUr ? ur.needs : 'Needs:'} {layer.needs}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500">
            {isUr ? ur.layerMap : 'LAYER MAP'}
          </p>
          {layers.map((layer) => {
            const brick = bricks.find((b) => b.layer === layer.id)
            const style = LAYER_STYLES[layer.color]
            const Icon = layer.Icon
            return (
              <div
                key={layer.id}
                className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-slate-900/60 p-3"
              >
                <LayerBadge layerId={layer.id} layers={layers} />
                <Icon className={`size-5 shrink-0 ${style.text}`} />
                <img
                  src={brick.avatar}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover object-top ring-1 ring-cyan-400/30"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${style.text}`}>
                    {layer.code} · {layer.title}
                  </p>
                  <p className="text-xs text-slate-200">
                    {brick.role} — {brick.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {isUr ? ur.needs : 'Needs:'} {layer.needs}
                  </p>
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3">
            <LayerBadge layerId={null} layers={layers} riskLabel={isUr ? ur.risk : 'RISK'} />
            <AlertTriangle className="size-5 shrink-0 text-rose-300" />
            <img
              src={custTrader}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-cover object-top ring-1 ring-rose-400/30"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-300">
                {isUr ? ur.risk : 'RISK'} · {trader?.role}
              </p>
              <p className="text-xs text-rose-100/90">
                {trader?.label} — {trader?.hint}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 hover:bg-cyan-300"
        >
          GOT IT — PLAY
        </button>
      </div>
    </div>
  )
}

function FirewallResultScreen({ passed, score, secured, lives, slots, layers, bricks, onRetry, onExit }) {
  const { t, isUr } = useLanguage()
  const ur = HUMAN_FIREWALL_UR
  const sealed = slots
    .map((id) => (id ? bricks.find((b) => b.id === id) : null))
    .filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,rgba(34,211,238,0.14),transparent_50%)]" />
      <div className="matrix-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative z-10 flex min-h-dvh flex-1 items-center justify-center p-4 sm:p-8">
        <div className="game-pop w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/90 shadow-[0_0_50px_rgba(34,211,238,0.18)] backdrop-blur">
          <div
            className={`px-6 py-8 text-center sm:px-8 ${
              passed
                ? 'bg-linear-to-b from-emerald-950/80 to-transparent'
                : 'bg-linear-to-b from-rose-950/70 to-transparent'
            }`}
          >
            <div
              className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl ring-1 ${
                passed
                  ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40 shadow-[0_0_28px_rgba(52,211,153,0.35)]'
                  : 'bg-rose-500/20 text-rose-300 ring-rose-400/40 shadow-[0_0_28px_rgba(244,63,94,0.35)]'
              }`}
            >
              {passed ? <ShieldCheck className="size-10" /> : <ShieldAlert className="size-10" />}
            </div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-slate-400">{t('debrief')}</p>
            <h2
              className={`mt-2 font-game text-2xl font-bold tracking-wide sm:text-3xl ${
                passed ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {passed ? 'FIREWALL RESTORED' : 'NETWORK BREACHED'}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
              {passed
                ? 'Human firewall online. Safe behaviours sealed Email Defense, Access Control, and Verify First.'
                : 'Risky habits opened holes in the wall. Retry and place only protective roles.'}
            </p>
          </div>

          <div className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-3 text-center">
                <p className="font-mono text-[9px] tracking-wider text-slate-500">{t('score')}</p>
                <p className="mt-1 font-game text-xl font-bold text-cyan-300">{score}</p>
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-3 text-center">
                <p className="font-mono text-[9px] tracking-wider text-slate-500">
                  {isUr ? ur.bricks : 'BRICKS'}
                </p>
                <p className="mt-1 font-game text-xl font-bold text-cyan-300">
                  {secured}/{TARGET_BRICKS}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-3 text-center">
                <p className="font-mono text-[9px] tracking-wider text-slate-500">
                  {isUr ? ur.lives : 'LIVES'}
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-1">
                  {Array.from({ length: MAX_LIVES }).map((_, i) => (
                    <Shield
                      key={i}
                      className={`size-4 ${
                        i < lives
                          ? 'fill-cyan-400 text-cyan-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
              <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500">
                {passed ? 'LAYERS SEALED' : 'PROGRESS'}
              </p>
              <ul className="mt-3 space-y-2">
                {layers.map((layer) => {
                  const brick = sealed.find((b) => b.layer === layer.id)
                  const style = LAYER_STYLES[layer.color]
                  const Icon = layer.Icon
                  return (
                    <li
                      key={layer.id}
                      className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${
                        brick ? 'bg-emerald-950/30' : 'bg-slate-950/40 opacity-50'
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${style.text}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold ${style.text}`}>
                          {layer.ordinal}: {layer.title}
                        </p>
                        <p className="truncate text-[10px] text-slate-400">
                          {brick ? `${brick.role} — ${brick.label}` : 'Not sealed'}
                        </p>
                      </div>
                      {brick ? (
                        <img
                          src={brick.avatar}
                          alt=""
                          className="h-9 w-9 rounded-md object-cover object-top ring-1 ring-cyan-400/30"
                        />
                      ) : (
                        <AlertTriangle className="size-4 text-slate-600" />
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                passed
                  ? 'border border-emerald-400/30 bg-emerald-950/40'
                  : 'border border-rose-400/30 bg-rose-950/40'
              }`}
            >
              {passed ? (
                <ShieldCheck className="size-8 shrink-0 text-emerald-400" />
              ) : (
                <ShieldAlert className="size-8 shrink-0 text-rose-400" />
              )}
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-slate-400">NETWORK STATUS</p>
                <p
                  className={`font-game text-sm font-bold tracking-wide ${
                    passed ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {passed ? 'SECURED' : 'AT RISK'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {!passed && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 hover:bg-cyan-300"
                >
                  {t('retry')}
                </button>
              )}
              {passed && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border border-cyan-400/40 font-game text-sm font-bold tracking-wider text-cyan-300 hover:bg-cyan-400/10"
                >
                  {t('playAgain')}
                </button>
              )}
              <button
                type="button"
                onClick={onExit}
                className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl font-game text-sm font-bold tracking-wider ${
                  passed
                    ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                    : 'border border-white/20 text-slate-200 hover:bg-white/5'
                }`}
              >
                {t('backToModule')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HumanFirewallGame({ onExit }) {
  const { t, isUr } = useLanguage()
  const ur = HUMAN_FIREWALL_UR

  const layers = useMemo(
    () =>
      LAYERS_BASE.map((layer) => {
        const copy = ur.layers[layer.id]
        return {
          ...layer,
          ordinal: isUr && copy ? copy.ordinal : layer.ordinal,
          title: isUr && copy ? copy.title : layer.title,
          needs: isUr && copy ? copy.needs : layer.needs,
        }
      }),
    [isUr, ur],
  )

  const bricks = useMemo(
    () =>
      BRICKS_BASE.map((brick) => {
        const copy = ur.bricksCopy[brick.id]
        return {
          ...brick,
          role: isUr && copy ? copy.role : brick.role,
          label: isUr && copy ? copy.label : brick.label,
          hint: isUr && copy ? copy.hint : brick.hint,
        }
      }),
    [isUr, ur],
  )

  const wallLabel = (text) => (isUr && ur.wallLabels[text] ? ur.wallLabels[text] : text)

  const [phase, setPhase] = useState('play')
  const [slots, setSlots] = useState([null, null, null])
  const [used, setUsed] = useState({})
  const [lives, setLives] = useState(MAX_LIVES)
  const [shake, setShake] = useState(false)
  const [flashBad, setFlashBad] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const secured = slots.filter(Boolean).length
  const complete = secured === TARGET_BRICKS
  const score = secured * 25 + (complete ? 25 : 0)
  const networkSecure = complete
  const gameOver = lives <= 0

  function showWrong(title, detail) {
    setShake(true)
    setFlashBad(true)
    setLives((n) => Math.max(0, n - 1))
    setFeedback({ title, detail, tone: 'bad' })
    window.setTimeout(() => setShake(false), 320)
    window.setTimeout(() => setFlashBad(false), 500)
    window.setTimeout(() => setFeedback(null), 4200)
  }

  const { drag, start } = usePointerDrag(({ payload, zoneId }) => {
    if (gameOver || complete || showHint) return
    if (!zoneId?.startsWith('slot-') || !payload?.id) return
    const brickItem = bricks.find((item) => item.id === payload.id)
    if (!brickItem || used[brickItem.id]) return

    const index = Number(zoneId.replace('slot-', ''))
    if (Number.isNaN(index) || slots[index]) return

    const targetLayer = layers[index]

    if (!brickItem.good || brickItem.layer == null) {
      showWrong(
        'Wrong move — RISK brick',
        `${brickItem.role} shared a password. Yeh kisi layer pe nahi lagti. Sirf safe behaviours wall seal karti hain.`,
      )
      return
    }

    if (brickItem.layer !== index) {
      const correctLayer = layers[brickItem.layer]
      showWrong(
        'Wrong layer',
        `${brickItem.role} belongs to ${correctLayer.ordinal} (${correctLayer.title}). You dropped on ${targetLayer.ordinal} (${targetLayer.title}). Match the same layer.`,
      )
      return
    }

    const next = [...slots]
    next[index] = brickItem.id
    setSlots(next)
    setUsed((current) => ({ ...current, [brickItem.id]: true }))
    setFeedback({
      title: `${targetLayer.ordinal} sealed`,
      detail: `${brickItem.role} → ${targetLayer.title}. Good placement.`,
      tone: 'good',
    })
    window.setTimeout(() => setFeedback(null), 2800)
  })

  const dragging = useMemo(() => bricks.find((item) => item.id === drag?.id), [drag?.id, bricks])
  const trayBricks = bricks.filter((item) => !used[item.id])
  const activeLayer = dragging?.layer

  function resetGame() {
    setSlots([null, null, null])
    setUsed({})
    setLives(MAX_LIVES)
    setShake(false)
    setFlashBad(false)
    setShowHint(false)
    setFeedback(null)
    setPhase('play')
  }

  if (phase === 'result' || gameOver) {
    return (
      <FirewallResultScreen
        passed={complete && !gameOver}
        score={score}
        secured={secured}
        lives={lives}
        slots={slots}
        layers={layers}
        bricks={bricks}
        onRetry={resetGame}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(8,47,73,0.45),transparent_50%)]" />
      <div className="matrix-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.15)_0_1px,transparent_2px),radial-gradient(circle_at_70%_40%,rgba(103,232,249,0.12)_0_1px,transparent_2px)] [background-size:120px_120px]" />

      <header className="relative z-20 flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 bg-slate-950/80 px-3 py-2 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{t('exit')}</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative flex size-9 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/50">
              <Shield className="size-5 text-cyan-300" />
              <Lock className="absolute size-2.5 text-cyan-50" />
            </div>
            <h1 className="font-game text-xs font-bold tracking-[0.14em] text-white sm:text-sm md:text-base">
              {isUr ? ur.secureTheNetwork : 'SECURE THE NETWORK'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <LangToggleGame />
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-cyan-300 ring-1 ring-cyan-400/40 transition hover:bg-cyan-400/15 hover:text-cyan-200"
            title="Hint — layer guide"
            aria-label="Open hint"
          >
            <HelpCircle className="size-5" />
          </button>
          <span className="rounded-full border border-cyan-400/60 bg-cyan-950/50 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-cyan-300 sm:text-xs">
            LEVEL 01
          </span>
          <span className="rounded-lg bg-slate-900/90 px-3 py-1.5 font-mono text-[10px] text-cyan-200 ring-1 ring-cyan-500/20 sm:text-xs">
            {t('score')}: {score}
          </span>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-2.5 py-1.5 ring-1 ring-cyan-500/20">
            <span className="font-mono text-[10px] text-slate-400 sm:text-xs">
              {isUr ? ur.lives : 'LIVES'}:
            </span>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Shield
                key={i}
                className={`size-4 ${i < lives ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]' : 'text-slate-700'}`}
              />
            ))}
          </div>
          <span className="rounded-lg bg-slate-900/90 px-3 py-1.5 font-mono text-[10px] text-cyan-200 ring-1 ring-cyan-500/20 sm:text-xs">
            {secured}/{TARGET_BRICKS} {isUr ? ur.bricks : 'BRICKS'}
          </span>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row lg:gap-4 lg:p-4">
        <aside className="relative flex max-h-[48vh] w-full shrink-0 flex-col rounded-2xl border border-cyan-500/25 bg-slate-950/70 p-3 pt-6 sm:p-4 sm:pt-7 lg:max-h-none lg:w-80 xl:w-96">
          <div className="absolute left-4 top-0 -translate-y-1/2 rounded-md border border-cyan-400/50 bg-cyan-500 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.45)] sm:text-[11px]">
            DRAGGABLE BEHAVIOR BRICK
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
            {trayBricks.map((item) => (
              <button
                key={item.id}
                type="button"
                onPointerDown={(event) => start(event, { id: item.id })}
                className={`flex min-h-[5.75rem] w-full shrink-0 cursor-grab touch-none items-center rounded-xl border border-cyan-500/30 bg-slate-900/80 p-3 text-left transition hover:border-cyan-300/70 hover:bg-cyan-950/40 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] active:cursor-grabbing sm:min-h-[6.5rem] sm:flex-1 sm:p-3.5 ${
                  drag?.id === item.id ? 'opacity-30' : ''
                }`}
              >
                <AvatarBrickCard item={item} />
              </button>
            ))}
            {trayBricks.length === 0 && (
              <p className="py-6 text-center font-mono text-xs text-cyan-300/70">All roles placed</p>
            )}
          </div>
          {complete && (
            <button
              type="button"
              onClick={() => setPhase('result')}
              className="game-pop mt-3 flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center rounded-xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 hover:bg-cyan-300"
            >
              SEAL THE WALL
            </button>
          )}
        </aside>

        <div
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-950/50 p-3 shadow-[inset_0_0_60px_rgba(8,145,178,0.12)] sm:p-4 ${
            shake ? 'game-shake' : ''
          } ${flashBad ? 'ring-2 ring-rose-500/70' : ''}`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30 [background:linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_70%)]" />

          <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-1.5 sm:gap-2">
            {WALL_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`grid gap-1.5 sm:gap-2 ${
                  row.length === 8
                    ? 'grid-cols-8'
                    : row.length === 7
                      ? 'grid-cols-7'
                      : 'grid-cols-6'
                } ${rowIndex % 2 === 1 ? 'translate-x-2 sm:translate-x-3' : ''}`}
              >
                {row.map((cell, cellIndex) => {
                  if (cell.type === 'layer') {
                    const layer = layers[cell.layer]
                    const style = LAYER_STYLES[layer.color]
                    const Icon = layer.Icon
                    return (
                      <BrickShell
                        key={`${rowIndex}-${cellIndex}`}
                        className={`min-h-[4.25rem] flex-col gap-0.5 px-1.5 normal-case sm:min-h-[4.75rem] ${style.brick}`}
                      >
                        <Icon className={`size-3.5 shrink-0 sm:size-4 ${style.text}`} />
                        <span className="line-clamp-2 text-[8px] font-semibold leading-tight text-slate-100 sm:text-[9px]">
                          {layer.title}
                        </span>
                      </BrickShell>
                    )
                  }

                  if (cell.type === 'slot') {
                    const layer = layers[cell.slot]
                    const style = LAYER_STYLES[layer.color]
                    const filledId = slots[cell.slot]
                    const filled = filledId ? bricks.find((b) => b.id === filledId) : null
                    const isMatchTarget = activeLayer === cell.slot && !filled
                    return (
                      <BrickShell
                        key={`${rowIndex}-${cellIndex}`}
                        glow
                        data-drop-id={`slot-${cell.slot}`}
                        className={`relative min-h-[4.25rem] overflow-hidden border-2 border-dashed p-1 sm:min-h-[4.75rem] ${
                          isMatchTarget
                            ? `border-2 ${style.brick} shadow-[0_0_16px_rgba(34,211,238,0.45)]`
                            : 'border-cyan-300/90'
                        } ${drag && !filled ? 'bg-cyan-400/10' : ''}`}
                      >
                        {filled ? (
                          <div className="flex h-full w-full items-center gap-1.5 overflow-hidden px-0.5">
                            <img
                              src={filled.avatar}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-md object-cover object-top ring-1 ring-cyan-300/40 sm:h-11 sm:w-11"
                              draggable={false}
                            />
                            <div className="min-w-0 text-left normal-case">
                              <p className="truncate font-mono text-[8px] tracking-wider text-cyan-300">
                                {filled.role}
                              </p>
                              <p className="line-clamp-2 text-[9px] font-semibold uppercase leading-tight text-cyan-50">
                                {filled.label}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5 px-1 normal-case">
                            <span className={`text-[8px] font-bold tracking-wider ${style.text}`}>
                              {layer.title}
                            </span>
                            <span className="text-[9px] font-normal tracking-wider text-cyan-300/70">
                              DROP HERE
                            </span>
                          </div>
                        )}
                      </BrickShell>
                    )
                  }

                  if (cell.type === 'label') {
                    return (
                      <BrickShell key={`${rowIndex}-${cellIndex}`} className="text-cyan-100/90">
                        <span className="line-clamp-2 leading-tight">{wallLabel(cell.text)}</span>
                      </BrickShell>
                    )
                  }

                  if (cell.type === 'icon') {
                    const Icon = DECOR_ICONS[cell.icon] ?? Shield
                    return (
                      <BrickShell key={`${rowIndex}-${cellIndex}`} className="text-cyan-500/35">
                        <Icon className="size-4 sm:size-5" />
                      </BrickShell>
                    )
                  }

                  return <BrickShell key={`${rowIndex}-${cellIndex}`} />
                })}
              </div>
            ))}
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-72 xl:w-80">
          <div className="rounded-2xl border border-cyan-500/25 bg-slate-950/75 p-4 backdrop-blur">
            <p className="font-game text-sm font-bold tracking-[0.12em] text-cyan-300">
              {isUr ? ur.secureTheNetwork : 'SECURE THE WALL'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {isUr ? ur.layerGuideBody : (
                <>
                  Har brick sirf apni layer pe lagti hai — L1 Email Defense, L2 Access Control, L3 Verify
                  First. RISK brick kisi pe nahi.
                </>
              )}
            </p>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>{isUr ? ur.bricks : 'Bricks Secured'}</span>
                <span className="text-cyan-300">
                  {secured}/{TARGET_BRICKS}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-cyan-500/20">
                <div
                  className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all duration-500"
                  style={{ width: `${(secured / TARGET_BRICKS) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 backdrop-blur ${
              networkSecure
                ? 'border-emerald-400/40 bg-emerald-950/40'
                : 'border-cyan-500/30 bg-slate-950/75'
            }`}
          >
            <div className="flex items-center gap-3">
              {networkSecure ? (
                <ShieldCheck className="size-10 shrink-0 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              ) : (
                <ShieldAlert className="size-10 shrink-0 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]" />
              )}
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-slate-400">NETWORK STATUS</p>
                <p
                  className={`mt-0.5 font-game text-sm font-bold tracking-wide sm:text-base ${
                    networkSecure ? 'text-emerald-300' : 'text-cyan-300'
                  }`}
                >
                  {networkSecure ? 'SECURED' : 'AT RISK'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              {networkSecure
                ? 'Human firewall online. Risky roles blocked.'
                : 'Read each role. Place only protective behaviours in the glowing slots.'}
            </p>
          </div>

          <div className="hidden flex-1 rounded-2xl border border-dashed border-cyan-500/15 bg-slate-950/40 p-4 lg:block">
            <p className="font-mono text-[10px] tracking-[0.2em] text-slate-600">ROLE GUIDE</p>
            <ul className="mt-2 space-y-2 text-xs text-slate-500">
              {bricks.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <img
                    src={b.avatar}
                    alt=""
                    className="h-8 w-8 rounded-md object-cover object-top ring-1 ring-white/10"
                  />
                  <span>
                    <span className="text-slate-300">{b.role}</span>
                    {' — '}
                    {b.hint}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-400/40 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
            >
              <HelpCircle className="size-4" />
              Open layer hint
            </button>
          </div>
        </aside>
      </div>

      {drag && dragging && (
        <div
          className="pointer-events-none fixed z-50 w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-300 bg-slate-950 p-2 shadow-[0_0_20px_rgba(34,211,238,0.55)]"
          style={{ left: drag.x, top: drag.y }}
        >
          <AvatarBrickCard item={dragging} compact />
        </div>
      )}

      {feedback && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:bottom-6">
          <div
            className={`game-pop pointer-events-auto flex max-w-lg items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
              feedback.tone === 'good'
                ? 'border-emerald-400/40 bg-emerald-950/90 text-emerald-50'
                : 'border-rose-400/50 bg-rose-950/95 text-rose-50'
            }`}
          >
            {feedback.tone === 'good' ? (
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" />
            ) : (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-300" />
            )}
            <div className="min-w-0">
              <p className="font-game text-xs font-bold tracking-wide sm:text-sm">{feedback.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">{feedback.detail}</p>
            </div>
          </div>
        </div>
      )}

      {showHint && (
        <HintGuideModal onClose={() => setShowHint(false)} layers={layers} bricks={bricks} />
      )}
    </div>
  )
}
