export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const EmailType = {
  LEGITIMATE: 'LEGITIMATE',
  PHISHING: 'PHISHING',
  SPAM: 'SPAM',
} as const;
export type EmailType = typeof EmailType[keyof typeof EmailType];

export const PhishingCategory = {
  SPEAR_PHISHING: 'Spear Phishing',
  BEC: 'Business Email Compromise',
  WHALING: 'Whaling',
  GENERAL: 'General Phishing',
  NONE: 'None',
} as const;
export type PhishingCategory = typeof PhishingCategory[keyof typeof PhishingCategory];

export interface Email {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  date: string;
  type: EmailType;
  difficulty: Difficulty;
  category: PhishingCategory;
  indicators: string[]; // Reasons why it's phishing
  actualLink?: string;
  displayLink?: string;
  attachment?: {
    name: string;
    type: string;
  };
  isRead: boolean;
  isReported: boolean;
  userChoice?: EmailType;
}

export interface GameStats {
  correct: number;
  falsePositives: number;
  missed: number;
  totalProcessed: number;
  score: number;
  level: number;
  accuracy: number;
}
