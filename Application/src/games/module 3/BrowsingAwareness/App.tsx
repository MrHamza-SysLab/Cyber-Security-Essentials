import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Plus, 
  X, 
  Search, 
  Lock, 
  ShieldCheck, 
  Trophy, 
  Star, 
  ChevronRight, 
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { saveGameScore } from '../../../../../../service/Game/gameApi.service';
import type { RootState } from '../../../../../../store/store';
import { cn } from './lib/utils';
import { LEVELS } from './constants';
import type { Level, GameState } from './types';

// --- Components ---

const ProductTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  
  const steps = [
    {
      title: "Welcome to the Browser Tour",
      description: "Before we start the mission, let's learn how a web browser works. We'll walk through the essential tools you'll use to navigate the internet.",
      icon: <ShieldCheck size={32} />,
      highlight: null
    },
    {
      title: "The Address Bar (URL Bar)",
      description: "This is where you type the exact address (URL) of a website, like 'google.com'. It's the fastest way to go directly to a site you already know.",
      icon: <Search size={32} />,
      highlight: "url-bar"
    },
    {
      title: "Navigation Controls",
      description: "Use the Back (←) and Forward (→) arrows to move through pages you've already visited. The Refresh button (↻) reloads the current page if it's stuck.",
      icon: <ArrowLeft size={32} />,
      highlight: "nav-controls"
    },
    {
      title: "Search vs. URL",
      description: "If you don't know the exact address, use a Search Bar. It helps you find websites by typing keywords or phrases like 'best pizza near me'.",
      icon: <Search size={32} />,
      highlight: "viewport" // Changed from search-page to viewport for reliability during tour
    },
    {
      title: "Security & HTTPS",
      description: "The Padlock icon indicates a secure connection (HTTPS). It means your data is encrypted and safe from hackers. Always look for the lock on sensitive sites!",
      icon: <Lock size={32} />,
      highlight: "security-lock"
    },
    {
      title: "The Content Area",
      description: "This is where the website actually lives. Be careful! Not everything you see is real. Learn to distinguish between official links and deceptive ads.",
      icon: <AlertCircle size={32} />,
      highlight: "viewport"
    }
  ];

  const currentStep = steps[step];

  useEffect(() => {
    const updateHighlight = () => {
      if (currentStep.highlight) {
        const el = document.getElementById(currentStep.highlight);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
          return;
        }
      }
      setHighlightRect(null);
    };

    // Initial update
    updateHighlight();

    // Update on resize
    window.addEventListener('resize', updateHighlight);
    
    // Polling as a fallback for layout shifts
    const interval = setInterval(updateHighlight, 500);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      clearInterval(interval);
    };
  }, [currentStep.highlight]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Highlight Box */}
      {highlightRect && (
        <motion.div 
          layoutId="tour-highlight"
          initial={false}
          animate={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            opacity: 1
          }}
          className="absolute border-4 border-blue-400 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.5)] pointer-events-none z-[301] hidden md:block"
        />
      )}

      <motion.div 
        key={step}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative z-[302] border border-gray-100 my-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl shrink-0">
            {currentStep.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Step {step + 1} of {steps.length}</p>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{currentStep.title}</h2>
          </div>
        </div>
        
        <p className="text-gray-600 mb-8 leading-relaxed text-base md:text-lg">
          {currentStep.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-8 bg-blue-600" : "w-2 bg-gray-200")} />
            ))}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {step > 0 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
            <button 
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(s => s + 1);
                } else {
                  onComplete();
                }
              }}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? "Start Mission" : "Next Step"} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gray-100 z-[200] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
  >
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col md:flex-row border border-gray-200 my-auto"
    >
      {/* Left Side: Hero */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
        <div className="bg-blue-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white mb-6 md:mb-8 shadow-lg shadow-blue-200">
          <ShieldCheck size={28} className="md:hidden" />
          <ShieldCheck size={36} className="hidden md:block" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight leading-none">
          Web<br />Navigator
        </h1>
        <p className="text-base md:text-xl text-gray-500 mb-8 md:mb-10 leading-relaxed max-w-md">
          Step into the world of digital exploration. Your mission: master the browser, identify secure paths, and navigate through the web's distractions.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
          >
            Initialize Protocol <ChevronRight size={20} />
          </button>
          <button className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
            Exit
          </button>
        </div>
      </div>

      {/* Right Side: Handbook */}
      <div className="flex-1 bg-gray-50 p-8 md:p-12 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto max-h-[50vh] md:max-h-none">
        <div className="space-y-10">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-2 text-gray-400 mb-6">
              <Info size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Navigator Handbook</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-black">1</div>
                <h3 className="font-black uppercase tracking-wider text-sm">Operational Protocol</h3>
              </div>
              
              <div className="space-y-4 ml-9">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm mb-1">Analyze Targets</p>
                  <p className="text-xs text-gray-500">Read the mission brief carefully to identify the required destination or action.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm mb-1">Execute Navigation</p>
                  <p className="text-xs text-gray-500">Use the URL bar for direct addresses and the Search bar for general queries.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={18} className="text-red-500" />
              <h3 className="font-black uppercase tracking-wider text-sm">Threat Indicators</h3>
            </div>
            
            <div className="space-y-4 ml-9">
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <p className="font-bold text-red-900 text-sm mb-1 flex items-center gap-2">
                  <Search size={14} /> Deceptive UI
                </p>
                <p className="text-xs text-red-700">Watch out for "Download" buttons that are actually advertisements or pop-up scams.</p>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
                  <Lock size={14} /> Insecure Paths
                </p>
                <p className="text-xs text-blue-700">Always verify the padlock icon in the address bar for sensitive data entry.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Trophy size={18} className="text-yellow-600" />
              <h3 className="font-black uppercase tracking-wider text-sm">Evaluation Rules</h3>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-sm font-bold">Successful Task</span>
                </div>
                <span className="text-green-400 font-black">+100 to +250</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-sm font-bold">Incorrect Action</span>
                </div>
                <span className="text-red-400 font-black">Streak Reset</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
    <motion.div 
      className="bg-blue-500 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const FeedbackToast: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50",
      type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
    )}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    <span className="font-medium">{message}</span>
  </motion.div>
);

