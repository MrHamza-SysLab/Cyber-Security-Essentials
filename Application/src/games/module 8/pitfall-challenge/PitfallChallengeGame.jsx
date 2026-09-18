import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Ban,
  CheckCircle2,
  FileWarning,
  Forward,
  Hourglass,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Trash2,
} from 'lucide-react'
import splash from '../../../assets/games/pitfall-challenge/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'THE "WHAT NOT TO DO" PITFALL CHALLENGE',
  'Panic creates the biggest incidents.',
  '• Spot the 3 common panicked mistakes',
  '• Choose the safe corporate path',
  '• Isolate · Preserve · Report immediately',
  'Bypass every pitfall to earn Incident Master.',
]

const NODES = [
  {
    id: 'logs',
    step: 1,
    title: 'Pitfall 1 · Evidence Tampering',
    prompt:
      'You accidentally emailed a customer list externally. Panic sets in — the system logs might show what you did.',
    pathLabel: 'DECISION NODE A',
    accent: 'border-rose-400/35 bg-rose-950/25',
    options: [
      {
        id: 'delete-logs',
        label: 'Delete system log files to hide the accidental leak',
        pitfall: true,
        icon: Trash2,
        wrongTitle: 'Investigation Interference',
        wrongReason:
          'Deleting logs is evidence tampering. It interferes with the investigation, may violate policy/law, and almost always makes the outcome worse.',
      },
      {
        id: 'preserve',
        label: 'Leave logs untouched — prepare to report the leak',
        pitfall: false,
        icon: FileWarning,
        okMsg: 'Evidence preserved. Investigators can reconstruct the timeline.',
      },
    ],
  },
  {
    id: 'forward',
    step: 2,
    title: 'Pitfall 2 · Threat Amplification',
    prompt:
      'A phishing email looks almost real. You want a second opinion from the whole team before reporting it.',
    pathLabel: 'DECISION NODE B',
    accent: 'border-amber-400/35 bg-amber-950/25',
    options: [
      {
        id: 'blast',
        label: 'Forward the phishing link to all colleagues: “Is this real?”',
        pitfall: true,
        icon: Forward,
        wrongTitle: 'Threat Spread',
        wrongReason:
          'Forwarding malicious links spreads the threat across mailboxes and increases click risk. Use Report Phishing / ask SOC — never blast the payload.',
      },
      {
        id: 'hold',
        label: 'Do not forward — escalate via official reporting only',
        pitfall: false,
        icon: Ban,
        okMsg: 'Threat contained to one inbox. SOC can quarantine safely.',
      },
    ],
  },
  {
    id: 'delay',
    step: 3,
    title: 'Pitfall 3 · Delayed Reporting',
    prompt:
      'You realize something went wrong three days ago. You are afraid of being punished if you speak up now.',
    pathLabel: 'DECISION NODE C',
    accent: 'border-orange-400/35 bg-orange-950/25',
    options: [
      {
        id: 'hide',
        label: 'Stay quiet — report it later if it gets worse',
        pitfall: true,
        icon: Hourglass,
        wrongTitle: 'Lateral Movement Window',
        wrongReason:
          'Waiting days lets attackers move laterally, escalate privileges, and exfiltrate data. Early reporting is rewarded — cover-ups are not.',
      },
      {
        id: 'report-now',
        label: 'Report immediately to IT / SOC despite the delay',
        pitfall: false,
        icon: Siren,
        okMsg: 'Late is better than never — SOC can still contain damage.',
      },
    ],
  },
  {
    id: 'correct',
    step: 4,
    title: 'Correct Path · Incident Master Protocol',
    prompt:
      'Final checkpoint: pick the corporate golden path for handling any suspected incident under pressure.',
    pathLabel: 'SAFE PATH',
    accent: 'border-emerald-400/40 bg-emerald-950/25',
    options: [
      {
        id: 'wrong-combo',
        label: 'Reboot, clear browser history, then tell your manager tomorrow',
        pitfall: true,
        icon: Ban,
        wrongTitle: 'Protocol Failure',
        wrongReason:
          'Clearing history destroys evidence and delaying the report widens the blast radius. Follow Isolate → Preserve → Report.',
      },
      {
        id: 'golden',
        label: 'Isolate device, preserve evidence, report immediately to IT/SOC',
        pitfall: false,
        icon: CheckCircle2,
        okMsg: 'Golden path confirmed — Incident Master protocol complete.',
        final: true,
      },
    ],
  },
]

