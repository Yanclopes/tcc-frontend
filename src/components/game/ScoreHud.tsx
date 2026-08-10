import { Flame, Star } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatInt } from '@/lib/utils';
import type { GameState } from '@/types';

/** Cabeçalho do jogo: pontuação, sequência (streak) e progresso. */
export function ScoreHud({ state }: { state: GameState }) {
  const total = state.totalQuestions;
  const progress = total ? (state.answered / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-bold">{formatInt(state.score)}</span>
          <span className="text-xs">pts</span>
        </div>

        <div className="text-sm font-medium text-slate-500">
          {total ? `Pergunta ${Math.min(state.answered + 1, total)} de ${total}` : `Pergunta ${state.answered + 1}`}
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
            state.streak > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span className="font-bold">{state.streak}</span>
        </div>
      </div>
      {total && <ProgressBar value={progress} />}
    </div>
  );
}
