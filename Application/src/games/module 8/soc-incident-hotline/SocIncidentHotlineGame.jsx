import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  Flag,
  Headset,
  KeyRound,
  MailWarning,
  Phone,
  ShieldCheck,
  Smartphone,
  Ticket,
} from 'lucide-react'
import splash from '../../../assets/games/soc-incident-hotline/splash.png'
import CyberSplash, { CyberHud, FeedbackToast, WrongChoiceOverlay } from '../../module 2/shared/CyberSplash'
import { useLanguage } from '../../../i18n/LanguageContext'

const BRIEF = [
  'INCIDENT TRIAGE & REPORTING HOTLINE',
  'You are on the corporate SOC hotline desk.',
  '• Classify each event by severity',
  '• Pick the required first action',
  '• 100% accuracy unlocks the award',
  'Speed matters — accuracy matters more.',
]

const SCENARIOS = [
  {
    id: 'phone',
    ticket: 'INC-8841',
    severity: 'HIGH',
    severityColor: 'border-amber-400/50 bg-amber-950/40 text-amber-200',
    label: 'Scenario A · Lost Device',
    caller: 'Alex Rivera · Sales',
    headline: 'Encrypted work phone left in a ride-share',
    detail:
      'Caller left their MDM-managed, encrypted corporate phone in an Uber after a client dinner. Device may still be unlocked with biometric for a short window.',
    icon: Smartphone,
    options: [
      {
        id: 'wait',
        label: 'Wait overnight — driver might return it',
        correct: false,
        wrongTitle: 'Delayed Containment',
        wrongReason:
          'Waiting leaves corporate email, MFA tokens, and CRM access exposed. Policy requires an immediate remote wipe / lock via IT Hotline.',
      },
      {
        id: 'wipe',
        label: 'Trigger Remote Wipe Request via IT Hotline',
        correct: true,
        xp: 34,
        okMsg: 'Remote wipe escalated — device data protected.',
      },
      {
        id: 'post',
        label: 'Post the IMEI on social media to find it',
        correct: false,
        wrongTitle: 'Public Disclosure Risk',
        wrongReason:
          'Broadcasting device identifiers publicly creates privacy and social-engineering risk. Use official IT/SOC channels only.',
      },
    ],
  },
  {
    id: 'creds',
    ticket: 'INC-8842',
    severity: 'CRITICAL',
    severityColor: 'border-rose-400/50 bg-rose-950/40 text-rose-200',
    label: 'Scenario B · Credential Compromise',
    caller: 'Jordan Lee · Marketing',
    headline: 'Credentials entered on a suspicious link 5 minutes ago',
    detail:
      'Employee clicked a lookalike SSO page and submitted username + password. No MFA prompt appeared. Session tokens may already be stolen.',
    icon: KeyRound,
    options: [
      {
        id: 'ignore',
        label: 'Monitor for a few days — maybe nothing happened',
        correct: false,
        wrongTitle: 'Active Compromise Ignored',
        wrongReason:
          'Credential harvest is an active incident. Attackers move fast — change the password and report the compromise immediately.',
      },
      {
        id: 'change',
        label: 'Change Password Immediately & Report Compromise',
        correct: true,
        xp: 33,
        okMsg: 'Password rotated and SOC ticket opened.',
      },
      {
        id: 'reuse',
        label: 'Reuse a previous password so you remember it',
        correct: false,
        wrongTitle: 'Credential Hygiene Failure',
        wrongReason:
          'Reusing old passwords keeps the account recoverable by the same attacker. Use a unique password and report to SOC.',
      },
    ],
  },
  {
    id: 'phish',
    ticket: 'INC-8843',
    severity: 'MEDIUM',
    severityColor: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-200',
    label: 'Scenario C · Suspicious Invoice',
    caller: 'Sam Okonkwo · AP Desk',
    headline: 'Unexpected invoice attachment in email',
    detail:
      'Finance received an email asking to “review the attached invoice.” Sender domain is slightly off; attachment is a .html.zip. No purchase order matches.',
    icon: MailWarning,
    options: [
      {
        id: 'open',
        label: 'Open the attachment to verify the vendor',
        correct: false,
        wrongTitle: 'Malware Delivery Risk',
        wrongReason:
          'Opening unexpected invoice attachments is a classic malware vector. Report phishing — do not open or forward.',
      },
      {
        id: 'forward',
        label: 'Forward to the whole AP team for opinions',
        correct: false,
        wrongTitle: 'Threat Propagation',
        wrongReason:
          'Forwarding spreads the malicious payload. Use the built-in Report Phishing control so SOC can quarantine it.',
      },
      {
        id: 'report',
        label: 'Click "Report Phishing" Button',
        correct: true,
        xp: 33,
        okMsg: 'Phishing reported — message quarantined for analysis.',
      },
    ],
  },
]

