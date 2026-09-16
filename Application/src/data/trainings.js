import firewall from '../assets/games/build-the-human-firewall/firewall-wall.png'
import thumbnail from '../assets/games/security-guard-pass-or-block/thumbnail.jpg'
import records from '../assets/games/hackers-target-board/asset-employee-records.png'
import marcus from '../assets/games/social-engineering-trap-detector/marcus-alarm.png'
import scanner from '../assets/games/threat-spotter-catch-the-impostor/red-flag-scanner.png'
import skyline from '../assets/general/bg-skyline.png'
import passwordCrackerThumb from '../assets/games/password-strength-cracker/thumbnail.png'
import mfaThumb from '../assets/games/mfa-gatekeeper/thumbnail.png'
import hijackThumb from '../assets/games/account-hijack-simulator/thumbnail.png'
import safeShareThumb from '../assets/games/safe-share-decision-engine/thumbnail.png'
import permissionThumb from '../assets/games/permission-matrix-sorter/thumbnail.png'

export const TRAININGS = [
  {
    id: 'cyber-security-essentials',
    title: 'Cyber Security Essentials',
    org: 'Syslab',
    grade: 'Professional',
    image: skyline,
    modules: [
      {
        id: 'module-1',
        title: 'Module 1',
        lessons: [
          {
            id: 'what-is-cybersecurity',
            title: 'Security Guard: Pass or Block',
            topic: 'What is Cybersecurity?',
            description:
              'Sort everyday items into a Secure Zone or Risk Area — digital safety is a daily habit, not a one-time install.',
            learnings: [
              'What counts as a digital asset',
              'Pass vs block decisions',
              'Security as a continuous habit',
            ],
            cover: thumbnail,
            poster: true,
            game: 'security-guard-pass-or-block',
          },
          {
            id: 'why-orgs-are-targeted',
            title: 'Hacker’s Target Board',
            topic: 'Why Organizations Are Targeted',
            description:
              'A hacker appears on the wire. Choose which corporate asset he hits first — and shield it.',
            learnings: [
              'Why every organisation is a target',
              'Weak vendors as entry points',
              'Valuable data vs easy access',
            ],
            cover: records,
            game: 'hackers-target-board',
          },
          {
            id: 'common-cyber-threats',
            title: 'Threat Spotter: Catch the Impostor',
            topic: 'Common Cyber Threats',
            description:
              'Drag the red-flag scanner onto phishing and ransomware. Leave genuine IT traffic alone.',
            learnings: [
              'Phishing tells',
              'Ransomware pop-ups',
              'Legitimate vs fake reset requests',
            ],
            cover: scanner,
            game: 'threat-spotter-catch-the-impostor',
          },
          {
            id: 'role-of-employees',
            title: 'Build the Human Firewall',
            topic: 'The Role of Employees',
            description:
              'Fill the missing bricks with the right employee behaviours to close the network wall.',
            learnings: [
              'You are the human firewall',
              'Report, lock, unique passwords',
              'Clicks and shared secrets open holes',
            ],
            cover: firewall,
            game: 'build-the-human-firewall',
          },
          {
            id: 'human-error-social-engineering',
            title: 'Social Engineering Trap Detector',
            topic: 'Human Error & Social Engineering',
            description:
              'A fake IT agent demands your password. Choose fast: give it, ignore it, or hang up and verify.',
            learnings: [
              'Urgency is a weapon',
              'Never share passwords on a call',
              'Verify on a known channel',
            ],
            cover: marcus,
            game: 'social-engineering-trap-detector',
          },
        ],
      },
      {
        id: 'module-2',
        title: 'Module 2 · Password & Authentication',
        lessons: [
          {
            id: 'weak-reused-passwords',
            title: 'Password Strength Cracker',
            topic: 'Weak & Reused Passwords',
            description:
              'Bots guess millions of passwords per second. Stop reuse, pick a unique passphrase — or trust a Password Manager.',
            learnings: [
              'Automated tools guess millions of combinations per second',
              'Reusing passwords means one leak compromises everything',
              'Use unique passphrases or an enterprise Password Manager',
            ],
            cover: passwordCrackerThumb,
            game: 'password-strength-cracker',
          },
          {
            id: 'multi-factor-authentication',
            title: 'MFA Gatekeeper',
            topic: 'Multi-Factor Authentication',
            description:
              'Audit live MFA pushes. Approve your device, deny Moscow at 3 AM, and stop fatigue spam.',
            learnings: [
              'Approve only known devices',
              'Deny odd-hour unknown browsers',
              'MFA fatigue → Deny All & Report',
            ],
            cover: mfaThumb,
            game: 'mfa-gatekeeper',
          },
          {
            id: 'credential-theft',
            title: 'Account Hijack Simulator',
            topic: 'Credential Theft',
            description:
              'Detective mode: find three compromise indicators in a hijacked corporate mailbox.',
            learnings: [
              'Unknown active sessions',
              'Malicious inbox forward rules',
              'Sudden spam from Sent',
            ],
            cover: hijackThumb,
            game: 'account-hijack-simulator',
          },
          {
            id: 'password-sharing',
            title: 'Safe Share Decision Engine',
            topic: 'Password Sharing',
            description:
              'Team Lead wants the AWS password in chat. Choose the compliant share path.',
            learnings: [
              'No passwords in plain chat',
              'Sticky-note photos still leak',
              'Use vault secure shared links',
            ],
            cover: safeShareThumb,
            game: 'safe-share-decision-engine',
          },
          {
            id: 'basic-access-principles',
            title: 'Permission Matrix Sorter',
            topic: 'Basic Access Principles',
            description:
              'Drag files to the minimum role that needs them — lock in least privilege.',
            learnings: [
              'Least privilege principle',
              'Payroll stays with Finance',
              'Root keys stay with SysAdmin',
            ],
            cover: permissionThumb,
            game: 'permission-matrix-sorter',
          },
        ],
      },
      {
        id: 'module-3',
        title: 'Module 3',
        lessons: [
          {
            id: 'module-3-placeholder',
            title: 'Coming next',
            description: 'Module 3 games will be added from the next blueprint.',
            learnings: ['Placeholder'],
            cover: skyline,
            game: null,
          },
        ],
      },
      {
        id: 'module-4',
        title: 'Module 4',
        lessons: [
          {
            id: 'module-4-placeholder',
            title: 'Coming next',
            description: 'Module 4 games will be added from the next blueprint.',
            learnings: ['Placeholder'],
            cover: skyline,
            game: null,
          },
        ],
      },
    ],
  },
]

export const GRADES = ['Professional']

export function getTraining(trainingId) {
  return TRAININGS.find((item) => item.id === trainingId)
}

export function findLesson(training, lessonId) {
  for (const module of training.modules) {
    const lesson = module.lessons.find((item) => item.id === lessonId)
    if (lesson) return { module, lesson }
  }
  return null
}
