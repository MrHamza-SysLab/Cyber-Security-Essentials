import { useLanguage } from '../i18n/LanguageContext'

/** Compact EN | اردو toggle — matches AML academy pattern. */
export default function LangToggle({ className = '', size = 'md' }) {
  const { isUr, setLang, t } = useLanguage()
  const pad = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`cursor-pointer rounded-md font-semibold transition ${pad} ${
          !isUr ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        {t('langSwitchToEn')}
      </button>
      <button
        type="button"
        onClick={() => setLang('ur')}
        className={`cursor-pointer rounded-md font-semibold transition ${pad} ${
          isUr ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'
        }`}
        style={isUr ? undefined : { fontFamily: "'Noto Nastaliq Urdu', sans-serif" }}
      >
        {t('langSwitchToUr')}
      </button>
    </div>
  )
}

/** Dark/game HUD variant. */
export function LangToggleGame({ className = '' }) {
  const { isUr, setLang, t } = useLanguage()

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-white/20 bg-black/30 p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold transition ${
          !isUr ? 'bg-cyan-400 text-slate-900' : 'text-cyan-100 hover:bg-white/10'
        }`}
      >
        {t('langSwitchToEn')}
      </button>
      <button
        type="button"
        onClick={() => setLang('ur')}
        className={`cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold transition ${
          isUr ? 'bg-cyan-400 text-slate-900' : 'text-cyan-100 hover:bg-white/10'
        }`}
      >
        {t('langSwitchToUr')}
      </button>
    </div>
  )
}
