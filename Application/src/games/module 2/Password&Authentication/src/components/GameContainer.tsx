
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import type { GameState } from '../types';
import PasswordLevel from './levels/PasswordLevel';
import AttackLevel from './levels/AttackLevel';
import TwoFactorLevel from './levels/TwoFactorLevel';
import MistakesLevel from './levels/MistakesLevel';
import ResultScreen from './levels/ResultScreen';
import StartScreen from './levels/StartScreen';
import { AnimatePresence, motion } from 'motion/react';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { saveGameScore } from '../../../../../../../../service/Game/gameApi.service';
import type { RootState } from '../../../../../../../../store/store';

const INITIAL_STATE: GameState = {
  level: 'START',
  score: 0,
  password: '',
  passwordStrength: 0,
  passwordFeedback: [],
  isHacked: false,
  twoFactorEnabled: false,
  twoFactorMethod: null,
  mistakesScore: 0,
};

export default function GameContainer() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userState = useSelector((reduxState: RootState) => reduxState.user);
  const userId = userState?.id || 0;
  const courseId = searchParams.get('courseId');
  const contentId = searchParams.get('contentId');
  const gameIdFromUrl =
    window.location.pathname.match(/\/(game)\/([^/?]+)/)?.[2] || 'password-authentication';
  const apiCallMadeRef = useRef(false);

  const handleStart = () => {
    setState(prev => ({ ...prev, level: 'PASSWORD' }));
  };

  const handlePasswordComplete = (password: string, strength: number, feedback: string[]) => {
    setState(prev => ({
      ...prev,
      password,
      passwordStrength: strength,
      passwordFeedback: feedback,
      level: 'ATTACK'
    }));
  };

  const handleAttackComplete = (isHacked: boolean) => {
    setState(prev => ({
      ...prev,
      isHacked,
      level: '2FA'
    }));
  };

  const handle2FAComplete = (enabled: boolean, method: 'SMS' | 'APP' | 'EMAIL' | null) => {
    setState(prev => ({
      ...prev,
      twoFactorEnabled: enabled,
      twoFactorMethod: method,
      level: 'MISTAKES'
    }));
  };

  const handleMistakesComplete = (score: number) => {
    setState(prev => ({
      ...prev,
      mistakesScore: score,
      level: 'RESULT'
    }));
  };

  const restartGame = () => {
    apiCallMadeRef.current = false;
    setState(INITIAL_STATE);
  };

  const finalScore = useMemo(() => {
    return Math.round(
      state.passwordStrength * 0.3 +
        (!state.isHacked ? 20 : 0) +
        (state.twoFactorEnabled ? 30 : 0) +
        state.mistakesScore * 0.2
    );
  }, [state.passwordStrength, state.isHacked, state.twoFactorEnabled, state.mistakesScore]);

  const handleBackToDashboard = () => {
    if (courseId && contentId && userId) {
      navigate(`/course-content/${courseId}/${userId}`);
      return;
    }
    navigate('/game');
  };

  useEffect(() => {
    if (state.level !== 'RESULT' || apiCallMadeRef.current) {
      return;
    }

    if (userId && courseId && contentId) {
      apiCallMadeRef.current = true;
      saveGameScore(
        userId,
        gameIdFromUrl,
        finalScore,
        1,
        {
          completed: true,
          criteria: {
            passwordStrength: state.passwordStrength,
            resistedAttack: !state.isHacked,
            twoFactorEnabled: state.twoFactorEnabled,
            mistakesScore: state.mistakesScore,
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
    state.level,
    userId,
    courseId,
    contentId,
    gameIdFromUrl,
    finalScore,
    state.passwordStrength,
    state.isHacked,
    state.twoFactorEnabled,
    state.mistakesScore,
  ]);

  const renderLevel = () => {
    switch (state.level) {
      case 'START':
        return <StartScreen onStart={handleStart} />;
      case 'PASSWORD':
        return <PasswordLevel onComplete={handlePasswordComplete} />;
      case 'ATTACK':
        return <AttackLevel passwordStrength={state.passwordStrength} onComplete={handleAttackComplete} />;
      case '2FA':
        return <TwoFactorLevel onComplete={handle2FAComplete} />;
      case 'MISTAKES':
        return <MistakesLevel onComplete={handleMistakesComplete} />;
      case 'RESULT':
        return (
          <ResultScreen
            state={state}
            finalScore={finalScore}
            onRestart={restartGame}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="password-auth-theme min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3f3f46 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>

      <header className="relative z-10 mb-8 text-center space-y-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
        >
          <Shield className="w-3 h-3" />
          Cyber Security Simulator
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
          Secure the <span className="text-primary">Account</span>
        </h1>
      </header>

      <main className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderLevel()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 mt-12 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Lock className="w-3 h-3" />
          ENCRYPTION: AES-256
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <User className="w-3 h-3" />
          STATUS: {state.level === 'RESULT' ? 'AUDIT COMPLETE' : 'SIMULATION ACTIVE'}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <AlertCircle className="w-3 h-3" />
          THREAT LEVEL: {state.isHacked ? 'CRITICAL' : 'MONITORED'}
        </div>
      </footer>
    </div>
  );
}
