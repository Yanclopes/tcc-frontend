import { Medal, Trophy, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn, formatInt } from '@/lib/utils';
import { catalogService } from '@/services/catalog.service';
import type { RankingEntry } from '@/types';

const MEDAL_COLORS = ['text-amber-400', 'text-slate-400', 'text-orange-400'];

export function RankingPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogService
      .ranking(20)
      .then(setEntries)
      .catch((err) => toast(extractError(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <FullPageSpinner label="Carregando ranking…" />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-600">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Ranking</h1>
          <p className="text-sm text-slate-500">As melhores pontuações da plataforma</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-slate-500">
            Ainda não há pontuações. Seja o primeiro a jogar!
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-slate-100 p-0">
            {entries.map((e, i) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <Medal className={cn('mx-auto h-6 w-6', MEDAL_COLORS[i])} />
                  ) : (
                    <span className="font-semibold text-slate-400">{i + 1}</span>
                  )}
                </div>
                <UserCircle2 className="h-8 w-8 text-slate-300" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    {e.user?.name ?? 'Participante anônimo'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(e.completedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatInt(e.score)}
                  </span>
                  <span className="ml-1 text-xs text-slate-400">pts</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
