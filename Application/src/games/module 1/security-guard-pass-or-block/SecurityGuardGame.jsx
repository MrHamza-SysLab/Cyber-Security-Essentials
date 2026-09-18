import { ArrowLeft, Check, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import office from '../../../assets/games/security-guard-pass-or-block/bg-branch.png'
import encryptedFile from '../../../assets/games/security-guard-pass-or-block/item-encrypted-file.png'
import lockedPhone from '../../../assets/games/security-guard-pass-or-block/item-locked-phone.png'
import splash from '../../../assets/games/security-guard-pass-or-block/splash-copy.png'
import sticky from '../../../assets/games/security-guard-pass-or-block/item-sticky-password.png'
import unlockedLaptop from '../../../assets/games/security-guard-pass-or-block/item-unlocked-laptop.png'
import usb from '../../../assets/games/security-guard-pass-or-block/item-usb.png'
import { LangToggleGame } from '../../../components/LangToggle'
import { useLanguage } from '../../../i18n/LanguageContext'
import { SECURITY_GUARD_UR } from '../../../i18n/module1'
import { usePointerDrag } from '../shared/usePointerDrag'

const ITEMS_BASE = [
  {
    id: 'laptop',
    label: 'Unlocked laptop',
    question: 'An unlocked laptop is sitting on the desk. Does it belong in the Secure Zone or the Risk Area?',
    zone: 'risk',
    src: unlockedLaptop,
  },
  {
    id: 'file',
    label: 'Encrypted file',
    question: 'This file is encrypted. Should it go to the Secure Zone or the Risk Area?',
    zone: 'secure',
    src: encryptedFile,
  },
  {
    id: 'sticky',
    label: 'Password on a sticky note',
    question: 'A password is written on a sticky note. Secure Zone or Risk Area?',
    zone: 'risk',
    src: sticky,
  },
  {
    id: 'usb',
    label: 'Unknown USB stick',
    question: 'An unknown USB stick was left at reception. Where should it go?',
    zone: 'risk',
    src: usb,
  },
  {
    id: 'phone',
    label: 'Locked work phone',
    question: 'This work phone is locked. Is it a secure item or a risk?',
    zone: 'secure',
    src: lockedPhone,
  },
]

const ROUND_SECONDS = 45
const TOTAL_SCORE = 100
const POINTS = TOTAL_SCORE / ITEMS_BASE.length

export default function SecurityGuardGame({ onExit }) {
  const { t, isUr } = useLanguage()
  const ur = SECURITY_GUARD_UR

  const items = useMemo(
    () =>
      ITEMS_BASE.map((item) => {
        const copy = ur.items[item.id]
        return {
          ...item,
          label: isUr && copy ? copy.label : item.label,
          question: isUr && copy ? copy.question : item.question,
        }
      }),
    [isUr, ur],
  )

  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(ROUND_SECONDS)
  const [flash, setFlash] = useState(null)
  const [busy, setBusy] = useState(false)
  const [answers, setAnswers] = useState([])
  const [splashReady, setSplashReady] = useState(false)

  const item = items[index]
  const playing = phase === 'play' && !busy
  const secureLabel = isUr ? ur.secureZone : 'SECURE ZONE'
  const riskLabel = isUr ? ur.riskArea : 'RISK AREA'

  const { drag, start } = usePointerDrag(({ zoneId }) => {
    if (!zoneId || !playing) return
    decide(zoneId)
  })

  useEffect(() => {
    if (!playing) return undefined
    if (seconds <= 0) {
      setPhase('result')
      return undefined
    }
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [playing, seconds])

  function decide(zone) {
    if (!playing || !item) return
    setBusy(true)
    const ok = zone === item.zone
    setFlash(ok ? 'ok' : 'bad')
    if (ok) {
      setCorrect((value) => value + 1)
      setScore((value) => value + POINTS)
    }
    setAnswers((list) => [...list, { id: item.id, picked: zone, ok }])
    window.setTimeout(() => {
      setFlash(null)
      setBusy(false)
      if (index + 1 >= items.length) setPhase('result')
      else setIndex((value) => value + 1)
    }, 480)
  }

  function restart() {
    setIndex(0)
    setCorrect(0)
    setScore(0)
    setSeconds(ROUND_SECONDS)
    setFlash(null)
    setBusy(false)
    setAnswers([])
    setPhase('play')
  }

  const clock = `00:${String(Math.max(0, seconds)).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-white">
      <img src={office} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-[#123044]/20" />

      {phase === 'intro' && (
        <div className="absolute inset-0 z-40 overflow-hidden bg-black">
          <img
            src={splash}
            alt={isUr ? ur.titleFull : 'Pass or Block'}
            className="absolute inset-0 size-full object-cover object-center"
          />
          <div className="absolute end-4 top-4 z-30">
            <LangToggleGame />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/80 via-black/35 to-transparent px-4 pb-8 pt-20 sm:px-8 sm:pb-10">
            <p className="mx-auto max-w-2xl text-center text-sm font-semibold leading-relaxed text-white drop-shadow sm:text-lg">
              {isUr ? ur.introTip : 'Drag each item into the Secure Zone or the Risk Area. 5 items, 100 points, 45 seconds.'}
            </p>
            <span
              className="splash-bar mt-5 block h-1 w-full origin-left rounded-full bg-cyan-400 rtl:origin-right"
              onAnimationEnd={() => setSplashReady(true)}
            />
            {splashReady && (
              <button
                type="button"
                onClick={() => setPhase('play')}
                className="game-pop mx-auto mt-5 flex min-h-12 w-full max-w-xs cursor-pointer items-center justify-center rounded-xl bg-cyan-400 px-8 text-base font-bold text-slate-900 hover:bg-cyan-300 sm:min-h-14 sm:text-lg"
              >
                {t('playNow')}
              </button>
            )}
          </div>
        </div>
      )}

      {phase !== 'intro' && (
        <div className="relative z-10 flex h-dvh max-h-dvh flex-col">
          <header className="grid shrink-0 grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1fr)] items-center gap-2 bg-[#16384d]/92 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,20,40,0.35)] sm:gap-4 sm:px-6 sm:py-3">
            <h1
              className={`min-w-0 text-sm font-bold sm:text-lg lg:text-xl ${
                isUr
                  ? 'leading-[1.9] text-cyan-200'
                  : 'truncate bg-linear-to-b from-cyan-100 to-cyan-400 bg-clip-text tracking-wide text-transparent'
              }`}
            >
              <span className="sm:hidden">{isUr ? ur.title : 'Pass or Block'}</span>
              <span className="hidden sm:inline">{isUr ? ur.titleFull : 'Security Guard: Pass or Block'}</span>
            </h1>
            <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-8">
              <p className="shrink-0 text-[11px] font-semibold text-cyan-50 sm:text-sm lg:text-base">
                {t('score')}: <span className="tabular-nums">{score}/{TOTAL_SCORE}</span>
              </p>
              <p className="shrink-0 text-[11px] font-semibold text-cyan-50 sm:text-sm lg:text-base">
                {t('timer')}: <span className="tabular-nums">{clock}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="hidden shrink-0 text-sm font-semibold text-cyan-50 md:inline lg:text-base">
                  {isUr ? ur.securityScore : 'Security Score'}:
                </span>
                <div
                  className="flex items-center gap-1 sm:w-36 sm:gap-1.5 lg:w-48"
                  aria-label={`Security score ${correct} of ${items.length}`}
                >
                  {items.map((_, i) => (
                    <span
                      key={i}
                      className={`size-2 shrink-0 rounded-full sm:h-3.5 sm:w-auto sm:min-w-0 sm:flex-1 sm:rounded-[3px] ${
                        i < correct ? 'bg-cyan-300' : 'bg-cyan-950/80 ring-1 ring-cyan-400/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 rtl:ml-0 rtl:mr-auto">
              <LangToggleGame />
              <button
                type="button"
                onClick={onExit}
                className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-cyan-50 hover:bg-white/10 sm:min-h-10 sm:px-3 sm:text-sm"
              >
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t('exit')}
              </button>
            </div>
          </header>

          {phase === 'play' && item && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pt-10 sm:px-6 sm:pt-14 md:pt-16">
                <p className="rounded-2xl bg-[#16384d]/88 px-4 py-3 text-center text-sm font-semibold leading-snug text-white shadow-[0_8px_24px_rgba(0,20,40,0.28)] ring-1 ring-cyan-200/25 sm:px-6 sm:py-3.5 sm:text-lg">
                  {item.question}
                </p>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)_auto] items-center gap-3 overflow-visible p-3 sm:gap-4 sm:p-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)_minmax(0,0.8fr)] md:grid-rows-1 md:px-6">
                <div className="col-span-2 flex min-h-0 items-center justify-center md:col-span-1 md:col-start-2">
                  <button
                    type="button"
                    onPointerDown={(event) => start(event, { id: item.id })}
                    className={`cursor-grab touch-none ${flash === 'bad' ? 'game-shake' : 'game-pop'}`}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="h-[min(38vh,240px)] w-[min(38vh,240px)] object-contain drop-shadow-[0_16px_32px_rgba(0,40,80,0.45)] sm:h-[min(48vh,420px)] sm:w-[min(48vh,420px)] md:h-[min(62vh,640px)] md:w-[min(62vh,640px)] lg:h-[min(68vh,720px)] lg:w-[min(68vh,720px)]"
                    />
                  </button>
                </div>

                <Zone
                  id="secure"
                  label={secureLabel}
                  active={flash === 'ok'}
                  onClick={() => decide('secure')}
                  className="md:col-start-1 md:row-start-1"
                />

                <Zone
                  id="risk"
                  label={riskLabel}
                  danger
                  active={flash === 'bad'}
                  onClick={() => decide('risk')}
                  className="md:col-start-3 md:row-start-1"
                />
              </div>
            </div>
          )}

          {phase === 'result' && (
            <ResultBoard
              score={score}
              answers={answers}
              items={items}
              secureLabel={isUr ? ur.secureZone : 'Secure Zone'}
              riskLabel={isUr ? ur.riskArea : 'Risk Area'}
              onRetry={restart}
              onExit={onExit}
            />
          )}
        </div>
      )}

      {drag && item && phase === 'play' && (
        <img
          src={item.src}
          alt=""
          className="pointer-events-none fixed z-50 h-44 w-44 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-56 sm:w-56 md:h-72 md:w-72"
          style={{ left: drag.x, top: drag.y }}
        />
      )}
    </div>
  )
}

