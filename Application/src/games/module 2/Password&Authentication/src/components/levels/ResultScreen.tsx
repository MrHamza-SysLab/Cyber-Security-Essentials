
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Trophy, ShieldCheck, ShieldAlert, ShieldX, RotateCcw, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { GameState } from '../../types';

interface ResultScreenProps {
  state: GameState;
  finalScore: number;
  onRestart: () => void;
  onBack: () => void;
}

export default function ResultScreen({ state, finalScore, onRestart, onBack }: ResultScreenProps) {
  const getRank = () => {
    if (finalScore >= 80) return { label: 'Security Expert', color: 'text-green-500', icon: ShieldCheck, desc: 'You are a digital fortress! Your data is safe.' };
    if (finalScore >= 50) return { label: 'Needs Improvement', color: 'text-yellow-500', icon: ShieldAlert, desc: 'You have good basics, but there are gaps in your armor.' };
    return { label: 'High Risk User', color: 'text-red-500', icon: ShieldX, desc: 'Warning: Your digital identity is highly vulnerable.' };
  };

  const rank = getRank();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-center">
        <CardHeader>
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Security Audit Complete</CardTitle>
          <CardDescription>Final security assessment for your account.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="text-6xl font-black tracking-tighter text-primary">{finalScore}</div>
            <div className="text-sm font-mono uppercase tracking-widest text-zinc-500">Security Score</div>
          </div>

          <div className={`p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4`}>
            <rank.icon className={`w-12 h-12 mx-auto ${rank.color}`} />
            <div>
              <h3 className={`text-xl font-bold ${rank.color}`}>{rank.label}</h3>
              <p className="text-sm text-zinc-400 mt-1">{rank.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase font-bold">Password</div>
              <div className="text-sm font-bold">{state.passwordStrength}% Strength</div>
            </div>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase font-bold">Attack Defense</div>
              <div className="text-sm font-bold">{state.isHacked ? 'Breached' : 'Repelled'}</div>
            </div>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase font-bold">2FA Status</div>
              <div className="text-sm font-bold">{state.twoFactorEnabled ? 'Active' : 'Disabled'}</div>
            </div>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase font-bold">Knowledge</div>
              <div className="text-sm font-bold">{state.mistakesScore}% Correct</div>
            </div>
          </div>

          <Button className="w-full font-bold uppercase tracking-widest h-12" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" /> Play Again
          </Button>
          <Button
            variant="outline"
            className="w-full font-bold uppercase tracking-widest h-12"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
