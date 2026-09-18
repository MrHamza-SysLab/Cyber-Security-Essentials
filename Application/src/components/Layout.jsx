import { Outlet } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function Layout() {
  const { t } = useLanguage()

  return (
    <div className="min-h-dvh bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
      >
        {t('skipToMain')}
      </a>
      <main id="main">
        <Outlet />
      </main>
    </div>
  )
}
