import { api } from '@/lib/api';
import type {
  AnswerResult,
  FinishGameResponse,
  GameState,
  NextQuestionResponse,
  PowerupResult,
} from '@/types';

export const gameService = {
  async start(difficultyId: string, educationLevelId?: number): Promise<GameState> {
    const { data } = await api.post<GameState>('/games', { difficultyId, educationLevelId });
    return data;
  },

  async next(gameId: string): Promise<NextQuestionResponse> {
    const { data } = await api.get<NextQuestionResponse>(`/games/${gameId}/next`);
    return data;
  },

  async answer(
    gameId: string,
    optionId: number,
    responseTimeMs?: number,
  ): Promise<AnswerResult> {
    const { data } = await api.post<AnswerResult>(`/games/${gameId}/answers`, {
      optionId,
      responseTimeMs,
    });
    return data;
  },

  async usePowerup(gameId: string, powerup: string): Promise<PowerupResult> {
    const { data } = await api.post<PowerupResult>(`/games/${gameId}/powerups`, { powerup });
    return data;
  },

  async finish(gameId: string): Promise<FinishGameResponse> {
    const { data } = await api.post<FinishGameResponse>(`/games/${gameId}/finish`);
    return data;
  },
};
