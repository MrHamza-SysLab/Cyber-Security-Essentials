import { useState, useCallback } from 'react';
import type { GameState, GameElement } from '../types/game';
import { LEVELS } from '../data/levels';

export function useGameStore() {
  const [state, setState] = useState<GameState>({
    score: 0,
    lives: 3,
    streak: 0,
    currentLevelIndex: 0,
    isGameOver: false,
    consequence: null,
    feedback: null,
  });

  const handleElementClick = useCallback((element: GameElement) => {
    if (state.isGameOver || state.feedback || state.consequence) return;

    if (element.type === 'real') {
      setState(prev => ({
        ...prev,
        score: prev.score + 100 + (prev.streak * 20),
        streak: prev.streak + 1,
        feedback: {
          isCorrect: true,
          explanation: element.explanation,
          elementLabel: element.label,
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        streak: 0,
        consequence: element.consequenceType || 'infection',
        feedback: {
          isCorrect: false,
          explanation: element.explanation,
          elementLabel: element.label,
        }
      }));
    }
  }, [state]);

  const nextLevel = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentLevelIndex + 1;
      if (nextIndex >= LEVELS.length) {
        return { ...prev, isGameOver: true, feedback: null, consequence: null };
      }
      return {
        ...prev,
        currentLevelIndex: nextIndex,
        feedback: null,
        consequence: null,
      };
    });
  }, []);

  const resetConsequence = useCallback(() => {
    setState(prev => {
      if (prev.lives <= 0) {
        return { ...prev, isGameOver: true, consequence: null };
      }
      return { ...prev, consequence: null };
    });
  }, []);

  const closeFeedback = useCallback(() => {
    setState(prev => {
      if (prev.feedback?.isCorrect) {
        // If correct, move to next level automatically or wait for user
        return { ...prev, feedback: null };
      }
      return { ...prev, feedback: null };
    });
  }, []);

  const restartGame = useCallback(() => {
    setState({
      score: 0,
      lives: 3,
      streak: 0,
      currentLevelIndex: 0,
      isGameOver: false,
      consequence: null,
      feedback: null,
    });
  }, []);

  return {
    state,
    currentLevel: LEVELS[state.currentLevelIndex],
    handleElementClick,
    nextLevel,
    resetConsequence,
    closeFeedback,
    restartGame,
  };
}
