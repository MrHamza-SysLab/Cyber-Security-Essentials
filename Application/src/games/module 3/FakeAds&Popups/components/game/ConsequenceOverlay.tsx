import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Terminal, ShieldAlert, Skull } from 'lucide-react';

interface ConsequenceOverlayProps {
  type: string | null;
  onComplete: () => void;
}

export const ConsequenceOverlay: React.FC<ConsequenceOverlayProps> = ({ type, onComplete }) => {
  useEffect(() => {
    if (type) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'hacker':
        return (
          <div className="flex flex-col items-center justify-center text-green-500 font-mono p-8 text-center">
            <Terminal className="w-24 h-24 mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold mb-4">SYSTEM BREACH DETECTED</h2>
            <div className="space-y-2 text-left w-full max-w-md bg-black/80 p-6 border border-green-500 rounded">
              <p className="animate-pulse">{">"} ACCESSING ROOT DIRECTORY...</p>
              <p className="delay-100 animate-pulse">{">"} EXTRACTING PASSWORDS...</p>
              <p className="delay-200 animate-pulse">{">"} UPLOADING TO REMOTE SERVER...</p>
              <p className="delay-300 animate-pulse text-red-500 font-bold">{">"} CONNECTION ESTABLISHED: 192.168.1.45</p>
            </div>
          </div>
        );
      case 'money-lost':
        return (
          <div className="flex flex-col items-center justify-center text-red-500 p-8 text-center">
            <ShieldAlert className="w-24 h-24 mb-6" />
            <h2 className="text-4xl font-bold mb-4">TRANSACTION AUTHORIZED</h2>
            <p className="text-2xl mb-8">-$2,499.00 withdrawn from your account</p>
            <div className="bg-white/10 p-4 rounded-lg border border-red-500/50">
              <p className="text-sm">Merchant: SCAM-PAY-GLOBAL</p>
              <p className="text-sm">Status: COMPLETED</p>
            </div>
          </div>
        );
      case 'data-leak':
        return (
          <div className="flex flex-col items-center justify-center text-orange-500 p-8 text-center">
            <AlertTriangle className="w-24 h-24 mb-6" />
            <h2 className="text-4xl font-bold mb-4">PERSONAL DATA LEAKED</h2>
            <div className="grid grid-cols-2 gap-4 text-left font-mono text-xs opacity-80">
              <div className="p-2 border border-orange-500/30">SSN: ***-**-4421</div>
              <div className="p-2 border border-orange-500/30">DOB: 05/12/1988</div>
              <div className="p-2 border border-orange-500/30">ADDR: 123 Fake St...</div>
              <div className="p-2 border border-orange-500/30">PHONE: 555-0199</div>
            </div>
          </div>
        );
      case 'infection':
      default:
        return (
          <div className="flex flex-col items-center justify-center text-red-600 p-8 text-center">
            <Skull className="w-24 h-24 mb-6 animate-bounce" />
            <h2 className="text-4xl font-bold mb-4">MALWARE INSTALLED</h2>
            <p className="text-xl">Your files are being encrypted...</p>
            <div className="w-full max-w-xs bg-slate-800 h-4 mt-8 rounded-full overflow-hidden border border-red-500">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5 }}
                className="h-full bg-red-500"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center overflow-hidden"
      >
        {/* Glitch Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="scanline" />
        </div>
        
        <motion.div 
          animate={{ 
            x: [0, -10, 10, -5, 5, 0],
            y: [0, 5, -5, 10, -10, 0]
          }}
          transition={{ duration: 0.2, repeat: Infinity }}
          className="relative z-10"
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
