import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, ShieldCheck, Upload, X } from 'lucide-react'
import splash from '../../../assets/games/permission-matrix-sorter/splash.png'
import roleIntern from '../../../assets/games/permission-matrix-sorter/role-intern.png'
import roleFinance from '../../../assets/games/permission-matrix-sorter/role-finance.png'
import roleAdmin from '../../../assets/games/permission-matrix-sorter/role-admin.png'
import roleHr from '../../../assets/games/permission-matrix-sorter/role-hr.png'
import roleMarketing from '../../../assets/games/permission-matrix-sorter/role-marketing.png'
import roleSecurity from '../../../assets/games/permission-matrix-sorter/role-security.png'
import fileLogo from '../../../assets/games/permission-matrix-sorter/file-logo.png'
import filePayroll from '../../../assets/games/permission-matrix-sorter/file-payroll.png'
import fileKeys from '../../../assets/games/permission-matrix-sorter/file-keys.png'
import fileHrRecords from '../../../assets/games/permission-matrix-sorter/file-hr-records.png'
import fileMarketing from '../../../assets/games/permission-matrix-sorter/file-marketing.png'
import fileAuditLogs from '../../../assets/games/permission-matrix-sorter/file-audit-logs.png'
import serverNexus from '../../../assets/games/permission-matrix-sorter/server-nexus.png'
import CyberSplash, { CyberHud, FeedbackToast } from '../shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'
import { usePointerDrag } from '../../module 1/shared/usePointerDrag'

const BRIEF = [
  'PERMISSION MATRIX SORTER',
  'Apply Least Privilege — nothing more.',
  '• Logo: anyone may view',
  '• Payroll → Finance · Keys → Admin',
  '• HR records · Brand kit · Audit logs',
  'Drag each file onto the right role.',
]

const MAX_SCORE = 100

function scoreForCount(count) {
  return Math.round((count / FILES.length) * MAX_SCORE)
}

const ALL_ROLE_IDS = ['intern', 'finance', 'admin', 'hr', 'marketing', 'security']

const ROLES = [
  {
    id: 'intern',
    label: 'Junior Intern',
    hint: 'Limited access',
    portrait: roleIntern,
  },
  {
    id: 'finance',
    label: 'Finance Manager',
    hint: 'Sensitive Finance Data',
    portrait: roleFinance,
  },
  {
    id: 'admin',
    label: 'System Admin',
    hint: 'Infrastructure keys',
    portrait: roleAdmin,
  },
  {
    id: 'hr',
    label: 'HR Manager',
    hint: 'Employee records',
    portrait: roleHr,
  },
  {
    id: 'marketing',
    label: 'Marketing Lead',
    hint: 'Brand & campaigns',
    portrait: roleMarketing,
  },
  {
    id: 'security',
    label: 'Security Analyst',
    hint: 'Audit & threat logs',
    portrait: roleSecurity,
  },
]

const FILES = [
  {
    id: 'logo',
    label: 'Company Logo',
    sublabel: 'Logo',
    art: fileLogo,
    allowed: ALL_ROLE_IDS,
  },
  {
    id: 'payroll',
    label: 'Payroll & Salary',
    sublabel: 'Salary Sheets',
    art: filePayroll,
    allowed: ['finance'],
  },
  {
    id: 'keys',
    label: 'Server Root Access Keys',
    sublabel: 'Keys',
    art: fileKeys,
    allowed: ['admin'],
  },
  {
    id: 'hr-records',
    label: 'Employee HR Records',
    sublabel: 'PII Files',
    art: fileHrRecords,
    allowed: ['hr'],
  },
  {
    id: 'marketing',
    label: 'Brand Campaign Kit',
    sublabel: 'Assets',
    art: fileMarketing,
    allowed: ['marketing'],
  },
  {
    id: 'audit-logs',
    label: 'Security Audit Logs',
    sublabel: 'SOC Logs',
    art: fileAuditLogs,
    allowed: ['security'],
  },
]

