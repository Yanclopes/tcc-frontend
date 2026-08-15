import * as Tabs from '@radix-ui/react-tabs';
import { Medal, Trophy, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn, formatInt } from '@/lib/utils';
import { catalogService, DIFFICULTIES } from '@/services/catalog.service';
import type { RankingEntry } from '@/types';

const MEDAL_COLORS = ['text-amber-400', 'text-slate-400', 'text-orange-400'];

// Aba padrao (Geral) usa string vazia como sinalizador de "sem filtro de modo".
const GERAL = '';

const TABS: Array<{ value: string; label: string }> = [
  { value: GERAL, label: 'Geral' },
  ...DIFFICULTIES.map((d) => ({ value: d.id, label: d.title })),
];

const tabTriggerCls = (active: boolean) =>
  cn(
    'border-b-2 px-3 py-2 text-sm font-semibold transition-colors',
    active
      ? 'border-amber-500 text-amber-700'
      : 'border-transparent text-slate-500 hover:text-slate-800',
  );

export function RankingPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<string>(GERAL);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    catalogService
      .ranking(20, tab || undefined)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err) => {
        if (!cancelled) toast(extractError(err), 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, toast]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-600">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Ranking</h1>
          <p className="text-sm text-slate-500">
            Melhor pontuação de cada jogador — geral e por modo
          </p>
        </div>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
          {TABS.map((t) => (
            <Tabs.Trigger
              key={t.value || 'geral'}
              value={t.value}
              className={tabTriggerCls(tab === t.value)}
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={tab}>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="text-amber-600" />
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                Ainda não há pontuações {tab ? 'neste modo' : ''}. Seja o primeiro a jogar!
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
                      <div className="font-semibold text-slate-800">{e.user.name}</div>
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
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
