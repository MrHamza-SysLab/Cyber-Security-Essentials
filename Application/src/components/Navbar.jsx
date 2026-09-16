import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'HOME', end: true },
  { to: '/about', label: 'ABOUT US' },
  { to: '/courses', label: 'COURSES' },
  { to: '/games', label: 'GAMES' },
  { to: '/', label: 'TRAINING', id: 'training', end: false },
  { to: '/my-learning', label: 'MY LEARNING' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2" aria-label="iParhai home">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            i
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Parhai
          </span>
        </NavLink>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink
              key={link.id ?? link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) => {
                const training = link.id === 'training'
                const active = training || (isActive && link.id !== 'training' && link.to !== '/')
                const forceTraining = link.id === 'training'
                return `text-[13px] font-medium tracking-wide transition ${
                  forceTraining
                    ? 'border-b-2 border-brand pb-1 text-brand'
                    : active
                      ? 'text-navy'
                      : 'text-slate-600 hover:text-navy'
                }`
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            LOGOUT
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 cursor-pointer items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            ACCOUNT
          </button>
        </div>

        <button
          type="button"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((link) => (
              <NavLink
                key={link.id ?? link.label}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={`flex min-h-11 items-center rounded-lg px-3 text-sm ${
                  link.id === 'training' ? 'bg-orange-50 font-semibold text-brand' : 'text-slate-700'
                }`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 pb-2">
            <button
              type="button"
              className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-sm"
            >
              LOGOUT
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white"
            >
              ACCOUNT
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
