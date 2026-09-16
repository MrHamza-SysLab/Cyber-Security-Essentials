import { useEffect, useMemo, useState } from 'react'

const HACK_DURATION_MS = 5000

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
export default function CyberSplash({
  image,
  title,
  lines,
  cta = 'ENGAGE',
  onPlay,
  alt = 'Mission splash',
}) {
  const [showBrief, setShowBrief] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const typing = useTypewriter(lines, { start: showBrief })

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

      <div className={`${boxClass} left-[2%] top-[14%] sm:left-[3%] md:left-[4%]`}>
        <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" />
        <BinaryRain columns={10} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-cyan-950/80 to-transparent p-3 sm:p-4">
          <p className="font-mono text-sm font-bold tracking-[0.2em] text-cyan-300 sm:text-base md:text-lg">
            DECRYPTING…
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-cyan-950">
            <span className="splash-hack-bar block h-full origin-left bg-cyan-400" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 scanline opacity-60" />
      </div>

      {showBrief && (
        <div
          className={`game-pop ${boxClass} right-[2%] top-[14%] flex flex-col bg-slate-950/70 p-3 backdrop-blur-[2px] sm:right-[3%] sm:p-4 md:right-[4%]`}
        >
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.22em] text-cyan-400/80 sm:text-sm md:text-base">
            ATTACK BRIEF // SOC
          </p>
          <div className="flex-1 space-y-2 overflow-y-auto font-mono text-sm leading-snug text-cyan-50 sm:text-base md:text-lg">
            {lines.map((line, index) => {
              if (index > typing.lineIndex) return null
              const shown = index < typing.lineIndex ? line : line.slice(0, typing.charIndex)
              const isTitle = index === 0
              return (
                <p
                  key={line}
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
              {cta}
            </button>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
        <p className="rounded-full border border-cyan-400/30 bg-slate-950/60 px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-cyan-300/80 backdrop-blur sm:text-xs">
          {title}
        </p>
      </div>
    </div>
  )
}

export function CyberHud({ title, score, onExit, children, status }) {
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
          ← Exit
        </button>
        <div className="text-center">
          <h1 className="font-game text-[10px] font-bold tracking-[0.16em] text-white sm:text-sm md:text-base">
            {title}
          </h1>
          {status && (
            <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-400/70">{status}</p>
          )}
        </div>
        <div className="min-w-16 text-right font-mono text-xs text-emerald-300">
          {score != null && <span>{score} XP</span>}
        </div>
      </header>

      <div className="relative z-20 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
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
