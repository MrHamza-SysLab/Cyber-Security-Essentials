import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Bluetooth,
  Coffee,
  ShieldCheck,
  ShieldOff,
  Wifi,
  X,
} from 'lucide-react'
import splash from '../../../assets/games/wireless-risk-analyzer/splash.jpg'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import PhoneFrame from '../shared/PhoneFrame'

const BRIEF = [
  'WIRELESS RISK ANALYZER',
  'You are working from an airport cafe.',
  '• Open guest Wi-Fi needs Corporate VPN first',
  '• Bluetooth discoverable = attack surface',
  '• Reject unknown pairing requests',
  'Secure the phone before sending any traffic.',
]

const TASK_META = {
  vpn: { label: 'Corporate VPN before traffic', xp: 30 },
  bt: { label: 'Bluetooth set to OFF', xp: 30 },
  pair: { label: 'Unknown speaker pairing denied', xp: 40 },
}

export default function WirelessRiskAnalyzerGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [wifiConnected, setWifiConnected] = useState(false)
  const [vpnOn, setVpnOn] = useState(false)
  const [bluetooth, setBluetooth] = useState('discoverable')
  const [pairOpen, setPairOpen] = useState(true)
  const [checks, setChecks] = useState({ vpn: false, bt: false, pair: false })
  const awarded = useRef({ vpn: false, bt: false, pair: false })

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function award(id) {
    if (awarded.current[id] || phase !== 'play') return
    awarded.current[id] = true
    const meta = TASK_META[id]
    setChecks((c) => ({ ...c, [id]: true }))
    setScore((s) => s + meta.xp)
    setToast({ tone: 'ok', title: `Secure step · +${meta.xp} XP`, detail: meta.label })
  }

  useEffect(() => {
    if (phase !== 'play') return
    if (checks.vpn && checks.bt && checks.pair) {
      const timer = window.setTimeout(() => setPhase('result'), 900)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [checks, phase])

  function fail(title, reason) {
    setWrongFeedback({ title, reason })
  }

  function connectWifi() {
    if (wrongFeedback) return
    setWifiConnected(true)
    if (vpnOn) award('vpn')
    setToast({
      tone: vpnOn ? 'ok' : 'warn',
      title: vpnOn ? 'Guest Wi-Fi + VPN' : 'Open Wi-Fi joined',
      detail: vpnOn
        ? 'Tunnel ready — public network traffic is protected.'
        : 'Enable Corporate VPN before browsing or sending mail.',
    })
  }

  function toggleVpn() {
    if (wrongFeedback) return
    const next = !vpnOn
    setVpnOn(next)
    if (next && wifiConnected) award('vpn')
  }

  function tryBrowse() {
    if (wrongFeedback) return
    if (!wifiConnected) {
      fail('No Network Session', 'Join the cafe Wi-Fi first, then protect it with Corporate VPN before working.')
      return
    }
    if (!vpnOn) {
      fail(
        'Cleartext on Public Wi-Fi',
        'You sent traffic on open Airport_Free_WiFi_Guest without Corporate VPN. Enable VPN before any work traffic.',
      )
      return
    }
    award('vpn')
    setToast({
      tone: 'ok',
      title: 'Protected session',
      detail: 'Mail sync routed through Corporate VPN.',
    })
  }

  function setBt(mode) {
    if (wrongFeedback) return
    if (mode === 'discoverable') {
      fail(
        'Bluetooth Still Exposed',
        'Discoverable to Everyone lets strangers find and probe your device in a public cafe. Turn Bluetooth OFF.',
      )
      return
    }
    setBluetooth('off')
    award('bt')
  }

  function handlePair(action) {
    if (wrongFeedback || awarded.current.pair) return
    if (action === 'accept') {
      fail(
        'Rogue Pairing Accepted',
        'Unknown_Speaker is not a trusted corporate accessory. Accepting random Bluetooth pairs can enable eavesdropping or file drops.',
      )
      return
    }
    setPairOpen(false)
    award('pair')
  }

  function resetPlay() {
    awarded.current = { vpn: false, bt: false, pair: false }
    setScore(0)
    setToast(null)
    setWrongFeedback(null)
    setWifiConnected(false)
    setVpnOn(false)
    setBluetooth('discoverable')
    setPairOpen(true)
    setChecks({ vpn: false, bt: false, pair: false })
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · BLUETOOTH SECURITY & PUBLIC WI-FI"
        lines={BRIEF}
        cta="ENTER AIRPORT CAFE"
        alt="Wireless Risk Analyzer"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="WIRELESS RISK ANALYZER" score={score} onExit={onExit} status="PUBLIC SPACE HARDENED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">CAFE CONNECTION SECURE</h2>
            <p className="mt-2 text-sm text-slate-300">
              VPN before traffic, Bluetooth off, unknown pairing denied — textbook public-network hygiene.
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

  const checklist = [
    { id: 'vpn', done: checks.vpn, label: TASK_META.vpn.label },
    { id: 'bt', done: checks.bt, label: TASK_META.bt.label },
    { id: 'pair', done: checks.pair, label: TASK_META.pair.label },
  ]
  const completed = checklist.filter((t) => t.done).length

  return (
    <CyberHud
      title="WIRELESS RISK ANALYZER"
      score={score}
      onExit={onExit}
      status={`CHECKLIST ${completed}/3`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(245,158,11,0.12),transparent_45%),radial-gradient(ellipse_at_80%_100%,rgba(34,211,238,0.08),transparent_40%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5">
          <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-stone-800 via-stone-900 to-slate-950 p-4 shadow-xl sm:p-5">
              <div className="flex items-center gap-2 text-amber-100/90">
                <Coffee className="size-5 text-amber-300" />
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em]">TERMINAL CAFE · GATE B12</p>
                  <h2 className="font-game text-lg text-white">Work-from-airport briefing</h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                Open guest Wi-Fi is visible. Your phone is still Bluetooth-discoverable. A nearby speaker is asking to
                pair. Lock this down before you open mail or files.
              </p>

              <div className="mt-4 space-y-2">
                {checklist.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                      task.done
                        ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-100'
                        : 'border-white/10 bg-black/25 text-stone-300'
                    }`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        task.done ? 'bg-emerald-400 text-slate-950' : 'bg-stone-700 text-stone-300'
                      }`}
                    >
                      {task.done ? '✓' : '•'}
                    </span>
                    {task.label}
                  </div>
                ))}
              </div>
            </div>

            <PhoneFrame
              indicators={
                <>
                  {wifiConnected && <Wifi className="size-3 text-cyan-300" />}
                  {bluetooth !== 'off' && <Bluetooth className="size-3 text-sky-300" />}
                </>
              }
            >
              <div className="space-y-3 px-3 pb-6 pt-1">
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500">STATUS DASHBOARD</p>

                <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Wifi className={`size-4 shrink-0 ${wifiConnected ? 'text-cyan-300' : 'text-slate-500'}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">Airport_Free_WiFi_Guest</p>
                        <p className="text-[11px] text-amber-200/90">Open network · no password</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={connectWifi}
                      className={`min-h-9 shrink-0 cursor-pointer rounded-lg px-3 font-mono text-[10px] ${
                        wifiConnected
                          ? 'border border-cyan-400/40 text-cyan-200'
                          : 'bg-cyan-400 font-bold text-slate-950'
                      }`}
                    >
                      {wifiConnected ? 'JOINED' : 'JOIN'}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2">
                    <div className="flex items-center gap-2">
                      {vpnOn ? (
                        <ShieldCheck className="size-4 text-emerald-300" />
                      ) : (
                        <ShieldOff className="size-4 text-rose-300" />
                      )}
                      <span className="text-sm text-slate-200">Corporate VPN</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={vpnOn}
                      onClick={toggleVpn}
                      className={`relative h-7 w-12 cursor-pointer rounded-full ${vpnOn ? 'bg-emerald-400' : 'bg-slate-600'}`}
                    >
                      <span
                        className={`absolute top-0.5 size-6 rounded-full bg-white transition ${
                          vpnOn ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={tryBrowse}
                    className="mt-3 flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    Open Corporate Mail
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-3">
                  <div className="flex items-center gap-2">
                    <Bluetooth className={`size-4 ${bluetooth === 'off' ? 'text-slate-500' : 'text-sky-300'}`} />
                    <p className="text-sm font-semibold text-white">Bluetooth</p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Status:{' '}
                    <span className={bluetooth === 'discoverable' ? 'text-rose-300' : 'text-emerald-300'}>
                      {bluetooth === 'off' ? 'OFF' : 'Discoverable to Everyone'}
                    </span>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBt('discoverable')}
                      className="min-h-10 cursor-pointer rounded-xl border border-rose-400/30 bg-rose-950/30 text-[11px] text-rose-100"
                    >
                      Keep Discoverable
                    </button>
                    <button
                      type="button"
                      onClick={() => setBt('off')}
                      className="min-h-10 cursor-pointer rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-900"
                    >
                      Turn Bluetooth OFF
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {pairOpen && !checks.pair && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex items-end bg-black/55 p-3 backdrop-blur-[2px]"
                  >
                    <motion.div
                      initial={{ y: 40 }}
                      animate={{ y: 0 }}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900 p-4 shadow-2xl"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-[10px] tracking-[0.16em] text-sky-300">BLUETOOTH REQUEST</p>
                          <h3 className="mt-1 font-game text-base text-white">Unknown_Speaker</h3>
                          <p className="mt-1 text-xs text-slate-400">Nearby device wants to pair via Bluetooth.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePair('deny')}
                          className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-800"
                          aria-label="Close"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handlePair('accept')}
                          className="min-h-11 cursor-pointer rounded-xl border border-slate-600 text-sm text-slate-200"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePair('deny')}
                          className="min-h-11 cursor-pointer rounded-xl bg-rose-500 font-semibold text-white"
                        >
                          Deny / Reject
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </PhoneFrame>
          </div>
        </div>

        {toast && <FeedbackToast {...toast} onClose={() => setToast(null)} />}
        {wrongFeedback && (
          <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={() => setWrongFeedback(null)} />
        )}
      </div>
    </CyberHud>
  )
}
