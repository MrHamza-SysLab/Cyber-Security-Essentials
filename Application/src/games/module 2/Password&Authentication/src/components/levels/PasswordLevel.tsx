
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, Info, Eye, EyeOff } from 'lucide-react';
import { checkPasswordStrength, calculateTimeToCrack } from '../../lib/security-utils';
import { motion } from 'motion/react';

interface PasswordLevelProps {
  onComplete: (password: string, strength: number, feedback: string[]) => void;
}

export default function PasswordLevel({ onComplete }: PasswordLevelProps) {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [timeToCrack, setTimeToCrack] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const result = checkPasswordStrength(password);
    setStrength(result.score);
    setFeedback(result.feedback);
    setTimeToCrack(calculateTimeToCrack(password));
  }, [password]);

  const getStrengthColor = () => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength < 30) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Level 01</span>
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Password</CardTitle>
          <CardDescription>
            Your account is under attack. Create a fortress of a password to protect your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Strength: <span className="text-zinc-100 font-bold">{getStrengthLabel()}</span></span>
              <span className="text-zinc-400">Time to crack: <span className="text-zinc-100 font-bold">{timeToCrack}</span></span>
            </div>
            <Progress value={strength} className="h-2 bg-zinc-800" indicatorClassName={getStrengthColor()} />
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Info className="w-3 h-3" /> Security Feedback
            </h4>
            <div className="space-y-1">
              {feedback.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {strength >= 70 ? (
                    <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                  )}
                  <span className={strength >= 70 ? "text-green-400" : "text-zinc-400"}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full font-bold uppercase tracking-widest"
            disabled={password.length === 0}
            onClick={() => onComplete(password, strength, feedback)}
          >
            Secure Account
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