function ResultBoard({ score, answers, items, secureLabel, riskLabel, onRetry, onExit }) {
  const { t, isUr } = useLanguage()
  const ur = SECURITY_GUARD_UR
  const [shown, setShown] = useState(0)
  const [selected, setSelected] = useState(null)
  const passed = score >= 80

  function zoneName(zone) {
    return zone === 'secure' ? secureLabel : riskLabel
  }

  const rank = isUr
    ? score === 100
      ? ur.ranks.perfect
      : passed
        ? ur.ranks.cleared
        : score >= 40
          ? ur.ranks.needsRound
          : ur.ranks.missed
    : score === 100
      ? 'Perfect guard'
      : passed
        ? 'Zone cleared'
        : score >= 40
          ? 'Needs another round'
          : 'Guard missed the shift'

  const tip =
    score === 100
      ? isUr
        ? ur.tipPerfect
        : 'Every item was sorted right. Unlocked devices, sticky passwords, and unknown USBs stay in the Risk Area.'
      : isUr
        ? ur.tipReview
        : 'Tap any item below to see where it belonged. Unlocked laptops, sticky passwords, and unknown USBs go to the Risk Area.'

  useEffect(() => {
    let value = 0
    const step = Math.max(1, Math.round(score / 20))
    const timer = window.setInterval(() => {
      value = Math.min(score, value + step)
      setShown(value)
      if (value >= score) window.clearInterval(timer)
    }, 28)
    return () => window.clearInterval(timer)
  }, [score])

  const review = items.map((item) => {
    const answer = answers.find((entry) => entry.id === item.id)
    return {
      ...item,
      picked: answer?.picked ?? null,
      ok: Boolean(answer?.ok),
      skipped: !answer,
    }
  })

  const okCount = answers.filter((entry) => entry.ok).length

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-6">
      <div className="game-pop w-full max-w-3xl rounded-3xl bg-[#16384d]/95 p-5 shadow-[0_24px_60px_rgba(0,20,40,0.45)] ring-1 ring-cyan-200/30 sm:p-7">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
          <ScoreRing score={score} shown={shown} passed={passed} />
          <div className="min-w-0 flex-1 text-center sm:text-start">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">{t('debrief')}</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{rank}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cyan-100 sm:text-base">{tip}</p>
            <p className="mt-3 text-sm font-semibold text-cyan-50">
              {isUr
                ? `${items.length} میں سے ${okCount} اشیاء درست چھانٹیں · ہر ایک ${POINTS} پوائنٹس`
                : `${okCount}/${items.length} items sorted right · ${POINTS} pts each`}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
          {review.map((item) => {
            const open = selected === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(open ? null : item.id)}
                className={`cursor-pointer rounded-2xl p-2 text-start ring-1 transition sm:p-3 ${
                  item.ok
                    ? 'bg-emerald-400/10 ring-emerald-300/40 hover:bg-emerald-400/16'
                    : 'bg-red-400/10 ring-red-300/35 hover:bg-red-400/16'
                } ${open ? 'scale-[1.03] ring-2' : ''}`}
              >
                <div className="relative">
                  <img src={item.src} alt="" className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20" />
                  <span
                    className={`absolute -top-1 -end-1 grid size-5 place-items-center rounded-full ${
                      item.ok ? 'bg-emerald-400 text-slate-900' : 'bg-red-400 text-white'
                    }`}
                  >
                    {item.ok ? <Check className="size-3.5 stroke-[3]" /> : <X className="size-3.5 stroke-[3]" />}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-center text-[11px] font-semibold leading-tight sm:text-xs">{item.label}</p>
                {open && (
                  <p className="mt-2 text-center text-[11px] leading-snug text-cyan-50">
                    {item.skipped
                      ? isUr
                        ? `وقت ختم۔ درست: ${zoneName(item.zone)}`
                        : `Time ran out. Correct: ${zoneName(item.zone)}`
                      : item.ok
                        ? isUr
                          ? `درست — ${zoneName(item.zone)}`
                          : `Correct — ${zoneName(item.zone)}`
                        : isUr
                          ? `آپ نے ${zoneName(item.picked)} چنا۔ درست: ${zoneName(item.zone)}`
                          : `You chose ${zoneName(item.picked)}. Correct: ${zoneName(item.zone)}`}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 text-sm font-bold text-slate-900 hover:bg-cyan-300"
          >
            <RotateCcw className="size-4" />
            {t('playAgain')}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10"
          >
            {t('backToModule')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ScoreRing({ score, shown, passed }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circ)
  const color = score === 100 ? '#22ff55' : passed ? '#22d3ee' : '#ff6b6b'

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOffset(circ * (1 - score / TOTAL_SCORE))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [score, circ])

  return (
    <div className="relative grid size-36 shrink-0 place-items-center sm:size-40">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(125,211,252,0.18)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="score-ring"
        />
      </svg>
      <p className="absolute text-center">
        <span className="block text-3xl font-extrabold tabular-nums sm:text-4xl">{shown}</span>
        <span className="text-xs font-semibold tracking-wide text-cyan-200">/ {TOTAL_SCORE}</span>
      </p>
    </div>
  )
}

function Zone({ id, label, danger, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      data-drop-id={id}
      aria-label={label}
      onClick={onClick}
      className={`flex h-28 w-full min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-[26px] transition sm:h-36 sm:gap-2 md:aspect-square md:h-auto md:max-h-[280px] md:w-full md:max-w-[280px] md:justify-self-center ${
        danger ? 'zone-risk' : 'zone-secure'
      } ${active ? 'scale-[1.03]' : ''} ${className}`}
    >
      {danger ? <RiskIcon /> : <LockIcon />}
      <span className="text-[11px] font-extrabold tracking-[0.14em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] sm:text-sm md:text-lg">
        {label}
      </span>
    </button>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 64 64" className="size-10 sm:size-14 md:size-20" aria-hidden="true">
      <path
        d="M20 28.5V22a12 12 0 0 1 24 0v6.5"
        fill="none"
        stroke="#22ff55"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="12" y="27" width="40" height="30" rx="8" fill="#22ff55" />
      <circle cx="32" cy="42" r="5.5" fill="#14532d" />
      <rect x="30" y="42" width="4" height="8" rx="1.5" fill="#14532d" />
    </svg>
  )
}

function RiskIcon() {
  return (
    <svg viewBox="0 0 64 64" className="size-10 sm:size-14 md:size-20" aria-hidden="true">
      <path
        d="M32 6c8 6 18 8 24 9v18c0 14-10 24-24 29C18 57 8 47 8 33V15c6-1 16-3 24-9Z"
        fill="none"
        stroke="#ff3b3b"
        strokeWidth="5"
      />
      <path d="M32 20v16" stroke="#ff3b3b" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="44" r="3.2" fill="#ff3b3b" />
    </svg>
  )
}