export default function PitfallChallengeGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [cleared, setCleared] = useState([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)

  const node = NODES[index]

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function advance(final) {
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    if (final || index >= NODES.length - 1) {
      setScore(100)
      setBadge(true)
      setPhase('result')
      return
    }
    setIndex((i) => i + 1)
  }

  function handleTryAgain() {
    setWrongFeedback(null)
    setBusy(false)
  }

  function handleChoice(option) {
    if (busy || wrongFeedback || phase !== 'play') return
    setBusy(true)

    if (option.pitfall) {
      setWrongFeedback({
        title: option.wrongTitle,
        reason: option.wrongReason,
      })
      return
    }

    setCleared((prev) => [...prev, node.id])
    const gained = option.final ? 40 : 20
    setScore((s) => s + gained)
    setToast({
      tone: 'ok',
      title: `Pitfall Avoided · +${gained} XP`,
      detail: option.okMsg,
    })
    window.setTimeout(() => advance(!!option.final), 1000)
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
    setCleared([])
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    setBadge(false)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <CyberSplash
        image={splash}
        title="TOPIC 3 · IMMEDIATE ACTIONS & WHAT NOT TO DO"
        lines={BRIEF}
        cta="ENTER THE DECISION TREE"
        alt="What NOT to Do Pitfall Challenge"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="PITFALL CHALLENGE" score={score} onExit={onExit} status="SAFE PATH CLEARED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">ALL PITFALLS BYPASSED</h2>
            <p className="mt-2 text-sm text-slate-300">
              You refused to wipe logs, blast phishing, or delay reporting — and locked in Isolate · Preserve · Report.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">INCIDENT MASTER</span>
              </div>
            )}
            <p className="mt-4 font-mono text-emerald-300">{score} XP</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetPlay}
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
      title="PITFALL CHALLENGE"
      score={score}
      onExit={onExit}
      status={`NODE ${index + 1}/${NODES.length}`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(16,185,129,0.1),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          {/* Path progress */}
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2">
            {NODES.map((n, i) => {
              const done = cleared.includes(n.id) || i < index
              const active = i === index
              return (
                <div key={n.id} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                      done
                        ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                        : active
                          ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-100'
                          : 'border-slate-600 bg-slate-900 text-slate-500'
                    }`}
                  >
                    {done ? <CheckCircle2 className="size-4" /> : n.step}
                  </div>
                  {i < NODES.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 rounded ${
                        done ? 'bg-emerald-400/50' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={node.id}
              className="mx-auto w-full max-w-3xl"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <div className={`rounded-2xl border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-6 ${node.accent}`}>
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-300">{node.pathLabel}</p>
                <h2 className="mt-2 font-game text-xl text-white sm:text-2xl">{node.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">{node.prompt}</p>

                <div className="mt-5 space-y-3">
                  {node.options.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={busy || !!wrongFeedback}
                        onClick={() => handleChoice(option)}
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          option.pitfall
                            ? 'border-slate-500/60 bg-slate-950/75 hover:border-rose-400/45 hover:bg-rose-950/25'
                            : 'border-slate-500/60 bg-slate-950/75 hover:border-emerald-400/50 hover:bg-emerald-950/25'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            option.pitfall ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span className="font-game text-sm leading-snug tracking-wide text-cyan-50">
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {node.id === 'correct' && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
                    <ShieldAlert className="size-3.5" />
                    Remember: Isolate device · Preserve evidence · Report to IT/SOC
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {wrongFeedback && <WrongChoiceOverlay feedback={wrongFeedback} onTryAgain={handleTryAgain} />}
        {toast && (
          <FeedbackToast tone={toast.tone} title={toast.title} detail={toast.detail} onClose={() => setToast(null)} />
        )}
      </div>
    </CyberHud>
  )
}