export default function SocIncidentHotlineGame({ onExit }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [wrongFeedback, setWrongFeedback] = useState(null)
  const [badge, setBadge] = useState(false)
  const [ringPulse, setRingPulse] = useState(true)

  const scenario = SCENARIOS[index]

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (phase !== 'play') return undefined
    setRingPulse(true)
    const timer = window.setTimeout(() => setRingPulse(false), 1800)
    return () => window.clearTimeout(timer)
  }, [phase, index])

  function advance() {
    setBusy(false)
    setToast(null)
    setWrongFeedback(null)
    if (index >= SCENARIOS.length - 1) {
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

    if (!option.correct) {
      setWrongFeedback({
        title: option.wrongTitle,
        reason: option.wrongReason,
      })
      return
    }

    const gained = option.xp
    setScore((s) => s + gained)
    setToast({
      tone: 'ok',
      title: `Ticket Closed · +${gained} XP`,
      detail: option.okMsg,
    })
    window.setTimeout(advance, 1000)
  }

  function resetPlay() {
    setIndex(0)
    setScore(0)
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
        title="TOPIC 2 · INCIDENT TRIAGE & FAST REPORTING"
        lines={BRIEF}
        cta="OPEN SOC HOTLINE"
        alt="Incident Triage & Reporting Hotline"
        onPlay={() => setPhase('play')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <CyberHud title="SOC INCIDENT HOTLINE" score={score} onExit={onExit} status="QUEUE CLEARED">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="game-pop w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-6 text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-300" />
            <h2 className="mt-3 font-game text-2xl font-bold text-emerald-300">HOTLINE CLEARED</h2>
            <p className="mt-2 text-sm text-slate-300">
              100% triage accuracy — lost device wipe, credential reset, and phishing report all handled correctly.
            </p>
            {badge && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-amber-200">
                <Award className="size-4" />
                <span className="font-game text-xs tracking-wider">SOC INCIDENT RESPONDER</span>
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

  const Icon = scenario.icon

  return (
    <CyberHud
      title="SOC INCIDENT HOTLINE"
      score={score}
      onExit={onExit}
      status={`TICKET ${index + 1}/${SCENARIOS.length}`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(14,165,233,0.12),transparent_45%)]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5">
          {/* Hotline console chrome */}
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-600/50 bg-slate-950/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className={`relative flex size-11 items-center justify-center rounded-full bg-cyan-500/15 ring-2 ring-cyan-400/40 ${
                  ringPulse ? 'animate-pulse' : ''
                }`}
              >
                <Headset className="size-5 text-cyan-300" />
                {ringPulse && (
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                )}
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-300/80">CORPORATE SOC HOTLINE</p>
                <p className="font-game text-sm text-white">Live Triage Desk · Ext. 911</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 font-mono text-[10px] text-slate-300">
              <Phone className="size-3.5 text-emerald-300" />
              INCOMING · {scenario.caller}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.id}
              className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-[1.1fr_0.9fr]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Ticket card */}
              <div className="rounded-2xl border border-slate-500/50 bg-slate-950/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-500/50 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-300">
                    <Ticket className="size-3" />
                    {scenario.ticket}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] tracking-wider ${scenario.severityColor}`}
                  >
                    <Flag className="size-3" />
                    {scenario.severity}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{scenario.label}</span>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/30">
                    <Icon className="size-6 text-cyan-200" />
                  </div>
                  <div>
                    <h2 className="font-game text-xl text-white sm:text-2xl">{scenario.headline}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{scenario.detail}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-dashed border-slate-600/60 bg-slate-900/50 p-3">
                  <p className="font-mono text-[9px] tracking-[0.18em] text-slate-500">CALLER STATEMENT</p>
                  <p className="mt-1 text-sm italic text-slate-200">
                    &ldquo;{scenario.detail.split('.')[0]}. What should I do right now?&rdquo;
                  </p>
                </div>
              </div>

              {/* Action panel */}
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 sm:p-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-300/80">REQUIRED ACTION</p>
                <p className="mt-1 text-sm text-slate-400">Select the correct first response for this severity.</p>
                <div className="mt-4 space-y-3">
                  {scenario.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={busy || !!wrongFeedback}
                      onClick={() => handleChoice(option)}
                      className="w-full cursor-pointer rounded-xl border border-slate-500/60 bg-slate-950/80 px-4 py-3.5 text-left transition hover:border-cyan-400/55 hover:bg-cyan-950/35 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="font-game text-sm tracking-wide text-cyan-100">{option.label}</span>
                    </button>
                  ))}
                </div>
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
