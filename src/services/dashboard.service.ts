import { api } from '@/lib/api';
import type {
  DashboardFilter,
  DashboardOverview,
  OdsBreakdownRow,
  QuestionBreakdownRow,
  RegionBreakdownRow,
} from '@/types';

/** Remove chaves indefinidas para não enviar params vazios. */
function clean(filter: DashboardFilter): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  );
}

export const dashboardService = {
  async overview(filter: DashboardFilter): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>('/dashboard/overview', {
      params: clean(filter),
    });
    return data;
  },

  async byOds(filter: DashboardFilter): Promise<OdsBreakdownRow[]> {
    const { data } = await api.get<OdsBreakdownRow[]>('/dashboard/by-ods', {
      params: clean(filter),
    });
    return data;
  },

  async byRegion(filter: DashboardFilter): Promise<RegionBreakdownRow[]> {
    const { data } = await api.get<RegionBreakdownRow[]>('/dashboard/by-region', {
      params: clean(filter),
    });
    return data;
  },

  async byQuestion(filter: DashboardFilter): Promise<QuestionBreakdownRow[]> {
    const { data } = await api.get<QuestionBreakdownRow[]>('/dashboard/by-question', {
      params: clean(filter),
    });
    return data;
  },

  async refresh(): Promise<{ refreshed: string[] }> {
    const { data } = await api.post<{ refreshed: string[] }>('/analytics/refresh');
    return data;
  },
};