const TutorialOverlay: React.FC<{ level: Level, onNext: () => void }> = ({ level, onNext }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
          <Info size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{level.title}</h2>
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {level.description}
      </p>
      <div className="bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100">
        <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-1">Your Task:</p>
        <p className="text-blue-900 font-medium">{level.task}</p>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Got it! Let's go <ChevronRight size={20} />
      </button>
    </motion.div>
  </motion.div>
);

const LevelComplete: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-block mb-6 text-yellow-500"
      >
        <Trophy size={100} strokeWidth={1.5} />
      </motion.div>
      <h2 className="text-4xl font-black text-gray-900 mb-2">Level Complete!</h2>
      <p className="text-gray-500 text-xl mb-8">You're becoming a pro navigator!</p>
      
      <div className="flex justify-center gap-4 mb-10">
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + s * 0.1, type: 'spring' }}
          >
            <Star className="text-yellow-400 fill-yellow-400" size={40} />
          </motion.div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="bg-gray-900 hover:bg-black text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl"
      >
        Next Level
      </button>
    </motion.div>
  </motion.div>
);

const FinalResultScreen: React.FC<{ score: number; onBack: () => void }> = ({ score, onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl p-10 text-center"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 mb-6">
        <Trophy size={42} />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-3">Mission Complete!</h2>
      <p className="text-gray-500 text-lg mb-8">You finished all browsing awareness levels.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-gray-900 text-white rounded-2xl px-8 py-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Final Score</p>
          <p className="text-5xl font-black">{score} / 100</p>
        </div>
        <div className="bg-blue-600 text-white rounded-2xl px-8 py-6">
          <p className="text-xs uppercase tracking-widest text-blue-100 font-bold mb-2">Percentage</p>
          <p className="text-5xl font-black">{Math.round((score / 100) * 100)}%</p>
        </div>
      </div>
      <button
        onClick={onBack}
        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
      >
        Back to Dashboard
      </button>
    </motion.div>
  </div>
);

// --- Main App ---

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  const userId = userState?.id || 0;
  const courseId = searchParams.get('courseId');
  const contentId = searchParams.get('contentId');
  const hasExecutedRef = useRef(false);
  const gameIdFromUrl = window.location.pathname.match(/\/game\/([^\/\?]+)/)?.[1] || 'browsing-awareness';

  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    showTour: false,
    currentLevel: 0,
    score: 0,
    streak: 0,
    stars: 0,
    isTutorialActive: true,
    isLevelComplete: false,
    history: [],
    currentUrl: 'about:blank',
    tabs: [{ id: '1', title: 'New Tab', url: 'about:blank', active: true }]
  });

  const [urlInput, setUrlInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  const [showPopups, setShowPopups] = useState(false);
  const [isFinalResultVisible, setIsFinalResultVisible] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentLevel = LEVELS[gameState.currentLevel];

  // Handle URL submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.toLowerCase().trim();
    
    if (currentLevel.expectedAction === 'url' && cleanUrl === currentLevel.targetUrl) {
      handleSuccess();
    } else {
      handleError("That's not quite right. Check the spelling or the task!");
    }
  };

  // Handle Search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchInput.toLowerCase().trim();
    
    if (currentLevel.expectedAction === 'search' && cleanSearch === currentLevel.targetSearch) {
      handleSuccess();
    } else {
      handleError("Try searching for the exact phrase mentioned in the task.");
    }
  };

  const handleAction = (action: Level['expectedAction']) => {
    if (currentLevel.expectedAction === action) {
      handleSuccess();
    } else {
      handleError("That's a valid browser action, but not what we need right now!");
    }
  };

  const handleSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b']
    });

    setFeedback({ message: "Excellent! You did it!", type: 'success' });
    setGameState(prev => ({
      ...prev,
      score: prev.score + currentLevel.points,
      streak: prev.streak + 1,
      isLevelComplete: true
    }));
  };

  const handleError = (msg: string) => {
    setFeedback({ message: msg, type: 'error' });
    setGameState(prev => ({ ...prev, streak: 0 }));
  };

  const nextLevel = () => {
    if (gameState.currentLevel < LEVELS.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1,
        isLevelComplete: false,
        isTutorialActive: true,
        currentUrl: 'about:blank'
      }));
      setUrlInput('');
      setSearchInput('');
      setIsSecure(false);
      setShowPopups(false);
    } else {
      const finalScore = gameState.score;
      const completed = true;

      const resetGame = () => {
        setGameState(prev => ({
          ...prev,
          currentLevel: 0,
          score: 0,
          streak: 0,
          gameStarted: false,
          showTour: false,
          isTutorialActive: true,
          isLevelComplete: false,
        }));
        setUrlInput('');
        setSearchInput('');
        setIsSecure(false);
        setShowPopups(false);
      };

      const finishLocalFlow = () => {
        message.success(`Great job! Score: ${finalScore}`);
        setFinalScore(finalScore);
        setIsFinalResultVisible(true);
      };

      if (!hasExecutedRef.current && userId && courseId && contentId) {
        hasExecutedRef.current = true;
        saveGameScore(
          userId,
          gameIdFromUrl,
          finalScore,
          1,
          {
            completed,
            criteria: {
              levelsCompleted: LEVELS.length,
              perfectRun: gameState.streak === LEVELS.length,
            },
          },
          courseId,
          contentId
        )
          .then(() => {
            message.success('Score saved successfully!');
            finishLocalFlow();
          })
          .catch(() => {
            hasExecutedRef.current = false;
            message.error('Failed to save score. Please try again.');
            resetGame();
          });
      } else {
        finishLocalFlow();
      }
    }
  };

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Level specific logic
  useEffect(() => {
    if (!gameState.isTutorialActive && gameState.gameStarted && !gameState.showTour) {
      if (currentLevel.id === 4) setIsSecure(true);
      if (currentLevel.id === 5) setShowPopups(true);
    }
  }, [gameState.isTutorialActive, currentLevel.id, gameState.gameStarted, gameState.showTour]);

  const handleBackToDashboard = () => {
    if (courseId && userId) {
      navigate(`/course-content/${courseId}/${userId}`);
      return;
    }
    navigate('/game');
  };

  if (isFinalResultVisible) {
    return <FinalResultScreen score={finalScore} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <AnimatePresence>
        {!gameState.gameStarted && (
          <LandingPage 
            key="landing-page"
            onStart={() =>
              setGameState(prev => ({
                ...prev,
                showTour: true,
                gameStarted: true,
                isTutorialActive: false,
              }))
            }
          />
        )}
        {gameState.showTour && (
          <ProductTour 
            key="product-tour"
            onComplete={() =>
              setGameState(prev => ({
                ...prev,
                showTour: false,
                isTutorialActive: true,
              }))
            }
          />
        )}
      </AnimatePresence>

      {/* Header / HUD */}
      <header className="bg-white border-bottom border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-40">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Web Navigator</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Level {currentLevel.id}: {currentLevel.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Score</p>
            <p className="text-2xl font-black text-gray-900 tabular-nums">{gameState.score.toLocaleString()}</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="flex flex-col gap-1 w-48">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Progress</span>
              <span>{Math.round((gameState.currentLevel / LEVELS.length) * 100)}%</span>
            </div>
            <ProgressBar progress={(gameState.currentLevel / LEVELS.length) * 100} />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Task Card */}
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <Star className="fill-white text-white" size={20} />
            </div>
            <p className="font-bold text-lg">{currentLevel.task}</p>
          </div>
          <button 
            onClick={() => setGameState(prev => ({ ...prev, isTutorialActive: true }))}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            Need a Hint?
          </button>
        </div>

        {/* Browser Simulation */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden relative">
          
          {/* Browser Tabs */}
          <div className="bg-gray-100 px-3 pt-3 flex items-end gap-1 border-b border-gray-200">
            <div className="flex items-center bg-white px-4 py-2 rounded-t-xl border-t border-x border-gray-200 min-w-[160px] relative group">
              <Search size={14} className="mr-2 text-gray-400" />
              <span className="text-xs font-medium text-gray-700 truncate">
                {currentLevel.id === 1 ? 'New Tab' : currentLevel.targetUrl || 'Search'}
              </span>
              <X size={12} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer" />
            </div>
            <div className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg mb-1 transition-colors cursor-pointer">
              <Plus size={16} />
            </div>
          </div>

          {/* Browser Toolbar */}
          <div className="bg-white px-4 py-2 flex items-center gap-4 border-b border-gray-100">
            <div id="nav-controls" className="flex items-center gap-1">
              <button 
                onClick={() => handleAction('back')}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <button 
                onClick={() => handleAction('forward')}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => handleAction('refresh')}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                <Home size={18} />
              </button>
            </div>

            {/* URL Bar */}
            <form 
              id="url-bar"
              onSubmit={handleUrlSubmit}
              className="flex-1 bg-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2 border border-transparent focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <button 
                id="security-lock"
                type="button"
                onClick={() => currentLevel.id === 4 && handleAction('identify_secure')}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  isSecure ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-200"
                )}
              >
                {isSecure ? <Lock size={16} /> : <Info size={16} />}
              </button>
              <input 
                type="text" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Search Google or type a URL"
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-2 border-white shadow-sm" />
            </div>
          </div>

          {/* Viewport Content */}
          <div id="viewport" className="flex-1 bg-white relative overflow-auto">
            {/* Simulated Web Pages */}
            <div className="h-full w-full flex flex-col items-center justify-center p-12">
              
              {/* Google-like Search Page */}
              {currentLevel.id === 2 && (
                <motion.div 
                  id="search-page"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-2xl text-center"
                >
                  <h2 className="text-7xl font-black mb-8 tracking-tighter">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                  </h2>
                  <form onSubmit={handleSearchSubmit} className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Search size={20} />
                    </div>
                    <input 
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full py-4 pl-14 pr-6 rounded-full border border-gray-200 shadow-sm hover:shadow-md focus:shadow-md focus:border-transparent focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg"
                      placeholder="Search the web..."
                    />
                  </form>
                  <div className="mt-8 flex justify-center gap-3">
                    <button className="bg-gray-50 hover:bg-gray-100 px-6 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-200 transition-colors">Google Search</button>
                    <button className="bg-gray-50 hover:bg-gray-100 px-6 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-200 transition-colors">I'm Feeling Lucky</button>
                  </div>
                </motion.div>
              )}

              {/* Download Page with Distractions */}
              {currentLevel.id === 5 && (
                <div className="w-full max-w-3xl space-y-8">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-3xl font-bold text-gray-900">Download Center</h2>
                    <p className="text-gray-500">Get the latest official software updates here.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Real Link */}
                    <div className="p-6 border border-gray-200 rounded-2xl hover:border-blue-500 transition-colors group">
                      <h3 className="font-bold text-xl mb-2">Navigator Pro v2.0</h3>
                      <p className="text-sm text-gray-500 mb-4">The official build for all platforms.</p>
                      <button 
                        onClick={() => handleAction('click_link')}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        Official Download <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Fake Ads */}
                    <div className="p-6 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-yellow-200 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Ad</div>
                      <h3 className="font-bold text-xl mb-2 text-yellow-900 italic">FREE MONEY!</h3>
                      <p className="text-sm text-yellow-700 mb-4">Click to claim your $1,000 prize now!</p>
                      <button 
                        onClick={() => handleError("Oops! That's a misleading ad. Look for the plain text link.")}
                        className="w-full bg-yellow-500 text-white font-black py-3 rounded-xl shadow-lg animate-bounce"
                      >
                        CLAIM NOW!!!
                      </button>
                    </div>
                  </div>

                  {/* More Distractions */}
                  <AnimatePresence>
                    {showPopups && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-8 rounded-3xl shadow-2xl z-50 text-center border-4 border-white"
                      >
                        <AlertCircle size={60} className="mx-auto mb-4" />
                        <h3 className="text-3xl font-black mb-2 uppercase italic">Warning!</h3>
                        <p className="text-lg font-bold mb-6">Your computer has 4,291 viruses!</p>
                        <button 
                          onClick={() => handleError("Don't click pop-ups! They are usually scams.")}
                          className="bg-white text-red-600 px-8 py-3 rounded-full font-black text-xl hover:bg-gray-100 transition-colors"
                        >
                          FIX NOW
                        </button>
                        <button 
                          onClick={() => setShowPopups(false)}
                          className="absolute -top-3 -right-3 bg-gray-900 text-white p-2 rounded-full border-2 border-white"
                        >
                          <X size={20} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Generic Placeholder for other levels */}
              {![2, 5].includes(currentLevel.id) && (
                <div className="text-center text-gray-300">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-gray-100">
                    <Search size={48} />
                  </div>
                  <p className="text-xl font-medium italic">Waiting for navigation...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {gameState.isTutorialActive && !gameState.showTour && (
          <TutorialOverlay 
            key="tutorial-overlay"
            level={currentLevel} 
            onNext={() => setGameState(prev => ({ ...prev, isTutorialActive: false }))} 
          />
        )}
        {gameState.isLevelComplete && (
          <LevelComplete 
            key="level-complete-overlay"
            onNext={nextLevel} 
          />
        )}
        {feedback && (
          <FeedbackToast 
            key={`feedback-${feedback.type}-${Date.now()}`}
            message={feedback.message} 
            type={feedback.type} 
          />
        )}
      </AnimatePresence>

      {/* Footer / Hint */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-medium"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {gameState.streak} Streak</span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="flex items-center gap-1 font-medium"><Trophy size={14} className="text-blue-500" /> Pro Navigator</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Hint:</span>
          <p className="italic font-medium">{currentLevel.hint}</p>
        </div>
      </footer>
    </div>
  );
}
