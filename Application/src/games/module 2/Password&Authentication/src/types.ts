
export type Level = 'START' | 'PASSWORD' | 'ATTACK' | '2FA' | 'MISTAKES' | 'RESULT';

export interface GameState {
  level: Level;
  score: number;
  password: string;
  passwordStrength: number; // 0 to 100
  passwordFeedback: string[];
  isHacked: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'SMS' | 'APP' | 'EMAIL' | null;
  mistakesScore: number;
}

export interface SecurityScenario {
  id: string;
  title: string;
  description: string;
  options: {
    text: string;
    isSafe: boolean;
    feedback: string;
  }[];
}