export default function PermissionMatrixSorterGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [placements, setPlacements] = useState({})
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [pool, setPool] = useState(FILES.map((f) => f.id))
  const resultTimerRef = useRef(null)

  const mappedCount = Object.keys(placements).length
  const allMapped = pool.length === 0 && mappedCount >= FILES.length

  const { drag, start } = usePointerDrag(({ payload, zoneId }) => {
    if (!payload?.fileId || !zoneId) return
    assign(payload.fileId, zoneId)
  })

  const fileMap = useMemo(() => Object.fromEntries(FILES.map((f) => [f.id, f])), [])

  function clearResultTimer() {
    if (resultTimerRef.current) {
      window.clearTimeout(resultTimerRef.current)
      resultTimerRef.current = null
    }
  }

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

    const nextPlacements = { ...placements, [fileId]: roleId }
    const count = Object.keys(nextPlacements).length

    setPlacements(nextPlacements)
    setPool((list) => list.filter((id) => id !== fileId))
    setScore(scoreForCount(count))
    setFeedback({
      tone: 'ok',
      title: 'Least Privilege Secured',
      detail: `${file.label} → ${ROLES.find((r) => r.id === roleId)?.label}`,
    })

    if (count >= FILES.length) {
      clearResultTimer()
      resultTimerRef.current = window.setTimeout(() => setPhase('result'), 900)
    }
  }

  function removeAssignment(fileId) {
    if (!placements[fileId]) return
    clearResultTimer()
    const next = { ...placements }
    delete next[fileId]
    setPlacements(next)
    setPool((list) => (list.includes(fileId) ? list : [...list, fileId]))
    setScore(scoreForCount(Object.keys(next).length))
    setFeedback({
      tone: 'warn',
      title: 'Access Revoked',
      detail: `${fileMap[fileId]?.label} returned to the file pool.`,
    })
  }

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
        centerHero={['PERMISSION', 'MATRIX', 'SORTER']}
        centerHeroTone="emerald"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud
        title="PERMISSION MATRIX SORTER"
        score={score}
        maxScore={MAX_SCORE}
        onExit={onExit}
        status="MATRIX CLEAR"
      >
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
                  clearResultTimer()
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
                {t('backToModule')}
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
      maxScore={MAX_SCORE}
      onExit={onExit}
      status={`${mappedCount} of ${FILES.length} Sorted`}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3 sm:gap-3 sm:p-4">
        <p className="shrink-0 text-center text-sm text-slate-300">
          Drag each file onto the <span className="font-semibold text-cyan-300">minimum role</span> that
          needs it. Logo can go to any role.
        </p>

        {/* Role drop zones — fill remaining vertical space */}
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3">
          {ROLES.map((role) => {
            const assigned = FILES.filter((f) => placements[f.id] === role.id)
            return (
              <div
                key={role.id}
                data-drop-id={role.id}
                className="group relative flex h-full min-h-0 flex-col items-center overflow-hidden rounded-2xl border border-cyan-400/35 bg-[#04101c]/85 p-2 shadow-[0_0_18px_rgba(34,211,238,0.08)] transition duration-200 hover:border-cyan-300/70 hover:shadow-[0_0_28px_rgba(34,211,238,0.25)] sm:p-2.5"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.12),transparent_60%)]" />

                <div className="relative mt-1 flex size-[4.5rem] shrink-0 items-center justify-center sm:size-24 lg:size-[5.75rem] xl:size-28">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-md" />
                  <div className="absolute inset-0 rounded-full ring-2 ring-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.45)]" />
                  <img
                    src={role.portrait}
                    alt={role.label}
                    className="relative size-[88%] rounded-full object-cover object-top"
                    draggable={false}
                  />
                </div>

                <div className="relative z-10 mt-2 flex w-full shrink-0 flex-col items-center gap-0.5">
                  <span className="inline-flex min-h-7 items-center rounded-full border border-violet-400/50 bg-slate-950/80 px-2.5 py-0.5 font-game text-[9px] font-bold tracking-[0.1em] text-cyan-100 shadow-[0_0_12px_rgba(167,139,250,0.25)] sm:text-[10px]">
                    {role.label}
                  </span>
                  <p className="font-mono text-[9px] text-slate-400">{role.hint}</p>
                </div>

                <div className="relative z-10 mt-auto flex w-full flex-1 flex-col justify-end gap-1 pt-2">
                  {assigned.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-950/50 px-2 py-1"
                    >
                      <img
                        src={file.art}
                        alt=""
                        className="size-5 rounded-full object-cover ring-1 ring-emerald-400/40"
                        draggable={false}
                      />
                      <span className="min-w-0 flex-1 truncate text-[10px] text-emerald-100">{file.label}</span>
                      <button
                        type="button"
                        onClick={() => removeAssignment(file.id)}
                        aria-label={`Remove ${file.label}`}
                        className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-rose-400/40 bg-rose-950/50 text-rose-200 transition hover:border-rose-300 hover:bg-rose-900/70 hover:text-rose-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {!assigned.length && (
                    <div className="flex min-h-[4.5rem] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cyan-400/45 bg-cyan-950/25 px-2 py-3 shadow-[inset_0_0_20px_rgba(34,211,238,0.08)] transition group-hover:border-cyan-300/70 group-hover:bg-cyan-900/30 group-hover:shadow-[inset_0_0_28px_rgba(34,211,238,0.16)] sm:min-h-[5.5rem]">
                      <div className="flex size-8 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 sm:size-9">
                        <Upload className="size-4 text-cyan-300 sm:size-4.5" strokeWidth={2.25} />
                      </div>
                      <p className="text-center text-[11px] font-semibold tracking-wide text-cyan-200 sm:text-xs">
                        Drop files here
                      </p>
                      <p className="text-center font-mono text-[9px] text-cyan-400/60">Drag & drop to assign</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* File gallery + nexus */}
        <div className="grid shrink-0 gap-2 lg:grid-cols-[1fr_minmax(9rem,11rem)]">
          <div className="rounded-2xl border border-cyan-400/25 bg-[#04101c]/70 px-2 py-2.5 shadow-[0_0_24px_rgba(34,211,238,0.08)] sm:px-3 sm:py-3">
            <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-2 sm:gap-x-4">
              {pool.map((id) => {
                const file = fileMap[id]
                return (
                  <button
                    key={id}
                    type="button"
                    onPointerDown={(event) => start(event, { fileId: id })}
                    className="game-pop group flex w-[5.75rem] cursor-grab touch-none flex-col items-center text-center active:cursor-grabbing sm:w-[6.75rem]"
                  >
                    <div className="relative mb-1.5 flex size-[4.25rem] shrink-0 items-center justify-center sm:size-[5.25rem]">
                      <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-md transition group-hover:bg-cyan-300/25" />
                      <img
                        src={file.art}
                        alt={file.label}
                        className="relative z-10 size-[4.25rem] rounded-full object-cover ring-2 ring-cyan-400/65 shadow-[0_0_16px_rgba(34,211,238,0.5)] transition group-hover:-translate-y-0.5 group-hover:ring-cyan-300 sm:size-[5.25rem]"
                        draggable={false}
                      />
                    </div>
                    <div className="flex h-10 w-full flex-col justify-start sm:h-11">
                      <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-100 sm:text-[11px]">
                        {file.label}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[9px] text-cyan-400/70">{file.sublabel}</p>
                    </div>
                  </button>
                )
              })}
              {!pool.length && (
                <p className="flex items-center gap-2 py-4 text-sm text-emerald-300">
                  <ShieldCheck className="size-4" /> All files assigned
                </p>
              )}
            </div>
          </div>

          <div className="hidden flex-col items-center justify-center gap-1.5 rounded-2xl border border-cyan-400/25 bg-[#04101c]/70 p-2 text-center shadow-[0_0_24px_rgba(34,211,238,0.08)] lg:flex">
            <img
              src={serverNexus}
              alt="Central Server Stack and Data Nexus"
              className="h-20 w-auto object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]"
              draggable={false}
            />
            <span className="inline-flex rounded-full border border-cyan-400/40 bg-slate-950/70 px-2 py-1 font-game text-[8px] tracking-[0.08em] text-cyan-100">
              Central Server Stack and Data Nexus
            </span>
          </div>
        </div>

        {/* Mobile tap assign */}
        {pool.length > 0 && (
          <div className="max-h-28 shrink-0 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-2 sm:hidden">
            <p className="mb-1 font-mono text-[10px] text-slate-400">TAP ASSIGN</p>
            {pool.map((id) => {
              const file = fileMap[id]
              return (
                <div key={id} className="mb-2">
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
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: drag.x, top: drag.y }}
        >
          <img
            src={fileMap[drag.fileId]?.art}
            alt=""
            className="size-20 rounded-full object-cover ring-2 ring-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.7)]"
          />
          <span className="mt-1 rounded-lg border border-cyan-400/50 bg-slate-950/90 px-2 py-0.5 text-[10px] text-cyan-100">
            {fileMap[drag.fileId]?.label}
          </span>
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
