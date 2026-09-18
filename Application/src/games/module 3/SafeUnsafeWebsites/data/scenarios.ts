export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export interface WebOption {
  url: string;
  isHttps: boolean;
  hasLock: boolean;
  isSafe: boolean;
  brandName: string;
  cues: string[];
  content: {
    title: string;
    description: string;
    buttonText: string;
    logoColor: string;
  };
}

export interface Scenario {
  id: string;
  title: string;
  difficulty: Difficulty;
  explanation: string;
  options: [WebOption, WebOption];
}

export const scenarios: Scenario[] = [
  {
    id: '1',
    title: 'Bank Login',
    difficulty: 'basic',
    explanation: 'Always check for HTTPS and the lock icon. HTTP is unencrypted and unsafe for sensitive data like bank logins.',
    options: [
      {
        url: 'https://secure.mybank.com/login',
        isHttps: true,
        hasLock: true,
        isSafe: true,
        brandName: 'MyBank',
        cues: ['HTTPS protocol', 'Secure lock icon'],
        content: {
          title: 'Welcome Back',
          description: 'Please enter your credentials to access your account.',
          buttonText: 'Sign In',
          logoColor: 'bg-blue-600',
        },
      },
      {
        url: 'http://mybank.com/login',
        isHttps: false,
        hasLock: false,
        isSafe: false,
        brandName: 'MyBank',
        cues: ['Missing HTTPS', 'No lock icon (Insecure)'],
        content: {
          title: 'Welcome Back',
          description: 'Please enter your credentials to access your account.',
          buttonText: 'Sign In',
          logoColor: 'bg-blue-600',
        },
      },
    ],
  },
  {
    id: '2',
    title: 'Social Media Update',
    difficulty: 'intermediate',
    explanation: 'Phishers often use "typosquatting" or misleading domains. "faceboook.com" (with three o\'s) is not the real Facebook.',
    options: [
      {
        url: 'https://facebook.com/settings',
        isHttps: true,
        hasLock: true,
        isSafe: true,
        brandName: 'Facebook',
        cues: ['Correct domain spelling', 'HTTPS enabled'],
        content: {
          title: 'Account Settings',
          description: 'Update your profile information and privacy settings.',
          buttonText: 'Save Changes',
          logoColor: 'bg-blue-500',
        },
      },
      {
        url: 'https://faceboook.com/settings',
        isHttps: true,
        hasLock: true,
        isSafe: false,
        brandName: 'Facebook',
        cues: ['Typosquatting (extra "o")', 'Misleading domain'],
        content: {
          title: 'Account Settings',
          description: 'Update your profile information and privacy settings.',
          buttonText: 'Save Changes',
          logoColor: 'bg-blue-500',
        },
      },
    ],
  },
  {
    id: '3',
    title: 'Online Shopping',
    difficulty: 'intermediate',
    explanation: 'Subdomains can be misleading. "amazon.deals-now.com" is a subdomain of "deals-now.com", not Amazon.',
    options: [
      {
        url: 'https://amazon.com/deals',
        isHttps: true,
        hasLock: true,
        isSafe: true,
        brandName: 'Amazon',
        cues: ['Official amazon.com domain'],
        content: {
          title: 'Daily Deals',
          description: 'Check out today\'s top offers and discounts.',
          buttonText: 'Shop Now',
          logoColor: 'bg-orange-500',
        },
      },
      {
        url: 'https://amazon.deals-now.com/offers',
        isHttps: true,
        hasLock: true,
        isSafe: false,
        brandName: 'Amazon',
        cues: ['Misleading subdomain', 'Actual domain is deals-now.com'],
        content: {
          title: 'Daily Deals',
          description: 'Check out today\'s top offers and discounts.',
          buttonText: 'Shop Now',
          logoColor: 'bg-orange-500',
        },
      },
    ],
  },
  {
    id: '4',
    title: 'Email Provider',
    difficulty: 'advanced',
    explanation: 'Even with HTTPS and a lock icon, a site can be phishing. "google-security-alert.net" is not an official Google domain.',
    options: [
      {
        url: 'https://accounts.google.com/security',
        isHttps: true,
        hasLock: true,
        isSafe: true,
        brandName: 'Google',
        cues: ['Official google.com domain'],
        content: {
          title: 'Security Checkup',
          description: 'Review your recent security activity and protect your account.',
          buttonText: 'Get Started',
          logoColor: 'bg-red-500',
        },
      },
      {
        url: 'https://google-security-alert.net/verify',
        isHttps: true,
        hasLock: true,
        isSafe: false,
        brandName: 'Google',
        cues: ['Generic TLD (.net)', 'Hyphenated misleading name'],
        content: {
          title: 'Security Checkup',
          description: 'Review your recent security activity and protect your account.',
          buttonText: 'Get Started',
          logoColor: 'bg-red-500',
        },
      },
    ],
  },
  {
    id: '5',
    title: 'Payment Gateway',
    difficulty: 'advanced',
    explanation: 'Always look at the Top-Level Domain (TLD). "paypal-support.biz" is suspicious compared to "paypal.com".',
    options: [
      {
        url: 'https://www.paypal.com/signin',
        isHttps: true,
        hasLock: true,
        isSafe: true,
        brandName: 'PayPal',
        cues: ['Official paypal.com domain'],
        content: {
          title: 'Log In to PayPal',
          description: 'Pay online or send money with ease.',
          buttonText: 'Log In',
          logoColor: 'bg-blue-800',
        },
      },
      {
        url: 'https://paypal-support.biz/login',
        isHttps: true,
        hasLock: true,
        isSafe: false,
        brandName: 'PayPal',
        cues: ['Suspicious .biz TLD', 'Hyphenated domain name'],
        content: {
          title: 'Log In to PayPal',
          description: 'Pay online or send money with ease.',
          buttonText: 'Log In',
          logoColor: 'bg-blue-800',
        },
      },
    ],
  },
];
