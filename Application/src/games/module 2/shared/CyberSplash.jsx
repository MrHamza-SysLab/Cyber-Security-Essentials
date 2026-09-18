import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import wrongChoiceAlarm from '../../../assets/games/social-engineering-trap-detector/wrong-choice-alarm.mp3'
import { LangToggleGame } from '../../../components/LangToggle'
import { BRIEFS_UR, HUD_UR, resolveGameId } from '../../../i18n/briefs.ur'
import { useLanguage } from '../../../i18n/LanguageContext'

const HACK_DURATION_MS = 5000

function playSirenBeep() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sawtooth'
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.value = 0.12

    const start = ctx.currentTime
    for (let step = 0; step < 5; step += 1) {
      oscillator.frequency.setValueAtTime(920, start + step * 0.28)
      oscillator.frequency.setValueAtTime(520, start + step * 0.28 + 0.14)
    }

    oscillator.start(start)
    oscillator.stop(start + 1.5)
    window.setTimeout(() => ctx.close(), 1600)
  } catch {
    // Audio may be blocked until user interaction.
  }
}

/** Module 2–style full-screen wrong-input alert (siren + TRY AGAIN). */
export function WrongChoiceOverlay({ feedback, onTryAgain }) {
  const { t } = useLanguage()
  const alarmRef = useRef(null)

  useEffect(() => {
    playSirenBeep()

    const alarm = new Audio(wrongChoiceAlarm)
    alarmRef.current = alarm
    const playPromise = alarm.play()
    if (playPromise?.catch) playPromise.catch(() => {})

    return () => {
      alarm.pause()
      alarm.src = ''
      alarmRef.current = null
    }
  }, [feedback])

  return (
    <div className="se-alarm-overlay fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 scanline opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(248,113,113,0.08)_0px,rgba(248,113,113,0.08)_2px,transparent_2px,transparent_6px)]" />

      <div className="se-alarm-card game-shake relative w-full max-w-xl overflow-hidden rounded-2xl border-2 border-rose-400/70 bg-slate-950/95 p-6 text-white shadow-[0_0_60px_rgba(248,113,113,0.45)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.22),transparent_55%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-rose-500/20 ring-2 ring-rose-400/60">
            <AlertTriangle className="size-8 animate-pulse text-rose-300" />
          </div>
          <p className="mt-4 font-mono text-xs tracking-[0.32em] text-rose-300">{t('securityAlert')}</p>
          <h2 className="mt-2 font-game text-3xl text-white sm:text-4xl">{t('wrongDecision')}</h2>
          <p className="mt-3 text-lg font-semibold text-cyan-200">{feedback.title}</p>
          <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-start text-sm leading-relaxed text-rose-100 sm:text-base">
            <span className="font-semibold text-rose-200">{t('whyWrong')}</span> {feedback.reason}
          </p>
          <button
            type="button"
            onClick={onTryAgain}
            className="mt-7 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-cyan-400 px-8 font-game text-sm tracking-wider text-slate-950 transition hover:bg-cyan-300 sm:text-base"
          >
            <RotateCcw className="size-4" />
            {t('tryAgain')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useTypewriter(lines, { start = true, charMs = 28, linePauseMs = 320 } = {}) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!start) return undefined
    setLineIndex(0)
    setCharIndex(0)
    setDone(false)
    return undefined
  }, [start])

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

