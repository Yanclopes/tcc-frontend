import { PartyPopper, RotateCcw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatInt, formatPercent } from '@/lib/utils';
import type { FinishGameResponse } from '@/types';

export function ResultScreen({
  result,
  onPlayAgain,
}: {
  result: FinishGameResponse;
  onPlayAgain: () => void;
}) {
  const accuracy = result.totalAnswered ? result.totalCorrect / result.totalAnswered : 0;

  return (
    <Card className="mx-auto max-w-lg animate-scale-in text-center">
      <CardContent className="space-y-6 py-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
          <PartyPopper className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Partida encerrada!</h2>
          <p className="mt-1 text-slate-600">Obrigado por contribuir com a pesquisa.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Pontos" value={formatInt(result.finalScore)} />
          <Stat label="Acertos" value={`${result.totalCorrect}/${result.totalAnswered}`} />
          <Stat label="Aproveitamento" value={formatPercent(accuracy, 0)} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={onPlayAgain}>
            <RotateCcw className="h-4 w-4" /> Jogar de novo
          </Button>
          <Button variant="outline" asChild>
            <Link to="/ranking">
              <Trophy className="h-4 w-4" /> Ver ranking
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
