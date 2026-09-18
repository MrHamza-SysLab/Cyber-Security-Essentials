import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { HUD } from '@/components/game/HUD';
import { BrowserFrame } from '@/components/game/BrowserFrame';
import { LevelRenderer } from '@/components/game/LevelRenderer';
import { ConsequenceOverlay } from '@/components/game/ConsequenceOverlay';
import { FeedbackPanel } from '@/components/game/FeedbackPanel';
import { useGameStore } from '@/hooks/useGameStore';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Trophy, RefreshCcw, Play, ArrowLeft } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { LEVELS } from '@/data/levels';
import { saveGameScore } from '../../../../../../service/Game/gameApi.service';
import type { RootState } from '../../../../../../store/store';
import './index.css';

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.user);
  const userId = userState?.id || 0;
  const courseId = searchParams.get('courseId');
  const contentId = searchParams.get('contentId');
  const gameIdFromUrl =
    window.location.pathname.match(/\/game\/([^/\\?]+)/)?.[1] || 'fake-ads-popups';
  const apiCallMadeRef = useRef(false);

  const { 
    state, 
    currentLevel, 
    handleElementClick, 
    nextLevel, 
    resetConsequence, 
    closeFeedback, 
    restartGame 
  } = useGameStore();

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!state.isGameOver || apiCallMadeRef.current) {
      return;
    }
    if (userId && courseId && contentId) {
      apiCallMadeRef.current = true;
      saveGameScore(
        userId,
        gameIdFromUrl,
        state.score,
        1,
        {
          completed: true,
          criteria: {
            livesLeft: state.lives,
            levelsCompleted: LEVELS.length,
            streak: state.streak,
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
  }, [
    state.isGameOver,
    state.score,
    state.lives,
    state.streak,
    userId,
    courseId,
    contentId,
    gameIdFromUrl,
  ]);

  const handleBackToDashboard = () => {
    if (courseId && userId) {
      navigate(`/course-content/${courseId}/${userId}`);
      return;
    }
    navigate('/game');
  };

  const handleRestartMission = () => {
    apiCallMadeRef.current = false;
    restartGame();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)]" />
          <div className="scanline" />
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Shield className="w-24 h-24 text-blue-500 animate-pulse" />
              <ShieldAlert className="absolute -top-2 -right-2 w-10 h-10 text-red-500 animate-bounce" />
            </div>
          </div>
          
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
            CyberScam <span className="text-blue-500">Hunter</span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            The internet is a minefield of deceptive buttons, fake ads, and malicious popups. 
            Can you navigate through the traps and complete your missions without getting hacked?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-blue-400 font-bold mb-2 text-sm uppercase">Identify</h3>
              <p className="text-xs text-slate-500">Spot the real buttons hidden among deceptive traps.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-red-400 font-bold mb-2 text-sm uppercase">Consequences</h3>
              <p className="text-xs text-slate-500">Every mistake triggers a realistic cyber attack simulation.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-green-400 font-bold mb-2 text-sm uppercase">Learn</h3>
              <p className="text-xs text-slate-500">Get detailed explanations on why elements are safe or dangerous.</p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={() => setGameStarted(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-8 text-2xl font-bold rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
          >
            START MISSION <Play className="ml-3 w-6 h-6 fill-white" />
          </Button>
        </div>
      </div>
    );
  }

  if (state.isGameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-2">Mission Complete</h2>
          <p className="text-slate-400 mb-8">Your final security assessment is ready.</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400">Final Score</span>
              <span className="text-2xl font-mono font-bold text-white">{state.score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400">Integrity Remaining</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Shield key={i} className={`w-5 h-5 ${i < state.lives ? 'text-green-500 fill-green-500' : 'text-slate-700'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleRestartMission}
              className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700"
            >
              RESTART MISSION <RefreshCcw className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="w-full py-6 text-lg font-bold border-slate-600 text-white hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((state.currentLevelIndex) / LEVELS.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <HUD 
        score={state.score} 
        lives={state.lives} 
        streak={state.streak} 
        levelName={currentLevel.name}
        progress={progress}
      />
      
      <main className="flex-1 flex flex-col relative">
        <div className="p-4 bg-slate-800/50 text-slate-300 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="font-medium">Objective:</span> {currentLevel.description}
        </div>

        <BrowserFrame url={currentLevel.url}>
          <LevelRenderer 
            level={currentLevel} 
            onElementClick={handleElementClick} 
          />
        </BrowserFrame>

        <ConsequenceOverlay 
          type={state.consequence} 
          onComplete={resetConsequence} 
        />

        <FeedbackPanel 
          feedback={state.feedback} 
          onClose={closeFeedback}
          onNext={nextLevel}
          isGameOver={state.isGameOver}
        />
      </main>

      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
