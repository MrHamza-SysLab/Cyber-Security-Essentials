import { Outlet } from 'react-router-dom'


export default function Layout() {
  return (
    <div className="min-h-dvh bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
      <main id="main">
        <Outlet />
      </main>
    </div>
  )
}
