export type ElementType = 'real' | 'fake' | 'ad' | 'popup';

export interface GameElement {
  id: string;
  type: ElementType;
  label: string;
  explanation: string;
  consequenceType?: 'hacker' | 'data-leak' | 'money-lost' | 'infection';
  style: 'button' | 'link' | 'banner' | 'popup' | 'download-btn';
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

export interface Level {
  id: string;
  name: string;
  url: string;
  description: string;
  elements: GameElement[];
  difficulty: number;
}

export interface GameState {
  score: number;
  lives: number;
  streak: number;
  currentLevelIndex: number;
  isGameOver: boolean;
  consequence: string | null;
  feedback: {
    isCorrect: boolean;
    explanation: string;
    elementLabel: string;
  } | null;
}
