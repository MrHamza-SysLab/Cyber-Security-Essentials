import type { Level } from '../types/game';

export const LEVELS: Level[] = [
  {
    id: 'software-download',
    name: 'Software Download Portal',
    url: 'soft-hub-pro.com/download/video-editor',
    description: 'You need to download a free video editor. Find the real download link.',
    difficulty: 1,
    elements: [
      {
        id: 'real-1',
        type: 'real',
        label: 'Download v2.4.1 (64-bit)',
        explanation: 'This is the real link. It matches the version number mentioned in the header and uses a standard, non-flashy style.',
        style: 'download-btn',
      },
      {
        id: 'fake-1',
        type: 'fake',
        label: 'START DOWNLOAD',
        explanation: 'Scammers use large, flashy green buttons that look like part of the site but are actually ads leading to malware.',
        consequenceType: 'infection',
        style: 'download-btn',
      },
      {
        id: 'ad-1',
        type: 'ad',
        label: 'Your Drivers are Outdated! Click to Fix',
        explanation: 'This is a "scareware" ad designed to make you panic and download unnecessary or malicious software.',
        consequenceType: 'hacker',
        style: 'banner',
      },
      {
        id: 'fake-2',
        type: 'fake',
        label: 'Download Manager (Recommended)',
        explanation: '"Download Managers" offered on free sites often bundle adware or spyware with the software you actually want.',
        consequenceType: 'data-leak',
        style: 'link',
      }
    ]
  },
  {
    id: 'streaming-site',
    name: 'Movie Streaming Site',
    url: 'watch-movies-free.io/play/blockbuster-2024',
    description: 'Try to play the movie without clicking on malicious ads or fake players.',
    difficulty: 2,
    elements: [
      {
        id: 'real-play',
        type: 'real',
        label: 'Play Movie',
        explanation: 'The real play button is usually integrated into the player UI and doesn\'t open new tabs immediately.',
        style: 'button',
      },
      {
        id: 'popup-1',
        type: 'popup',
        label: 'VPN Required to Watch in Your Country',
        explanation: 'Fake VPN prompts are common ways to trick users into installing tracking software or paying for useless services.',
        consequenceType: 'money-lost',
        style: 'popup',
      },
      {
        id: 'fake-play',
        type: 'fake',
        label: 'HD Stream (Fastest)',
        explanation: 'Buttons promising "HD" or "Fast" streams outside the main player are almost always links to phishing sites.',
        consequenceType: 'hacker',
        style: 'button',
      },
      {
        id: 'ad-2',
        type: 'ad',
        label: 'You Won a $1000 Amazon Gift Card!',
        explanation: 'If it sounds too good to be true, it is. These "winner" ads are classic phishing traps for personal info.',
        consequenceType: 'data-leak',
        style: 'banner',
      }
    ]
  },
  {
    id: 'tech-support',
    name: 'System Security Alert',
    url: 'windows-security-alert-system-error-0x800.com',
    description: 'A sudden popup appeared. What is the safest action?',
    difficulty: 3,
    elements: [
      {
        id: 'real-close',
        type: 'real',
        label: 'Close Browser Tab',
        explanation: 'The only safe way to handle a tech support scam page is to close the tab or browser entirely. Never click buttons inside the page.',
        style: 'button',
      },
      {
        id: 'popup-scam',
        type: 'popup',
        label: 'Call +1-800-SCAN-SCAM for Immediate Help',
        explanation: 'Real security alerts will never ask you to call a phone number. This is a classic social engineering attack.',
        consequenceType: 'money-lost',
        style: 'popup',
      },
      {
        id: 'fake-scan',
        type: 'fake',
        label: 'Scan My PC Now',
        explanation: 'Clicking "Scan" on a suspicious site allows it to run malicious scripts or show fake "infection" results to scare you.',
        consequenceType: 'hacker',
        style: 'button',
      }
    ]
  },
  {
    id: 'social-phishing',
    name: 'Social Media Verification',
    url: 'face-book-security-portal.net/verify-account',
    description: 'You received an alert that your account was accessed from another country. Verify your identity.',
    difficulty: 4,
    elements: [
      {
        id: 'real-exit',
        type: 'real',
        label: 'Go to Official Facebook.com',
        explanation: 'Always navigate to the official website directly through your browser instead of clicking links in security alerts.',
        style: 'button',
      },
      {
        id: 'phish-popup',
        type: 'popup',
        label: 'Your account will be DELETED in 24 hours if you do not verify now!',
        explanation: 'Urgency and threats of account deletion are classic hallmarks of phishing scams.',
        consequenceType: 'data-leak',
        style: 'popup',
      },
      {
        id: 'fake-login',
        type: 'fake',
        label: 'Login with Facebook',
        explanation: 'This button leads to a fake login page designed to steal your username and password.',
        consequenceType: 'hacker',
        style: 'button',
      },
      {
        id: 'ad-social',
        type: 'ad',
        label: 'See who is viewing your profile!',
        explanation: 'Social media "profile viewer" apps are almost always scams or data-harvesting tools.',
        consequenceType: 'data-leak',
        style: 'banner',
      }
    ]
  },
  {
    id: 'ecommerce-scam',
    name: 'Rewards Center',
    url: 'global-rewards-winner-882.xyz/claim',
    description: 'You\'ve been selected as the winner of a new smartphone! Claim your prize.',
    difficulty: 5,
    elements: [
      {
        id: 'real-terms',
        type: 'real',
        label: 'View Official Contest Rules',
        explanation: 'Checking the fine print or official rules often reveals the scam. Real contests don\'t use random .xyz domains.',
        style: 'link',
      },
      {
        id: 'spin-popup',
        type: 'popup',
        label: 'CONGRATULATIONS! You won an iPhone 15 Pro! Click OK to pay $1 shipping.',
        explanation: 'The "$1 shipping" trick is used to steal credit card information for much larger unauthorized charges.',
        consequenceType: 'money-lost',
        style: 'popup',
      },
      {
        id: 'fake-claim',
        type: 'fake',
        label: 'CLAIM MY PRIZE NOW',
        explanation: 'Large, pulsating "Claim" buttons on generic reward sites are designed to bypass your critical thinking.',
        consequenceType: 'money-lost',
        style: 'download-btn',
      },
      {
        id: 'ad-gift',
        type: 'ad',
        label: 'Complete this 30-second survey to unlock your reward',
        explanation: 'Scam surveys are used to collect personal data which is then sold to telemarketers or used for identity theft.',
        consequenceType: 'data-leak',
        style: 'banner',
      }
    ]
  },
  {
    id: 'crypto-scam',
    name: 'Crypto Wallet Sync',
    url: 'wallet-connect-secure-fix.io/sync',
    description: 'Your crypto wallet needs to be "synchronized" to prevent loss of funds. Follow the steps.',
    difficulty: 6,
    elements: [
      {
        id: 'real-abort',
        type: 'real',
        label: 'Disconnect and Close Tab',
        explanation: 'Never enter your seed phrase or private keys on any website. Official wallets will never ask for them to "sync".',
        style: 'button',
      },
      {
        id: 'seed-popup',
        type: 'popup',
        label: 'Enter your 12-word Recovery Phrase to verify ownership.',
        explanation: 'This is the ultimate crypto scam. Giving away your recovery phrase gives the attacker full control of your funds.',
        consequenceType: 'money-lost',
        style: 'popup',
      },
      {
        id: 'fake-connect',
        type: 'fake',
        label: 'Connect MetaMask / Trust Wallet',
        explanation: 'Fake "WalletConnect" sites use malicious scripts to drain your wallet as soon as you approve the connection.',
        consequenceType: 'hacker',
        style: 'download-btn',
      },
      {
        id: 'ad-crypto',
        type: 'ad',
        label: 'Double your Bitcoin! Send 0.1 BTC and get 0.2 BTC back instantly.',
        explanation: 'The "Double your Crypto" scam is a classic Ponzi scheme that simply steals whatever you send.',
        consequenceType: 'money-lost',
        style: 'banner',
      }
    ]
  },
  {
    id: 'popup-hell',
    name: 'Antivirus Scan Portal',
    url: 'secure-scan-pro-v8.com/alert',
    description: 'Your browser is being flooded with alerts. Find the real way to exit.',
    difficulty: 7,
    elements: [
      {
        id: 'real-exit-browser',
        type: 'real',
        label: 'Close Browser Tab',
        explanation: 'When a site floods you with popups, the only safe action is to close the tab or browser entirely.',
        style: 'button',
      },
      {
        id: 'popup-1',
        type: 'popup',
        label: 'VIRUS DETECTED! Your system is 98% corrupted. Click OK to clean.',
        explanation: 'Fake antivirus popups are "scareware" designed to make you install real malware.',
        consequenceType: 'infection',
        style: 'popup',
      },
      {
        id: 'popup-2',
        type: 'popup',
        label: 'Windows Firewall has been disabled! Click to re-enable.',
        explanation: 'Websites cannot see your system firewall status. This is a lie to get you to click.',
        consequenceType: 'hacker',
        style: 'popup',
      },
      {
        id: 'popup-3',
        type: 'popup',
        label: 'Your webcam is being accessed remotely! Click to block.',
        explanation: 'This is a common scare tactic to induce panic and force a quick, unthinking click.',
        consequenceType: 'data-leak',
        style: 'popup',
      }
    ]
  }
];
