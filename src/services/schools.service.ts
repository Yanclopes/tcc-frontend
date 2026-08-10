import { api } from '@/lib/api';
import type { School, SchoolSuggestion, SuggestionStatus } from '@/types';

export interface SchoolInput {
  name: string;
  cityId: number;
  educationLevelIds: number[];
}

export const schoolsService = {
  async list(cityId?: number): Promise<School[]> {
    const { data } = await api.get<School[]>('/schools', {
      params: cityId ? { cityId } : undefined,
    });
    return data;
  },

  async create(input: SchoolInput): Promise<School> {
    const { data } = await api.post<School>('/schools', input);
    return data;
  },

  async update(id: number, input: Partial<SchoolInput>): Promise<School> {
    const { data } = await api.patch<School>(`/schools/${id}`, input);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/schools/${id}`);
  },

  // ----- Sugestões -----
  async listSuggestions(status?: SuggestionStatus): Promise<SchoolSuggestion[]> {
    const { data } = await api.get<SchoolSuggestion[]>('/schools/suggestions', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  async approve(id: number, educationLevelIds: number[], overrides?: { name?: string; cityId?: number }): Promise<School> {
    const { data } = await api.post<School>(`/schools/suggestions/${id}/approve`, {
      educationLevelIds,
      ...overrides,
    });
    return data;
  },

  async reject(id: number): Promise<SchoolSuggestion> {
    const { data } = await api.post<SchoolSuggestion>(`/schools/suggestions/${id}/reject`, {});
    return data;
  },
};
