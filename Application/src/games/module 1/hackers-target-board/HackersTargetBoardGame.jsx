import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Lock, Shield, ShieldCheck } from 'lucide-react'
import payments from '../../../assets/games/hackers-target-board/asset-payments.png'
import records from '../../../assets/games/hackers-target-board/asset-employee-records.png'
import strategy from '../../../assets/games/hackers-target-board/asset-secret-strategy.png'
import vendor from '../../../assets/games/hackers-target-board/asset-small-vendor.png'
import shield from '../../../assets/games/hackers-target-board/energy-shield.png'
import hacker from '../../../assets/games/hackers-target-board/hacker-laptop-front.png'
import splash from '../../../assets/games/hackers-target-board/splash.jpg'
import { LangToggleGame } from '../../../components/LangToggle'
import { useLanguage } from '../../../i18n/LanguageContext'
import { HACKERS_TARGET_UR } from '../../../i18n/module1'

const ASSETS_BASE = [
  {
    id: 'records',
    label: 'Employee Records',
    src: records,
    correct: false,
    reason:
      'Employee records are valuable, but usually tightly controlled. Hackers look for a softer entry first — try again.',
  },
  {
    id: 'strategy',
    label: 'Secret Strategy',
    src: strategy,
    correct: false,
    reason:
      'Secret strategy files are high-value and heavily locked. Attackers rarely start here — try again.',
  },
  {
    id: 'vendor',
    label: 'Small Vendor Account',
    src: vendor,
    correct: true,
    reason:
      'Small vendors are often the weakest link — weaker security and shared access. Hackers usually hit this soft door first.',
  },
  {
    id: 'payments',
    label: 'Customer Payments',
    src: payments,
    correct: false,
    reason:
      'Payment systems are heavily monitored. Hackers prefer a less guarded vendor path first — try again.',
  },
]

const ARC = [
  { rotate: '-14deg', y: '0.35rem', x: '0' },
  { rotate: '-5deg', y: '-1.15rem', x: '0' },
  { rotate: '5deg', y: '-1.15rem', x: '0' },
  { rotate: '14deg', y: '0.35rem', x: '0' },
]

const SPLASH_LABELS_BASE = [
  { id: 'records', text: 'Employee Records', className: 'left-[8%] top-[10%] sm:left-[11%] sm:top-[11%]', delay: '0ms' },
  { id: 'strategy', text: 'Secret Strategy', className: 'left-[2%] top-[40%] sm:left-[4%] sm:top-[42%]', delay: '120ms' },
  { id: 'vendor', text: 'Small Vendor Account', className: 'right-[10%] top-[10%] sm:right-[14%] sm:top-[11%]', delay: '240ms' },
  { id: 'payments', text: 'Customer Data', className: 'right-[3%] top-[38%] sm:right-[5%] sm:top-[40%]', delay: '360ms' },
]

const TYPE_LINES_EN = [
  'Hacker sab se pehle kis par nazar rakhega?',
  'Spot the prime target!',
]

function useTypewriter(lines, { start = true, charMs = 38, linePauseMs = 420 } = {}) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!start) return undefined
    setLineIndex(0)
    setCharIndex(0)
    setDone(false)
  }, [start, lines])

  useEffect(() => {
    if (!start || done) return undefined
    const current = lines[lineIndex] ?? ''
    if (charIndex < current.length) {
      const timer = window.setTimeout(() => setCharIndex((value) => value + 1), charMs)
      return () => window.clearTimeout(timer)
    }
    if (lineIndex < lines.length - 1) {
      const timer = window.setTimeout(() => {
        setLineIndex((value) => value + 1)
        setCharIndex(0)
      }, linePauseMs)
      return () => window.clearTimeout(timer)
    }
    setDone(true)
    return undefined
  }, [start, done, lines, lineIndex, charIndex, charMs, linePauseMs])

  return { lineIndex, charIndex, done }
}

