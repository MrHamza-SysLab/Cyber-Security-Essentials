export type Level = {
  id: number;
  title: string;
  description: string;
  task: string;
  targetUrl?: string;
  targetSearch?: string;
  expectedAction: 'url' | 'search' | 'back' | 'forward' | 'refresh' | 'click_link' | 'identify_secure';
  hint: string;
  distractions?: string[];
  points: number;
};

export type GameState = {
  gameStarted: boolean;
  showTour: boolean;
  currentLevel: number;
  score: number;
  streak: number;
  stars: number;
  isTutorialActive: boolean;
  isLevelComplete: boolean;
  history: string[];
  currentUrl: string;
  tabs: { id: string; title: string; url: string; active: boolean }[];
};
