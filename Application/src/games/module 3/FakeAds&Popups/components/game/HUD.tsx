import React from 'react';
import { Shield, Heart, Trophy, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HUDProps {
  score: number;
  lives: number;
  streak: number;
  levelName: string;
  progress: number;
}

export const HUD: React.FC<HUDProps> = ({ score, lives, streak, levelName, progress }) => {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between text-white">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="font-mono text-sm font-bold uppercase tracking-wider">CyberScam Hunter</span>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-700" />
        
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Current Mission</span>
          <span className="text-sm font-medium">{levelName}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Score</span>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xl font-mono font-bold">{score.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Integrity</span>
          <div className="flex gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} 
              />
            ))}
          </div>
        </div>

        {streak > 1 && (
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse">
            <Zap className="w-3 h-3 mr-1 fill-orange-400" />
            {streak}x STREAK
          </Badge>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-800">
        <div 
          className="h-full bg-blue-500 transition-all duration-500" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};
