
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ShieldAlert, ShieldCheck, Key, HelpCircle, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">
            Mission: <span className="text-primary">Secure the Account</span>
          </CardTitle>
          <CardDescription className="text-zinc-400 text-lg">
            Your digital identity is under constant threat. Are you prepared?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> The Objective
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Your goal is to secure a high-value account against sophisticated hacking attempts. 
                You must build a multi-layered defense system to survive.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Your Mission
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <Key className="w-3 h-3 text-primary" /> Create an unbreakable password
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Repel a live brute-force attack
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Configure multi-factor authentication
                </li>
                <li className="flex items-center gap-2">
                  <HelpCircle className="w-3 h-3 text-primary" /> Navigate real-world security traps
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-center text-primary font-mono uppercase tracking-tighter">
              Warning: Simulation includes realistic attack patterns and social engineering tactics.
            </p>
          </div>

          <Button 
            className="w-full h-14 text-lg font-black uppercase tracking-[0.2em] group"
            onClick={onStart}
          >
            Initialize Security Protocol
            <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
