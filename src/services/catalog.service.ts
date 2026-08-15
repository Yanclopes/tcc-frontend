import { api } from '@/lib/api';
import type { GeoItem, Goal, RankingEntry } from '@/types';

/** Modos de dificuldade conhecidos (espelham a seed do backend). */
export interface DifficultyOption {
  id: string;
  title: string;
  numberQuestions: number | null;
  /** Texto curto de apoio exibido no card de escolha do modo. */
  subtitle: string;
  /** Se true, errar encerra a partida (modo Sobrevivencia). */
  endsOnWrong: boolean;
}

export const catalogService = {
  async goals(): Promise<Goal[]> {
    const { data } = await api.get<Goal[]>('/goals');
    return data;
  },

  async ranking(limit = 10, mode?: string): Promise<RankingEntry[]> {
    const { data } = await api.get<RankingEntry[]>('/ranking', {
      params: { limit, ...(mode ? { mode } : {}) },
    });
    return data;
  },

  async educationLevels(): Promise<GeoItem[]> {
    // Reaproveita o endpoint de perfis quando existir; por ora, lista estática
    // alinhada à seed (o backend expõe escolaridade via cadastro).
    return [
      { id: 1, name: 'Ensino Fundamental I' },
      { id: 2, name: 'Ensino Fundamental II' },
      { id: 3, name: 'Ensino Médio' },
      { id: 4, name: 'Ensino Superior' },
    ];
  },

  async states(countryId?: number): Promise<GeoItem[]> {
    const { data } = await api.get<GeoItem[]>('/geo/states', { params: { countryId } });
    return data;
  },

  async cities(stateId?: number): Promise<GeoItem[]> {
    const { data } = await api.get<GeoItem[]>('/geo/cities', { params: { stateId } });
    return data;
  },

  async schools(cityId?: number): Promise<GeoItem[]> {
    const { data } = await api.get<GeoItem[]>('/geo/schools', { params: { cityId } });
    return data;
  },
};

/** Modos padrão do jogo (correspondem à seed: quick/classic/endless/survival). */
export const DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'quick',
    title: 'Rápido',
    numberQuestions: 5,
    subtitle: '5 perguntas · erros não eliminam',
    endsOnWrong: false,
  },
  {
    id: 'classic',
    title: 'Clássico',
    numberQuestions: 15,
    subtitle: '15 perguntas · erros não eliminam',
    endsOnWrong: false,
  },
  {
    id: 'endless',
    title: 'Infinito',
    numberQuestions: null,
    subtitle: 'Sem limite · jogue até quando quiser',
    endsOnWrong: false,
  },
  {
    id: 'survival',
    title: 'Sobrevivência',
    numberQuestions: null,
    subtitle: 'Errou, acabou! Vá o mais longe que conseguir',
    endsOnWrong: true,
  },
];