export function BinaryRain({ columns = 10, stopAfterMs = HACK_DURATION_MS, className = '' }) {
  const [running, setRunning] = useState(true)
  const streams = useMemo(
    () =>
      Array.from({ length: columns }, (_, col) => ({
        id: col,
        delay: `${(col % 5) * 0.35}s`,
        duration: `${3.2 + (col % 4) * 0.45}s`,
        text: Array.from({ length: 56 }, () => (Math.random() > 0.5 ? '1' : '0')).join('\n'),
      })),
    [columns],
  )

  useEffect(() => {
    if (!stopAfterMs) return undefined
    const timer = window.setTimeout(() => setRunning(false), stopAfterMs)
    return () => window.clearTimeout(timer)
  }, [stopAfterMs])

  const leftOffsetPct = 4
  const usableWidthPct = 100 - leftOffsetPct

  return (
    <div
      className={`binary-rain absolute inset-0 overflow-hidden font-mono text-sm leading-[1.2] text-cyan-300/90 sm:text-base md:text-lg ${className}`}
    >
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="binary-rain-col absolute top-0 whitespace-pre"
          style={{
            left: `${leftOffsetPct + (stream.id / columns) * usableWidthPct}%`,
            width: `${usableWidthPct / columns}%`,
            animationDelay: stream.delay,
            animationDuration: stream.duration,
            animationPlayState: running ? 'running' : 'paused',
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

/**
 * Threat Spotter–style cinematic splash: full-bleed art + left decrypt panel + typed brief + CTA.
 */
const CENTER_HERO_TONES = {
  ice: {
    backdrop:
      'bg-[radial-gradient(ellipse_at_center,rgba(2,16,24,0.72)_0%,rgba(2,16,24,0.35)_55%,transparent_75%)]',
    lines: [
      {
        color: '#ecfeff',
        textShadow:
          '0 1px 0 rgba(8,47,73,0.55), 0 0 10px rgba(165,243,252,0.95), 0 0 28px rgba(34,211,238,0.65), 0 0 48px rgba(6,182,212,0.35)',
      },
      {
        color: '#67e8f9',
        textShadow:
          '0 1px 0 rgba(8,47,73,0.45), 0 0 8px rgba(103,232,249,0.85), 0 0 22px rgba(34,211,238,0.45)',
      },
      {
        color: '#5eead4',
        textShadow:
          '0 1px 0 rgba(8,47,73,0.45), 0 0 8px rgba(94,234,212,0.8), 0 0 24px rgba(45,212,191,0.4)',
      },
    ],
  },
  // Account Hijack splash: electric cyan HUD + dark navy (red reserved for alerts)
  cyan: {
    backdrop:
      'bg-[radial-gradient(ellipse_at_center,rgba(0,8,18,0.78)_0%,rgba(0,8,18,0.4)_55%,transparent_75%)]',
    lines: [
      {
        color: '#f0fdff',
        textShadow:
          '0 1px 0 rgba(0,20,40,0.7), 0 0 10px rgba(186,230,253,0.95), 0 0 26px rgba(34,211,238,0.75), 0 0 50px rgba(6,182,212,0.4)',
      },
      {
        color: '#22d3ee',
        textShadow:
          '0 1px 0 rgba(0,20,40,0.65), 0 0 10px rgba(34,211,238,0.95), 0 0 28px rgba(6,182,212,0.7), 0 0 44px rgba(8,145,178,0.35)',
      },
      {
        color: '#7dd3fc',
        textShadow:
          '0 1px 0 rgba(0,20,40,0.6), 0 0 8px rgba(125,211,252,0.9), 0 0 24px rgba(56,189,248,0.5)',
      },
    ],
  },
  // Permission Matrix splash: holographic cyan + emerald green
  emerald: {
    backdrop:
      'bg-[radial-gradient(ellipse_at_center,rgba(2,18,28,0.75)_0%,rgba(2,18,28,0.38)_55%,transparent_75%)]',
    lines: [
      {
        color: '#ecfeff',
        textShadow:
          '0 1px 0 rgba(8,47,73,0.55), 0 0 10px rgba(165,243,252,0.95), 0 0 28px rgba(34,211,238,0.65), 0 0 48px rgba(6,182,212,0.35)',
      },
      {
        color: '#22d3ee',
        textShadow:
          '0 1px 0 rgba(8,47,73,0.5), 0 0 10px rgba(34,211,238,0.95), 0 0 26px rgba(6,182,212,0.65)',
      },
      {
        color: '#34d399',
        textShadow:
          '0 1px 0 rgba(6,40,30,0.55), 0 0 10px rgba(52,211,153,0.9), 0 0 28px rgba(16,185,129,0.55), 0 0 44px rgba(5,150,105,0.3)',
      },
    ],
  },
}

export default function CyberSplash({
  image,
  title,
  lines,
  cta,
  onPlay,
  alt = 'Mission splash',
  /** Optional stacked neon title over the splash center (e.g. vault). */
  centerHero,
  /** Color preset matched to splash art: 'ice' | 'cyan' | 'emerald' */
  centerHeroTone = 'ice',
  /** When set, Urdu mode swaps BRIEF lines from briefs.ur.js */
  gameId,
}) {
  const { t, isUr } = useLanguage()
  const [showBrief, setShowBrief] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const resolvedId = resolveGameId({ gameId, lines, title })
  const resolvedLines = useMemo(() => {
    if (isUr && resolvedId && BRIEFS_UR[resolvedId]?.length) return BRIEFS_UR[resolvedId]
    return lines
  }, [isUr, resolvedId, lines])
  const typing = useTypewriter(resolvedLines, { start: showBrief })
  const heroTone = CENTER_HERO_TONES[centerHeroTone] ?? CENTER_HERO_TONES.ice
  const ctaLabel = cta ?? t('engage')
  const resolvedTitle =
    isUr && resolvedId && HUD_UR[resolvedId]?.title ? HUD_UR[resolvedId].title : title

  useEffect(() => {
    const timer = window.setTimeout(() => setShowBrief(true), HACK_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!typing.done) return undefined
    const timer = window.setTimeout(() => setCanPlay(true), 400)
    return () => window.clearTimeout(timer)
  }, [typing.done])

  const boxClass =
    'absolute z-10 h-[46%] w-[30%] overflow-hidden rounded-sm ring-1 ring-cyan-400/50 sm:top-[16%] sm:h-[44%] sm:w-[28%] md:w-[26%]'

  return (
    <div className="fixed inset-0 z-50 h-dvh w-screen overflow-hidden rounded-none bg-black text-white">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 size-full rounded-none object-cover object-center"
      />

      <div className="absolute end-4 top-4 z-40">
        <LangToggleGame />
      </div>

      {centerHero?.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
          <div className="relative flex -translate-y-[2%] flex-col items-center px-6 py-5 text-center leading-[0.95] select-none">
            <div aria-hidden className={`absolute inset-0 -z-10 rounded-full ${heroTone.backdrop}`} />
            {centerHero.map((line, index) => {
              const isTop = index === 0
              const twoLine = centerHero.length === 2
              const isMid = !twoLine && index === 1
              // For 2-line titles, use first + last palette colors (skip tiny mid size)
              const styleIndex = twoLine && index === 1 ? heroTone.lines.length - 1 : index
              const style = heroTone.lines[Math.min(styleIndex, heroTone.lines.length - 1)]
              const sizeClass = isTop
                ? 'text-[clamp(1.65rem,5.2vw,3.75rem)]'
                : isMid
                  ? 'text-[clamp(1.05rem,3.2vw,2.35rem)]'
                  : 'text-[clamp(1.35rem,4.2vw,3.1rem)]'
              return (
                <p
                  key={line}
                  className={`font-game font-black uppercase tracking-[0.12em] ${sizeClass}`}
                  style={style}
                >
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      )}

      <div className={`${boxClass} start-[2%] top-[14%] sm:start-[3%] md:start-[4%]`}>
        <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" />
        <BinaryRain columns={10} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-cyan-950/80 to-transparent p-3 sm:p-4">
          <p className="font-mono text-sm font-bold tracking-[0.2em] text-cyan-300 sm:text-base md:text-lg">
            {t('decrypting')}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-cyan-950">
            <span className="splash-hack-bar block h-full origin-left bg-cyan-400 rtl:origin-right" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 scanline opacity-60" />
      </div>

      {showBrief && (
        <div
          className={`game-pop ${boxClass} end-[2%] top-[14%] flex flex-col bg-slate-950/70 p-3 backdrop-blur-[2px] sm:end-[3%] sm:p-4 md:end-[4%]`}
        >
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.22em] text-cyan-400/80 sm:text-sm md:text-base">
            {t('attackBrief')}
          </p>
          <div className="flex-1 space-y-2 overflow-y-auto font-mono text-sm leading-snug text-cyan-50 sm:text-base md:text-lg">
            {resolvedLines.map((line, index) => {
              if (index > typing.lineIndex) return null
              const shown = index < typing.lineIndex ? line : line.slice(0, typing.charIndex)
              const isTitle = index === 0
              return (
                <p
                  key={`${index}-${line.slice(0, 12)}`}
                  className={
                    isTitle
                      ? 'font-game text-base font-bold tracking-wide text-cyan-300 sm:text-lg md:text-xl'
                      : index === 1
                        ? 'font-semibold text-slate-200'
                        : 'text-cyan-100/90'
                  }
                >
                  {shown}
                  {index === typing.lineIndex && !typing.done && (
                    <span className="splash-caret bg-cyan-300">&nbsp;</span>
                  )}
                </p>
              )
            })}
          </div>

          {canPlay && (
            <button
              type="button"
              onClick={onPlay}
              className="game-pop mt-3 flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-cyan-400 px-4 font-game text-base font-bold tracking-wider text-slate-950 hover:bg-cyan-300 sm:min-h-12 sm:text-lg"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
        <p className="rounded-full border border-cyan-400/30 bg-slate-950/60 px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-cyan-300/80 backdrop-blur sm:text-xs">
          {resolvedTitle}
        </p>
      </div>
    </div>
  )
}

export function CyberHud({ title, score, onExit, children, status, maxScore, gameId }) {
  const { t, isUr } = useLanguage()
  const xpPct =
    score != null && maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : null
  const resolvedId = resolveGameId({ gameId, title })
  const resolvedTitle =
    isUr && resolvedId && HUD_UR[resolvedId]?.title ? HUD_UR[resolvedId].title : title
  const resolvedStatus =
    isUr && resolvedId && HUD_UR[resolvedId]?.status ? HUD_UR[resolvedId].status : status

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#021018] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.14),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(127,29,29,0.18),transparent_45%)]" />
      <div className="matrix-grid pointer-events-none absolute inset-0 opacity-40" />

      <header className="relative z-30 mx-3 mt-3 flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/35 bg-slate-950/75 px-3 py-2 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md sm:mx-5 sm:px-5">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
        >
          ← {t('exit')}
        </button>
        <div className="text-center">
          <h1 className="font-game text-[10px] font-bold tracking-[0.16em] text-white sm:text-sm md:text-base">
            {resolvedTitle}
          </h1>
          {resolvedStatus && (
            <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-400/70">{resolvedStatus}</p>
          )}
        </div>
        <div className="flex min-w-16 items-center justify-end gap-2">
          <LangToggleGame />
          {score != null && xpPct != null && (
            <div className="hidden h-2 w-16 overflow-hidden rounded-full bg-slate-800 sm:block sm:w-24">
              <div
                className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          )}
          {score != null && (
            <span className="font-mono text-xs text-emerald-300">{score} XP</span>
          )}
        </div>
      </header>

      <div className="relative z-20 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

/** Localized "Back to module" control for game result screens. */
export function BackToModuleButton({ onClick, className = '' }) {
  const { t } = useLanguage()
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ||
        'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10'
      }
    >
      {t('backToModule')}
    </button>
  )
}

export function FeedbackToast({ tone = 'ok', title, detail, onClose }) {
  const styles =
    tone === 'ok'
      ? 'border-emerald-400/40 bg-emerald-950/90 text-emerald-100'
      : tone === 'warn'
        ? 'border-amber-400/40 bg-amber-950/90 text-amber-100'
        : 'border-rose-400/40 bg-rose-950/90 text-rose-100'

  return (
    <div
      className={`game-pop pointer-events-auto fixed bottom-6 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${styles}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-game text-sm font-bold tracking-wide">{title}</p>
          {detail && <p className="mt-1 text-xs leading-relaxed opacity-90">{detail}</p>}
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="cursor-pointer text-lg leading-none opacity-70">
            ×
          </button>
        )}
      </div>
    </div>
  )
}
