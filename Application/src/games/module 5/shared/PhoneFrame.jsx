/** Corporate smartphone chrome for Module 5 sims. */
export default function PhoneFrame({
  children,
  time = '9:41',
  indicators,
  notch = true,
  className = '',
  maxWidthClass = 'max-w-[340px]',
  screenClassName = 'bg-gradient-to-b from-slate-900 via-slate-950 to-black',
  statusClassName = 'text-white',
}) {
  return (
    <div
      className={`relative mx-auto w-full ${maxWidthClass} overflow-hidden rounded-[2.1rem] border-[3px] border-slate-600/80 bg-slate-950 shadow-[0_28px_80px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(148,163,184,0.15)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-y-8 -left-[3px] w-[3px] rounded-l bg-slate-500/50" />
      <div className="pointer-events-none absolute top-14 -right-[3px] h-12 w-[3px] rounded-r bg-slate-500/40" />
      <div className="pointer-events-none absolute top-28 -right-[3px] h-16 w-[3px] rounded-r bg-slate-500/40" />

      <div className={`relative z-20 flex h-11 items-end justify-between px-5 pb-1.5 ${statusClassName}`}>
        <span className="font-sans text-[12px] font-medium tracking-wide">{time}</span>
        {notch ? (
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        ) : (
          <div className="absolute left-1/2 top-2 size-3 -translate-x-1/2 rounded-full bg-black ring-1 ring-black/40" />
        )}
        <div className="flex items-center gap-1.5">
          {indicators}
          <span className="inline-flex h-2.5 w-5 items-end gap-px">
            <span className="h-1 w-0.5 rounded-sm bg-current opacity-80" />
            <span className="h-1.5 w-0.5 rounded-sm bg-current opacity-80" />
            <span className="h-2 w-0.5 rounded-sm bg-current opacity-80" />
            <span className="h-2.5 w-0.5 rounded-sm bg-current opacity-50" />
          </span>
          <span className="rounded-[3px] border border-current/70 px-1 py-px font-mono text-[8px] leading-none opacity-90">
            84%
          </span>
        </div>
      </div>

      <div className={`relative min-h-[560px] ${screenClassName}`}>{children}</div>

      <div className="absolute bottom-2 left-1/2 z-20 h-1 w-28 -translate-x-1/2 rounded-full bg-white/25" />
    </div>
  )
}
