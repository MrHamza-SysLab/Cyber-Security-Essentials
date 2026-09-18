import { useEffect, useMemo, useState } from 'react'
import splash from '../../../assets/games/threat-spotter-catch-the-impostor/splash.jpg'
import { LangToggleGame } from '../../../components/LangToggle'
import { useLanguage } from '../../../i18n/LanguageContext'
import { THREAT_SPOTTER_UR } from '../../../i18n/module1'
import PhishingDefender from './PhishingDefender/App'

const HACK_DURATION_MS = 5000

const DESC_LINES_EN = [
  'INTRUSION DETECTED',
  'Hacker ne ye attacks fire kiye:',
  '• Phishing — fake payroll / login links',
  '• Ransomware — encrypt & ransom pop-ups',
  '• Spoofed reset — loo-alike domains',
  '• BEC / CEO fraud — urgent money asks',
  'Sanitize the inbox. Catch every impostor.',
]

function useTypewriter(lines, { start = true, charMs = 28, linePauseMs = 320 } = {}) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!start) return undefined
    setLineIndex(0)
    setCharIndex(0)
    setDone(false)
    return undefined
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

function BinaryRain({ columns = 10, stopAfterMs = HACK_DURATION_MS }) {
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
    const timer = window.setTimeout(() => setRunning(false), stopAfterMs)
    return () => window.clearTimeout(timer)
  }, [stopAfterMs])

  // Small left inset — still slightly right of the edge, with room for an extra column
  const leftOffsetPct = 4
  const usableWidthPct = 100 - leftOffsetPct

  return (
    <div className="binary-rain absolute inset-0 overflow-hidden font-mono text-sm leading-[1.2] text-cyan-300/90 sm:text-base md:text-lg">
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

function ThreatSpotterSplash({ onPlay }) {
  const { t, isUr } = useLanguage()
  const ur = THREAT_SPOTTER_UR
  const descLines = useMemo(() => (isUr ? ur.DESC_LINES : DESC_LINES_EN), [isUr, ur])

  const [showBrief, setShowBrief] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const typing = useTypewriter(descLines, { start: showBrief })

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
        src={splash}
        alt="Threat Spotter: Catch the Impostor"
        className="absolute inset-0 size-full rounded-none object-cover object-center"
      />

      <div className="absolute end-4 top-4 z-30">
        <LangToggleGame />
      </div>

      {/* Left — wall monitors: binary hack animation */}
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

      {/* Right — server glass: typed attack brief after 5s */}
      {showBrief && (
        <div
          className={`game-pop ${boxClass} right-[2%] top-[14%] flex flex-col bg-slate-950/70 p-3 backdrop-blur-[2px] sm:right-[3%] sm:p-4 md:right-[4%]`}
        >
          <p className="mb-2 font-mono text-xs font-bold tracking-[0.22em] text-cyan-400/80 sm:text-sm md:text-base">
            ATTACK BRIEF // SOC
          </p>
          <div className="flex-1 space-y-2 overflow-y-auto font-mono text-sm leading-snug text-cyan-50 sm:text-base md:text-lg">
            {descLines.map((line, index) => {
              if (index > typing.lineIndex) return null
              const shown =
                index < typing.lineIndex ? line : line.slice(0, typing.charIndex)
              const isTitle = index === 0
              return (
                <p
                  key={`${index}-${line}`}
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
              {isUr ? ur.identifyNow : t('playNow')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ThreatSpotterGame({ onExit }) {
  const [phase, setPhase] = useState('intro')

  if (phase === 'intro') {
    return <ThreatSpotterSplash onPlay={() => setPhase('play')} />
  }

  return <PhishingDefender onExit={onExit} />
}