function useElapsedTimer(active) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    setSeconds(0)
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [active])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function BinaryRain({ columns = 8 }) {
  const streams = useMemo(
    () =>
      Array.from({ length: columns }, (_, col) => ({
        id: col,
        delay: `${(col % 5) * 0.4}s`,
        duration: `${3.4 + (col % 4) * 0.5}s`,
        text: Array.from({ length: 48 }, () => (Math.random() > 0.5 ? '1' : '0')).join('\n'),
      })),
    [columns],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden font-mono text-[10px] leading-[1.15] text-cyan-300/25 sm:text-xs">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="binary-rain-col absolute top-0 whitespace-pre"
          style={{
            left: `${(stream.id / columns) * 100}%`,
            width: `${100 / columns}%`,
            animationDelay: stream.delay,
            animationDuration: stream.duration,
          }}
        >
          {stream.text}
          {'\n'}
          {stream.text}
        </div>
      ))}
    </div>
  )
}

function HoloStat({ label, value }) {
  return (
    <div className="rounded-md border border-cyan-400/35 bg-slate-950/70 px-2.5 py-1.5 shadow-[0_0_12px_rgba(34,211,238,0.12)]">
      <p className="font-mono text-[9px] tracking-[0.18em] text-cyan-400/70">{label}</p>
      <p className="mt-0.5 font-mono text-xs font-semibold text-cyan-200 sm:text-sm">{value}</p>
    </div>
  )
}

