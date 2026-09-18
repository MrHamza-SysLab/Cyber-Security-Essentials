import type { GameResult } from "../../types/game.types";
import type { AmlUrduScorePayloadInput } from "../../service/gameScore.types";

type AmlUrduCompletionMetadata = {
  tier?: string;
  skill?: string;
  xp?: number;
  badges?: string[];
  best?: Record<string, number>;
};

export const buildAmlUrduScorePayload = (
  result: GameResult
): AmlUrduScorePayloadInput => {
  const meta = result.metadata as AmlUrduCompletionMetadata | undefined;

  return {
    gameType: "aml-urdu" as const,
    scorePercentage: result.score,
    completed: result.completed,
    completedAt: new Date().toISOString(),
    details: {
      tier: meta?.tier,
      skill: meta?.skill,
      xp: meta?.xp ?? 0,
      badges: meta?.badges ?? [],
      best: { ...(meta?.best ?? {}) },
    },
  };
};
