import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, FileKey, FileText, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import splash from '../../../assets/games/permission-matrix-sorter/splash.png'
import CyberSplash, { CyberHud, FeedbackToast } from '../shared/CyberSplash'
import { usePointerDrag } from '../../module 1/shared/usePointerDrag'

const BRIEF = [
  'PERMISSION MATRIX SORTER',
  'Apply Least Privilege — nothing more.',
  '• Logo: everyone may view',
  '• Payroll: Finance only',
  '• Root keys: System Admin only',
  'Drag each file onto the right role.',
]

const ROLES = [
  { id: 'intern', label: 'Junior Intern', hint: 'Limited access' },
  { id: 'finance', label: 'Finance Manager', hint: 'Sensitive finance data' },
  { id: 'admin', label: 'System Admin', hint: 'Infrastructure keys' },
]

const FILES = [
  {
    id: 'logo',
    label: 'Company Logo SVG',
    icon: ImageIcon,
    allowed: ['intern', 'finance', 'admin'],
  },
  {
    id: 'payroll',
    label: 'Payroll & Salary Sheet PDF',
    icon: FileText,
    allowed: ['finance'],
  },
  {
    id: 'keys',
    label: 'Server Root Access Keys',
    icon: FileKey,
    allowed: ['admin'],
  },
]

export default function PermissionMatrixSorterGame({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [placements, setPlacements] = useState({})
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [pool, setPool] = useState(FILES.map((f) => f.id))

  const allMapped = pool.length === 0 && Object.keys(placements).length >= FILES.length

  const { drag, start } = usePointerDrag(({ payload, zoneId }) => {
    if (!payload?.fileId || !zoneId) return
    assign(payload.fileId, zoneId)
  })

  const fileMap = useMemo(() => Object.fromEntries(FILES.map((f) => [f.id, f])), [])

  function assign(fileId, roleId) {
    const file = fileMap[fileId]
    if (!file) return

    if (!file.allowed.includes(roleId)) {
      setFeedback({
        tone: 'bad',
        title: 'Access Over-Privileged Risk',
        detail: `${file.label} cannot be granted to ${ROLES.find((r) => r.id === roleId)?.label}.`,
      })
      return
    }

    setPlacements((prev) => {
      const next = { ...prev, [fileId]: roleId }
      if (Object.keys(next).length >= FILES.length) {
        window.setTimeout(() => setPhase('result'), 900)
      }
      return next
    })
    setPool((list) => list.filter((id) => id !== fileId))
    setScore((s) => s + 40)
    setFeedback({
      tone: 'ok',
      title: 'Least Privilege Secured',
      detail: `${file.label} → ${ROLES.find((r) => r.id === roleId)?.label}`,
    })
  }

  // For logo, allow dropping on any role — we track one placement; also support tap-to-assign on mobile
  function quickAssign(fileId, roleId) {
    assign(fileId, roleId)
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 5 · BASIC ACCESS PRINCIPLES"
        lines={BRIEF}
        cta="OPEN MATRIX"
        alt="Permission Matrix Sorter"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="PERMISSION MATRIX SORTER" score={score} onExit={onExit} status="MATRIX CLEAR">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">LEAST PRIVILEGE SECURED</h2>
            <p className="mt-2 text-sm text-slate-300">
              Give people only the access they need for the job — nothing extra.
            </p>
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setPlacements({})
                  setPool(FILES.map((f) => f.id))
                  setScore(0)
                  setFeedback(null)
                  setPhase('play')
                }}
                className="min-h-12 cursor-pointer rounded-xl border border-cyan-400/40 px-5 font-game text-sm text-cyan-200"
              >
                Replay
              </button>
              <button
                type="button"
                onClick={onExit}
                className="min-h-12 cursor-pointer rounded-xl bg-cyan-400 px-5 font-game text-sm font-bold text-slate-950"
              >
                Back to module
              </button>
            </div>
          </div>
        </div>
      </CyberHud>
    )
  }

  return (
    <CyberHud
      title="PERMISSION MATRIX SORTER"
      score={score}
      onExit={onExit}
      status={`${Object.keys(placements).length}/3 MAPPED`}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
        <p className="text-center text-sm text-slate-300">
          Drag each file onto the <span className="text-cyan-300">minimum role</span> that needs it.
          Logo can go to any role.
        </p>

        {/* Roles */}
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLES.map((role) => {
            const assigned = FILES.filter((f) => placements[f.id] === role.id)
            return (
              <div
                key={role.id}
                data-drop-id={role.id}
                className="min-h-36 rounded-2xl border border-dashed border-cyan-400/40 bg-slate-950/60 p-3 transition hover:border-cyan-300/70 hover:bg-cyan-950/20"
              >
                <p className="font-game text-sm font-bold tracking-wide text-cyan-200">{role.label}</p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">{role.hint}</p>
                <div className="mt-3 space-y-2">
                  {assigned.map((file) => {
                    const Icon = file.icon
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-950/40 px-2 py-1.5 text-xs text-emerald-100"
                      >
                        <Icon className="size-3.5" />
                        {file.label}
                      </div>
                    )
                  })}
                  {!assigned.length && (
                    <p className="py-6 text-center text-[11px] text-slate-600">Drop files here</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* File pool */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
          <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-slate-400">DATA FILES</p>
          <div className="flex flex-wrap justify-center gap-3">
            {pool.map((id) => {
              const file = fileMap[id]
              const Icon = file.icon
              return (
                <button
                  key={id}
                  type="button"
                  onPointerDown={(event) => start(event, { fileId: id })}
                  className="game-pop flex max-w-[14rem] cursor-grab touch-none flex-col items-center gap-2 rounded-xl border border-cyan-400/35 bg-slate-950 px-4 py-3 text-center active:cursor-grabbing"
                >
                  <Icon className="size-8 text-cyan-300" />
                  <span className="text-xs font-semibold text-slate-100">{file.label}</span>
                  <span className="font-mono text-[9px] text-slate-500">drag to role</span>
                </button>
              )
            })}
            {!pool.length && (
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <ShieldCheck className="size-4" /> All files assigned
              </p>
            )}
          </div>
        </div>

        {/* Mobile helper: tap assign for remaining files */}
        {pool.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 sm:hidden">
            <p className="mb-2 font-mono text-[10px] text-slate-400">TAP ASSIGN</p>
            {pool.map((id) => {
              const file = fileMap[id]
              return (
                <div key={id} className="mb-3">
                  <p className="mb-1 text-xs text-slate-300">{file.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => quickAssign(id, role.id)}
                        className="cursor-pointer rounded-lg border border-cyan-500/30 px-2 py-1 text-[10px] text-cyan-200"
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {drag && (
        <motion.div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-400 bg-slate-950 px-3 py-2 text-xs text-cyan-100 shadow-lg"
          style={{ left: drag.x, top: drag.y }}
        >
          {fileMap[drag.fileId]?.label}
        </motion.div>
      )}

      {feedback && (
        <FeedbackToast
          tone={feedback.tone}
          title={feedback.title}
          detail={feedback.detail}
          onClose={() => setFeedback(null)}
        />
      )}

      {allMapped && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-4 py-2 text-xs text-emerald-200">
            <AlertTriangle className="size-3.5" /> Matrix validating…
          </span>
        </div>
      )}
    </CyberHud>
  )
}
