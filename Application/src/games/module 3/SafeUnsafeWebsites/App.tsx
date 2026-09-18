/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  RotateCcw, 
  ChevronRight, 
  Trophy, 
  Flame,
  Info,
  Globe,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { saveGameScore } from '../../../../../../service/Game/gameApi.service';
import type { RootState } from '../../../../../../store/store';
import { cn } from './lib/utils';
import { scenarios, type WebOption } from './data/scenarios';

// --- Components ---

interface BrowserWindowProps {
  option: WebOption;
  isSelected?: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({ 
  option, 
  isSelected, 
  isCorrect, 
  showResult, 
  onClick,
  disabled 
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "flex flex-col w-full bg-white rounded-xl overflow-hidden browser-shadow border-2 transition-colors duration-300",
        !showResult && !disabled && "hover:border-blue-400 cursor-pointer",
        showResult && isSelected && isCorrect && "border-emerald-500 ring-4 ring-emerald-500/20",
        showResult && isSelected && !isCorrect && "border-rose-500 ring-4 ring-rose-500/20",
        !showResult && "border-slate-200"
      )}
    >
      {/* Browser Toolbar */}
      <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-bottom border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        
        <div className="flex-1 flex items-center bg-white rounded-md px-3 py-1.5 border border-slate-200 gap-2 overflow-hidden">
          {option.hasLock ? (
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          <span className={cn(
            "text-xs font-mono truncate",
            option.isHttps ? "text-emerald-700" : "text-slate-500"
          )}>
            <span className="opacity-50">{option.isHttps ? 'https://' : 'http://'}</span>
            {option.url.replace(/^https?:\/\//, '')}
          </span>
        </div>
        
        <Globe className="w-4 h-4 text-slate-400" />
      </div>

      {/* Website Content Mock */}
      <div className="p-8 flex flex-col items-center text-center gap-6 min-h-[300px] justify-center">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl", option.content.logoColor)}>
          {option.brandName[0]}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">{option.content.title}</h3>
          <p className="text-sm text-slate-500 max-w-[200px] mx-auto leading-relaxed">
            {option.content.description}
          </p>
        </div>
        <div className="w-full max-w-[200px] space-y-3">
          <div className="h-10 bg-slate-100 rounded border border-slate-200" />
          <div className="h-10 bg-slate-100 rounded border border-slate-200" />
          <button className={cn("w-full py-2.5 rounded font-semibold text-white transition-opacity", option.content.logoColor)}>
            {option.content.buttonText}
          </button>
        </div>
      </div>

      {/* Result Overlay */}
      <AnimatePresence>
        {showResult && isSelected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10",
              isCorrect ? "text-emerald-600" : "text-rose-600"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 className="w-16 h-16" />
              ) : (
                <XCircle className="w-16 h-16" />
              )}
              <span className="text-2xl font-black uppercase tracking-widest">
                {isCorrect ? 'Safe!' : 'Phishing!'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  const userId = userState?.id || 0;
  const courseId = searchParams.get('courseId');
  const contentId = searchParams.get('contentId');
  const gameIdFromUrl = window.location.pathname.match(/\/game\/([^\/\?]+)/)?.[1] || 'safe-unsafe-websites';
  const apiCallMadeRef = useRef(false);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'feedback' | 'finished'>('start');
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const currentScenario = scenarios[currentScenarioIdx];

  const handleSelect = (idx: number) => {
    if (selectedOptionIdx !== null) return;

    const selected = currentScenario.options[idx];
    const correct = selected.isSafe;

    setSelectedOptionIdx(idx);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 100 + (streak * 20));
      setStreak(prev => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setGameState('feedback');
    }, 1500);
  };

  const nextScenario = () => {
    if (currentScenarioIdx < scenarios.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsCorrect(null);
      setGameState('playing');
    } else {
      setGameState('finished');
    }
  };

  const restartGame = () => {
    setCurrentScenarioIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOptionIdx(null);
    setIsCorrect(null);
    setGameState('start');
  };

  useEffect(() => {
    if (gameState !== 'finished' || apiCallMadeRef.current) {
      return;
    }

    if (userId && courseId && contentId) {
      apiCallMadeRef.current = true;
      saveGameScore(
        userId,
        gameIdFromUrl,
        score,
        1,
        {
          completed: true,
          criteria: {
            scenariosCompleted: scenarios.length,
            bestStreak: streak,
          },
        },
        courseId,
        contentId
      )
        .then(() => {
          message.success('Score saved successfully!');
        })
        .catch(() => {
          apiCallMadeRef.current = false;
          message.error('Failed to save score. Please try again.');
        });
    }
  }, [gameState, userId, courseId, contentId, gameIdFromUrl, score, streak]);

  const handleBackToDashboard = () => {
    if (courseId && userId) {
      navigate(`/course-content/${courseId}/${userId}`);
      return;
    }
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">PhishGuard</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Web Safety Challenge</p>
            </div>
          </div>

          {gameState !== 'start' && gameState !== 'finished' && (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</span>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-mono font-bold text-lg">{score.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Streak</span>
                <div className="flex items-center gap-1.5">
                  <Flame className={cn("w-4 h-4 transition-colors", streak > 0 ? "text-orange-500" : "text-slate-300")} />
                  <span className="font-mono font-bold text-lg">{streak}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  Interactive Training
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Can you spot the <span className="text-blue-600">Phish?</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Cybercriminals create realistic-looking websites to steal your data. 
                  Test your skills and learn how to stay safe online.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {[
                  { icon: Lock, label: 'HTTPS & Locks', desc: 'Basic security cues' },
                  { icon: Globe, label: 'Domain Check', desc: 'Spot misleading URLs' },
                  { icon: ShieldAlert, label: 'Phishing Tactics', desc: 'Advanced detection' }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-2">
                    <item.icon className="w-6 h-6 mx-auto text-blue-500" />
                    <h4 className="font-bold text-sm">{item.label}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setGameState('playing')}
                  className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  Start Challenge
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowTutorial(true)}
                  className="px-10 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
                >
                  How to Play
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentScenario.title}</h2>
                  <p className="text-slate-500">Select the <span className="text-emerald-600 font-bold">safe</span> website</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                    currentScenario.difficulty === 'basic' && "bg-emerald-50 text-emerald-600 border-emerald-200",
                    currentScenario.difficulty === 'intermediate' && "bg-amber-50 text-amber-600 border-amber-200",
                    currentScenario.difficulty === 'advanced' && "bg-rose-50 text-rose-600 border-rose-200"
                  )}>
                    {currentScenario.difficulty}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 items-center">
                {currentScenario.options.map((option, idx) => (
                  <BrowserWindow 
                    key={idx}
                    option={option}
                    isSelected={selectedOptionIdx === idx}
                    isCorrect={isCorrect ?? undefined}
                    showResult={selectedOptionIdx !== null}
                    onClick={() => handleSelect(idx)}
                    disabled={selectedOptionIdx !== null}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <div className="flex gap-2">
                  {scenarios.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === currentScenarioIdx ? "w-8 bg-blue-600" : "w-2 bg-slate-200",
                        i < currentScenarioIdx && "bg-emerald-400"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-8 max-w-xl w-full browser-shadow border border-slate-200 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {isCorrect ? 'Excellent Spot!' : 'You got Phished!'}
                    </h3>
                    <p className="text-slate-500">
                      {isCorrect ? 'You identified the secure site correctly.' : 'This site was designed to deceive you.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Security Breakdown
                  </h4>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{currentScenario.explanation}"
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {currentScenario.options.map((opt, i) => (
                      <div key={i} className="space-y-2">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          opt.isSafe ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {opt.isSafe ? 'Safe Site' : 'Phishing Site'}
                        </span>
                        <ul className="space-y-1">
                          {opt.cues.map((cue, j) => (
                            <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                              <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", opt.isSafe ? "bg-emerald-400" : "bg-rose-400")} />
                              {cue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={nextScenario}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {currentScenarioIdx < scenarios.length - 1 ? 'Next Challenge' : 'See Final Results'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto gap-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 rounded-full" />
                <div className="relative bg-white p-8 rounded-full border-8 border-blue-50">
                  <Trophy className="w-24 h-24 text-amber-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900">Challenge Complete!</h2>
                <p className="text-slate-500 text-lg">You've completed the PhishGuard training.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Score</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{score.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Best Streak</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{streak}</p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={restartGame}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Dashboard
                </button>
                <p className="text-xs text-slate-400">
                  Share this challenge with friends to help them stay safe!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full space-y-6"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <Info className="w-6 h-6" />
                <h3 className="text-xl font-bold">How to Play</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-slate-600">Compare the two browser windows shown side-by-side.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-slate-600">Look at the <span className="font-bold text-slate-900">URL bar</span>, check for <span className="font-bold text-slate-900">HTTPS</span>, the <span className="font-bold text-slate-900">Lock Icon</span>, and <span className="font-bold text-slate-900">Domain Spelling</span>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <p className="text-slate-600">Click on the website you believe is <span className="font-bold text-emerald-600">Safe</span>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">4</div>
                  <p className="text-slate-600">Earn points for correct answers and build a streak for bonuses!</p>
                </div>
              </div>

              <button 
                onClick={() => setShowTutorial(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Got it, let's go!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-400 text-xs border-t border-slate-200">
        <p>© 2026 PhishGuard Training. Stay safe out there.</p>
      </footer>
    </div>
  );
}
