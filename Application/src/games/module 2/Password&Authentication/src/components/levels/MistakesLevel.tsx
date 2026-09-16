
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { HelpCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { SecurityScenario } from '../../types';

interface MistakesLevelProps {
  onComplete: (score: number) => void;
}

const SCENARIOS: SecurityScenario[] = [
  {
    id: '1',
    title: 'Public Computer',
    description: 'You are using a computer at a public library to check your bank account. The browser asks: "Remember password for this site?"',
    options: [
      { text: 'Yes, it makes it easier next time', isSafe: false, feedback: 'Risky! Anyone using this PC after you can access your account.' },
      { text: 'No, never save passwords on public devices', isSafe: true, feedback: 'Correct! Always keep your credentials private on shared hardware.' }
    ]
  },
  {
    id: '2',
    title: 'Support Call',
    description: 'A "Support Agent" calls you saying your account is hacked. They ask for your 2FA code to "verify" your identity.',
    options: [
      { text: 'Give them the code to fix the issue', isSafe: false, feedback: 'Hacked! Real support will NEVER ask for your OTP or password.' },
      { text: 'Refuse and hang up', isSafe: true, feedback: 'Safe! This is a common social engineering tactic.' }
    ]
  },
  {
    id: '3',
    title: 'Password Reuse',
    description: 'You have a very strong password for your email. Should you use the same one for your new social media account?',
    options: [
      { text: 'Yes, it is strong so it is safe', isSafe: false, feedback: 'Dangerous! If the social media site is breached, your email is now vulnerable.' },
      { text: 'No, use a unique password for every site', isSafe: true, feedback: 'Perfect! Password managers can help you keep track of unique passwords.' }
    ]
  }
];

export default function MistakesLevel({ onComplete }: MistakesLevelProps) {
  const [scenarios, setScenarios] = useState<SecurityScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Shuffle scenarios on mount
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5);
    setScenarios(shuffled);
  }, []);

  if (scenarios.length === 0) return null;

  const currentScenario = scenarios[currentIndex];

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setShowFeedback(true);
    if (currentScenario.options[index].isSafe) {
      setScore(s => s + 33.3);
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      onComplete(Math.round(score));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Level 04</span>
          </div>
          <CardTitle className="text-2xl font-bold">Real-Life Challenges</CardTitle>
          <CardDescription>
            Security is about more than just technology—it's about your decisions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
            <h3 className="font-bold text-lg text-primary">{currentScenario.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{currentScenario.description}</p>
          </div>

          <div className="space-y-3">
            {currentScenario.options.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                disabled={showFeedback}
                className={`w-full justify-start h-auto p-4 text-left whitespace-normal border-zinc-800 transition-all ${
                  selectedOption === i 
                    ? option.isSafe ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
                    : 'hover:bg-zinc-800'
                }`}
                onClick={() => handleOptionSelect(i)}
              >
                <div className="flex gap-3 items-center">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedOption === i 
                      ? option.isSafe ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                      : 'border-zinc-700'
                  }`}>
                    {selectedOption === i ? (
                      option.isSafe ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-lg flex gap-3 ${
                  currentScenario.options[selectedOption!].isSafe 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{currentScenario.options[selectedOption!].feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {showFeedback && (
            <Button className="w-full font-bold uppercase" onClick={handleNext}>
              {currentIndex < SCENARIOS.length - 1 ? 'Next Scenario' : 'See Results'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