function TargetBoardResultScreen({ score, wrongCount, target, timer, onRetry, onExit }) {
  const { t, isUr } = useLanguage()
  const ur = HACKERS_TARGET_UR

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#02161c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.16),transparent_48%),radial-gradient(ellipse_at_50%_100%,rgba(6,78,59,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(34,211,238,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />
      <BinaryRain columns={10} />

      <header className="relative z-30 mx-3 mt-3 flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/35 bg-slate-950/75 px-3 py-2 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md sm:mx-5 sm:px-5">
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
            <div className="relative flex size-9 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/55">
              <Shield className="size-5 text-cyan-300" />
              <Lock className="absolute size-2.5 text-cyan-50" />
            </div>
            <div>
              <h1 className="font-game text-[10px] font-bold tracking-[0.16em] text-white sm:text-sm md:text-base">
                {isUr ? ur.secureTheNetwork : 'SECURE THE NETWORK'}
              </h1>
              <p className="hidden font-mono text-[9px] tracking-[0.2em] text-cyan-400/70 sm:block">
                {isUr ? ur.missionDebrief : 'MISSION DEBRIEF'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LangToggleGame />
          <span className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-emerald-300 sm:text-xs">
            {isUr ? ur.statusCleared : 'STATUS: CLEARED'}
          </span>
        </div>
      </header>

      <div className="relative z-20 flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="game-pop w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-400/35 bg-slate-950/90 shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur">
          <div className="bg-linear-to-b from-emerald-950/80 to-transparent px-6 py-8 text-center sm:px-8">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/40">
              <ShieldCheck className="size-10" />
            </div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-slate-400">
              {isUr ? ur.missionDebrief : 'MISSION DEBRIEF'}
            </p>
            <h2 className="mt-2 font-game text-2xl font-bold tracking-wide text-emerald-300 sm:text-3xl">
              {isUr ? ur.targetShielded : 'TARGET SHIELDED'}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
              {isUr
                ? ur.resultBlurb
                : 'You spotted the prime target. Soft vendor accounts are often the first door hackers open.'}
            </p>
          </div>

          <div className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-3 text-center">
                <p className="font-mono text-[9px] tracking-wider text-slate-500">{t('score')}</p>
                <p className="mt-1 font-game text-xl font-bold text-cyan-300">{score}</p>
              </div>
              <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-3 text-center">
                <p className="font-mono text-[9px] tracking-wider text-slate-500">
                  {isUr ? ur.misses : 'MISSES'}
                </p>
                <p className="mt-1 font-game text-xl font-bold text-cyan-300">{wrongCount}</p>
              </div>
              <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-3 text-center">
                <p className="font-mono text-[9px] tracking-wider text-slate-500">
                  {isUr ? ur.time : 'TIME'}
                </p>
                <p className="mt-1 font-game text-xl font-bold text-cyan-300">{timer}</p>
              </div>
            </div>

            {target && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-950/40 p-3">
                <div className="htb-holo-card flex size-16 shrink-0 items-center justify-center rounded-lg border border-emerald-400/40 bg-slate-950/60 sm:size-20">
                  <img src={target.src} alt="" className="h-[78%] w-[78%] object-contain" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-mono text-[9px] tracking-[0.18em] text-emerald-400/80">
                    {isUr ? ur.primaryTarget : 'PRIMARY TARGET'}
                  </p>
                  <p className="mt-1 font-game text-sm font-bold tracking-wide text-emerald-200 sm:text-base">
                    {target.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">{target.reason}</p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-3 sm:p-4">
              <p className="font-mono text-[9px] tracking-[0.18em] text-cyan-400/70">
                {isUr ? ur.keyTakeaway : 'KEY TAKEAWAY'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                {isUr
                  ? ur.keyTakeawayBody
                  : 'Attackers often start at the weakest linked vendor — it is the easiest door into a larger network.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onRetry}
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border border-cyan-400/40 font-game text-sm font-bold tracking-wider text-cyan-300 transition hover:bg-cyan-400/10"
              >
                {t('playAgain')}
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-cyan-400 font-game text-sm font-bold tracking-wider text-slate-950 transition hover:bg-cyan-300"
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

export default function HackersTargetBoardGame({ onExit }) {
  const { t, isUr } = useLanguage()
  const ur = HACKERS_TARGET_UR

  const assets = useMemo(
    () =>
      ASSETS_BASE.map((asset) => {
        const copy = ur.assets[asset.id]
        return {
          ...asset,
          label: isUr && copy ? copy.label : asset.label,
          reason: isUr && copy ? copy.reason : asset.reason,
        }
      }),
    [isUr, ur],
  )

  const splashLabels = useMemo(
    () =>
      SPLASH_LABELS_BASE.map((label) => ({
        ...label,
        text: isUr && ur.splashLabels[label.id] ? ur.splashLabels[label.id] : label.text,
      })),
    [isUr, ur],
  )

  const typeLines = useMemo(
    () => (isUr ? [ur.playPrompt, ur.spotPrime] : TYPE_LINES_EN),
    [isUr, ur],
  )

  const [phase, setPhase] = useState('intro')
  const [picked, setPicked] = useState(null)
  const [wrongIds, setWrongIds] = useState([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [splashReady, setSplashReady] = useState(false)
  const typing = useTypewriter(typeLines, { start: phase === 'intro' })
  const timer = useElapsedTimer(phase === 'play')
  const pickedAsset = assets.find((asset) => asset.id === picked) ?? null
  const locked = Boolean(pickedAsset?.correct)

  function resetPlay() {
    setPicked(null)
    setWrongIds([])
    setScore(0)
    setFeedback(null)
    setPhase('play')
  }

  function choose(asset) {
    if (locked || wrongIds.includes(asset.id)) return

    if (!asset.correct) {
      setWrongIds((ids) => [...ids, asset.id])
      setFeedback({
        tone: 'bad',
        title: isUr ? ur.wrongTarget : 'Wrong target — try again',
        detail: asset.reason,
      })
      return
    }

    const nextScore = Math.max(40, 100 - wrongIds.length * 20)
    setPicked(asset.id)
    setScore(nextScore)
    setFeedback({
      tone: 'good',
      title: isUr ? ur.correctTarget : 'Correct target',
      detail: asset.reason,
    })
    window.setTimeout(() => setPhase('result'), 2800)
  }

  if (phase === 'result') {
    return (
      <TargetBoardResultScreen
        score={score}
        wrongCount={wrongIds.length}
        target={pickedAsset}
        timer={timer}
        onRetry={resetPlay}
        onExit={onExit}
      />
    )
  }

  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 h-dvh w-screen overflow-hidden rounded-none bg-black text-white">
        <img
          src={splash}
          alt={isUr ? ur.hackersTargetBoard : "Hacker’s Target Board"}
          className="absolute inset-0 size-full rounded-none object-cover object-center"
        />

        <div className="absolute end-4 top-4 z-30">
          <LangToggleGame />
        </div>

        {splashLabels.map((label) => (
          <p
            key={label.id}
            style={{ '--float-delay': label.delay }}
            className={`splash-float-up splash-metal-text absolute z-10 max-w-[13rem] text-center font-game text-base font-bold uppercase leading-tight tracking-wide sm:max-w-[16rem] sm:text-xl md:text-2xl lg:text-3xl ${label.className}`}
          >
            {label.text}
          </p>
        ))}

        <div className="absolute inset-x-0 top-[44%] z-10 flex -translate-y-1/2 flex-col items-center px-4 sm:top-[46%]">
          <p className="splash-metal-text min-h-[1.4em] text-center font-game text-lg font-bold tracking-wide sm:text-2xl md:text-3xl lg:text-4xl">
            {typing.lineIndex === 0
              ? typeLines[0].slice(0, typing.charIndex)
              : typeLines[0]}
            {typing.lineIndex === 0 && !typing.done && <span className="splash-caret">&nbsp;</span>}
          </p>
          <p className="splash-metal-text mt-2 min-h-[1.3em] text-center font-game text-base font-semibold tracking-wider sm:mt-3 sm:text-xl md:text-2xl lg:text-3xl">
            {typing.lineIndex >= 1 ? typeLines[1].slice(0, typing.charIndex) : ''}
            {typing.lineIndex >= 1 && !typing.done && <span className="splash-caret">&nbsp;</span>}
            {typing.done && <span className="splash-caret">&nbsp;</span>}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 rounded-none bg-linear-to-t from-black/80 via-black/35 to-transparent px-4 pb-8 pt-20 sm:px-8 sm:pb-10">
          <p className="splash-metal-text mx-auto max-w-3xl text-center font-game text-base font-semibold leading-relaxed tracking-wide sm:text-xl md:text-2xl">
            {isUr
              ? ur.splashBlurb
              : 'Four company assets are exposed. Spot the prime target the hacker hits first.'}
          </p>
          <span
            className="splash-bar mt-5 block h-1 w-full origin-left rounded-none bg-sky-400"
            onAnimationEnd={() => setSplashReady(true)}
          />
          {splashReady && (
            <button
              type="button"
              onClick={() => setPhase('play')}
              className="game-pop mx-auto mt-5 flex min-h-12 w-full max-w-xs cursor-pointer items-center justify-center rounded-xl bg-sky-400 px-8 font-game text-lg font-bold tracking-wider text-slate-900 hover:bg-sky-300 sm:min-h-14 sm:text-xl md:text-2xl"
            >
              {t('playNow')}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'play') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#02161c] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.16),transparent_48%),radial-gradient(ellipse_at_50%_100%,rgba(6,78,59,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(34,211,238,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />
        <BinaryRain columns={12} />

        <header className="relative z-30 mx-3 mt-3 flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/35 bg-slate-950/75 px-3 py-2 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md sm:mx-5 sm:px-5">
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
              <div className="relative flex size-9 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/55">
                <Shield className="size-5 text-cyan-300" />
                <Lock className="absolute size-2.5 text-cyan-50" />
              </div>
              <div>
                <h1 className="font-game text-[10px] font-bold tracking-[0.16em] text-white sm:text-sm md:text-base">
                  {isUr ? ur.secureTheNetwork : 'SECURE THE NETWORK'}
                </h1>
                <p className="hidden font-mono text-[9px] tracking-[0.2em] text-cyan-400/70 sm:block">
                  {isUr ? ur.hackersTargetBoard : "HACKER'S TARGET BOARD"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <LangToggleGame />
            <span className="rounded-lg border border-cyan-400/40 bg-cyan-950/40 px-2.5 py-1.5 font-mono text-[10px] text-cyan-200 sm:text-xs">
              {t('timer')}: {timer}
            </span>
            <span className="rounded-lg border border-cyan-400/40 bg-cyan-950/40 px-2.5 py-1.5 font-mono text-[10px] text-cyan-200 sm:text-xs">
              {t('score')}: {score} pts
            </span>
            <span className="rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-cyan-300 sm:text-xs">
              {isUr ? ur.statusActive : 'LEVEL: 01 / STATUS: ACTIVE'}
            </span>
          </div>
        </header>

        <div className="relative z-20 flex min-h-0 flex-1">
          <aside className="relative hidden w-16 shrink-0 flex-col items-center gap-3 border-r border-cyan-500/15 py-4 md:flex lg:w-24">
            <BinaryRain columns={3} />
            <div className="relative z-10 flex w-full flex-col gap-2 px-2">
              <HoloStat label={t('timer')} value={timer} />
              <HoloStat label={t('score')} value={`${score}`} />
            </div>
            <p className="htb-code-stream relative z-10 mt-auto px-1 font-mono text-[9px] text-cyan-400/50">
              LIVE STATUS : / LEVEL 01
            </p>
          </aside>

          <main className="relative flex min-w-0 flex-1 flex-col px-3 pb-2 pt-3 sm:px-6 sm:pt-4">
            <p className="relative z-20 mx-auto max-w-3xl text-center text-base font-semibold leading-snug text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.45)] sm:text-xl md:text-2xl lg:text-3xl">
              {isUr ? ur.playPrompt : TYPE_LINES_EN[0]}
            </p>

            <div className="relative z-20 mx-auto mt-2 flex w-full max-w-5xl flex-1 flex-col items-center justify-end">
              <div className="relative z-30 mb-2 flex w-full max-w-4xl justify-center gap-2 px-1 sm:mb-4 sm:gap-4 md:gap-5">
                {assets.map((asset, i) => {
                  const arc = ARC[i]
                  const isWrong = wrongIds.includes(asset.id)
                  const isCorrectPick = picked === asset.id && asset.correct
                  const disabled = locked || isWrong
                  return (
                    <div
                      key={asset.id}
                      style={{ transform: `rotate(${arc.rotate}) translateY(${arc.y})` }}
                      className="w-[23%] max-w-[9.5rem] sm:w-40 sm:max-w-none"
                    >
                      <button
                        type="button"
                        onClick={() => choose(asset)}
                        disabled={disabled}
                        style={{ animationDelay: `${100 * i}ms` }}
                        className={`game-pop group relative w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`htb-holo-card htb-panel-glow flex aspect-square w-full flex-col items-center justify-center rounded-xl bg-cyan-950/35 backdrop-blur-sm transition duration-200 ${
                            isCorrectPick
                              ? 'border border-emerald-400/80 shadow-[0_0_28px_rgba(52,211,153,0.45)]'
                              : isWrong
                                ? 'border border-rose-400/70 opacity-55 shadow-[0_0_18px_rgba(251,113,133,0.28)]'
                                : 'border border-cyan-400/45 group-hover:border-cyan-300 group-hover:bg-cyan-500/15 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.35)]'
                          }`}
                        >
                          <img
                            src={asset.src}
                            alt=""
                            className="relative z-10 h-[68%] w-[68%] object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                          />
                          {isCorrectPick && (
                            <img
                              src={shield}
                              alt=""
                              className="game-pulse absolute inset-0 z-20 m-auto h-[88%] w-[88%] object-contain"
                            />
                          )}
                        </div>
                        <span className="mt-2 block text-center font-game text-[8px] font-bold uppercase leading-tight tracking-[0.12em] text-cyan-100 sm:text-[10px] md:text-xs">
                          {asset.label}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="pointer-events-none relative z-10 flex w-full justify-center">
                <div className="absolute inset-x-[10%] bottom-[8%] h-16 rounded-[100%] bg-cyan-400/20 blur-2xl sm:h-24" />
                <img
                  src={hacker}
                  alt=""
                  className="relative h-[38vh] max-h-[420px] w-auto object-contain object-bottom drop-shadow-[0_0_30px_rgba(34,211,238,0.35)] mix-blend-lighten sm:h-[44vh]"
                />
              </div>
            </div>
          </main>

          <aside className="relative hidden w-16 shrink-0 flex-col items-center gap-3 border-l border-cyan-500/15 py-4 md:flex lg:w-24">
            <BinaryRain columns={3} />
            <div className="relative z-10 flex w-full flex-col gap-2 px-2">
              <HoloStat label="LEVEL" value="01" />
              <HoloStat label="STATUS" value="ACTIVE" />
            </div>
            <p className="htb-code-stream relative z-10 mt-auto px-1 font-mono text-[9px] text-cyan-400/50">
              LEVEL INFO / TARGET SELECT
            </p>
          </aside>
        </div>

        {feedback && (
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 sm:bottom-6">
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
      </div>
    )
  }

  return null
}
