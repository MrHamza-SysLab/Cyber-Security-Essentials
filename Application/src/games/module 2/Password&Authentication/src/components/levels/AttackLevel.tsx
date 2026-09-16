
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Terminal, ShieldX, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttackLevelProps {
  passwordStrength: number;
  onComplete: (isHacked: boolean) => void;
}

export default function AttackLevel({ passwordStrength, onComplete }: AttackLevelProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'attacking' | 'hacked' | 'blocked'>('attacking');
  const [progress, setProgress] = useState(0);

  const attackSpeed = Math.max(50, (100 - passwordStrength) * 2); // Faster for weak passwords

  useEffect(() => {
    const attackLogs = [
      "Initializing brute-force sequence...",
      "Connecting to proxy nodes...",
      "Attempting common dictionary attack...",
      "Testing character combinations...",
      "Bypassing basic firewall...",
      "Analyzing password entropy...",
      "Injecting payload...",
      "Finalizing breach attempt..."
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < attackLogs.length) {
        setLogs(prev => [...prev, attackLogs[logIndex]]);
        logIndex++;
        setProgress((logIndex / attackLogs.length) * 100);
      } else {
        clearInterval(interval);
        const hacked = passwordStrength < 70;
        setStatus(hacked ? 'hacked' : 'blocked');
        setTimeout(() => onComplete(hacked), 2000);
      }
    }, attackSpeed);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-950 overflow-hidden relative">
        {/* Matrix-like background effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
           <div className="text-[8px] font-mono leading-none break-all">
             {Array(1000).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
           </div>
        </div>

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Level 02</span>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            Hacker Attack Simulation
            {status === 'attacking' && <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />}
          </CardTitle>
          <CardDescription>
            A hacker is attempting to breach your account using your new password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          <div className="bg-black/80 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto border border-zinc-800 space-y-1">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-green-500"
                >
                  <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {status === 'attacking' && (
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-green-500 inline-block align-middle ml-1"
              />
            )}
          </div>

          <div className="space-y-4">
            {status === 'attacking' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-zinc-500">
                  <span>BRUTE-FORCE PROGRESS</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'hacked' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 p-6 bg-red-500/10 border border-red-500/50 rounded-lg text-center"
              >
                <ShieldX className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="text-xl font-bold text-red-500">ACCOUNT COMPROMISED</h3>
                  <p className="text-sm text-red-400">Your password was too weak to stop the attack.</p>
                </div>
              </motion.div>
            )}

            {status === 'blocked' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 p-6 bg-green-500/10 border border-green-500/50 rounded-lg text-center"
              >
                <ShieldCheck className="w-12 h-12 text-green-500" />
                <div>
                  <h3 className="text-xl font-bold text-green-500">ATTACK BLOCKED</h3>
                  <p className="text-sm text-green-400">Your strong password successfully repelled the breach.</p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
