import { Heart, Infinity as InfinityIcon, Timer, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OptionButton, type OptionVisualState } from '@/components/game/OptionButton';
import { PowerupBar } from '@/components/game/PowerupBar';
import { ResultScreen } from '@/components/game/ResultScreen';
import { ScoreHud } from '@/components/game/ScoreHud';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { OdsBadge } from '@/components/ui/OdsBadge';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { DIFFICULTIES } from '@/services/catalog.service';
import { gameService } from '@/services/game.service';
import type {
  AnswerResult,
  FinishGameResponse,
  GameState,
  NextQuestionResponse,
  QuestionPublic,
} from '@/types';

type Phase = 'setup' | 'loading' | 'playing' | 'revealed' | 'finished';

const SPEED_WINDOW_MS = 15000;

export function GamePage() {
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>('setup');
  const [busy, setBusy] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [question, setQuestion] = useState<QuestionPublic | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answer, setAnswer] = useState<AnswerResult | null>(null);
  const [removed, setRemoved] = useState<number[]>([]);
  const [audience, setAudience] = useState<Record<number, number>>();
  const [result, setResult] = useState<FinishGameResponse | null>(null);

  const startedAt = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  // Cronômetro: atualiza o tempo decorrido enquanto se responde.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt.current), 150);
    return () => clearInterval(id);
  }, [phase]);

  const applyNext = useCallback(
    (res: NextQuestionResponse, finish: () => void) => {
      setGameState(res.state);
      if (res.finished || !res.question) {
        finish();
        return;
      }
      setQuestion(res.question);
      setSelectedId(null);
      setAnswer(null);
      setRemoved([]);
      setAudience(undefined);
      startedAt.current = Date.now();
      setElapsed(0);
      setPhase('playing');
    },
    [],
  );

  const doFinish = useCallback(
    async (gameId: string) => {
      try {
        const res = await gameService.finish(gameId);
        setResult(res);
        setPhase('finished');
      } catch (err) {
        toast(extractError(err), 'error');
      }
    },
    [toast],
  );

  const loadNext = useCallback(
    async (gameId: string) => {
      setPhase('loading');
      try {
        const res = await gameService.next(gameId);
        applyNext(res, () => void doFinish(gameId));
      } catch (err) {
        toast(extractError(err), 'error');
        setPhase('setup');
      }
    },
    [applyNext, doFinish, toast],
  );

  const startGame = async (difficultyId: string) => {
    setBusy(true);
    try {
      const state = await gameService.start(difficultyId);
      setGameState(state);
      await loadNext(state.gameId);
    } catch (err) {
      toast(extractError(err, 'Não foi possível iniciar a partida.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (optionId: number) => {
    if (!gameState || busy) return;
    setSelectedId(optionId);
    setBusy(true);
    try {
      const res = await gameService.answer(gameState.gameId, optionId, Date.now() - startedAt.current);
      setAnswer(res);
      setGameState(res.state);
      setPhase('revealed');
      if (res.isCorrect) {
        toast(`+${res.earnedPoints} pontos!`, 'success');
      }
    } catch (err) {
      toast(extractError(err), 'error');
      setSelectedId(null);
    } finally {
      setBusy(false);
    }
  };

  const usePowerup = async (key: string) => {
    if (!gameState || busy) return;
    setBusy(true);
    try {
      const res = await gameService.usePowerup(gameState.gameId, key);
      setGameState(res.state);
      if (key === 'fifty' && res.removedOptionIds) {
        setRemoved(res.removedOptionIds);
      } else if (key === 'audience' && res.audienceDistribution) {
        setAudience(res.audienceDistribution);
      } else if (key === 'skip' && res.next) {
        applyNext(res.next, () => void doFinish(gameState.gameId));
      }
    } catch (err) {
      toast(extractError(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    if (!gameState) return;
    if (answer?.finished) {
      void doFinish(gameState.gameId);
    } else {
      void loadNext(gameState.gameId);
    }
  };

  const reset = () => {
    setPhase('setup');
    setGameState(null);
    setQuestion(null);
    setAnswer(null);
    setResult(null);
    setRemoved([]);
    setAudience(undefined);
  };

  // ---------- Render ----------
  if (phase === 'setup') {
    return <SetupScreen busy={busy} onStart={startGame} />;
  }
  if (phase === 'loading' || !question || !gameState) {
    return <FullPageSpinner label="Preparando a próxima pergunta…" />;
  }
  if (phase === 'finished' && result) {
    return <ResultScreen result={result} onPlayAgain={reset} />;
  }

  const speedLeft = Math.max(0, 100 - (elapsed / SPEED_WINDOW_MS) * 100);

  const optionState = (id: number): OptionVisualState => {
    if (removed.includes(id)) return 'removed';
    if (answer) {
      if (id === answer.correctOptionId) return 'correct';
      if (id === selectedId) return 'wrong';
      return 'idle';
    }
    return id === selectedId ? 'selected' : 'idle';
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <ScoreHud state={gameState} />

      <Card className="animate-fade-in">
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <OdsBadge number={question.goalNumber} />
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
              <Timer className="h-3.5 w-3.5" />
              {(elapsed / 1000).toFixed(1)}s · dificuldade {question.difficulty}
            </span>
          </div>

          {/* Barra de velocidade (esvazia em 15s) */}
          {phase === 'playing' && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-150',
                  speedLeft > 40 ? 'bg-brand-500' : speedLeft > 15 ? 'bg-amber-400' : 'bg-rose-400',
                )}
                style={{ width: `${speedLeft}%` }}
              />
            </div>
          )}

          <h2 className="text-xl font-bold leading-snug text-slate-900">{question.text}</h2>

          <div className="space-y-2.5">
            {question.options.map((opt, i) => (
              <OptionButton
                key={opt.id}
                index={i}
                text={opt.text}
                state={optionState(opt.id)}
                disabled={phase === 'revealed' || busy}
                audiencePercent={audience?.[opt.id]}
                onClick={() => submitAnswer(opt.id)}
              />
            ))}
          </div>

          {phase === 'playing' && (
            <PowerupBar powerups={gameState.powerups} disabled={busy} onUse={usePowerup} />
          )}

          {phase === 'revealed' && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span
                className={cn(
                  'font-semibold',
                  answer?.isCorrect ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {answer?.isCorrect
                  ? 'Resposta correta! 🎉'
                  : answer?.eliminated
                    ? 'Você foi eliminado! Fim de jogo.'
                    : 'Não foi dessa vez.'}
              </span>
              <Button onClick={handleContinue}>
                {answer?.finished ? 'Ver resultado' : 'Próxima'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Tela de escolha do modo de jogo. */
function SetupScreen({
  busy,
  onStart,
}: {
  busy: boolean;
  onStart: (difficultyId: string) => void;
}) {
  const icons: Record<string, typeof Zap> = {
    quick: Zap,
    classic: Timer,
    endless: InfinityIcon,
    survival: Heart,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Escolha o modo</h1>
        <p className="mt-2 text-slate-600">
          Responda perguntas sobre os ODS. Quanto mais rápido e mais sequências de acerto, mais
          pontos! Nos modos normais, errar <strong>não</strong> encerra a partida.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DIFFICULTIES.map((d) => {
          const Icon = icons[d.id] ?? Timer;
          return (
            <button
              key={d.id}
              disabled={busy}
              onClick={() => onStart(d.id)}
              className={cn(
                'group rounded-2xl border-2 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-50',
                d.endsOnWrong
                  ? 'border-amber-200 hover:border-amber-400'
                  : 'border-slate-200 hover:border-brand-400',
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl',
                  d.endsOnWrong
                    ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                    : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-lg font-bold text-slate-900">{d.title}</div>
              <div className="mt-1 text-sm text-slate-500">{d.subtitle}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
