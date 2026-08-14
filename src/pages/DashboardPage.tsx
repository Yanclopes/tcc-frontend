import * as Tabs from '@radix-ui/react-tabs';
import {
  CheckCircle2,
  Gauge,
  ListChecks,
  MapPin,
  RefreshCw,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { HBarChart, type BarItem } from '@/components/dashboard/HBarChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { OdsBadge } from '@/components/ui/OdsBadge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { odsColor } from '@/lib/ods';
import { cn, formatInt, formatMs, formatPercent } from '@/lib/utils';
import { dashboardService } from '@/services/dashboard.service';
import type {
  DashboardFilter,
  DashboardOverview,
  OdsBreakdownRow,
  QuestionBreakdownRow,
  RegionBreakdownRow,
} from '@/types';

const tabTrigger = (active: boolean) =>
  cn(
    'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
    active
      ? 'border-brand-600 text-brand-700'
      : 'border-transparent text-slate-500 hover:text-slate-800',
  );

export function DashboardPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<DashboardFilter>({ level: 'state' });
  const [tab, setTab] = useState('overview');

  const [overview, setOverview] = useState<DashboardOverview>();
  const [byOds, setByOds] = useState<OdsBreakdownRow[]>([]);
  const [byRegion, setByRegion] = useState<RegionBreakdownRow[]>([]);
  const [byQuestion, setByQuestion] = useState<QuestionBreakdownRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, ods, region, questions] = await Promise.all([
        dashboardService.overview(filter),
        dashboardService.byOds(filter),
        dashboardService.byRegion(filter),
        dashboardService.byQuestion(filter),
      ]);
      setOverview(ov);
      setByOds(ods);
      setByRegion(region);
      setByQuestion(questions);
    } catch (err) {
      toast(extractError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshViews = async () => {
    setRefreshing(true);
    try {
      await dashboardService.refresh();
      toast('Materialized views atualizadas.', 'success');
    } catch (err) {
      toast(extractError(err), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const odsBars: BarItem[] = byOds.map((r) => ({
    label: `${r.goalNumber} · ${r.goalName}`,
    ratio: r.taxaAcerto,
    valueLabel: formatPercent(r.taxaAcerto),
    color: odsColor(r.goalNumber),
    sub: `${formatInt(r.totalRespostas)} respostas · ${formatMs(r.tempoMedioMs)}`,
  }));

  const regionBars: BarItem[] = byRegion.map((r) => ({
    label: r.regionLabel,
    ratio: r.taxaAcerto,
    valueLabel: formatPercent(r.taxaAcerto),
    color: '#0a97d9',
    sub: `${formatInt(r.totalRespostas)} respostas · ${formatInt(r.totalParticipantes)} participantes`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Levantamento do conhecimento sobre os ODS — geral ou por região
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Spinner className="text-brand-600" />}
          <Button variant="outline" size="sm" onClick={refreshViews} disabled={refreshing}>
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Atualizar views
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent>
          <FilterBar filter={filter} onChange={setFilter} showLevel={tab === 'region'} />
        </CardContent>
      </Card>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="flex gap-1 overflow-x-auto border-b border-slate-200">
          <Tabs.Trigger value="overview" className={tabTrigger(tab === 'overview')}>
            <Gauge className="h-4 w-4" /> Visão geral
          </Tabs.Trigger>
          <Tabs.Trigger value="ods" className={tabTrigger(tab === 'ods')}>
            <TrendingUp className="h-4 w-4" /> Por ODS
          </Tabs.Trigger>
          <Tabs.Trigger value="region" className={tabTrigger(tab === 'region')}>
            <MapPin className="h-4 w-4" /> Por região
          </Tabs.Trigger>
          <Tabs.Trigger value="question" className={tabTrigger(tab === 'question')}>
            <ListChecks className="h-4 w-4" /> Por pergunta
          </Tabs.Trigger>
        </Tabs.List>

        {/* Visão geral */}
        <Tabs.Content value="overview" className="mt-5 space-y-5 focus:outline-none">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={ListChecks} label="Respostas coletadas" value={formatInt(overview?.totalRespostas ?? 0)} />
            <StatCard icon={CheckCircle2} label="Taxa de acerto" value={formatPercent(overview?.taxaAcerto ?? 0)} hint={`${formatInt(overview?.totalAcertos ?? 0)} acertos`} />
            <StatCard icon={Timer} label="Tempo médio" value={formatMs(overview?.tempoMedioMs ?? 0)} />
            <StatCard icon={Gauge} label="Partidas" value={formatInt(overview?.totalPartidas ?? 0)} />
            <StatCard icon={Users} label="Participantes cadastrados" value={formatInt(overview?.totalParticipantes ?? 0)} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Taxa de acerto por ODS</CardTitle>
            </CardHeader>
            <CardContent>
              <HBarChart items={odsBars} />
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Por ODS */}
        <Tabs.Content value="ods" className="mt-5 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por ODS</CardTitle>
            </CardHeader>
            <CardContent>
              <HBarChart items={odsBars} />
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Por região */}
        <Tabs.Content value="region" className="mt-5 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por região</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
                O recorte regional só considera participantes que informaram uma escola no perfil
                (campo opcional no cadastro).
              </p>
              <HBarChart items={regionBars} emptyLabel="Nenhum dado regional para o filtro atual." />
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Por pergunta */}
        <Tabs.Content value="question" className="mt-5 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por pergunta</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {byQuestion.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Sem dados para o filtro atual.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {byQuestion.map((q) => (
                    <div key={q.questionId} className="flex items-center gap-4 px-5 py-3">
                      <OdsBadge number={q.goalNumber} showName={false} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {q.questionText}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatInt(q.totalRespostas)} respostas · {formatMs(q.tempoMedioMs)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
                          q.taxaAcerto >= 0.7
                            ? 'bg-emerald-50 text-emerald-700'
                            : q.taxaAcerto >= 0.4
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700',
                        )}
                      >
                        {formatPercent(q.taxaAcerto)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
