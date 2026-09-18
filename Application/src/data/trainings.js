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
import searchPoisonCover from '../assets/games/threat-spotter-catch-the-impostor/splash.jpg'
import domainSpotterCover from '../assets/games/account-hijack-simulator/splash.png'
import fakeLoginCover from '../assets/games/fake-login-destroyer/thumbnail.png'
import extensionCleanerCover from '../assets/games/permission-matrix-sorter/splash.png'
import parkingLotCover from '../assets/games/the-parking-lot-bait/item-usb.png'
import threatTypeCover from '../assets/games/threat-spotter-catch-the-impostor/red-flag-scanner.png'
import patchAuditorCover from '../assets/games/permission-matrix-sorter/splash.png'
import incidentProtocolCover from '../assets/games/account-hijack-simulator/splash.png'
import permissionAuditorCover from '../assets/games/permission-auditor-blitz/splash.png'
import smishingDetectiveCover from '../assets/games/smishing-text-detective/splash.png'
import wirelessRiskCover from '../assets/games/wireless-risk-analyzer/splash.jpg'
import privacyIndicatorCover from '../assets/games/privacy-indicator-tracker/splash.png'
import officeDeskCover from '../assets/games/office-desk-inspection/splash.png'
import doorwayDefenderCover from '../assets/games/doorway-defender/splash.png'
import impostorSpotterCover from '../assets/games/impostor-spotter/splash.png'
import vishingPublicCover from '../assets/games/vishing-public-shield/splash.png'
import classificationSorterCover from '../assets/games/classification-sorter/splash.png'
import channelGuardCover from '../assets/games/channel-guard/splash.png'
import screenshotInspectorCover from '../assets/games/screenshot-inspector/splash.png'
import privacyIncidentCover from '../assets/games/privacy-incident-response/splash.png'
import firstResponderCover from '../assets/games/first-responder/splash.png'
import socHotlineCover from '../assets/games/soc-incident-hotline/splash.png'
import pitfallChallengeCover from '../assets/games/pitfall-challenge/splash.png'

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
        title: 'Module 3 · Safe Browsing & Phishing',
        lessons: [
          {
            id: 'safe-search-scams',
            title: 'Search Poisoning Inspector',
            topic: 'Safe Search & Scams',
            description:
              'A poisoned Google results page for Zoom. Click the real zoom.us download — ignore sponsored traps.',
            learnings: [
              'Sponsored ads can impersonate brands',
              'Prefer the official company domain',
              'Loud “Download now” ads are often malware',
            ],
            cover: searchPoisonCover,
            game: 'search-poisoning-inspector',
          },
          {
            id: 'urls-https',
            title: 'Domain Spotter',
            topic: 'URLs & HTTPS',
            description:
              'Inspect browser URLs: highlight the real root domain, zoom for typosquatting, then Mark Legitimate or Flag Phishing — 15 seconds each.',
            learnings: [
              'HTTPS lock encrypts data, not identity',
              'Typosquatting (paypaI, micros0ft)',
              'Subdomain tricks — trust the root domain',
            ],
            cover: domainSpotterCover,
            game: 'domain-spotter',
          },
          {
            id: 'fake-login-pages',
            title: 'Fake Login Page',
            topic: 'Fake Login Pages',
            description:
              'Compare side-by-side login portals (bank, Microsoft 365, PayPal, Google). Pick the safe site — HTTPS, lock, and real domain.',
            learnings: [
              'HTTPS + padlock before signing in',
              'Typosquat domains (micros0ft)',
              'Lookalike TLDs and urgency bait',
            ],
            cover: fakeLoginCover,
            game: 'fake-login-destroyer',
          },
          {
            id: 'browser-extensions-malvertising',
            title: 'Extension & Pop-Up Cleaner',
            topic: 'Browser Extensions & Malvertising',
            description:
              'Close the prize scam pop-up, then remove unknown extensions from the browser Extensions menu — keep only verified tools like AdBlocker Pro.',
            learnings: [
              'Unknown extensions steal sessions',
              'Prize pop-ups are phishing bait',
              'Keep verified publisher tools only',
            ],
            cover: extensionCleanerCover,
            game: 'extension-popup-cleaner',
          },
        ],
      },
      {
        id: 'module-4',
        title: 'Module 4 · Malware, Devices & Incident Response',
        lessons: [
          {
            id: 'usb-risks-unknown-devices',
            title: 'The Parking Lot Bait',
            topic: 'USB Risks & Unknown USB Devices',
            description:
              'A stylish USB labeled “Executive Salaries 2026” sits in the office lot. Identify unsafe insertion behavior and choose the secure corporate response.',
            learnings: [
              'Never plug unknown USB media into a PC',
              'Leaving bait still endangers other employees',
              'Handle carefully and deliver to IT Security',
            ],
            cover: parkingLotCover,
            game: 'parking-lot-bait',
          },
          {
            id: 'malware-categories',
            title: 'Threat Type Categorizer',
            topic: 'Viruses, Trojans, Spyware, Ransomware & Keyloggers',
            description:
              'SOC triage drill: drag four system alerts into the correct malware buckets — ransomware, trojan, keylogger, and spyware.',
            learnings: [
              'Ransomware encrypts and demands payment',
              'Trojans disguise as trusted apps',
              'Keyloggers and spyware steal silently',
            ],
            cover: threatTypeCover,
            game: 'threat-type-categorizer',
          },
          {
            id: 'unauthorized-software-updates',
            title: 'Patch & Software Auditor',
            topic: 'Unauthorized Software & Software Updates',
            description:
              'Admin desk simulator: install critical OS patches, block unapproved torrent tools, and reject cracked executables.',
            learnings: [
              'Install critical security patches promptly',
              'Block unapproved downloads',
              'Reject and report crack / keygen files',
            ],
            cover: patchAuditorCover,
            game: 'patch-software-auditor',
          },
          {
            id: 'antivirus-lost-stolen-devices',
            title: 'Critical Incident Emergency Protocol',
            topic: 'Antivirus & Lost/Stolen Devices',
            description:
              'Timed 15-second drills: restart for AV containment, and trigger emergency remote wipe when a laptop is left in a taxi.',
            learnings: [
              'Never disable antivirus during an alert',
              'Save work and restart for malware quarantine',
              'Lost devices need immediate remote wipe',
            ],
            cover: incidentProtocolCover,
            game: 'critical-incident-protocol',
          },
        ],
      },
      {
        id: 'module-5',
        title: 'Module 5 · Mobile Security & Privacy',
        lessons: [
          {
            id: 'application-permissions-device-access',
            title: 'Permission Auditor Blitz',
            topic: 'Application Permissions & Device Access',
            description:
              'Interactive smartphone settings drill: audit new app permission requests and revoke dangerous access while keeping only business-justified toggles.',
            learnings: [
              'Keep only permissions an app truly needs',
              'Revoke always-on location and contact grabs',
              'Utility apps rarely need microphone or contacts',
            ],
            cover: permissionAuditorCover,
            game: 'permission-auditor-blitz',
          },
          {
            id: 'mobile-phishing-sms-attacks',
            title: 'Smishing Text Detective',
            topic: 'Mobile Phishing & SMS-Based Attacks',
            description:
              'Rapid swipe inbox: swipe left for smishing traps and right for legitimate SMS — catch fake delivery and corporate re-verify links.',
            learnings: [
              'Odd tracking domains are SMS phishing tells',
              'Balance alerts without links can be legitimate',
              'Urgent email deactivation SMS is a credential trap',
            ],
            cover: smishingDetectiveCover,
            game: 'smishing-text-detective',
          },
          {
            id: 'bluetooth-public-wifi',
            title: 'Wireless Risk Analyzer',
            topic: 'Bluetooth Security & Public Wi-Fi',
            description:
              'Airport cafe simulator: enable Corporate VPN before traffic, turn Bluetooth off, and deny unknown speaker pairing.',
            learnings: [
              'VPN before any traffic on open guest Wi-Fi',
              'Discoverable Bluetooth is a public attack surface',
              'Reject unknown Bluetooth pairing requests',
            ],
            cover: wirelessRiskCover,
            game: 'wireless-risk-analyzer',
          },
          {
            id: 'privacy-indicators-background-access',
            title: 'Privacy Indicator Tracker',
            topic: 'Contacts, Files, Camera, Microphone & Location Access',
            description:
              'Spot green camera/mic privacy dots during a casual game, then neutralize spyware via Settings → Permission Manager.',
            learnings: [
              'Green privacy dots mean live sensor access',
              'Never ignore unexplained camera or mic indicators',
              'Block spyware permissions in Permission Manager',
            ],
            cover: privacyIndicatorCover,
            game: 'privacy-indicator-tracker',
          },
        ],
      },
      {
        id: 'module-6',
        title: 'Module 6 · Physical Security & Social Engineering',
        lessons: [
          {
            id: 'shoulder-surfing-clean-desk',
            title: 'The Office Desk Inspection',
            topic: 'Shoulder Surfing, Clean Desk & Unattended Computers',
            description:
              '30-second workstation inspection: spot an unlocked payroll screen, password sticky note, open client file, and unattended visitor badge.',
            learnings: [
              'Lock screens when stepping away',
              'Never store passwords on sticky notes',
              'Secure client files and visitor badges',
            ],
            cover: officeDeskCover,
            game: 'office-desk-inspection',
          },
          {
            id: 'visitors-access-tailgating',
            title: 'Doorway Defender',
            topic: 'Visitors, Access Cards & Tailgating',
            description:
              'Turnstile simulator: swipe your badge, then stop a box-carrying stranger from tailgating — direct them to reception for a visitor badge.',
            learnings: [
              'Never hold doors for unknown people',
              'Visitors need reception badges first',
              'Never swipe or borrow another badge',
            ],
            cover: doorwayDefenderCover,
            game: 'doorway-defender',
          },
          {
            id: 'social-engineering-impersonation',
            title: 'Impostor Spotter',
            topic: 'Social Engineering & Impersonation',
            description:
              'Dialogue drill across three visitors: fake IT demanding passwords, COD courier scams, and unescorted “auditor” server-room access.',
            learnings: [
              'IT never needs your password for patches',
              'Route unannounced packages to reception',
              'Deny unescorted restricted-area access',
            ],
            cover: impostorSpotterCover,
            game: 'impostor-spotter',
          },
          {
            id: 'vishing-public-area-security',
            title: 'Vishing & Public Area Shield',
            topic: 'Phone-Based Scams & Public Place Security',
            description:
              'Hang up on fake HR OTP vishing, then harden a cafe laptop with privacy filter, muted speakerphone, and screen angled away from the walkway.',
            learnings: [
              'Never share OTPs over cold calls',
              'Use privacy filters in public spaces',
              'Mute speakerphone and hide screens from aisles',
            ],
            cover: vishingPublicCover,
            game: 'vishing-public-shield',
          },
        ],
      },
      {
        id: 'module-7',
        title: 'Module 7 · Data Classification & Privacy',
        lessons: [
          {
            id: 'data-classification-sorter',
            title: 'The Classification Sorter',
            topic: 'Confidential Corporate Information & Data Classification',
            description:
              'Drag-and-drop sorting engine: classify incoming assets into Public, Internal, or Restricted/Confidential tiers.',
            learnings: [
              'Match assets to sensitivity tiers',
              'Public vs internal vs restricted data',
              'Protect unannounced finance and customer PII',
            ],
            cover: classificationSorterCover,
            game: 'classification-sorter',
          },
          {
            id: 'safe-sharing-channel-guard',
            title: 'Channel Guard',
            topic: 'Safe Information Sharing, Personal Email & Cloud Storage',
            description:
              'Decision simulator: block personal Dropbox/WhatsApp and Gmail — route large customer files through corporate secure transfer.',
            learnings: [
              'Reject Shadow IT file sharing',
              'Use official secure portals / OneDrive',
              'Never send customer DBs to personal email',
            ],
            cover: channelGuardCover,
            game: 'channel-guard',
          },
          {
            id: 'screenshot-pii-inspector',
            title: 'The Screenshot Inspector',
            topic: 'Cloud Storage, Screenshots & Photographs',
            description:
              'Spot-the-leak photo audit: click customer PII on screen, whiteboard IPs, and a printed salary slip before posting.',
            learnings: [
              'Audit desk photos before social posts',
              'Screens and whiteboards leak infrastructure data',
              'Printed payslips are sensitive PII',
            ],
            cover: screenshotInspectorCover,
            game: 'screenshot-inspector',
          },
          {
            id: 'privacy-incident-response',
            title: 'Privacy Policy Incident Response',
            topic: 'Data Leakage & Basic Privacy Principles',
            description:
              'Time-critical checklist: notify DPO, request vendor deletion in writing, and never cover up a customer data leak.',
            learnings: [
              'Report privacy incidents immediately',
              'Contain leaks with written vendor confirmation',
              'Cover-ups increase regulatory fines',
            ],
            cover: privacyIncidentCover,
            game: 'privacy-incident-response',
          },
        ],
      },
      {
        id: 'module-8',
        title: 'Module 8 · Incident Response & First Actions',
        lessons: [
          {
            id: 'first-responder-outbreak',
            title: 'The First Responder',
            topic: 'Malware Infection, Ransomware & Immediate Actions',
            description:
              'Time-critical outbreak simulator: a ransomware pop-up hits your desktop — contain the network without destroying forensics or negotiating with attackers.',
            learnings: [
              'Isolate LAN and Wi-Fi during active ransomware',
              'Never hard power-off (preserves memory forensics)',
              'Never contact or pay ransomware operators',
            ],
            cover: firstResponderCover,
            game: 'first-responder',
          },
          {
            id: 'soc-incident-hotline',
            title: 'Incident Triage & Reporting Hotline',
            topic: 'Cybersecurity Incidents, Lost Devices & Fast Reporting',
            description:
              'Interactive SOC hotline desk: triage lost devices, credential compromise, and suspicious invoices — pick the required first action every time.',
            learnings: [
              'Trigger remote wipe for lost encrypted devices',
              'Change password and report credential compromise',
              'Use Report Phishing — never open unexpected invoices',
            ],
            cover: socHotlineCover,
            game: 'soc-incident-hotline',
          },
          {
            id: 'what-not-to-do-pitfalls',
            title: 'The "What NOT to Do" Pitfall Challenge',
            topic: 'Immediate Actions & What NOT to Do',
            description:
              'Decision-tree drill: dodge panicked mistakes — deleting logs, blasting phishing links, delayed reporting — and lock in Isolate · Preserve · Report.',
            learnings: [
              'Never delete logs to hide mistakes',
              'Never forward malicious links for “opinions”',
              'Report immediately — isolate, preserve, escalate to IT/SOC',
            ],
            cover: pitfallChallengeCover,
            game: 'pitfall-challenge',
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
