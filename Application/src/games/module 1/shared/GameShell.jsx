import { ArrowLeft } from 'lucide-react'
import { LangToggleGame } from '../../../components/LangToggle'
import { useLanguage } from '../../../i18n/LanguageContext'

export default function GameShell({ title, score, extra, onExit, children }) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b14] text-white">
      <div className="matrix-grid pointer-events-none absolute inset-0 opacity-80" />
      <header className="relative z-10 flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-4 backdrop-blur">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t('exit')}
        </button>
        <h1 className="truncate text-center text-sm font-semibold sm:text-base">{title}</h1>
        <div className="flex min-w-16 items-center justify-end gap-3 font-mono text-xs text-emerald-300">
          <LangToggleGame />
          {extra}
          {score != null && <span>{score} XP</span>}
        </div>
      </header>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

export function IntroCard({ image, speaker, text, onStart, cta }) {
  const { t } = useLanguage()
  const label = cta ?? t('startDrill')

  return (
    <div className="flex flex-1 items-end justify-center p-4 sm:items-center">
      <div className="game-pop flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur sm:flex-row sm:items-end">
        {image && (
          <img src={image} alt="" className="game-float h-44 w-auto object-contain sm:h-56" />
        )}
        <div className="flex-1 text-center sm:text-start">
          {speaker && <p className="font-mono text-[11px] tracking-[0.18em] text-emerald-300">{speaker}</p>}
          <p className="mt-2 text-sm leading-relaxed text-slate-100">{text}</p>
          <button
            type="button"
            onClick={onStart}
            className="mt-4 inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ResultCard({ passed, title, detail, score, onRetry, onExit }) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="game-pop w-full max-w-md rounded-3xl bg-white/5 p-6 text-center ring-1 ring-white/10">
        <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-300">{t('debrief').toUpperCase()}</p>
        <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-300">{detail}</p>
        <p className="mt-4 font-mono text-emerald-300">
          {score} XP
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {!passed && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white"
            >
              {t('retry')}
            </button>
          )}
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-5 text-sm ring-1 ring-white/20"
          >
            {t('backToModule')}
          </button>
        </div>
      </div>
    </div>
  )
}
