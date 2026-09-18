import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FeedbackPanelProps {
  feedback: {
    isCorrect: boolean;
    explanation: string;
    elementLabel: string;
  } | null;
  onClose: () => void;
  onNext: () => void;
  isGameOver: boolean;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, onClose, onNext, isGameOver }) => {
  if (!feedback) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-full max-w-lg px-4"
      >
        <Card className={`border-2 ${feedback.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50 shadow-2xl'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <CardTitle className={feedback.isCorrect ? 'text-green-800' : 'text-red-800'}>
                  {feedback.isCorrect ? 'Safe Choice!' : 'Security Breach!'}
                </CardTitle>
                <CardDescription className="font-medium">
                  You clicked: <span className="italic">"{feedback.elementLabel}"</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              {feedback.explanation}
            </p>
            
            <div className="flex justify-end gap-3 pt-2">
              {!feedback.isCorrect && !isGameOver && (
                <Button variant="outline" onClick={onClose} className="border-red-200 text-red-700 hover:bg-red-100">
                  Try Again
                </Button>
              )}
              {feedback.isCorrect && !isGameOver && (
                <Button onClick={onNext} className="bg-green-600 hover:bg-green-700 text-white">
                  Next Mission <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {isGameOver && (
                <Button onClick={onClose} variant="destructive">
                  View Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
